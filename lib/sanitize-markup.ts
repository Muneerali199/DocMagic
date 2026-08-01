/**
 * lib/sanitize-markup.ts — Fix #1050 (stored XSS via unsanitised AI-generated markup)
 *
 * AI-generated presentation visuals (SVG diagrams, Tailwind HTML mockups)
 * are rendered directly into the DOM via `dangerouslySetInnerHTML`. The
 * markup originates from the Gemini/Mistral API response and must be
 * treated as untrusted, since a prompt-injected description can coerce the
 * model into emitting `<script>`, unquoted event-handler attributes,
 * `javascript:` URIs, or other HTML that a naive regex blocklist misses
 * (e.g. `<img src=x onerror=alert(1)>` has no quotes around the handler,
 * so a `/on[a-z]+=(["']).*?\1/` regex never matches it).
 *
 * DOMPurify sanitises via a real DOM parse + allowlist rather than string
 * matching, so it isn't defeated by the malformed/obfuscated markup that
 * bypasses regex-based blocklists.
 */

import DOMPurify, { type Config } from "dompurify";

// DOMPurify's default config already allows the full safe HTML + SVG tag
// set (needed for svg_code diagrams and html_tailwind mockups) while
// stripping <script>, event-handler attributes, and javascript:/data: URIs
// in dangerous contexts. We additionally forbid a few embedding vectors
// that have no legitimate use in a generated slide visual.
const SANITIZE_CONFIG: Config = {
  FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "base", "meta"],
  FORBID_ATTR: ["srcdoc"],
  ALLOW_DATA_ATTR: false,
  USE_PROFILES: { html: true, svg: true, svgFilters: true },
};

/**
 * Sanitise AI-generated SVG/HTML markup before rendering with
 * `dangerouslySetInnerHTML`.
 *
 * DOMPurify requires a real DOM and is unavailable during server-side
 * rendering. All call sites are within "use client" components, so on the
 * server this returns an empty string (safe default); the client-side
 * render after hydration sanitises and displays the markup normally, with
 * no SEO/content impact since these are dynamic, generated visuals.
 */
export function sanitizeMarkup(markup: string): string {
  if (typeof window === "undefined") {
    return "";
  }
  if (typeof markup !== "string" || markup.length === 0) {
    return "";
  }
  return DOMPurify.sanitize(markup, SANITIZE_CONFIG);
}
