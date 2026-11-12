import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, roleForToken } from '@/server/session';

/**
 * Runs before every /admin request. Anyone who is not a signed-in admin gets
 * the "Access denied" page with a real HTTP 403 status, and the admin page
 * itself never runs for them.
 */
export async function proxy(request: NextRequest) {
  const role = await roleForToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (role === 'admin') {
    return NextResponse.next();
  }
  return NextResponse.rewrite(new URL('/access-denied', request.url), { status: 403 });
}

export const config = {
  matcher: ['/admin/:path*'],
};
