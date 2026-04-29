import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logAuthFailure } from '@/lib/security';

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
  '/',        // Landing page (will handle auth redirect)
];

// Landing paths that authenticated users should be redirected from
const LANDING_REDIRECT_PATHS = ['/', '/about', '/faq'];
const LANDING_EXACT_PATHS = ['/', ''];
const LANDING_PREFIX_PATHS = ['/about', '/faq', '/pricing', '/privacy', '/consent'];

const APP_PATH = '/app';

// Static assets and API routes
const PUBLIC_PREFIXES = [
  '/_next/',
  '/static/',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/sitemap',
];

// Admin-only paths
const ADMIN_PATHS = ['/admin', '/api/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public prefixes (static assets)
  if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow API routes to handle their own auth (they use Firebase verify)
  if (pathname.startsWith('/api/')) {
    // Special handling for sensitive API endpoints
    if (pathname.startsWith('/api/crypto/') || pathname.startsWith('/api/billing/')) {
      const authCookie = request.cookies.get('__session')?.value;
      if (!authCookie) {
        logAuthFailure(request, 'API access without valid session');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { 
            status: 401,
            headers: {
              'WWW-Authenticate': 'Bearer',
            }
          }
        );
      }
    }
    return NextResponse.next();
  }

  // Check for Firebase auth token in cookies
  const authCookie = request.cookies.get('__session')?.value || 
                     request.cookies.get('firebaseUser')?.value;

  // If authenticated and on landing page, redirect to app
  if (authCookie) {
    const isLandingPath = LANDING_EXACT_PATHS.includes(pathname) ||
                          LANDING_PREFIX_PATHS.some(path => pathname.startsWith(path));
    if (isLandingPath) {
      const url = request.nextUrl.clone();
      url.pathname = APP_PATH;
      return NextResponse.redirect(url);
    }
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // If no auth cookie, redirect to login
  if (!authCookie) {
    logAuthFailure(request, 'Access to protected route without authentication');
    
    // For app routes, redirect to home with login modal
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'required');
    return NextResponse.redirect(url);
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '0'); // Disabled in favor of CSP
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
