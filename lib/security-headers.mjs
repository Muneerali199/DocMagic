import { CSP_HEADER } from "./csp.mjs";

export const DEFAULT_ALLOWED_ORIGINS = "http://localhost:3000";

export const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-Id",
  "Access-Control-Max-Age": "86400",
};

export const SECURITY_HEADER_VALUES = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

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
) {
  return rawOrigins.split(",").map((origin) => origin.trim());
}

/**
 * Builds CORS response headers for an allowed request origin.
 */
export function buildCorsHeaders(origin, allowedOrigins = getAllowedOrigins()) {
  if (!origin) return {};
  if (!allowedOrigins.includes("*") && !allowedOrigins.includes(origin)) {
    return {};
  }
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    ...CORS_HEADERS,
  };
}
