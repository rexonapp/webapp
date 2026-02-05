import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

interface SessionData {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  authProvider: string;
  role?: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a superadmin route
  if (pathname.startsWith('/superadmin')) {
    const sessionToken = request.cookies.get('session')?.value;

    // No session token - redirect to login
    if (!sessionToken) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Verify and decode the JWT token
      const { payload } = await jwtVerify(sessionToken, SECRET_KEY);
      const session = payload as unknown as SessionData;

      // Check if user has superadmin role
      if (session.role !== 'superadmin') {
        // User is logged in but not a superadmin - redirect to home
        return NextResponse.redirect(new URL('/', request.url));
      }

      // User is authenticated and has superadmin role - allow access
      return NextResponse.next();
    } catch (error) {
      // Invalid or expired token - redirect to login
      console.error('JWT verification failed:', error);
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // For all other routes, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
