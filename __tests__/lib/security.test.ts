/**
 * Unit tests for lib/security.ts
 */

import {
  checkRateLimit,
  isAllowedOrigin,
  getSecurityHeaders,
  validateEnvironmentVariables,
  SECURITY_CONFIG,
} from "@/lib/security";
import {
  buildCorsHeaders,
  STATIC_SECURITY_HEADERS,
} from "@/lib/security-headers";

beforeAll(() => jest.useFakeTimers());
afterAll(() => jest.useRealTimers());

// ──────────────────────────────────────────────────────────────
// checkRateLimit
// ──────────────────────────────────────────────────────────────
describe("checkRateLimit", () => {
  const config = { requests: 3, windowMs: 60_000 };

  it("allows the first request and returns correct remaining count", () => {
    const result = checkRateLimit("ip-A", config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.retryAfter).toBe(0);
  });

  it("blocks once the request cap is reached", () => {
    const id = "ip-B";
    checkRateLimit(id, config);
    checkRateLimit(id, config);
    checkRateLimit(id, config);
    const blocked = checkRateLimit(id, config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("resets the window after windowMs elapses", () => {
    const id = "ip-C";
    checkRateLimit(id, config);
    checkRateLimit(id, config);
    checkRateLimit(id, config);
    expect(checkRateLimit(id, config).allowed).toBe(false);

    jest.advanceTimersByTime(60_001);

    const fresh = checkRateLimit(id, config);
    expect(fresh.allowed).toBe(true);
    expect(fresh.remaining).toBe(2);
  });

  it("treats different identifiers independently", () => {
    const a = checkRateLimit("unique-A", config);
    const b = checkRateLimit("unique-B", config);
    expect(a.allowed).toBe(true);
    expect(b.allowed).toBe(true);
  });

  it("returns a reset timestamp in the future", () => {
    const result = checkRateLimit("ip-reset-check", config);
    expect(result.reset).toBeGreaterThan(Date.now());
  });
});

// ──────────────────────────────────────────────────────────────
// isAllowedOrigin
// ──────────────────────────────────────────────────────────────
describe("isAllowedOrigin", () => {
  const host = "example.com";

  it("returns false for a null origin", () => {
    expect(isAllowedOrigin(null, host)).toBe(false);
  });

  it("returns true for the exact host origin", () => {
    expect(isAllowedOrigin(`https://${host}`, host)).toBe(true);
  });

  it("returns true for the canonical draftdeckai.com origin", () => {
    expect(isAllowedOrigin("https://draftdeckai.com", host)).toBe(true);
  });

  it("returns false for an untrusted origin", () => {
    expect(isAllowedOrigin("https://evil.example.com", host)).toBe(false);
  });

  it("allows localhost origins in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      (process.env as any).NODE_ENV = "development";
      const host = "localhost:3000";
      expect(isAllowedOrigin("http://localhost:3000", host)).toBe(true);
    } finally {
      (process.env as any).NODE_ENV = originalEnv;
    }
  });
});

// ──────────────────────────────────────────────────────────────
// getSecurityHeaders
// ──────────────────────────────────────────────────────────────
describe("getSecurityHeaders", () => {
  it("includes X-Frame-Options", () => {
    const headers = getSecurityHeaders();
    expect(headers["X-Frame-Options"]).toBe("DENY");
  });

  it("CSP contains form-action directive", () => {
    const headers = getSecurityHeaders();
    expect(headers["Content-Security-Policy"]).toContain("form-action");
  });

  it("CSP contains frame-ancestors directive", () => {
    const headers = getSecurityHeaders();
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors");
  });

  it("omits HSTS in development mode", () => {
    const devHeaders = getSecurityHeaders(true);
    expect(devHeaders["Strict-Transport-Security"]).toBeUndefined();
  });

  it("includes HSTS in production mode", () => {
    const prodHeaders = getSecurityHeaders(false);
    expect(prodHeaders["Strict-Transport-Security"]).toContain("max-age=");
  });
});

// ──────────────────────────────────────────────────────────────
// shared security headers
// ──────────────────────────────────────────────────────────────
describe("shared security header config", () => {
  it("exports static headers used by Next config", () => {
    const keys = STATIC_SECURITY_HEADERS.map((header) => header.key);
    expect(keys).toEqual(
      expect.arrayContaining([
        "X-Frame-Options",
        "X-Content-Type-Options",
        "X-XSS-Protection",
        "Referrer-Policy",
        "Strict-Transport-Security",
        "Content-Security-Policy",
      ]),
    );
  });

  it("builds CORS headers for allowed origins", () => {
    const headers = buildCorsHeaders("https://draftdeckai.com", [
      "https://draftdeckai.com",
    ]);

    expect(headers).toMatchObject({
      "Access-Control-Allow-Origin": "https://draftdeckai.com",
      Vary: "Origin",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Request-Id",
      "Access-Control-Max-Age": "86400",
    });
  });

  it("keeps the runtime mjs helper aligned with the TypeScript helper", async () => {
    const runtimeModule = await import("../../lib/security-headers.mjs");
    const origin = "https://draftdeckai.com";
    const allowedOrigins = [origin];

    expect(runtimeModule.STATIC_SECURITY_HEADERS).toEqual(
      STATIC_SECURITY_HEADERS,
    );
    expect(runtimeModule.buildCorsHeaders(origin, allowedOrigins)).toEqual(
      buildCorsHeaders(origin, allowedOrigins),
    );
    expect(
      runtimeModule.buildCorsHeaders(
        "https://evil.example.com",
        allowedOrigins,
      ),
    ).toEqual(buildCorsHeaders("https://evil.example.com", allowedOrigins));
  });
});

// ──────────────────────────────────────────────────────────────
// validateEnvironmentVariables
// ──────────────────────────────────────────────────────────────
describe("validateEnvironmentVariables", () => {
  it("throws when a required variable is missing", () => {
    const saved = process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(() => validateEnvironmentVariables()).toThrow(/Missing required/);
    process.env.NEXT_PUBLIC_SUPABASE_URL = saved;
  });

  it("throws when NEXT_PUBLIC_SUPABASE_URL is not a valid URL", () => {
    const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const savedAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const savedGemini = process.env.GEMINI_API_KEY;

    process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-url";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-here";
    process.env.GEMINI_API_KEY = "gemini-key-that-is-long-enough";

    expect(() => validateEnvironmentVariables()).toThrow(/valid URL/);

    process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedAnon;
    process.env.GEMINI_API_KEY = savedGemini;
  });
});

// ──────────────────────────────────────────────────────────────
// SECURITY_CONFIG sanity checks
// ──────────────────────────────────────────────────────────────
describe("SECURITY_CONFIG", () => {
  it("has rate limit configs for AUTH, GENERATE, and API", () => {
    expect(SECURITY_CONFIG.RATE_LIMITS.AUTH).toBeDefined();
    expect(SECURITY_CONFIG.RATE_LIMITS.GENERATE).toBeDefined();
    expect(SECURITY_CONFIG.RATE_LIMITS.API).toBeDefined();
  });

  it("enforces a minimum password length of at least 8 characters", () => {
    expect(
      SECURITY_CONFIG.INPUT_LIMITS.PASSWORD_MIN_LENGTH,
    ).toBeGreaterThanOrEqual(8);
  });
});
