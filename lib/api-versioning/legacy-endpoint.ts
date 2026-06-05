import { type NextResponse } from "next/server";
import { VERSION_CONFIGS } from "./types";

const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Deprecation headers for legacy (unversioned) routes superseded by /api/v2/generate/*.
 * RFC 8594-style headers aligned with addDeprecationHeaders for v1.
 */
export function addLegacyEndpointDeprecation(
  response: NextResponse,
  successorPath: string,
): NextResponse {
  const successorUrl = `${SITE_ORIGIN}${successorPath}`;
  const migrationGuide = VERSION_CONFIGS.v1.migrationGuideUrl;
  const sunsetDate = VERSION_CONFIGS.v1.sunsetDate;
  const sunsetDatetime = `${sunsetDate}T23:59:59Z`;

  response.headers.set("Deprecation", "true");
  response.headers.set("Sunset", sunsetDatetime);
  response.headers.set(
    "Warning",
    `299 - "This endpoint is deprecated. Use ${successorPath} instead. See ${migrationGuide}"`,
  );
  response.headers.set(
    "Link",
    `<${successorUrl}>; rel="successor-version", <${migrationGuide}>; rel="deprecation"`,
  );
  response.headers.set("X-API-Deprecated", "true");
  response.headers.set("X-API-Successor", successorPath);
  response.headers.set("X-API-Sunset", sunsetDate);

  return response;
}

/** Registry of legacy generation paths → v2 successors (for docs and tests). */
export const LEGACY_GENERATION_ENDPOINTS = {
  "/api/generate/resume": "/api/v2/generate/resume",
  "/api/resume/generate-smart": "/api/v2/generate/resume/smart",
  "/api/resume/improve": "/api/v2/generate/resume/improve",
  "/api/generate/presentation": "/api/v2/generate/presentation",
  "/api/generate/letter": "/api/v2/generate/letter",
  "/api/generate/diagram": "/api/v2/generate/diagram",
  "/api/generate/guided-resume": "/api/v2/generate/resume/guided",
  "/api/generate/resume-guidance": "/api/v2/generate/resume/guidance",
  "/api/resume/enhance-bullet": "/api/v2/generate/resume/enhance-bullet",
  "/api/resume/ats-score": "/api/v2/generate/resume/ats-score",
} as const;

export type LegacyGenerationPath = keyof typeof LEGACY_GENERATION_ENDPOINTS;
