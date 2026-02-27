import discoveryData from '../data/discovery.json';
import differentiatorsData from '../data/differentiators.json';
import objectionsData from '../data/objections.json';
import usecasesData from '../data/usecases.json';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
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

When given a prospect's details, generate a personalized prep brief using EXACTLY these four section headers in this order. Do not add any text before the first section header.

## BRIEF
Write 2-3 paragraphs: company context and what they do, what the stakeholder(s) care about based on their LinkedIn profiles, likely analytics pain points, and the recommended ThoughtSpot angle for this specific prospect.

## DISCOVERY
List the 8-10 most relevant discovery questions from the library above, reframed specifically for this prospect. Number each question and add 1-2 sentences below explaining why it's relevant for this specific company/person.

## TALKING_POINTS
List 5-7 of the most relevant differentiators and objection responses from the library, reframed to resonate with this prospect's context. Use bullet points.

## DEMO_FLOW
Recommend a 4-5 step demo sequence. For each step, name the use case, describe what to show, and explain why it fits this specific prospect.`;
}

function buildUserPrompt({ companyName, linkedinProfiles, additionalContext }) {
  const profilesText = linkedinProfiles
    .filter(p => p.trim())
    .map((p, i) => `--- LinkedIn Profile ${i + 1} ---\n${p}`)
    .join('\n\n');

  let prompt = `Company: ${companyName}\n\n`;
  if (profilesText) {
    prompt += `Stakeholder LinkedIn Profiles:\n${profilesText}\n\n`;
  }
  if (additionalContext?.trim()) {
    prompt += `Additional Context:\n${additionalContext}\n\n`;
  }
  prompt += 'Generate the personalized prep brief.';
  return prompt;
}

/**
 * Stream a Claude response for the given prospect inputs.
 *
 * @param {Object} inputs - { companyName, linkedinProfiles, additionalContext }
 * @param {Function} onChunk - called with each text chunk as it arrives
 * @param {AbortSignal} signal - optional AbortSignal for cancellation
 */
export async function streamAiPrep(inputs, onChunk, signal) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    signal,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      stream: true,
      system: buildSystemPrompt(),
      messages: [{ role: 'user', content: buildUserPrompt(inputs) }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API_ERROR:${response.status}:${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]' || !data) continue;
      try {
        const parsed = JSON.parse(data);
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
