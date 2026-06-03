/**
 * lib/csp.ts
 *
 * Single source of truth for the Content-Security-Policy header.
 *
 * Imported by:
 *   - next.config.js  (static response headers via lib/csp.mjs companion)
 *   - middleware.ts   (dynamic per-request headers; uses buildCspWithNonce
 *                      for HTML page routes to eliminate unsafe-inline)
 *
 * netlify.toml carries an equivalent inline CSP for CDN-edge delivery.
 * When updating this file, mirror the change in both lib/csp.mjs and
 * netlify.toml (comments in those files mark the relevant blocks).
 *
 * Security posture (tracked changes from #735 to #736):
 *   #735 - unified CSP into a single source of truth.
 *   #736 - replaced 'unsafe-inline' in script-src with per-request nonces
 *           so inline scripts cannot be injected by XSS; removed 'unsafe-eval'
 *           from production builds (Next.js SWC does not require it).
 */

// ---------------------------------------------------------------------------
// Shared directives (same for both nonce and non-nonce variants)
// ---------------------------------------------------------------------------

const SHARED_DIRECTIVES: string[] = [
  // Only same-origin resources by default.
  "default-src 'self'",

  // Styles: unsafe-inline is required for Tailwind-in-JS and third-party
  // widget CSS injected at runtime. Nonce-based style CSP is out of scope.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",

  // Fonts: Google Fonts glyphs served from gstatic; data: for bundled icon sets.
  "font-src 'self' https://fonts.gstatic.com data: https://cdn.jsdelivr.net",

  // Images: https: allows avatar / stock-photo CDNs; blob: and data: for canvas
  // exports and in-browser image previews.
  "img-src 'self' data: https: blob:",

  // Fetch / XHR: enumerate every external API the client calls.
  //   data:                             @react-pdf/renderer yoga-wasm (data: URI)
  //   https://*.supabase.co             database + auth
  //   https://*.nebius.cloud            AI inference
  //   https://api.tokenfactory.nebius.com Nebius token factory
  //   https://generativelanguage.googleapis.com  Gemini API
  //   https://api.mistral.ai            Mistral AI
  //   https://api.stripe.com            Stripe server-side calls from the client
  //   https://latexonline.cc / https://latex.ytotech.com  LaTeX rendering
  //   https://cdn.jsdelivr.net          CDN-hosted WASM and assets
  "connect-src 'self' data: https://*.supabase.co https://*.nebius.cloud https://api.stripe.com https://generativelanguage.googleapis.com https://api.mistral.ai https://api.tokenfactory.nebius.com https://latexonline.cc https://latex.ytotech.com https://cdn.jsdelivr.net",

  // Frames: blob: for PDF previews; Stripe card-input widget runs in an iframe.
  "frame-src 'self' blob: https://js.stripe.com",

  // Restrict <object> and <embed>; blob: for PDF previews.
  "object-src 'self' blob:",

  // Service workers and web workers run same-origin or from blob: URLs.
  "worker-src 'self' blob:",

  // Restrict <base> to same-origin to block base-tag injection.
  "base-uri 'self'",

  // Limit form submissions to same-origin to block reflected-input attacks.
  "form-action 'self'",

  // Prevent this page from being embedded in any external frame (clickjacking).
  "frame-ancestors 'none'",
];

// ---------------------------------------------------------------------------
// Static CSP (used by next.config.js for non-HTML responses and as a fallback)
//
// Retains 'unsafe-inline' and 'unsafe-eval' because next.config.js headers
// are applied to all route responses, including static asset requests where
// Next.js uses eval for chunk loading in development.
// ---------------------------------------------------------------------------

export const CSP_DIRECTIVES: string[] = [
  // Scripts: unsafe-inline and unsafe-eval retained here because this variant
  // is served as a static header (cannot carry per-request nonces).
  //   unsafe-eval:   required by Next.js HMR/webpack in development.
  //   unsafe-inline: fallback for routes not covered by middleware nonces.
  //   https://js.stripe.com: Stripe.js payment widget.
  //   https://cdn.jsdelivr.net: UI library bundles.
  //   https://plausible.io: privacy-first analytics script.
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdn.jsdelivr.net https://plausible.io",
  ...SHARED_DIRECTIVES,
];

/** Full CSP header value for static/fallback use (next.config.js, netlify.toml). */
export const CSP_HEADER: string = CSP_DIRECTIVES.join('; ');

// ---------------------------------------------------------------------------
// Nonce-based CSP (generated per request by middleware for HTML page routes)
//
// Replaces 'unsafe-inline' with 'nonce-{value}' in script-src so only
// scripts that carry the matching nonce attribute are executed. This prevents
// scripts injected by XSS from running even if they appear inline.
//
// 'unsafe-eval' is removed in production (Next.js SWC does not need it).
// ---------------------------------------------------------------------------

/**
 * Returns a CSP header string where 'unsafe-inline' in script-src is replaced
 * by a per-request nonce. Call this from middleware when rendering HTML pages.
 *
 * @param nonce - A cryptographically random base64 string generated per request.
 */
export function buildCspWithNonce(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development';

  const scriptSrc = [
    "'self'",
    // Allow the nonce-carrying inline scripts (theme, analytics init, etc.)
    `'nonce-${nonce}'`,
    // unsafe-eval: only in development (Next.js HMR / webpack needs it).
    ...(isDev ? ["'unsafe-eval'"] : []),
    // Third-party scripts loaded via <script src="..."> remain whitelisted.
    'https://js.stripe.com',
    'https://cdn.jsdelivr.net',
    'https://plausible.io',
  ].join(' ');

  return [`script-src ${scriptSrc}`, ...SHARED_DIRECTIVES].join('; ');
}
