import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Protect all /portal_ad routes
  if (request.nextUrl.pathname.startsWith('/portal_ad')) {
    const session = request.cookies.get('admin_session');
    const validSessionToken = process.env.ADMIN_SESSION_TOKEN || 'fallback_secure_token_123';
    
    // If no session cookie exists or it's not the secure token, redirect to login
    if (!session || session.value !== validSessionToken) {
      const loginUrl = new URL('/portal_ad', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/portal_ad/:path*',
};
