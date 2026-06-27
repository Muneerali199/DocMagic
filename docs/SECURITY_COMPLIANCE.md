# Security Compliance Dashboard — DraftDeckAI

**Last Updated:** May 17, 2026  
**Framework:** OWASP Top 10 (2021)  
**Issue Ref:** [#542](https://github.com/DraftDeckAI/DraftDeckAI/issues/542)

---

## OWASP Top 10 Compliance Status

| # | OWASP Category | Status | Coverage | Controls |
|---|---------------|--------|----------|----------|
| A01 | **Broken Access Control** | ✅ Compliant | Full | Bearer token auth on all `/api/generate/*`, `/api/send-email`, `/api/metrics`. Stripe webhook signature verification. Health endpoint info-gating. |
| A02 | **Cryptographic Failures** | ✅ Compliant | Full | HSTS with `preload` enforces TLS. Supabase handles encryption at rest. No secrets in source code (verified by CI scan). `.env.example` uses placeholder values. |
| A03 | **Injection** | ✅ Compliant | Full | Zod schemas for input validation. `sanitizeHtml()` / `sanitizeInput()` helpers. `detectSqlInjection()` guard. CSP with `form-action 'self'` blocks form hijacking. |
| A04 | **Insecure Design** | ✅ Compliant | Full | `reactStrictMode: true`. Tiered rate limiting (AUTH/GENERATE/EXPORT). Rate limit store memory cap (10K entries). Atomic credit reservation (TOCTOU prevention). Proxy image size limits. |
| A05 | **Security Misconfiguration** | ✅ Compliant | Full | Full security header suite (CSP, HSTS preload, Permissions-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-Permitted-Cross-Domain-Policies). API responses include `Cache-Control: no-store`. No placeholder origins. |
| A06 | **Vulnerable & Outdated Components** | ✅ Compliant | Full | CI pipeline fails on critical vulnerabilities (`npm audit --audit-level=critical`). Weekly scheduled security scans. Dependabot auto-merge pipeline. |
| A07 | **Identification & Authentication Failures** | ✅ Compliant | Full | Supabase Auth with JWT validation. Per-endpoint rate limiting. Security event logging for auth failures. |
| A08 | **Software & Data Integrity Failures** | ✅ Compliant | Full | Stripe webhook signature verification. Proxy-image MIME-type validation. Lockfile-based installs (`npm ci`). |
| A09 | **Security Logging & Monitoring Failures** | ✅ Compliant | Full | `logSecurityEvent()` for unauthorized access, rate limit breaches, email operations. Error responses don't leak internal details. Structured logging with request IDs. |
| A10 | **Server-Side Request Forgery (SSRF)** | ✅ Compliant | Full | `isPrivateUrl()` guard on all URL-fetching endpoints. Blocks private IPs, cloud metadata, non-HTTP protocols, internal TLDs, IPv6 loopback/ULA. |

---

## CWE Coverage Matrix

| CWE ID | Description | Status | Control |
|--------|-------------|--------|---------|
| CWE-79 | Cross-Site Scripting (XSS) | ⚠️ Monitored | `sanitizeHtml()` in email routes. `dangerouslySetInnerHTML` flagged in CI; used only for AI-generated content. CSP blocks inline scripts. |
| CWE-89 | SQL Injection | ✅ Mitigated | `detectSqlInjection()` helper. Supabase ORM prevents raw SQL. |
| CWE-200 | Information Exposure | ✅ Mitigated | Health endpoint gated. Metrics endpoint authenticated. Error responses sanitized. |
| CWE-209 | Error Message Information Exposure | ✅ Mitigated | `letter/route.ts` error details removed. Email route uses generic error messages. |
| CWE-352 | Cross-Site Request Forgery | ✅ Mitigated | `form-action 'self'` CSP. Bearer token auth (not cookie-based). |
| CWE-400 | Uncontrolled Resource Consumption | ✅ Mitigated | Rate limiting with memory cap. Proxy image size limits. Request timeouts. |
| CWE-489 | Active Debug Code | ✅ Mitigated | `reactStrictMode: true`. No debug endpoints in production. |
| CWE-918 | Server-Side Request Forgery | ✅ Mitigated | Comprehensive `isPrivateUrl()` guard with cloud metadata, protocol, and TLD blocking. |
| CWE-942 | Overly Permissive CORS | ✅ Mitigated | Removed `Access-Control-Allow-Origin: *` from proxy-image. Removed placeholder origin. |
| CWE-1021 | UI Layer Restriction | ✅ Mitigated | `X-Frame-Options: DENY`. `frame-ancestors 'none'` in CSP. |
| CWE-1104 | Unmaintained Third Party Components | ✅ Mitigated | CI pipeline fails on critical vulnerabilities. Weekly automated scans. |

---

## Security Header Checklist

| Header | Value | Status |
|--------|-------|--------|
| `Content-Security-Policy` | Full directive set (see `next.config.js`) | ✅ |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ |
| `X-Frame-Options` | `DENY` | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | ✅ |
| `X-Permitted-Cross-Domain-Policies` | `none` | ✅ |
| `X-XSS-Protection` | `1; mode=block` | ✅ |
| `Cache-Control` (API) | `no-store, no-cache, must-revalidate` | ✅ |

---

## CI/CD Security Pipeline

| Check | Trigger | Status |
|-------|---------|--------|
| `npm audit --audit-level=critical` | Every PR + push to main | ✅ Fail-on-critical |
| `npm audit --audit-level=high --omit=dev` | Every PR + push to main | ✅ Active |
| Secret detection scan | Every PR + push to main | ✅ Active |
| Dangerous pattern detection (`eval`, `dangerouslySetInnerHTML`) | Every PR + push to main | ✅ Active (report) |
| Security header validation | Every PR + push to main | ✅ Fail-on-missing |
| SSRF guard validation | Every PR + push to main | ✅ Fail-on-missing |
| Weekly comprehensive scan | Monday 2 AM UTC | ✅ Scheduled |

---

## Remediation Roadmap

| Priority | Item | Status | Target |
|----------|------|--------|--------|
| P0 | Fix open proxy (wildcard CORS) | ✅ Done | This PR |
| P0 | Harden SSRF guard | ✅ Done | This PR |
| P0 | Secure metrics/health endpoints | ✅ Done | This PR |
| P1 | Harden all security headers | ✅ Done | This PR |
| P1 | CI fails on critical vulnerabilities | ✅ Done | This PR |
| P1 | Automated security scanning | ✅ Done | This PR |
| P2 | DOMPurify for `dangerouslySetInnerHTML` | ⏳ Planned | Future PR |
| P2 | Prompt injection sanitization layer | ⏳ Planned | Future PR |
| P3 | Security dependency pinning | ⏳ Planned | Future PR |
