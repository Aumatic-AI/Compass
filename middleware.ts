// middleware.ts  (goes at the PROJECT ROOT — same level as app/, lib/,
// package.json. NOT inside app/.)
//
// Runs before every request to /dashboard/* and checks for a valid
// signed session cookie. No cookie (or an invalid/expired one) means
// an immediate redirect to /login — the dashboard itself never even
// starts rendering for a logged-out visitor.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth-session';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const secret = process.env.AUTH_SECRET || '';

  const isValid = await verifySessionToken(token, secret);

  if (!isValid) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Only run this check for dashboard routes — /login and the auth API
// routes must stay reachable by everyone, logged in or not.
export const config = {
  matcher: ['/dashboard/:path*'],
};
