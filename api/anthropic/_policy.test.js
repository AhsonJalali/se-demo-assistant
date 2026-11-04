import { describe, it, expect } from 'vitest';
import { applyPolicy, safeEqual, PolicyError, DEFAULT_MODEL, MAX_TOKENS_CAP, WEB_SEARCH_TYPE } from './_policy.js';

const msg = [{ role: 'user', content: 'hi' }];

describe('applyPolicy', () => {
  it('pins the model and forces streaming regardless of what the client sends', () => {
    const out = applyPolicy({ model: 'claude-fable-5-1', stream: false, messages: msg, max_tokens: 100 });
    expect(out.model).toBe(DEFAULT_MODEL);
    expect(out.stream).toBe(true);
  });

  it('caps max_tokens and defaults it when missing', () => {
    expect(applyPolicy({ messages: msg, max_tokens: 128000 }).max_tokens).toBe(MAX_TOKENS_CAP);
    expect(applyPolicy({ messages: msg }).max_tokens).toBe(MAX_TOKENS_CAP);
    expect(applyPolicy({ messages: msg, max_tokens: 1500 }).max_tokens).toBe(1500);
  });

  it('drops unknown fields', () => {
    const out = applyPolicy({ messages: msg, thinking: { type: 'adaptive' }, mcp_servers: [{}], speed: 'fast' });
    expect(Object.keys(out).sort()).toEqual(['max_tokens', 'messages', 'model', 'stream']);
  });

  it('allows only web search, normalised and capped', () => {
    const out = applyPolicy({ messages: msg, tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 50 }] });
    expect(out.tools).toEqual([{ type: WEB_SEARCH_TYPE, name: 'web_search', max_uses: 5 }]);
    expect(() => applyPolicy({ messages: msg, tools: [{ type: 'code_execution_20260521', name: 'code_execution' }] }))
      .toThrow(PolicyError);
  });

  it('keeps text system blocks with cache_control and rejects anything else', () => {
    const out = applyPolicy({ messages: msg, system: [{ type: 'text', text: 'lib', cache_control: { type: 'ephemeral', ttl: '1h' } }] });
    expect(out.system).toEqual([{ type: 'text', text: 'lib', cache_control: { type: 'ephemeral' } }]);
    expect(() => applyPolicy({ messages: msg, system: [{ type: 'image' }] })).toThrow(PolicyError);
  });

  it('rejects malformed bodies', () => {
    expect(() => applyPolicy(null)).toThrow(PolicyError);
    expect(() => applyPolicy({ messages: [] })).toThrow(PolicyError);
    expect(() => applyPolicy({ messages: [{ role: 'system', content: 'x' }] })).toThrow(PolicyError);
  });
});

describe('safeEqual', () => {
  it('compares strings', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
    expect(safeEqual(undefined, 'abc')).toBe(false);
  });
});
