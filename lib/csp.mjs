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

// 1. Define shared directives (everything except script-src)
const SHARED_DIRECTIVES = [
  "default-src 'self'",
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

// 2. Define static fallback directives (includes unsafe-inline for static assets)
const IS_DEV = process.env.NODE_ENV === 'development';

export const CSP_DIRECTIVES = [
  [
    "script-src",
    "'self'",
    ...(IS_DEV ? ["'unsafe-eval'"] : []),
    "'unsafe-inline'",
    "https://js.stripe.com",
    "https://cdn.jsdelivr.net",
    "https://plausible.io",
  ].join(' '),
  ...SHARED_DIRECTIVES
];

export const CSP_HEADER = CSP_DIRECTIVES.join('; ');

/**
 * Returns a CSP header string where 'unsafe-inline' in script-src is replaced
 * by a per-request nonce. Call this from middleware when rendering HTML pages.
 *
 * @param {string} nonce - A cryptographically random base64 string generated per request.
 */
export function buildCspWithNonce(nonce) {
  const isDev = process.env.NODE_ENV === 'development';

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    ...(isDev ? ["'unsafe-eval'"] : []),
    'https://js.stripe.com',
    'https://cdn.jsdelivr.net',
    'https://plausible.io',
  ].join(' ');

  // 3. Combine the strict script-src with the shared directives
  return [`script-src ${scriptSrc}`, ...SHARED_DIRECTIVES].join('; ');
}