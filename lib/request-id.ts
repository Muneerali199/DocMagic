/**
 * Extracts the request ID from headers or generates a new one if not present.
 * This ensures every request has a traceable identifier.
 */
export function getRequestId(headers: Headers): string {
  // Try common request ID headers
  const requestId = 
    headers.get('x-request-id') || 
    headers.get('x-correlation-id') || 
    headers.get('cf-ray') || // Cloudflare
    crypto.randomUUID();

  return requestId;
}

/**
 * Creates a standard set of headers including the request ID to propagate
 * it to downstream services (like Supabase or AI APIs).
 */
export function getCorrelationHeaders(requestId: string): Record<string, string> {
  return {
    'x-request-id': requestId,
  };
}
