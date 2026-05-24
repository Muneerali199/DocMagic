/**
 * lib/api-handler.ts  —  Fix #1 (unhandled exceptions) + Fix #2 (centralized
 * error middleware) + Fix #12 (unhandled promise rejections)
 */
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';
import { RequestValidationError } from '@/lib/validation';

// ── Typed errors ─────────────────────────────────────────────
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode = 500,
    public readonly code = 'INTERNAL_ERROR',
  ) { super(message); this.name = new.target.name; Object.setPrototypeOf(this,new.target.prototype); }
}
export class ValidationError extends AppError {
  constructor(m: string) { super(m, 400, 'VALIDATION_ERROR'); this.name='ValidationError'; }
}
export class AuthError extends AppError {
  constructor(m='Unauthorized') { super(m, 401, 'AUTH_ERROR'); this.name='AuthError'; }
}
export class ForbiddenError extends AppError {
  constructor(m='Forbidden') { super(m, 403, 'FORBIDDEN_ERROR'); this.name='ForbiddenError'; }
}
export class NotFoundError extends AppError {
  constructor(r='Resource') { super(`${r} not found`, 404, 'NOT_FOUND'); this.name='NotFoundError'; }
}
export class RateLimitError extends AppError {
  retryAfter: number;
  constructor(s=60) { super('Too many requests',429,'RATE_LIMIT_EXCEEDED'); this.name='RateLimitError'; this.retryAfter=s; }
}

// ── Error → Response ─────────────────────────────────────────
function errorToResponse(error: unknown, requestId: string): NextResponse {
  const isProd = process.env.NODE_ENV === 'production';
  if (error instanceof RequestValidationError) {
    return NextResponse.json({ error: error.message, details: error.details, requestId }, { status: 400 });
  }
  if (error instanceof ZodError) {
    const details = error.errors.map(e=>`${e.path.join('.')}: ${e.message}`);
    return NextResponse.json({ error:'Validation failed', details, requestId }, { status:400 });
  }
  if (error instanceof RateLimitError) {
    return new NextResponse(JSON.stringify({ error:error.message, code:error.code, requestId }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(error.retryAfter),
      },
    });
  }
  if (error instanceof AppError) {
    return NextResponse.json({ error:error.message, code:error.code, requestId }, { status:error.statusCode });
  }
  const message = !isProd && error instanceof Error ? error.message : 'Internal server error';
  return NextResponse.json({ error:message, code:'INTERNAL_ERROR', requestId }, { status:500 });
}

// ── Main wrapper ─────────────────────────────────────────────
type RouteContext = { params?: Record<string,string> };
type Handler = (req: NextRequest, ctx: RouteContext) => Promise<NextResponse>;

export function apiHandler(handler: Handler): Handler {
  return async (req: NextRequest, ctx: RouteContext = {}) => {
    const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();
    const start = Date.now();
    try {
      const response = await handler(req, ctx);
      logger.info({ requestId }, `${req.method} ${req.nextUrl.pathname} → ${response.status} (${Date.now()-start}ms)`);
      response.headers.set('X-Request-Id', requestId);
      return response;
    } catch (error) {
      const response = errorToResponse(error, requestId);
      logger.error({ requestId }, `${req.method} ${req.nextUrl.pathname} → ${response.status} (${Date.now()-start}ms)`, error instanceof Error ? error.stack : error);
      response.headers.set('X-Request-Id', requestId);
      return response;
    }
  };
}

// ── Global rejection guard (Fix #12) ─────────────────────────
export function registerGlobalErrorHandlers() {
  if (typeof process === 'undefined') return;
  process.on('unhandledRejection', (reason) => logger.error(null,'[unhandledRejection]', reason));
  process.on('uncaughtException',  (error)  => logger.error(null,'[uncaughtException]',  error));
}
