import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseMatchedIds, streamObjectionCopilot } from './objectionCopilot';

vi.mock('./claudeApi', async () => {
  const actual = await vi.importActual('./claudeApi');
  return { ...actual, streamClaude: vi.fn().mockResolvedValue(undefined) };
});

import { streamClaude, MODEL } from './claudeApi';

describe('parseMatchedIds', () => {
  it('returns [] for empty or missing text', () => {
    expect(parseMatchedIds('')).toEqual([]);
    expect(parseMatchedIds(undefined)).toEqual([]);
    expect(parseMatchedIds(null)).toEqual([]);
  });

  it('returns [] when there is no Matches line', () => {
    expect(parseMatchedIds('Some read text with no matches line at all.')).toEqual([]);
  });

  it('returns [] for "Matches: none"', () => {
    expect(parseMatchedIds('This is the read.\nMatches: none\n')).toEqual([]);
  });

  it('extracts a single id', () => {
    expect(parseMatchedIds('Read.\nMatches: obj-3\n')).toEqual(['obj-3']);
  });

  it('extracts multiple comma-separated ids', () => {
    expect(parseMatchedIds('Read.\nMatches: obj-1, obj-7, obj-12\n')).toEqual(['obj-1', 'obj-7', 'obj-12']);
  });

  it('is tolerant of bold/asterisks around the label', () => {
    expect(parseMatchedIds('Read.\n**Matches:** obj-2\n')).toEqual(['obj-2']);
  });

  it('is case-insensitive on the label and the ids', () => {
    expect(parseMatchedIds('Read.\nMATCHES: OBJ-4\n')).toEqual(['obj-4']);
  });

  it('de-dupes ids while preserving order', () => {
    expect(parseMatchedIds('Read.\nMatches: obj-5, obj-1, obj-5\n')).toEqual(['obj-5', 'obj-1']);
  });

  it('finds the Matches line among other content, not just the first line', () => {
    const text = 'First the read paragraph.\nSecond sentence here.\nMatches: obj-9\nmore text after';
    expect(parseMatchedIds(text)).toEqual(['obj-9']);
  });
});

describe('streamObjectionCopilot', () => {
  const content = {
    objections: [{ id: 'obj-1', text: 'Too expensive' }],
    differentiators: [{ id: 'diff-1', text: 'Faster setup' }],
  };

  beforeEach(() => {
    streamClaude.mockClear();
  });

  it('calls streamClaude with the configured model and the onChunk/signal passed through', async () => {
    const onChunk = vi.fn();
    const signal = new AbortController().signal;

    await streamObjectionCopilot({ objectionText: 'It costs too much', session: null, content, settings: {} }, onChunk, signal);

    expect(streamClaude).toHaveBeenCalledTimes(1);
    const [body, passedOnChunk, passedSignal] = streamClaude.mock.calls[0];
    expect(body.model).toBe(MODEL);
    expect(passedOnChunk).toBe(onChunk);
    expect(passedSignal).toBe(signal);
  });

  it('embeds the objection library and the objection text in the request', async () => {
    await streamObjectionCopilot({ objectionText: 'It costs too much', session: null, content, settings: {} }, vi.fn());

    const [body] = streamClaude.mock.calls[0];
    expect(body.system[0].text).toContain('Too expensive');
    expect(body.system[0].text).toContain('Faster setup');
    expect(body.system[0].cache_control).toEqual({ type: 'ephemeral' });
    expect(body.messages[0].content).toContain('It costs too much');
  });

  it('includes session context (deal stage, industries, use cases, 3 Whys) when a session is loaded', async () => {
    const session = {
      name: 'Acme Corp',
      metadata: { dealStage: 'Evaluation', industries: ['Retail'], useCases: ['Checkout'] },
      threeWhys: { 'why-change': 'Legacy tool is slow', 'why-now': 'Budget freed up', 'why-us': 'Best fit' },
    };

    await streamObjectionCopilot(
      { objectionText: 'Why not the incumbent?', session, content, settings: { productName: 'Acme Platform' } },
      vi.fn()
    );

    const [body] = streamClaude.mock.calls[0];
    const prompt = body.messages[0].content;
    expect(prompt).toContain('Prospect/session: Acme Corp');
    expect(prompt).toContain('Deal stage: Evaluation');
    expect(prompt).toContain('Industry: Retail');
    expect(prompt).toContain('Use cases in play: Checkout');
    expect(prompt).toContain('Why change (captured): Legacy tool is slow');
    expect(prompt).toContain('Why now (captured): Budget freed up');
    expect(prompt).toContain('Why Acme Platform (captured): Best fit');
  });

  it('omits the session context block entirely when no session is loaded', async () => {
    await streamObjectionCopilot({ objectionText: 'Too pricey', session: null, content, settings: {} }, vi.fn());

    const [body] = streamClaude.mock.calls[0];
    expect(body.messages[0].content).not.toContain('Session context:');
  });

  it('skips the default "New Session" name and blank 3 Whys fields', async () => {
    const session = { name: 'New Session', metadata: {}, threeWhys: { 'why-change': '   ' } };

    await streamObjectionCopilot({ objectionText: 'Too pricey', session, content, settings: {} }, vi.fn());

    const [body] = streamClaude.mock.calls[0];
    const prompt = body.messages[0].content;
    expect(prompt).not.toContain('Prospect/session:');
    expect(prompt).not.toContain('Why change');
  });
});
