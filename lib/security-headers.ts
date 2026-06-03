import { CSP_HEADER } from "./csp";

export const DEFAULT_ALLOWED_ORIGINS = "http://localhost:3000";

export const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Id",
  "Access-Control-Max-Age": "86400",
} as const;

export const SECURITY_HEADER_VALUES = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
} as const;

export const STATIC_SECURITY_HEADERS = [
  ...Object.entries(SECURITY_HEADER_VALUES).map(([key, value]) => ({
    key,
    value,
  })),
  {
    // Source of truth: lib/csp.ts (and its JS companion lib/csp.mjs)
    key: "Content-Security-Policy",
    value: CSP_HEADER,
  },
];

/**
 * Parses the comma-separated CORS allowlist from the environment.
 */
export function getAllowedOrigins(
  rawOrigins = process.env.ALLOWED_ORIGINS ?? DEFAULT_ALLOWED_ORIGINS,
): string[] {
  return rawOrigins.split(",").map((origin) => origin.trim());
}

/**
 * Builds CORS response headers for an allowed request origin.
 */
export function buildCorsHeaders(
  origin: string | null,
  allowedOrigins = getAllowedOrigins(),
): Record<string, string> {
  if (!origin) return {};
  if (!allowedOrigins.includes("*") && !allowedOrigins.includes(origin))
    return {};
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    ...CORS_HEADERS,
  };
}

/**
 * Applies the shared security header values to a mutable Headers object.
 */
export function applySecurityHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(SECURITY_HEADER_VALUES)) {
    headers.set(key, value);
  }
}
