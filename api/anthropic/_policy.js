// Request policy for the Anthropic proxy. Pure functions so they can be unit-tested.
//
// The browser builds the prompts, but the server decides what it may spend:
// the model is pinned, max_tokens is capped, only the web search tool is
// allowed (with a capped number of uses), and unknown fields are dropped.

export const DEFAULT_MODEL = 'claude-sonnet-5-5';
export const MAX_TOKENS_CAP = 8000;
export const WEB_SEARCH_TYPE = 'web_search_20260209';
export const WEB_SEARCH_MAX_USES = 5;
export const MAX_BODY_BYTES = 400_000;

export class PolicyError extends Error {}

const isTextBlock = (b) => b && b.type === 'text' && typeof b.text === 'string';

/**
 * Turn an untrusted client body into the only request shape the proxy will send.
 * Throws PolicyError for anything it can't safely coerce.
 */
export function applyPolicy(raw, { model = DEFAULT_MODEL, maxTokensCap = MAX_TOKENS_CAP } = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new PolicyError('Body must be a JSON object');

  const { messages, system, max_tokens: maxTokens, tools } = raw;

  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
    throw new PolicyError('messages must be a non-empty array (max 20)');
  }
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) throw new PolicyError('Invalid message role');
  }

  let safeSystem;
  if (system !== undefined) {
    if (typeof system === 'string') safeSystem = system;
    else if (Array.isArray(system) && system.every(isTextBlock)) {
      safeSystem = system.map(b => (b.cache_control ? { type: 'text', text: b.text, cache_control: { type: 'ephemeral' } } : { type: 'text', text: b.text }));
    } else throw new PolicyError('system must be a string or text blocks');
  }

  let safeTools;
  if (tools !== undefined) {
    if (!Array.isArray(tools)) throw new PolicyError('tools must be an array');
    if (tools.some(t => t?.name !== 'web_search')) throw new PolicyError('Only the web_search tool is allowed');
    if (tools.length > 0) {
      const requested = Number(tools[0].max_uses) || WEB_SEARCH_MAX_USES;
      safeTools = [{ type: WEB_SEARCH_TYPE, name: 'web_search', max_uses: Math.min(requested, WEB_SEARCH_MAX_USES) }];
    }
  }

  const requestedTokens = Number.isFinite(maxTokens) && maxTokens > 0 ? Math.floor(maxTokens) : maxTokensCap;

  return {
    model,
    max_tokens: Math.min(requestedTokens, maxTokensCap),
    stream: true,
    messages,
    ...(safeSystem !== undefined && { system: safeSystem }),
    ...(safeTools && { tools: safeTools }),
  };
}

/** Constant-time string comparison (Edge runtime has no crypto.timingSafeEqual). */
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}
