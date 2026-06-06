import { type NextResponse } from 'next/server';
import { type ApiVersion, VERSION_CONFIGS } from './types';

/**
 * Injects RFC 8594-compliant deprecation headers into a v1 response.
 *
 * Headers added:
 *   Deprecation       — signals the endpoint is deprecated (RFC 8594)
 *   Sunset            — ISO 8601 datetime after which the endpoint may be removed
 *   Warning           — 299 warning with human-readable message (RFC 7234 §5.5)
 *   Link              — points to the migration guide (rel="deprecation")
 *   X-API-Version     — echoes back which version was served
 *   X-API-Deprecated  — machine-readable boolean for clients
 *   X-API-Sunset      — plain date string for clients that skip the Sunset header
 */
export function addDeprecationHeaders(response: NextResponse, version: ApiVersion = 'v1'): NextResponse {
  const config = VERSION_CONFIGS[version];

  if (!config.deprecated) return response;

  const sunsetDatetime = `${config.sunsetDate}T23:59:59Z`;

  response.headers.set('Deprecation', 'true');
  response.headers.set('Sunset', sunsetDatetime);
  response.headers.set(
    'Warning',
    `299 - "API ${version} is deprecated and will be removed on ${config.sunsetDate}. Migrate to v2: ${config.migrationGuideUrl}"`
  );
  response.headers.set('Link', `<${config.migrationGuideUrl}>; rel="deprecation"`);
  response.headers.set('X-API-Version', version);
  response.headers.set('X-API-Deprecated', 'true');
  response.headers.set('X-API-Sunset', config.sunsetDate);

  return response;
}

/** Returns the deprecation headers as a plain object (useful in tests). Returns {} for non-deprecated versions. */
export function getDeprecationHeaderMap(version: ApiVersion = 'v1'): Record<string, string> {
  const config = VERSION_CONFIGS[version];

  if (!config.deprecated) return {};

  const sunsetDatetime = `${config.sunsetDate}T23:59:59Z`;

  return {
    Deprecation: 'true',
    Sunset: sunsetDatetime,
    Warning: `299 - "API ${version} is deprecated and will be removed on ${config.sunsetDate}. Migrate to v2: ${config.migrationGuideUrl}"`,
    Link: `<${config.migrationGuideUrl}>; rel="deprecation"`,
    'X-API-Version': version,
    'X-API-Deprecated': 'true',
    'X-API-Sunset': config.sunsetDate,
  };
}
