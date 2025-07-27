import { createServerClient } from '@supabase/ssr';
import { type CookieOptions } from '@supabase/ssr';
import { type NextRequest } from 'next/server';

// Create a type-safe response object
const createResponse = () => {
  const response = new Response();
  return Object.assign(response, {
    cookies: {
      set: (name: string, value: string, options?: CookieOptions) => {
        // This is a no-op in middleware, actual cookie handling is done by Next.js
      },
    },
  });
};

// Security headers configuration
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: http:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; '),
};

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Skip middleware for auth routes
  if (request.nextUrl.pathname.startsWith('/auth')) {
    const response = new Response(null, { status: 200 });
    // Apply security headers to auth routes as well
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const response = createResponse();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie in the response
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie by setting maxAge to 0
          response.cookies.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();
  
  // If user is not signed in, redirect to login
  if (!session) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    // Create a redirect response
    const redirectResponse = new Response(null, {
      status: 302,
      headers: {
        Location: url.toString(),
        ...securityHeaders,
      },
    });
    return redirectResponse;
  }

  // Apply security headers to all responses
  const finalResponse = new Response(response.body, response);
  Object.entries(securityHeaders).forEach(([key, value]) => {
    finalResponse.headers.set(key, value);
  });
  
  return finalResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth routes
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$|auth/|api/).*)',
  ],
};
