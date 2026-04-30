import discoveryData from '../data/discovery.json';
import differentiatorsData from '../data/differentiators.json';
import objectionsData from '../data/objections.json';
import usecasesData from '../data/usecases.json';

const ANTHROPIC_API_URL = '/anthropic/v1/messages';
const MODEL = 'claude-sonnet-4-6';

function buildSystemPrompt() {
  const discovery = JSON.stringify(discoveryData.questions, null, 2);
  const differentiators = JSON.stringify(differentiatorsData.competitors, null, 2);
  const objections = JSON.stringify(objectionsData.objections, null, 2);
  const usecases = JSON.stringify(usecasesData.useCases, null, 2);

  return `You are an expert ThoughtSpot Solution Engineer assistant. Your job is to help SEs prepare highly personalized, relevant demos for specific prospects.

You have access to ThoughtSpot's complete sales content library:

DISCOVERY QUESTIONS:
${discovery}

COMPETITIVE DIFFERENTIATORS:
${differentiators}

OBJECTION HANDLING:
${objections}

USE CASES:
${usecases}

# CRITICAL OPERATING RULES

1. **NEVER ask the SE clarifying questions.** Do not beg for more information. Do not say "I need more details" or "could you provide". The SE has given you what they have. Your job is to deliver a useful brief with whatever input is provided, even if it's just a company name and a URL.

2. **ALWAYS produce all 4 sections in the exact format below**, in this exact order, with these exact headers. The downstream parser depends on these literal strings:
   - \`## BRIEF\`
   - \`## DISCOVERY\`
   - \`## TALKING_POINTS\`
   - \`## DEMO_FLOW\`
   Your very first character of output MUST be \`#\`. Do not add any text, greeting, or "here is your brief"-style preamble before \`## BRIEF\`. Do not skip a section. Do not rename a section. If you are tempted to refuse or to ask for more info, instead make explicit assumptions and continue.

3. **USE WEB SEARCH AGGRESSIVELY** when input is sparse. You have a \`web_search\` tool — use it. Specifically:
   - If the company is obscure or unfamiliar, search: \`"{company name}"\`, then \`"{company name}" site:linkedin.com/company\`, then \`"{company name}" about\`, and similar variants. Try the company website domain if you can guess it.
   - If a LinkedIn input value looks like a URL (starts with \`http\`, \`https\`, or \`linkedin.com\`), search the web for that URL directly, and also search for the person's name + the company name to find their role and background.
   - If a Company Website is provided, you may search for the domain to find recent news, product pages, or About content.
   - You have up to 5 web searches per brief. Use them. Do not produce a brief based purely on guessing when search would clarify.

4. **Make explicit, useful assumptions when info is still sparse after searching.** Do not hedge passively. State the assumption out loud and proceed. Example phrasing:
   > "Based on the company name pattern and limited public footprint, Gabooja appears to be an early-stage [guess: marketplace / SaaS / agency] — this brief assumes that. Adjust during discovery if the SE confirms otherwise."
   This is far more useful to an SE than a refusal or a request for clarification.

5. **Ground every recommendation in the prospect's specifics.** Reframe library content (discovery questions, differentiators, objections, use cases) so it speaks directly to this company and these stakeholders — not generic ThoughtSpot pitch.

# OUTPUT FORMAT

## BRIEF
Write 2-3 paragraphs covering: (a) company context — what they do, industry, scale, any signals from web search; (b) what the stakeholder(s) likely care about based on their LinkedIn role/background; (c) likely analytics pain points for a company of this profile; (d) the recommended ThoughtSpot angle for this specific prospect. If you had to make assumptions due to sparse input, state them explicitly here in one sentence.

## DISCOVERY
List the 8-10 most relevant discovery questions from the library above, reframed specifically for this prospect. Number each question and add 1-2 sentences below explaining why it's relevant for this specific company/person.

## TALKING_POINTS
List 5-7 of the most relevant differentiators and objection responses from the library, reframed to resonate with this prospect's context. Use bullet points.

## DEMO_FLOW
Recommend a 4-5 step demo sequence. For each step, name the use case, describe what to show, and explain why it fits this specific prospect.`;
}

function buildUserPrompt({ companyName, companyWebsite, linkedinProfiles, additionalContext }) {
  const profilesText = (linkedinProfiles ?? [])
    .filter(p => p.trim())
    .map((p, i) => `--- LinkedIn Profile ${i + 1} ---\n${p}`)
    .join('\n\n');

  let prompt = `Company: ${companyName}\n\n`;
  if (companyWebsite?.trim()) {
    prompt += `Company Website: ${companyWebsite.trim()}\n\n`;
  }
  if (profilesText) {
    prompt += `Stakeholder LinkedIn Profiles:\n${profilesText}\n\n`;
  }
  if (additionalContext?.trim()) {
    prompt += `Additional Context:\n${additionalContext}\n\n`;
  }
  prompt += 'Generate the personalized prep brief. Use web_search to research anything you do not recognize. Do not ask me clarifying questions — make explicit assumptions and produce all 4 sections.';
  return prompt;
}

/**
 * Stream a Claude response for the given prospect inputs.
 *
 * @param {Object} inputs - { companyName, companyWebsite, linkedinProfiles, additionalContext }
 * @param {Function} onChunk - called with each text chunk as it arrives
 * @param {AbortSignal} signal - optional AbortSignal for cancellation
 */
export async function streamAiPrep(inputs, onChunk, signal) {
  // In dev, Vite proxies /anthropic/v1/messages to api.anthropic.com and the
  // browser must supply the key (VITE_ANTHROPIC_API_KEY). In prod, the same
  // path is handled by api/anthropic/messages.js which adds the key from a
  // server-only env var, so the browser sends no key at all.
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const headers = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
  };
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  } else if (import.meta.env.DEV) {
    throw new Error('NO_API_KEY');
  }

  const systemPromptText = buildSystemPrompt();

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers,
    signal,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      stream: true,
      system: [
        {
          type: 'text',
          text: systemPromptText,
          cache_control: { type: 'ephemeral' },
        },
      ],
      tools: [
        { type: 'web_search_20250305', name: 'web_search', max_uses: 5 },
      ],
      messages: [{ role: 'user', content: buildUserPrompt(inputs) }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API_ERROR:${response.status}:${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? ''; // keep the incomplete last line for next read

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]' || !data) continue;
      try {
        const parsed = JSON.parse(data);
        // Only forward assistant-authored text deltas. This intentionally
        // excludes input_json_delta (tool-use args) and any
        // web_search_tool_result content blocks, which the server emits as
        // separate non-text-delta events and which would otherwise leak
        // raw search payloads into the brief.
        if (
          parsed.type === 'content_block_delta' &&
          parsed.delta?.type === 'text_delta' &&
          parsed.delta.text
        ) {
          onChunk(parsed.delta.text);
        }
      } catch {
        // skip malformed SSE lines
      }
    }
  }
}
