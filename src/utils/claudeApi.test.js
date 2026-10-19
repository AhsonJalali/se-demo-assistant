import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { describeProduct, streamClaude } from './claudeApi';

function sseResponse(chunks, { ok = true, status = 200, statusText = '' } = {}) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return {
    ok,
    status,
    statusText,
    body: stream,
    text: async () => chunks.join(''),
  };
}

beforeEach(() => {
  sessionStorage.clear();
  vi.stubEnv('DEV', false);
  vi.stubEnv('VITE_ANTHROPIC_API_KEY', undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('describeProduct', () => {
  it('falls back to generic platform language with no settings', () => {
    const text = describeProduct(undefined);
    expect(text).toContain('our platform');
    expect(text).toContain('No product description was provided');
  });

  it('names the product and company when both are given', () => {
    const text = describeProduct({ productName: 'Acme Cloud', companyName: 'Acme Inc' });
    expect(text).toContain('The SE sells Acme Cloud (from Acme Inc).');
  });

  it('omits the parenthetical for the default "our team" company placeholder', () => {
    const text = describeProduct({ productName: 'Acme Cloud', companyName: 'our team' });
    expect(text).not.toContain('(from');
  });

  it('includes the pitch verbatim when provided', () => {
    const text = describeProduct({ productName: 'Acme Cloud', productPitch: 'Ships faster.' });
    expect(text).toContain("What Acme Cloud does, in the SE's words:\nShips faster.");
  });
});

describe('streamClaude', () => {
  it('throws NO_API_KEY in dev with no key configured', async () => {
    vi.stubEnv('DEV', true);
    await expect(streamClaude({}, () => {})).rejects.toThrow('NO_API_KEY');
  });

  it('sends x-api-key when a dev API key is configured', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'test-key');
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([]));
    vi.stubGlobal('fetch', fetchMock);

    await streamClaude({ model: 'x' }, () => {});

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers['x-api-key']).toBe('test-key');
    expect(options.headers['Authorization']).toBeUndefined();
  });

  it('sends a bearer token from sessionStorage in prod when one exists', async () => {
    sessionStorage.setItem('ts_auth_token', 'session-token');
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([]));
    vi.stubGlobal('fetch', fetchMock);

    await streamClaude({ model: 'x' }, () => {});

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers['Authorization']).toBe('Bearer session-token');
  });

  it('omits the Authorization header in prod when there is no token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([]));
    vi.stubGlobal('fetch', fetchMock);

    await streamClaude({ model: 'x' }, () => {});

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers['Authorization']).toBeUndefined();
  });

  it('clears the token and throws AUTH_EXPIRED on a 401', async () => {
    sessionStorage.setItem('ts_auth_token', 'stale-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sseResponse([], { ok: false, status: 401 })));

    await expect(streamClaude({}, () => {})).rejects.toThrow('AUTH_EXPIRED');
    expect(sessionStorage.getItem('ts_auth_token')).toBeNull();
  });

  it('throws RATE_LIMITED on a 429', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sseResponse([], { ok: false, status: 429 })));
    await expect(streamClaude({}, () => {})).rejects.toThrow('RATE_LIMITED');
  });

  it('throws SERVER_API_KEY_INVALID on a 502 naming that error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        sseResponse(['SERVER_API_KEY_INVALID: bad key'], { ok: false, status: 502 })
      )
    );
    await expect(streamClaude({}, () => {})).rejects.toThrow('SERVER_API_KEY_INVALID');
  });

  it('throws a generic API_ERROR with the status and body for other failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(sseResponse(['boom'], { ok: false, status: 500 }))
    );
    await expect(streamClaude({}, () => {})).rejects.toThrow('API_ERROR:500:boom');
  });

  it('forwards only assistant text deltas to onChunk', async () => {
    const lines = [
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hel"}}\n',
      'data: {"type":"content_block_delta","delta":{"type":"input_json_delta","partial_json":"{}"}}\n',
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"lo"}}\n',
      'data: [DONE]\n',
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sseResponse(lines)));

    const onChunk = vi.fn();
    await streamClaude({}, onChunk);

    expect(onChunk.mock.calls.map((c) => c[0])).toEqual(['Hel', 'lo']);
  });

  it('reassembles a data line split across multiple stream reads', async () => {
    const full = 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"whole"}}\n';
    const splitPoint = 20;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(sseResponse([full.slice(0, splitPoint), full.slice(splitPoint)]))
    );

    const onChunk = vi.fn();
    await streamClaude({}, onChunk);

    expect(onChunk).toHaveBeenCalledTimes(1);
    expect(onChunk).toHaveBeenCalledWith('whole');
  });

  it('ignores blank lines and malformed JSON without throwing', async () => {
    const lines = ['\n', 'data: \n', 'data: not-json\n', 'data: [DONE]\n'];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sseResponse(lines)));

    const onChunk = vi.fn();
    await expect(streamClaude({}, onChunk)).resolves.toBeUndefined();
    expect(onChunk).not.toHaveBeenCalled();
  });

  it('ignores non data: lines such as SSE event: fields', async () => {
    const lines = ['event: ping\n', 'data: [DONE]\n'];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sseResponse(lines)));

    const onChunk = vi.fn();
    await streamClaude({}, onChunk);
    expect(onChunk).not.toHaveBeenCalled();
  });

  it('serializes the request body with stream: true', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([]));
    vi.stubGlobal('fetch', fetchMock);

    await streamClaude({ model: 'claude-sonnet-5', max_tokens: 100 }, () => {});

    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      model: 'claude-sonnet-5',
      max_tokens: 100,
      stream: true,
    });
  });
});
