#!/usr/bin/env bash
# DraftDeckAI — creates all 15 fix files automatically
set -e
echo "Creating directory lib/__tests__ and scripts..."
mkdir -p lib/__tests__ scripts app/api/health

# ─────────────────────────────────────────────────────────────
# FILE 1 of 15 — lib/env.ts   (Fix #5 #20)
# ─────────────────────────────────────────────────────────────
cat > lib/env.ts << 'ENDOFFILE'
/**
 * lib/env.ts  —  Fix #5 (hardcoded secrets) + Fix #20 (startup validation)
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[env] Required env var "${key}" is not set.`);
    }
    console.warn(`[env] WARNING: "${key}" is not set.`);
    return '';
  }
  return value.trim();
}
function optionalEnv(key: string, defaultValue = ''): string {
  return (process.env[key] ?? defaultValue).trim();
}
export const SUPABASE_URL            = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
export const SUPABASE_ANON_KEY       = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
export const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
export const GEMINI_API_KEY          = requireEnv('GEMINI_API_KEY');
export const MISTRAL_API_KEY         = optionalEnv('MISTRAL_API_KEY');
export const OPENAI_API_KEY          = optionalEnv('OPENAI_API_KEY');
export const STRIPE_SECRET_KEY       = optionalEnv('STRIPE_SECRET_KEY');
export const STRIPE_WEBHOOK_SECRET   = optionalEnv('STRIPE_WEBHOOK_SECRET');
export const SMTP_HOST               = optionalEnv('SMTP_HOST', 'smtp.gmail.com');
export const SMTP_PORT               = parseInt(optionalEnv('SMTP_PORT', '587'), 10);
export const SMTP_USER               = optionalEnv('SMTP_USER');
export const SMTP_PASS               = optionalEnv('SMTP_PASS');
export const APP_URL                 = optionalEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
export const APP_NAME                = optionalEnv('NEXT_PUBLIC_APP_NAME', 'DraftDeckAI');
export const NODE_ENV                = optionalEnv('NODE_ENV', 'development');
export const IS_PRODUCTION           = NODE_ENV === 'production';
export const RAPIDAPI_KEY            = optionalEnv('RAPIDAPI_KEY');
export const PEXELS_API_KEY          = optionalEnv('PEXELS_API_KEY');
export const env = {
  SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
  GEMINI_API_KEY, MISTRAL_API_KEY, OPENAI_API_KEY,
  STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
  APP_URL, APP_NAME, NODE_ENV, IS_PRODUCTION,
  RAPIDAPI_KEY, PEXELS_API_KEY,
} as const;
ENDOFFILE
echo "  ✓ lib/env.ts"

# ─────────────────────────────────────────────────────────────
# FILE 2 of 15 — lib/logger.ts   (Fix #9)
# ─────────────────────────────────────────────────────────────
cat > lib/logger.ts << 'ENDOFFILE'
/**
 * lib/logger.ts  —  Fix #9 (structured logging)
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogContext {
  requestId?: string; userId?: string; route?: string;
  durationMs?: number; statusCode?: number; [key: string]: unknown;
}
const IS_PROD = process.env.NODE_ENV === 'production';
const IS_TEST = process.env.NODE_ENV === 'test';
const COLOURS: Record<LogLevel,string> = { debug:'\x1b[90m', info:'\x1b[36m', warn:'\x1b[33m', error:'\x1b[31m' };
const RESET = '\x1b[0m';
function serialize(v: unknown): string {
  if (v === null || v === undefined) return String(v);
  if (typeof v === 'string') return v;
  if (v instanceof Error) return JSON.stringify({ message: v.message, stack: v.stack });
  try { return JSON.stringify(v); } catch { return String(v); }
}
function buildEntry(level: LogLevel, ctx: LogContext|null, args: unknown[]): string {
  const ts = new Date().toISOString();
  const msg = args.map(serialize).join(' ');
  if (IS_PROD) return JSON.stringify({ timestamp: ts, level: level.toUpperCase(), message: msg, ...(ctx ?? {}) });
  const c = COLOURS[level]; const ctxStr = ctx ? ` ${JSON.stringify(ctx)}` : '';
  return `[${ts}] ${c}${level.toUpperCase()}${RESET}${ctxStr} ${msg}`;
}
function out(level: LogLevel, entry: string) {
  if (IS_TEST) return;
  if (level === 'error') console.error(entry);
  else if (level === 'warn') console.warn(entry);
  else if (level === 'debug') console.debug(entry);
  else console.info(entry);
}
export const logger = {
  debug(ctx: LogContext|null, ...a: unknown[]) { if (!IS_PROD) out('debug', buildEntry('debug',ctx,a)); },
  info (ctx: LogContext|null, ...a: unknown[]) { out('info',  buildEntry('info', ctx,a)); },
  warn (ctx: LogContext|null, ...a: unknown[]) { out('warn',  buildEntry('warn', ctx,a)); },
  error(ctx: LogContext|null, ...a: unknown[]) { out('error', buildEntry('error',ctx,a)); },
  withContext(ctx: LogContext) {
    return { debug:(...a:unknown[])=>logger.debug(ctx,...a), info:(...a:unknown[])=>logger.info(ctx,...a),
             warn:(...a:unknown[])=>logger.warn(ctx,...a),  error:(...a:unknown[])=>logger.error(ctx,...a) };
  },
};
ENDOFFILE
echo "  ✓ lib/logger.ts"

# ─────────────────────────────────────────────────────────────
# FILE 3 of 15 — lib/api-handler.ts   (Fix #1 #2 #12)
# ─────────────────────────────────────────────────────────────
cat > lib/api-handler.ts << 'ENDOFFILE'
/**
 * lib/api-handler.ts  —  Fix #1 (unhandled exceptions) + Fix #2 (centralized
 * error middleware) + Fix #12 (unhandled promise rejections)
 */
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ZodError } from 'zod';

// ── Typed errors ─────────────────────────────────────────────
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode = 500,
    public readonly code = 'INTERNAL_ERROR',
  ) { super(message); this.name = 'AppError'; Object.setPrototypeOf(this,AppError.prototype); }
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
  if (error instanceof ZodError) {
    const details = error.errors.map(e=>`${e.path.join('.')}: ${e.message}`);
    return NextResponse.json({ error:'Validation failed', details, requestId }, { status:400 });
  }
  if (error instanceof RateLimitError) {
    return NextResponse.json({ error:error.message, code:error.code, requestId },
      { status:429, headers:{ 'Retry-After': String(error.retryAfter) } });
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
ENDOFFILE
echo "  ✓ lib/api-handler.ts"

# ─────────────────────────────────────────────────────────────
# FILE 4 of 15 — lib/validation.ts   (Fix #6 #17 #20)
# ─────────────────────────────────────────────────────────────
cat > lib/validation.ts << 'ENDOFFILE'
/**
 * lib/validation.ts  —  Fix #6 (XSS/SQLi) + Fix #17 (safe parse) + Fix #20 (limits)
 */
import { z, ZodSchema } from 'zod';

export const LIMITS = {
  NAME_MAX:200, EMAIL_MAX:254, PASSWORD_MIN:8, PASSWORD_MAX:128,
  PROMPT_MIN:10, PROMPT_MAX:5_000, CONTENT_MAX:10_000,
  TITLE_MAX:200, DESCRIPTION_MAX:2_000, MAX_BODY_BYTES:1_048_576,
} as const;

export function sanitizeHtml(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/\//g,'&#x2F;');
}

