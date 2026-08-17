// lib/auth-session.ts
//
// Minimal signed-cookie session for the dashboard login. No external
// auth library — just an HMAC-signed token so the cookie can't be
// forged without knowing AUTH_SECRET.
//
// Uses Web Crypto (crypto.subtle) only, deliberately avoiding Node-only
// APIs like Buffer, because this file is imported both by middleware.ts
// (which runs on the Edge runtime) and by the login API route (Node
// runtime) — Web Crypto is the one thing both environments support.

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createSessionToken(username: string, secret: string): Promise<string> {
  // Base64-encode the username first. Without this, a username
  // containing a dot (very common — e.g. "admin@gmail.com") would
  // break the 3-part split below, since the token itself is
  // dot-delimited. Base64 output never contains a literal dot.
  const encodedUsername = btoa(username);
  const payload = `${encodedUsername}.${Date.now()}`;
  const sig = await hmacHex(secret, payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
  secret: string
): Promise<boolean> {
  if (!token || !secret) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [encodedUsername, ts, sig] = parts;
  if (!encodedUsername || !ts || !sig) return false;

  const expectedSig = await hmacHex(secret, `${encodedUsername}.${ts}`);
  if (sig !== expectedSig) return false;

  const issuedAt = Number(ts);
  if (Number.isNaN(issuedAt)) return false;
  if (Date.now() - issuedAt > SEVEN_DAYS_MS) return false;

  return true;
}

export const SESSION_COOKIE_NAME = 'dash_session';
