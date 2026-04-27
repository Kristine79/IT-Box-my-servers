import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  '/share/',  // Public share links
  '/about',   // Public about page
  '/faq',     // Public FAQ
  '/pricing', // Public pricing
  '/privacy', // Privacy policy
  '/consent', // Data consent
  '/login',   // Login page
  '/auth',    // Auth page
  '/',        // Dashboard (will handle auth check client-side)
];

// Static assets and API routes
const PUBLIC_PREFIXES = [
  '/_next/',
  '/api/',
  '/static/',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/sitemap',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public prefixes
  if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for Firebase auth token in cookies
  const authCookie = request.cookies.get('__session')?.value || 
                     request.cookies.get('firebaseUser')?.value;

  // If no auth cookie, redirect to login
  if (!authCookie) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For app routes, redirect to home with login modal
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'required');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
