/**
 * Shared security and CORS headers.
 *
 * next.config.js imports the matching lib/security-headers.mjs companion
 * because it runs before TypeScript compilation. Keep both files in sync.
 */

import { CSP_HEADER } from "./csp";

type HeaderTarget = {
  set(key: string, value: string): void;
};

export const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
} as const;

export const CORS_BASE_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Id",
  "Access-Control-Max-Age": "86400",
} as const;

export const NEXT_SECURITY_HEADERS = [
  ...Object.entries(SECURITY_HEADERS).map(([key, value]) => ({ key, value })),
  { key: "Content-Security-Policy", value: CSP_HEADER },
];

/**
 * Parse the comma-separated CORS allow-list from the environment.
 */
export function getAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim());
}

/**
 * Build CORS response headers when the request origin is explicitly allowed.
 */
export function buildCorsHeaders(
  origin: string | null,
): Record<string, string> {
  if (!origin) return {};

  const allowedOrigins = getAllowedOrigins();
  if (!allowedOrigins.includes("*") && !allowedOrigins.includes(origin))
    return {};

  return { "Access-Control-Allow-Origin": origin, ...CORS_BASE_HEADERS };
}

/**
 * Apply the shared browser security headers to a mutable Headers-like target.
 */
export function applySecurityHeaders(headers: HeaderTarget): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
}
