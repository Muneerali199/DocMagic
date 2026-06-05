/**
 * lib/logger.ts  —  Fix #9 (structured logging)
 */
type LogLevel = "debug" | "info" | "warn" | "error";
export const REQUEST_ID_HEADER = "x-request-id";

export interface LogContext {
  requestId?: string;
  userId?: string;
  route?: string;
  durationMs?: number;
  statusCode?: number;
  [key: string]: unknown;
}
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};
const SENSITIVE_KEY_PATTERN =
  /(password|passwd|token|secret|api[_-]?key|authorization|cookie|session)/i;
const getEnv = () => {
  const key = "NODE_ENV";
  return process.env[key];
};
const IS_PROD = getEnv() === "production";
const IS_TEST = getEnv() === "test";
const COLOURS: Record<LogLevel, string> = {
  debug: "\x1b[90m",
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};
const RESET = "\x1b[0m";

export function createRequestId(candidate?: string | null): string {
  const trimmed = candidate?.trim();
  if (trimmed && /^[a-zA-Z0-9._:-]{8,128}$/.test(trimmed)) {
    return trimmed;
  }

  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export function requestContextFromHeaders(
  headers: Pick<Headers, "get">,
  route: string,
): LogContext {
  return {
    requestId: createRequestId(headers.get(REQUEST_ID_HEADER)),
    route,
  };
}

function getConfiguredLevel(): LogLevel {
  const configured = process.env.LOG_LEVEL?.toLowerCase() as
    | LogLevel
    | undefined;
  if (configured && configured in LOG_LEVEL_PRIORITY) return configured;
  return getEnv() === "production" ? "info" : "debug";
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[getConfiguredLevel()];
}

function redactSensitive(
  value: unknown,
  seen = new WeakSet<object>(),
): unknown {
  if (!value || typeof value !== "object") return value;
  if (value instanceof Error)
    return { message: value.message, stack: value.stack };
  if (seen.has(value)) return "[Circular]";
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, seen));
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key)
        ? "[REDACTED]"
        : redactSensitive(entry, seen),
    ]),
  );
}

function serialize(v: unknown): string {
  if (v === null || v === undefined) return String(v);
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(redactSensitive(v));
  } catch {
    return String(v);
  }
}
function buildEntry(
  level: LogLevel,
  ctx: LogContext | null,
  args: unknown[],
): string {
  const ts = new Date().toISOString();
  const safeCtx = ctx ? redactSensitive(ctx) : null;
  const msg = args.map(serialize).join(" ");
  if (IS_PROD)
    return JSON.stringify({
      timestamp: ts,
      level: level.toUpperCase(),
      message: msg,
      ...(safeCtx ?? {}),
    });
  const c = COLOURS[level];
  const ctxStr = safeCtx ? ` ${JSON.stringify(safeCtx)}` : "";
  return `[${ts}] ${c}${level.toUpperCase()}${RESET}${ctxStr} ${msg}`;
}
function out(level: LogLevel, entry: string) {
  if (!shouldLog(level)) return;
  if (IS_TEST) return;
  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else if (level === "debug") console.debug(entry);
  else console.info(entry);
}
export const logger = {
  debug(ctx: LogContext | null, ...a: unknown[]) {
    if (!IS_PROD) out("debug", buildEntry("debug", ctx, a));
  },
  info(ctx: LogContext | null, ...a: unknown[]) {
    out("info", buildEntry("info", ctx, a));
  },
  warn(ctx: LogContext | null, ...a: unknown[]) {
    out("warn", buildEntry("warn", ctx, a));
  },
  error(ctx: LogContext | null, ...a: unknown[]) {
    out("error", buildEntry("error", ctx, a));
  },
  withContext(ctx: LogContext) {
    return {
      debug: (...a: unknown[]) => logger.debug(ctx, ...a),
      info: (...a: unknown[]) => logger.info(ctx, ...a),
      warn: (...a: unknown[]) => logger.warn(ctx, ...a),
      error: (...a: unknown[]) => logger.error(ctx, ...a),
    };
  },
};
