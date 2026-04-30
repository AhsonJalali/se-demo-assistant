// Vercel Edge function: server-side proxy to the Anthropic Messages API.
//
// In dev, Vite's server.proxy in vite.config.js handles /anthropic/v1/messages.
// In prod, vercel.json rewrites /anthropic/v1/messages -> /api/anthropic/messages,
// which lands here. This function attaches the API key from a server-only env
// var (ANTHROPIC_API_KEY, no VITE_ prefix) so the key is never bundled into the
// browser. Streams the SSE response back unchanged.

export const config = { runtime: 'edge' };

// In-memory sliding-window rate limiter (best-effort within a single Edge isolate).
// State resets on cold starts, so this is basic throttling rather than strict enforcement.
const ipTimestamps = new Map();

function checkRateLimit(ip) {
  const max = Number(process.env.RATE_LIMIT_MAX ?? 20);
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MINUTES ?? 60) * 60_000;
  const now = Date.now();
  const cutoff = now - windowMs;

  const timestamps = (ipTimestamps.get(ip) ?? []).filter(t => t > cutoff);
  if (timestamps.length >= max) return false;
  timestamps.push(now);
  ipTimestamps.set(ip, timestamps);
  return true;
}

async function computeHmac(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const buf = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

async function verifyToken(token) {
  const secret = process.env.APP_SECRET;
  // Auth is optional — if APP_SECRET isn't set, all requests are allowed through
  if (!secret) return true;

  const username = process.env.APP_USERNAME;
  const password = process.env.APP_PASSWORD;
  if (!username || !password || !token) return false;

  const expected = await computeHmac(`${username}:${password}`, secret);
  return token === expected;
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Auth check
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!(await verifyToken(token))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Rate limit check
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
      status: 429,
      headers: { 'content-type': 'application/json', 'retry-after': '3600' },
    });
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
