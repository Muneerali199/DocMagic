import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

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
