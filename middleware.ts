import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { CSP_HEADER } from '@/lib/csp';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

const CORS_HDRS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id',
  'Access-Control-Max-Age': '86400',
};

const RL = {
  AUTH: { windowMs: 15 * 60 * 1000, max: 10 },
  GENERATE: { windowMs: 5 * 60 * 1000, max: 20 },
  API: { windowMs: 60 * 1000, max: 100 },
} as const;

type RLKey = keyof typeof RL;

const store = new Map<string, { count: number; reset: number }>();

function pruneStore() {
  const now = Date.now();
  for (const [k, d] of store) {
    if (now > d.reset) store.delete(k);
  }
}

function rlKey(pathname: string): RLKey {
  const norm = pathname.replace(/^\/api\/v\d+(?:\/|$)/, '/api/');

  if (norm.startsWith('/api/auth/')) return 'AUTH';
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
    e = {
      count: 1,
      reset: now + cfg.windowMs,
    };

    store.set(sk, e);

    return {
      allowed: true,
      remaining: cfg.max - 1,
      reset: e.reset,
      limit: cfg.max,
    };
  }

  if (e.count >= cfg.max) {
    return {
      allowed: false,
      remaining: 0,
      reset: e.reset,
      limit: cfg.max,
    };
  }

  e.count++;

  return {
    allowed: true,
    remaining: cfg.max - e.count,
    reset: e.reset,
    limit: cfg.max,
  };
}

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return {};

  if (
    !ALLOWED_ORIGINS.includes('*') &&
    !ALLOWED_ORIGINS.includes(origin)
  ) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    ...CORS_HDRS,
  };
}

function secHdrs(r: NextResponse) {
  r.headers.set('X-Frame-Options', 'DENY');
  r.headers.set('X-Content-Type-Options', 'nosniff');
  r.headers.set('X-XSS-Protection', '1; mode=block');
  r.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  r.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );

  r.headers.set('Content-Security-Policy', CSP_HEADER);
}

export function middleware(request: NextRequest) {
  const requestId = crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);

  requestHeaders.set('x-request-id', requestId);

  const { pathname } = request.nextUrl;

  const origin = request.headers.get('origin');

  const cors = corsHeaders(origin);

  // OPTIONS
  if (request.method === 'OPTIONS') {
    if (!Object.keys(cors).length) {
      return new NextResponse(null, { status: 403 });
    }

    return new NextResponse(null, {
      status: 204,
      headers: cors,
    });
  }

  // Static assets
  if (
    pathname.match(
      /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/i
    )
  ) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.headers.set(
      'Cache-Control',
      'public,max-age=31536000,immutable'
    );

    response.headers.set('Vary', 'Accept-Encoding');

    response.headers.set('x-request-id', requestId);

    return response;
  }

  // API routes
  if (pathname.startsWith('/api/')) {
    const ip = (
      request.headers.get('x-forwarded-for')?.split(',')[0] ??
      request.headers.get('x-real-ip') ??
      'unknown'
    ).trim();

    const rl = checkRL(ip, pathname);

    if (!rl.allowed) {
      const ra = Math.ceil((rl.reset - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: ra,
        },
        {
          status: 429,
          headers: {
            ...cors,
            'Retry-After': String(ra),
            'X-RateLimit-Limit': String(rl.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(
              Math.ceil(rl.reset / 1000)
            ),
          },
        }
      );
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    for (const [k, v] of Object.entries(cors)) {
      response.headers.set(k, v);
    }

    response.headers.set(
      'X-RateLimit-Limit',
      String(rl.limit)
    );

    response.headers.set(
      'X-RateLimit-Remaining',
      String(rl.remaining)
    );

    response.headers.set(
      'X-RateLimit-Reset',
      String(Math.ceil(rl.reset / 1000))
    );

    const versionMatch = pathname.match(
      /^\/api\/(v\d+)(?:\/|$)/
    );

    response.headers.set(
      'X-API-Version',
      versionMatch ? versionMatch[1] : 'v2'
    );

    response.headers.set('x-request-id', requestId);

    return response;
  }

  // Pages
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  secHdrs(response);

  response.headers.set(
    'Cache-Control',
    'public,max-age=300,stale-while-revalidate=3600'
  );

  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  response.headers.set('x-request-id', requestId);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};