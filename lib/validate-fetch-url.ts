/**
 * SSRF Protection Guard (OWASP A10 / CWE-918)
 *
 * Validates URLs to prevent Server-Side Request Forgery attacks.
 * Blocks requests to private/internal networks, cloud metadata endpoints,
 * and other dangerous destinations.
 */
export const isPrivateUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        // Strip brackets from IPv6 literals (URL.hostname keeps them)
        const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
        const protocol = parsed.protocol;

        // Block non-HTTP(S) protocols (e.g., file://, ftp://, gopher://)
        if (protocol !== 'http:' && protocol !== 'https:') {
            return true;
        }

        // Block private/reserved IP ranges and loopback addresses
        if (
            hostname === 'localhost' ||
            /^127\./.test(hostname) ||
            /^10\./.test(hostname) ||
            /^192\.168\./.test(hostname) ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
            hostname === '::1' ||
            hostname === '0.0.0.0' ||
            hostname === '[::]' ||
            /^0+\./.test(hostname) ||             // Octal zero-prefix bypass (0177.0.0.1)
            /^fc00:/i.test(hostname) ||            // IPv6 Unique Local Address
            /^fe80:/i.test(hostname)               // IPv6 Link-Local
        ) {
            return true;
        }

        // Block cloud metadata endpoints (AWS, GCP, Azure)
        if (
            /^169\.254\./.test(hostname) ||                    // AWS/Azure metadata (169.254.169.254)
            hostname === 'metadata.google.internal' ||         // GCP metadata
            hostname === 'metadata.google.com' ||              // GCP alt
            hostname === 'metadata' ||                         // Short metadata hostname
            hostname === 'instance-data'                       // AWS instance data
        ) {
            return true;
        }

        // Block internal/local TLDs commonly used in corporate environments
        if (
            hostname.endsWith('.internal') ||
            hostname.endsWith('.local') ||
            hostname.endsWith('.corp') ||
            hostname.endsWith('.home') ||
            hostname.endsWith('.lan')
        ) {
            return true;
        }

        return false;
    } catch {
        return true;  // Reject malformed URLs
    }
};