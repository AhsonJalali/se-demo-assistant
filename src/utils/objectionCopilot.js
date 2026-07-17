import differentiatorsData from '../data/differentiators.json';
import objectionsData from '../data/objections.json';
import { streamClaude, MODEL } from './claudeApi';

function buildSystemPrompt() {
  const objections = JSON.stringify(objectionsData.objections, null, 2);
  const differentiators = JSON.stringify(differentiatorsData.competitors, null, 2);

  return `You are a live-call objection coach for a ThoughtSpot Solution Engineer. The SE is in a demo RIGHT NOW: a prospect just pushed back, and the SE has seconds to respond. Speed and usability beat completeness.

Your library:

OBJECTION HANDLING:
${objections}

COMPETITIVE DIFFERENTIATORS:
${differentiators}

# OPERATING RULES

1. **Never ask clarifying questions.** Work with exactly what the SE pasted. If it's ambiguous, pick the most likely reading and proceed.
2. **Always produce all 3 sections below, in this order, with these exact headers.** The downstream parser depends on these literal strings. Your very first character of output MUST be \`#\` — no preamble.
3. **Mirror the prospect's own words.** The response must sound like it was written for what THIS prospect said, not a library entry read aloud.
4. **Ground everything in the library.** Reframe matched objection responses and relevant differentiators; do not invent product claims.
5. **Be brief.** The SE is reading this on a second screen mid-conversation.

# OUTPUT FORMAT

## READ
One or two sentences naming what this objection really is (pricing fear? switching-cost anxiety? champion covering for a stalled deal?). Then, on its own line: \`Matches: <comma-separated ids from the objection library, e.g. obj-1, obj-7>\` — or \`Matches: none\` if nothing fits.

## RESPONSE
Three to five sentences the SE can say out loud, in a natural, confident, conversational voice. No bullets, no headings, no jargon. Acknowledge the concern genuinely before reframing — never sound defensive.

## REDIRECT
Two or three numbered discovery questions that move the conversation forward and put the SE back in control. Each tailored to this objection, not generic.`;
}

function buildUserPrompt(objectionText, session) {
  let prompt = `The prospect just said:\n\n"${objectionText.trim()}"\n`;

  if (session) {
    const ctx = [];
    if (session.name && session.name !== 'New Session') ctx.push(`Prospect/session: ${session.name}`);
    if (session.metadata?.dealStage) ctx.push(`Deal stage: ${session.metadata.dealStage}`);
    if (session.metadata?.industries?.length) ctx.push(`Industry: ${session.metadata.industries.join(', ')}`);
    if (session.metadata?.useCases?.length) ctx.push(`Use cases in play: ${session.metadata.useCases.join(', ')}`);
    const whys = session.threeWhys ?? {};
    if (whys['why-change']?.trim()) ctx.push(`Why change (captured): ${whys['why-change'].trim()}`);
    if (whys['why-now']?.trim()) ctx.push(`Why now (captured): ${whys['why-now'].trim()}`);
    if (whys['why-thoughtspot']?.trim()) ctx.push(`Why ThoughtSpot (captured): ${whys['why-thoughtspot'].trim()}`);
    if (ctx.length) {
      prompt += `\nSession context:\n${ctx.map(l => `- ${l}`).join('\n')}\n`;
    }
  }

  prompt += '\nGive me the read, the response, and the redirect. All 3 sections, no preamble.';
  return prompt;
}

/**
 * Stream an objection-copilot answer.
 * No web search tools: this is a live-call feature — latency is the enemy.
 *
 * @param {Object} inputs - { objectionText, session } (session may be null)
 * @param {Function} onChunk - called with each text chunk as it arrives
 * @param {AbortSignal} signal - optional AbortSignal for cancellation
 */
export async function streamObjectionCopilot({ objectionText, session }, onChunk, signal) {
  return streamClaude(
    {
      model: MODEL,
      max_tokens: 1500,
      system: [
        {
          type: 'text',
          text: buildSystemPrompt(),
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: buildUserPrompt(objectionText, session) }],
    },
    onChunk,
    signal
  );
}
