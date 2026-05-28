/**
 * lib/csp.mjs
 *
 * JavaScript re-export of lib/csp.ts for use in next.config.js.
 * next.config.js runs in Node.js before TypeScript compilation, so it
 * cannot import .ts files directly. This file mirrors the same CSP_HEADER
 * value and must be kept in sync with lib/csp.ts.
 *
 * When changing the CSP, update BOTH this file AND lib/csp.ts.
 *
 * See lib/csp.ts for per-directive documentation.
 */

export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdn.jsdelivr.net https://plausible.io",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
  "font-src 'self' https://fonts.gstatic.com data: https://cdn.jsdelivr.net",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' data: https://*.supabase.co https://*.nebius.cloud https://api.stripe.com https://generativelanguage.googleapis.com https://api.mistral.ai https://api.tokenfactory.nebius.com https://latexonline.cc https://latex.ytotech.com https://cdn.jsdelivr.net",
  "frame-src 'self' blob: https://js.stripe.com",
  "object-src 'self' blob:",
  "worker-src 'self' blob:",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
];

export const CSP_HEADER = CSP_DIRECTIVES.join('; ');
