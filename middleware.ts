import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CSP_HEADER, buildCspWithNonce } from '@/lib/csp';
import { applySecurityHeaders, buildCorsHeaders } from '@/lib/security-headers';

const DEPLOYMENT_ERROR_PATTERNS = [
  /DEPLOYMENT_NOT_FOUND/i,
  /503|504/,
  /service unavailable/i,
  /deployment.*error/i,
];

function isDeploymentError(response: Response): boolean {
  const status = response.status;
  if (status === 503 || status === 504 || status >= 500) {
    return true;
  }
  return false;
}

async function logError(
  pathname: string,
  error: string,
  status: number,
  timestamp: number
) {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${pathname}: ${error} (${status}) at ${new Date(timestamp).toISOString()}`);
  }
}

const RL = {
  AUTH:     { windowMs: 15 * 60 * 1000, max: 10  },
  GENERATE: { windowMs:  5 * 60 * 1000, max: 20  },
  API:      { windowMs:       60 * 1000, max: 100 },
} as const;

type RLKey = keyof typeof RL;

// NOTE: In-memory Maps only rate-limit per individual Edge node in production. 
// For global production rate limiting, swap this Map for Vercel KV or Redis.
const store = new Map<string, { count: number; reset: number }>();
function pruneStore() {
  const now = Date.now();
  for (const [k, d] of store) if (now > d.reset) store.delete(k);
}

function rlKey(p: string): RLKey {
  const norm = p.replace(/^\/api\/v\d+(?:\/|$)/, '/api/');
  if (norm.startsWith('/api/auth/'))     return 'AUTH';
  if (norm.startsWith('/api/generate/')) return 'GENERATE';
  return 'API';
}

function checkRL(ip: string, pathname: string) {
  pruneStore();
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

/**
 * Generate a cryptographically random nonce for per-request CSP.
 * Uses Web APIs (btoa) to ensure compatibility with the Edge Runtime.
 */
function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(Array.from(bytes).map(b => String.fromCharCode(b)).join(''));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin');
  const cors = buildCorsHeaders(origin);

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
    const ip = (
      req.headers.get('x-forwarded-for')?.split(',')[0] ??
      req.headers.get('x-real-ip') ??
      'unknown'
    ).trim();
    
    const rl = checkRL(ip, pathname);
    if (!rl.allowed) {
      const ra = Math.ceil((rl.reset - Date.now()) / 1000);
      logError(pathname, 'Rate limit exceeded', 429, Date.now());
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

    const r = NextResponse.next();
    for (const [k, v] of Object.entries(cors)) r.headers.set(k, v);
    r.headers.set('X-RateLimit-Limit', String(rl.limit));
    r.headers.set('X-RateLimit-Remaining', String(rl.remaining));
    r.headers.set('X-RateLimit-Reset', String(Math.ceil(rl.reset / 1000)));

    const versionMatch = pathname.match(/^\/api\/(v\d+)(?:\/|$)/);
    r.headers.set('X-API-Version', versionMatch ? versionMatch[1] : 'v2');

    if (pathname.startsWith('/api/generate/') || pathname.startsWith('/api/analyze-ats')) {
      r.headers.set('X-Endpoint-Type', 'ai-generation');
    }

    if (isDeploymentError(r)) {
      logError(pathname, 'Deployment error detected', r.status, Date.now());
      r.headers.set('X-Deployment-Error', 'true');
    }

    return r;
  }

  if (!pathname.includes('.')) {
    const nonce = generateNonce();
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-nonce', nonce);

    const r = NextResponse.next({ request: { headers: requestHeaders } });
    applySecurityHeaders(r.headers);
    
    r.headers.set('Content-Security-Policy', buildCspWithNonce(nonce));
    r.headers.set('X-DNS-Prefetch-Control', 'on');
    r.headers.set('Cache-Control', 'public,max-age=300,stale-while-revalidate=3600');
    r.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    if (isDeploymentError(r)) {
      logError(pathname, 'Deployment error on page load', r.status, Date.now());
      r.headers.set('X-Deployment-Error', 'true');
    }

    return r;
  }

  const r = NextResponse.next();
  applySecurityHeaders(r.headers);
  r.headers.set('Content-Security-Policy', CSP_HEADER);
  r.headers.set('Cache-Control', 'public,max-age=300,stale-while-revalidate=3600');
  return r;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
