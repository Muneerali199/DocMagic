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
