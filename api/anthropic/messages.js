// Vercel Edge function: server-side proxy to the Anthropic Messages API.
//
// In dev, Vite's server.proxy in vite.config.js handles /anthropic/v1/messages.
// In prod, vercel.json rewrites /anthropic/v1/messages -> /api/anthropic/messages,
// which lands here. This function attaches the API key from a server-only env
// var (ANTHROPIC_API_KEY, no VITE_ prefix) so the key is never bundled into the
// browser. Streams the SSE response back unchanged.

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not set on server' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }

  const body = await req.text();

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': req.headers.get('anthropic-version') || '2023-06-01',
    },
    body,
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json',
      'cache-control': 'no-cache, no-transform',
    },
  });
}
