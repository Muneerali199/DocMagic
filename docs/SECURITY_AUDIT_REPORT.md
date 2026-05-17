# Security Audit Report — DraftDeckAI

**Audit Date:** May 17, 2026  
**Auditor:** @Dineshkumar2006471  
**Issue Ref:** [#542 — Implement Security Audit & Compliance Framework](https://github.com/DraftDeckAI/DraftDeckAI/issues/542)  
**Standard:** OWASP Top 10 (2021)  
**Scope:** Full codebase — API routes, middleware, client components, CI/CD pipelines

---

## Executive Summary

A comprehensive security audit was performed against the OWASP Top 10 (2021) framework. The codebase demonstrated a **strong security baseline** with existing protections for authentication, rate limiting, and input validation. This audit identified **10 actionable findings** mapped to specific OWASP categories and CWE identifiers, all of which have been **remediated in this PR**.

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 1 | ✅ Fixed |
| 🟠 High | 4 | ✅ Fixed |
| 🟡 Medium | 5 | ✅ Fixed |

---

## Findings & Remediations

### Finding 1 — Open Proxy with Wildcard CORS  
**Severity:** 🔴 Critical  
**OWASP:** A01 (Broken Access Control) / A05 (Security Misconfiguration)  
**CWE:** CWE-942 (Overly Permissive CORS Policy)

| | |
|---|---|
| **File** | `app/api/proxy-image/route.ts` |
| **Issue** | `Access-Control-Allow-Origin: *` set on proxied responses. Combined with missing content-type validation, this endpoint functioned as an unauthenticated open proxy that could be used for data exfiltration. |
| **Fix** | Removed wildcard CORS header. Added protocol validation (HTTPS/HTTP only), image MIME-type allowlist, 10 MB response size limit, and request timeout. |

---

### Finding 2 — SSRF Guard Bypass via Cloud Metadata & Protocol Abuse  
**Severity:** 🟠 High  
**OWASP:** A10 (Server-Side Request Forgery)  
**CWE:** CWE-918 (SSRF)

| | |
|---|---|
| **File** | `lib/validate-fetch-url.ts` |
| **Issue** | The `isPrivateUrl` guard blocked common private IP ranges but did not guard against: cloud metadata endpoints (169.254.169.254), non-HTTP protocols (`file://`, `gopher://`), IPv6 ULA/link-local addresses, octal IP bypass, or `.internal`/`.local` TLDs. |
| **Fix** | Added protocol allowlist (http/https only), cloud metadata blocking (AWS, GCP, Azure), IPv6 protection, octal-bypass detection, and internal TLD blocking. |

---

### Finding 3 — Unauthenticated Metrics Endpoint (Information Disclosure)  
**Severity:** 🟠 High  
**OWASP:** A01 (Broken Access Control)  
**CWE:** CWE-200 (Information Exposure)

| | |
|---|---|
| **File** | `app/api/metrics/route.ts` |
| **Issue** | The `/api/metrics` endpoint exposed server memory usage, uptime, request counts, and load averages without any authentication. Attackers could use this to fingerprint the server and measure the impact of DoS attacks. |
| **Fix** | Added Bearer token authentication using Supabase `auth.getUser()`. Metrics are now only accessible to authenticated users. |

---

### Finding 4 — Health Endpoint Leaking Server Internals  
**Severity:** 🟠 High  
**OWASP:** A01 (Broken Access Control) / A09 (Security Logging & Monitoring Failures)  
**CWE:** CWE-200 (Information Exposure)

| | |
|---|---|
| **File** | `app/api/health/route.ts` |
| **Issue** | The health endpoint exposed `process.memoryUsage()`, `process.env.NODE_ENV`, `npm_package_version`, performance stats, and queue internals without authentication. Additionally, it made outbound requests to `httpbin.org` on every call, creating an SSRF vector. |
| **Fix** | Unauthenticated requests now receive only `{status, timestamp}`. Detailed health data (memory, perf stats, queue) requires an `Authorization` header. Removed the httpbin.org call entirely. |

---

### Finding 5 — Weak Security Headers (CSP, HSTS, Permissions-Policy)  
**Severity:** 🟠 High  
**OWASP:** A05 (Security Misconfiguration)  
**CWE:** CWE-1021 (Improper Restriction of Rendered UI Layers)

| | |
|---|---|
| **Files** | `next.config.js`, `middleware.ts`, `lib/security.ts` |
| **Issues** | (a) HSTS `max-age` set to 1 year instead of 2 years, missing `preload` directive. (b) CSP `object-src` allowed `'self' blob:` — overly permissive. (c) Missing `form-action` and `frame-ancestors` CSP directives. (d) Missing `Permissions-Policy` in `next.config.js`. (e) Missing `X-Permitted-Cross-Domain-Policies` header. (f) API responses had no `Cache-Control: no-store` header. (g) `interest-cohort=()` not in Permissions-Policy. |
| **Fix** | HSTS set to `max-age=63072000; includeSubDomains; preload`. CSP `object-src` tightened to `'none'`. Added `form-action 'self'` and `frame-ancestors 'none'` to CSP. Added `Permissions-Policy` with FLoC opt-out. Added `X-Permitted-Cross-Domain-Policies: none`. API responses now include `Cache-Control: no-store`. All three files synced to match. |

---

### Finding 6 — API Error Response Leaking Internal Details  
**Severity:** 🟡 Medium  
**OWASP:** A09 (Security Logging & Monitoring Failures)  
**CWE:** CWE-209 (Information Exposure Through an Error Message)

| | |
|---|---|
| **File** | `app/api/generate/letter/route.ts` |
| **Issue** | The error response included `details: error.message`, potentially exposing stack traces, database errors, or API key fragments to the client. |
| **Fix** | Removed `details` field from error response. Internal error is still logged server-side via `console.error()`. |

---

### Finding 7 — Insecure React Configuration  
**Severity:** 🟡 Medium  
**OWASP:** A04 (Insecure Design)  
**CWE:** CWE-489 (Active Debug Code)

| | |
|---|---|
| **File** | `next.config.js` |
| **Issue** | `reactStrictMode` was set to `false`, disabling React's development-time safety checks for unsafe lifecycles, legacy API usage, and side-effect detection. |
| **Fix** | Set `reactStrictMode: true`. |

---

### Finding 8 — Rate Limit Store Unbounded Memory Growth  
**Severity:** 🟡 Medium  
**OWASP:** A04 (Insecure Design)  
**CWE:** CWE-400 (Uncontrolled Resource Consumption)

| | |
|---|---|
| **File** | `middleware.ts` |
| **Issue** | The in-memory rate limit `Map` had no eviction policy or size cap. Under sustained attack, entries would accumulate unboundedly, leading to memory exhaustion and potential server crash. |
| **Fix** | Added `RATE_LIMIT_MAX_ENTRIES = 10,000` cap. Added `pruneExpiredEntries()` function that runs on each rate limit check, removing entries whose reset timestamp has passed. |

---

### Finding 9 — Placeholder Origin in CORS Allow List  
**Severity:** 🟡 Medium  
**OWASP:** A05 (Security Misconfiguration)  
**CWE:** CWE-942 (Overly Permissive CORS Policy)

| | |
|---|---|
| **File** | `lib/security.ts` |
| **Issue** | The `allowedOrigins` array contained `'https://your-vercel-url.vercel.app'` — a placeholder that should have been removed. While this particular URL is harmless, placeholder origins in security-critical lists indicate a process failure and could easily be exploited if someone registered the matching domain. |
| **Fix** | Removed the placeholder URL from `allowedOrigins`. |

---

### Finding 10 — CI Pipeline Not Failing on Vulnerabilities  
**Severity:** 🟡 Medium  
**OWASP:** A06 (Vulnerable and Outdated Components)  
**CWE:** CWE-1104 (Use of Unmaintained Third Party Components)

| | |
|---|---|
| **File** | `.github/workflows/dependency_check.yml` |
| **Issue** | `npm audit` was configured with `continue-on-error: true` and `\|\| echo "Audit completed with warnings"`, meaning the CI pipeline would **never fail** regardless of vulnerability severity. Critical/High vulnerabilities in dependencies would go unnoticed. |
| **Fix** | Removed `continue-on-error` from the critical audit step. Changed to `npm audit --audit-level=critical` to fail on critical vulnerabilities. Added a separate production-only high-severity check. Created a new dedicated `security_scan.yml` workflow with comprehensive OWASP-mapped checks. |

---

## Existing Security Strengths (No Action Required)

These areas were audited and found to be properly implemented:

| Area | OWASP | Status | Notes |
|------|-------|--------|-------|
| Authentication (all generation endpoints) | A07 | ✅ Secure | Bearer token + Supabase `getUser()` on all `/api/generate/*` routes |
| Stripe Webhook Signature Verification | A01 | ✅ Secure | `stripe.webhooks.constructEvent()` validates signatures |
| Input Validation (Zod schemas) | A03 | ✅ Secure | `send-email` uses Zod; `generate/resume` uses `validateAndSanitize` |
| SQL Injection Detection | A03 | ✅ Secure | `detectSqlInjection()` helper in `lib/validation.ts` |
| Rate Limiting (tiered) | A04 | ✅ Secure | AUTH, GENERATE, EXPORT tiers in middleware |
| SSRF Guard (base) | A10 | ✅ Secure | `isPrivateUrl()` on all external-URL-fetching routes |
| Credit Reservation (TOCTOU fix) | A04 | ✅ Secure | Atomic `reserveCredits()` prevents race conditions (Issue #477) |
| Email HTML Sanitization | A03 | ✅ Secure | `sanitizeHtml()` on all user-provided email fields |
| Security Event Logging | A09 | ✅ Secure | `logSecurityEvent()` for auth failures, rate limits, email actions |

---

## Recommendations for Future Work

1. **XSS in Presentation Components**: Multiple instances of `dangerouslySetInnerHTML` in `mobile-presentation-generator.tsx` and `presentation-preview.tsx`. These render AI-generated content and are low-risk (server-generated, not user-controlled HTML), but should be migrated to a sanitization library like DOMPurify for defense-in-depth.

2. **Prompt Injection**: AI generation routes pass user prompts directly to Mistral/Gemini. Consider implementing a prompt sanitization layer to detect and strip injection attempts.

3. **Dependency Pinning**: Consider using `npm shrinkwrap` or exact version pinning for security-critical dependencies.

---

## Files Modified in This PR

| File | Change |
|------|--------|
| `next.config.js` | HSTS preload, Permissions-Policy, CSP hardening, reactStrictMode |
| `middleware.ts` | API security headers, HSTS preload, rate limit memory guard |
| `lib/validate-fetch-url.ts` | Comprehensive SSRF protection |
| `lib/security.ts` | CSP sync, HSTS preload, remove placeholder origin |
| `app/api/proxy-image/route.ts` | Remove wildcard CORS, add content-type/size validation |
| `app/api/metrics/route.ts` | Add authentication guard |
| `app/api/health/route.ts` | Restrict info exposure, remove httpbin call |
| `app/api/generate/letter/route.ts` | Remove error details leak |
| `.github/workflows/dependency_check.yml` | Strict audit enforcement |
| `.github/workflows/security_scan.yml` | **[NEW]** OWASP-mapped security scanning |
| `docs/SECURITY_AUDIT_REPORT.md` | **[NEW]** This report |
| `docs/SECURITY_COMPLIANCE.md` | **[NEW]** Compliance dashboard |
