/** @jest-environment node */
import { NextResponse } from "next/server";
import {
  addLegacyEndpointDeprecation,
  LEGACY_GENERATION_ENDPOINTS,
} from "@/lib/api-versioning";

describe("addLegacyEndpointDeprecation", () => {
  it("sets deprecation and successor headers", () => {
    const response = addLegacyEndpointDeprecation(
      NextResponse.json({ ok: true }),
      "/api/v2/generate/resume",
    );

    expect(response.headers.get("Deprecation")).toBe("true");
    expect(response.headers.get("X-API-Deprecated")).toBe("true");
    expect(response.headers.get("X-API-Successor")).toBe(
      "/api/v2/generate/resume",
    );
    expect(response.headers.get("Link")).toContain('rel="successor-version"');
    expect(response.headers.get("Link")).toContain("/api/v2/generate/resume");
  });
});

describe("LEGACY_GENERATION_ENDPOINTS", () => {
  it("maps known legacy resume paths to v2", () => {
    expect(LEGACY_GENERATION_ENDPOINTS["/api/generate/resume"]).toBe(
      "/api/v2/generate/resume",
    );
    expect(LEGACY_GENERATION_ENDPOINTS["/api/resume/improve"]).toBe(
      "/api/v2/generate/resume/improve",
    );
  });
});
