import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth-session';

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { username, password } = body;
  const validUsername = process.env.DASHBOARD_USERNAME;
  const validPassword = process.env.DASHBOARD_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!validUsername || !validPassword || !secret) {
    return NextResponse.json(
      { error: 'Login is not configured yet — add DASHBOARD_USERNAME, DASHBOARD_PASSWORD, and AUTH_SECRET to .env.local, then restart the server.' },
      { status: 500 }
    );
  }

  if (!username || !password || username !== validUsername || password !== validPassword) {
    return NextResponse.json({ error: 'Incorrect user ID or password.' }, { status: 401 });
  }

  const token = await createSessionToken(username, secret);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
