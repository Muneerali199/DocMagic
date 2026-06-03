/**
 * SSRF Protection Utilities
 * Prevents Server-Side Request Forgery attacks by validating URLs
 * before the server makes any outbound fetch requests.
 */

// Internal hostnames that must never be fetched
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',  // GCP metadata
  '169.254.169.254',           // AWS/GCP metadata IP
  'instance-data',
]);

// Only http and https are safe protocols
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Returns true if the URL points to a private/internal address (BLOCK it).
 * Returns false if the URL is safe to fetch.
 */
export const isPrivateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Block non-http/https protocols (file://, ftp://, javascript://, etc.)
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return true;
    }

    // Block known internal hostnames
    if (BLOCKED_HOSTNAMES.has(hostname)) {
      return true;
    }

    // Block localhost and subdomains like app.localhost
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      return true;
    }

    // Block IPv4 private/reserved ranges
    if (
      /^127\./.test(hostname) ||                              // 127.x.x.x loopback
      /^10\./.test(hostname) ||                               // 10.x.x.x private
      /^192\.168\./.test(hostname) ||                         // 192.168.x.x private
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||    // 172.16-31.x.x private
      /^169\.254\./.test(hostname) ||                         // 169.254.x.x link-local (AWS metadata!)
      hostname === '0.0.0.0'
    ) {
      return true;
    }

    // Block IPv6 internal addresses
    if (
      hostname === '::1' ||
      hostname === '[::1]' ||
      /^fc[0-9a-f]{2}:/i.test(hostname) ||   // IPv6 ULA range fc00::/7
      /^fd[0-9a-f]{2}:/i.test(hostname)       // IPv6 ULA range fd00::/8
    ) {
      return true;
    }

    return false; // URL is safe
  } catch {
    return true; // If parsing fails, block it to be safe
  }
};

/**
 * Full URL validation for safe server-side fetching.
 * Returns an error message if the URL is invalid/unsafe.
 * Returns null if the URL is safe to fetch.
 *
 * Usage:
 *   const error = validateFetchUrl(url);
 *   if (error) return res.status(403).json({ error });
 */
export function validateFetchUrl(url: unknown): string | null {
  // Must be a string
  if (typeof url !== 'string') {
    return 'URL must be a string';
  }

  // Prevent huge URLs (max 2048 chars is browser standard)
  if (url.length > 2048) {
    return 'URL is too long (maximum 2048 characters)';
  }

  // Must be a parseable URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return 'Invalid URL format. Please provide a valid HTTP/HTTPS URL.';
  }

  // Must use http or https
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return 'Only HTTP and HTTPS URLs are allowed';
  }

  // Must not be a private/internal address
  if (isPrivateUrl(url)) {
    return 'Access to internal or private network addresses is not allowed';
  }

  return null; // ✅ URL is safe
}