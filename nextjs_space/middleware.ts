import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Global Middleware for Authentication & Product Gating
 * 
 * Rules:
 * 1. If authenticated + has product → allow access
 * 2. If authenticated + no product → redirect to purchase
 * 3. If not authenticated + public path → allow
 * 4. If not authenticated + protected path → save target and redirect to login
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/auth/login',
    '/auth/admin-login',
    '/auth/whop-redirect',
    '/api/auth',
    '/api/dev', // Allow dev endpoints for seeding/testing
  ];

  // Check if path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Allow public paths and static assets
  if (
    isPublicPath ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/robots') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get user session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If not authenticated, redirect to login
  if (!token) {
    // Save the target URL for post-login redirect
    const loginUrl = new URL('/auth/login', request.url);
    
    // For deep links, save the target in the URL
    if (isDeepLink(pathname)) {
      loginUrl.searchParams.set('callbackUrl', pathname + search);
    }
    
    return NextResponse.redirect(loginUrl);
  }

  // Check for coach-only routes (/admin)
  if (pathname.startsWith('/admin')) {
    const isCoach = (token as any).isCoach || false;
    
    if (!isCoach) {
      // Not a coach - redirect to dashboard with error message
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(dashboardUrl);
    }
    
    // Is coach - allow access to admin routes
    return NextResponse.next();
  }

  // User is authenticated - check product ownership for player routes
  const membershipTier = (token as any).membershipTier || 'free';
  const membershipStatus = (token as any).membershipStatus || 'inactive';
  
  // Check if user has an active paid membership
  const hasProduct = 
    membershipStatus === 'active' &&
    membershipTier !== 'free';

  // If no product, redirect to purchase page (except for onboarding/profile)
  if (!hasProduct) {
    const exemptPaths = [
      '/onboarding',
      '/profile',
      '/welcome',
    ];
    
    const isExempt = exemptPaths.some(path => pathname.startsWith(path));
    
    if (!isExempt && pathname !== '/') {
      const purchaseUrl = new URL('/purchase-required', request.url);
      purchaseUrl.searchParams.set('return', pathname + search);
      return NextResponse.redirect(purchaseUrl);
    }
  }

  // User has access - proceed
  return NextResponse.next();
}

/**
 * Check if path is a deep link (content page)
 */
function isDeepLink(pathname: string): boolean {
  const deepLinkPatterns = [
    /^\/video\/[^/]+$/,
    /^\/session\/[^/]+$/,
    /^\/sessions\/[^/]+$/,
    /^\/analysis\/[^/]+$/,
    /^\/lesson\/[^/]+$/,
    /^\/drills\/[^/]+$/,
  ];

  return deepLinkPatterns.some(pattern => pattern.test(pathname));
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, manifest.json (metadata)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp)).*)',
  ],
};
