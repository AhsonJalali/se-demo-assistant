export const config = { runtime: 'edge' };

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

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const expectedUsername = process.env.APP_USERNAME;
  const expectedPassword = process.env.APP_PASSWORD;
  const appSecret = process.env.APP_SECRET;

  if (!expectedUsername || !expectedPassword || !appSecret) {
    return new Response(JSON.stringify({ error: 'AUTH_NOT_CONFIGURED' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const { username, password } = body;

  if (username !== expectedUsername || password !== expectedPassword) {
    return new Response(JSON.stringify({ error: 'INVALID_CREDENTIALS' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  const token = await computeHmac(`${username}:${password}`, appSecret);

  return new Response(JSON.stringify({ token }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
