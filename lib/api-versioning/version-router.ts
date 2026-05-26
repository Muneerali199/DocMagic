import type { NextRequest } from 'next/server';
import { type ApiVersion, VERSION_CONFIGS } from './types';

/**
 * Detects the requested API version from a NextRequest.
 *
 * Priority order:
 *   1. URL path prefix  — /api/v1/... or /api/v2/...
 *   2. Request header   — API-Version: 1  (or "v1")
 *   3. Query parameter  — ?api_version=1  (or "v1")
 *   4. Default          — v2 (current stable)
 */
export function detectVersion(request: NextRequest): ApiVersion {
  const { pathname, searchParams } = request.nextUrl;

  // 1. URL path — most explicit, highest priority
  // (?:\/|$) matches both /api/v1/health and /api/v1 (no trailing slash)
  const pathMatch = pathname.match(/^\/api\/(v\d+)(?:\/|$)/);
  if (pathMatch) {
    const candidate = pathMatch[1] as ApiVersion;
    if (isSupported(candidate)) return candidate;
  }

  // 2. Header — API-Version: 1 or API-Version: v1
  const headerValue = request.headers.get('API-Version') ?? request.headers.get('X-API-Version');
  if (headerValue) {
    const candidate = normalise(headerValue);
    if (isSupported(candidate)) return candidate;
  }

  // 3. Query param — ?api_version=1 or ?api_version=v1
  const queryValue = searchParams.get('api_version');
  if (queryValue) {
    const candidate = normalise(queryValue);
    if (isSupported(candidate)) return candidate;
  }

  return 'v2';
}

/** Returns true when the version is known — derived from VERSION_CONFIGS keys, single source of truth. */
export function isSupported(version: string): version is ApiVersion {
  return version in VERSION_CONFIGS;
}

/** Returns true when the version is marked deprecated in VERSION_CONFIGS. */
export function isDeprecated(version: ApiVersion): boolean {
  return VERSION_CONFIGS[version].deprecated;
}

/** Normalises bare numbers ("1", "2") to the "v1" / "v2" form. */
function normalise(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  return trimmed.startsWith('v') ? trimmed : `v${trimmed}`;
}
