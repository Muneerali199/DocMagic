/**
 * lib/csp.ts
 *
 * Single source of truth for the Content-Security-Policy header.
 *
 * Imported by:
 *   - next.config.js  (static response headers for all routes)
 *   - middleware.ts   (dynamic per-request headers for page routes)
 *
 * netlify.toml carries an equivalent inline CSP for CDN-edge delivery.
 * When updating this file, mirror the change in netlify.toml as well
 * (a comment in that file marks the relevant block).
 */

/**
 * CSP directives with an inline explanation for each.
 * Keeping the rationale next to the value makes future audits easier.
 */
export const CSP_DIRECTIVES: string[] = [
  // Block any resource not explicitly permitted below.
  "default-src 'self'",

  // Scripts: same-origin plus trusted third-party bundles.
  //   - 'unsafe-eval': required by Next.js SWC in development mode.
  //   - 'unsafe-inline': needed until all inline scripts use nonces (tracked in #736).
  //   - https://js.stripe.com: Stripe.js payment widget.
  //   - https://cdn.jsdelivr.net: UI library bundles.
  //   - https://plausible.io: privacy-first analytics script.
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://cdn.jsdelivr.net https://plausible.io",

  // Styles: 'unsafe-inline' is required for Tailwind-generated class styles
  // and third-party widget CSS injected at runtime.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",

  // Fonts: Google Fonts glyphs are served from gstatic.com;
  // data: URIs are used by bundled icon sets.
  "font-src 'self' https://fonts.gstatic.com data: https://cdn.jsdelivr.net",

  // Images: broad https: covers avatar/stock-photo CDNs;
  // blob: and data: are needed for canvas exports and in-browser previews.
  "img-src 'self' data: https: blob:",

  // Fetch / XHR: enumerate every external API the client calls.
  //   - data: is required by @react-pdf/renderer (yoga-wasm loads via data: URI).
  //   - https://*.supabase.co: database + auth.
  //   - https://*.nebius.cloud / https://api.tokenfactory.nebius.com: AI inference.
  //   - https://generativelanguage.googleapis.com: Gemini API.
  //   - https://api.mistral.ai: Mistral AI.
  //   - https://api.stripe.com: Stripe server-side calls from the client.
  //   - https://latexonline.cc / https://latex.ytotech.com: LaTeX rendering.
  //   - https://cdn.jsdelivr.net: CDN-hosted WASM and assets.
  "connect-src 'self' data: https://*.supabase.co https://*.nebius.cloud https://api.stripe.com https://generativelanguage.googleapis.com https://api.mistral.ai https://api.tokenfactory.nebius.com https://latexonline.cc https://latex.ytotech.com https://cdn.jsdelivr.net",

  // Frames: blob: is needed for PDF previews;
  // Stripe renders the card-input widget inside an iframe.
  "frame-src 'self' blob: https://js.stripe.com",

  // Restrict <object> and <embed>; blob: is needed for PDF previews.
  "object-src 'self' blob:",

  // Service workers and web workers run same-origin or from blob: URLs.
  "worker-src 'self' blob:",

  // Restrict the <base> element to same-origin to prevent base-tag injection.
  "base-uri 'self'",

  // Limit form submissions to same-origin to block reflected-input attacks.
  "form-action 'self'",

  // Prevent this page from being embedded in any external frame (clickjacking).
  "frame-ancestors 'none'",
];

/** Full CSP header value ready to be used as Content-Security-Policy. */
export const CSP_HEADER: string = CSP_DIRECTIVES.join('; ');
