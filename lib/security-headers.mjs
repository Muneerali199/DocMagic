/**
 * JavaScript companion for lib/security-headers.ts.
 *
 * next.config.js runs in Node.js before TypeScript compilation, so this file
 * mirrors the shared header config for build-time imports.
 */

import { CSP_HEADER } from "./csp.mjs";

export const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

export const CORS_BASE_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Max-Age": "86400",
};

export const NEXT_SECURITY_HEADERS = [
  ...Object.entries(SECURITY_HEADERS).map(([key, value]) => ({ key, value })),
  { key: "Content-Security-Policy", value: CSP_HEADER },
];

/**
 * Parse the comma-separated CORS allow-list from the environment.
 */
export function getAllowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Build CORS response headers when the request origin is explicitly allowed.
 */
export function buildCorsHeaders(origin) {
  if (!origin) return {};

  const allowedOrigins = getAllowedOrigins();
  if (!allowedOrigins.includes("*") && !allowedOrigins.includes(origin))
    return {};

  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    ...CORS_BASE_HEADERS,
  };
}

/**
 * Apply the shared browser security headers to a mutable Headers-like target.
 */
export function applySecurityHeaders(headers) {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }
}
