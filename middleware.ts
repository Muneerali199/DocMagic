import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

// Deployment error detection
const DEPLOYMENT_ERROR_PATTERNS = [
  /DEPLOYMENT_NOT_FOUND/i,
  /503|504/,
  /service unavailable/i,
  /deployment.*error/i,
];

// In-memory stores
const rateLimitStore = new Map<string, { count: number; reset: number }>();
const ipBlocklist = new Set<string>();

/**
 * Detect if error is deployment-related
 */
function isDeploymentError(response: Response): boolean {
  const status = response.status;
  
  // Check HTTP status codes that indicate deployment issues
  if (status === 503 || status === 504 || status >= 500) {
    return true;
  }
  
  return false;
}

/**
 * Log error for monitoring (Sentry, LogRocket, etc.)
 */
async function logError(
  pathname: string,
  error: string,
  status: number,
  timestamp: number
) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${pathname}: ${error} (${status}) at ${new Date(timestamp).toISOString()}`);
  }

  // TODO: Integrate with Sentry or other monitoring service
  // if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  //   await Sentry.captureMessage(`Deployment Error: ${error}`, 'error');
  // }
}

function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith('/api/auth/')) {
    return RATE_LIMITS.AUTH;
  } else if (pathname.startsWith('/api/generate/')) {
    return RATE_LIMITS.GENERATE;
  } else if (pathname.startsWith('/api/export/')) {
    return RATE_LIMITS.EXPORT;
  }
  return RATE_LIMITS.API;
const CORS_HDRS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id',
  'Access-Control-Max-Age': '86400',
};

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return {};
  if (!ALLOWED_ORIGINS.includes('*') && !ALLOWED_ORIGINS.includes(origin)) return {};
  return { 'Access-Control-Allow-Origin': origin, ...CORS_HDRS };
}

const RL = {
  AUTH:     { windowMs: 15 * 60 * 1000, max: 10  },
  GENERATE: { windowMs:  5 * 60 * 1000, max: 20  },
  API:      { windowMs:       60 * 1000, max: 100 },
} as const;

type RLKey = keyof typeof RL;

const store = new Map<string, { count: number; reset: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [k, d] of store) if (now > d.reset) store.delete(k);
}, 60_000);

function rlKey(p: string): RLKey {
  // Strip version prefix so /api/v1/generate/... and /api/generate/... share the same bucket
  const norm = p.replace(/^\/api\/v\d+(?:\/|$)/, '/api/');
  if (norm.startsWith('/api/auth/'))     return 'AUTH';
  if (norm.startsWith('/api/generate/')) return 'GENERATE';
  return 'API';
}

function checkRL(ip: string, pathname: string) {
  const k = rlKey(pathname);
  const cfg = RL[k];
  const now = Date.now();
  const sk = `${ip}:${k}`;
  let e = store.get(sk);
  if (!e || now > e.reset) {
    e = { count: 1, reset: now + cfg.windowMs };
    store.set(sk, e);
    return { allowed: true, remaining: cfg.max - 1, reset: e.reset, limit: cfg.max };
  }
  if (e.count >= cfg.max)
    return { allowed: false, remaining: 0, reset: e.reset, limit: cfg.max };
  e.count++;
  return { allowed: true, remaining: cfg.max - e.count, reset: e.reset, limit: cfg.max };
}

function secHdrs(r: NextResponse) {
  r.headers.set('X-Frame-Options', 'DENY');
  r.headers.set('X-Content-Type-Options', 'nosniff');
  r.headers.set('X-XSS-Protection', '1; mode=block');
  r.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  r.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    if (!Object.keys(cors).length) return new NextResponse(null, { status: 403 });
    return new NextResponse(null, { status: 204, headers: cors });
  }

  if (/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/i.test(pathname)) {
    const r = NextResponse.next();
    r.headers.set('Cache-Control', 'public,max-age=31536000,immutable');
    return r;
  }

  if (pathname.startsWith('/api/')) {
    const rateLimitResult = checkRateLimit(ip, pathname);
    
    if (!rateLimitResult.allowed) {
      const errorMsg = 'Rate limit exceeded';
      logError(pathname, errorMsg, 429, Date.now());
      
      return NextResponse.json(
        {
          error: errorMsg,
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
    const ip = (
      req.headers.get('x-forwarded-for')?.split(',')[0] ??
      req.headers.get('x-real-ip') ??
      'unknown'
    ).trim();
    const rl = checkRL(ip, pathname);
    if (!rl.allowed) {
      const ra = Math.ceil((rl.reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: ra },
        {
          status: 429,
          headers: {
            ...cors,
            'Retry-After': String(ra),
            'X-RateLimit-Limit': String(rl.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rl.reset / 1000)),
          },
        }
      );
    }

    const response = NextResponse.next();
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', RATE_LIMITS.API.max.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.reset / 1000).toString());
    
    // Performance monitoring for AI endpoints
    if (pathname.startsWith('/api/generate/') || pathname.startsWith('/api/analyze-ats')) {
      response.headers.set('X-Endpoint-Type', 'ai-generation');
    }
    
    // Detect and log deployment errors
    if (isDeploymentError(response)) {
      logError(pathname, 'Deployment error detected', response.status, Date.now());
      
      // Add error context header for client-side handling
      response.headers.set('X-Deployment-Error', 'true');
    }
    
    return response;
  }

  // HTML pages - add performance headers
  if (pathname.match(/\.html$/) || !pathname.includes('.')) {
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Performance headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Cache HTML pages moderately
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
    
    // Detect and log deployment errors for pages
    if (isDeploymentError(response)) {
      logError(pathname, 'Deployment error on page load', response.status, Date.now());
      response.headers.set('X-Deployment-Error', 'true');
    }
    
    return response;
    const r = NextResponse.next();
    for (const [k, v] of Object.entries(cors)) r.headers.set(k, v);
    r.headers.set('X-RateLimit-Limit', String(rl.limit));
    r.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    r.headers.set('X-RateLimit-Reset', String(Math.ceil(rl.reset / 1000)));

    // Stamp which API version was routed so clients always know what they got
    const versionMatch = pathname.match(/^\/api\/(v\d+)(?:\/|$)/);
    r.headers.set('X-API-Version', versionMatch ? versionMatch[1] : 'v2');

    return r;
  }

  const r = NextResponse.next();
  secHdrs(r);
  r.headers.set('Cache-Control', 'public,max-age=300,stale-while-revalidate=3600');
  return r;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)', ],
};
