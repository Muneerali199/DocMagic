# API Route Security Checklist

Use this checklist when adding or changing routes under `app/api/**/route.ts`. Copy the PR checklist into your pull request description whenever your PR touches API routes.

For broader security policy, see [SECURITY.md](../SECURITY.md).

> **Gold-standard example:** `app/api/send-email/route.ts` — follows the full auth → validate → rate limit → sanitize → log → safe errors flow.

---

## PR Checklist

Copy this into every PR that touches API routes:

- [ ] **Auth** — Protected routes verify the session; public/webhook routes are intentional.
- [ ] **Validation** — Request body/query validated with Zod; invalid JSON returns 400.
- [ ] **Rate limiting** — Relies on global middleware and/or route-specific limits where needed.
- [ ] **Error shape** — JSON responses use a consistent `{ error }` shape; no leaked secrets.
- [ ] **Logging** — Security events use `logSecurityEvent()`; no passwords, tokens, or full PII in logs.

---

## 1. Authentication

Protected routes must verify the caller before doing any work.

| Pattern | When to use |
|---|---|
| `createRoute()` from `@/lib/supabase/server` | Cookie-based session in route handlers (most app routes) |
| Bearer token + `supabase.auth.getUser()` | Clients that send `Authorization: Bearer <token>` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin operations (credits, webhooks) — never expose to the client |

**Checklist**

- [ ] Call `supabase.auth.getUser()` (or equivalent) and return **401** if unauthenticated on private routes.
- [ ] Use the **user-scoped** Supabase client for user data; reserve service role for trusted server logic only.
- [ ] Document whether the route is **public** (e.g. `health`, registration) or uses **alternate auth** (e.g. Stripe webhook signature).
- [ ] Do not trust `userId` or `email` from the request body without matching the authenticated user.

**References:** `app/api/send-email/route.ts`, `app/api/auth/register/route.ts`, `lib/supabase/server.ts`

---

## 2. Validation

All user-controlled input must be validated before use.

| Helper | Location | Purpose |
|---|---|---|
| `registrationSchema`, `resumeGenerationSchema`, etc. | `lib/validation.ts` | Shared Zod schemas |
| `validateAndSanitize(schema, data)` | `lib/validation.ts` | Parse + throw on failure |
| `schema.safeParse(data)` | Zod (per-route schemas) | Parse + handle errors in-route |
| `detectSqlInjection(input)` | `lib/validation.ts` | Extra check on free-text fields |
| `sanitizeInput` / `sanitizeHtml` | `lib/validation.ts` | Trim/escape before storage or HTML rendering |
| `SECURITY_CONFIG.INPUT_LIMITS` | `lib/security.ts` | Max lengths for prompts, content, etc. |

**Checklist**

- [ ] Define or reuse a **Zod schema** for body, query, and route params.
- [ ] Wrap `request.json()` in try/catch; return **400** with `{ error: 'Invalid JSON payload' }` on parse failure.
- [ ] Return **400** with `{ error: 'Validation failed: ...' }` when validation fails — do not proceed with partial data.
- [ ] Apply `sanitizeInput` / `sanitizeHtml` where content is stored or rendered (email, HTML, etc.).
- [ ] Respect `INPUT_LIMITS` in `lib/security.ts` for all new string fields.

**References:** `app/api/auth/register/route.ts`, `app/api/send-email/route.ts`, `lib/validation.ts`

---

## 3. Rate Limiting

Global limits are enforced in `middleware.ts` for all `/api/*` paths.

| Path prefix | Default limit |
|---|---|
| `/api/auth/` | 10 requests / 15 min |
| `/api/generate/` | 20 requests / 5 min |
| `/api/export/` | 30 requests / 2 min |
| Other `/api/*` | 100 requests / 1 min |

See `SECURITY_CONFIG.RATE_LIMITS` in `lib/security.ts` for full reference.

**Checklist**

- [ ] Assume **middleware** rate limiting is always active — do not disable without maintainer approval.
- [ ] For **high-abuse endpoints** (email, expensive AI, exports), add per-user or stricter limits in the route if middleware alone isn't sufficient.
- [ ] On limit exceeded, return **429** with `{ error, retryAfter? }` and a `Retry-After` header where applicable.
- [ ] Validate malformed requests **before** consuming per-user quota where possible.

**References:** `middleware.ts`, `app/api/send-email/route.ts`, `lib/security.ts`

---

## 4. Error Response Shape

Keep responses predictable and safe for clients.

**Success**

```json
{ "success": true, "data": { } }
```

Or route-specific fields (`messageId`, `id`, etc.) — document in the route if non-standard.

**Client errors**

```json
{ "error": "Human-readable message" }
```

| Status | Use for |
|---|---|
| 400 | Invalid JSON, validation failure, bad input |
| 401 | Missing or invalid authentication |
| 403 | Authenticated but not authorized |
| 429 | Rate limit exceeded |
| 500 | Unexpected server failure |

**Checklist**

- [ ] Use `Content-Type: application/json` on all JSON responses.
- [ ] Use `{ error: string }` for all failure responses.
- [ ] Do **not** return stack traces, env values, API keys, or raw provider errors to the client.
- [ ] Log detailed errors with `console.error` on the server only.
- [ ] Use a generic message for **500** responses (e.g. `"Failed to process request. Please try again later."`).

**References:** `app/api/send-email/route.ts`, `middleware.ts`

---

## 5. Logging

Use structured security logging for audit and monitoring.

| Function | Location | Use for |
|---|---|---|
| `logSecurityEvent(event, details, ip?)` | `lib/security.ts` | Auth failures, rate limits, abuse signals |
| `console.error` | Route handler | Unexpected server errors (server logs only) |

**Checklist**

- [ ] Call `logSecurityEvent` for: failed auth, rate-limit hits, suspicious input, and other security-relevant outcomes.
- [ ] Pass **client IP** when available: `request.ip \|\| request.headers.get('x-forwarded-for') \|\| 'unknown'`
- [ ] Do **not** log passwords, session tokens, full email bodies, or payment data.
- [ ] Prefer non-PII in event details (e.g. `userId`, recipient domain, event name).

**References:** `lib/security.ts`, `app/api/send-email/route.ts`

---

## Recommended Handler Order

For a typical **authenticated, mutating** route:

1. **Resolve client IP** — for logging.
2. **Authenticate** → return 401 if required and missing.
3. **Parse & validate** body → return 400 on failure.
4. **Rate limit** (if route-specific) → return 429.
5. **Sanitize** inputs and run business logic.
6. Return success JSON or a safe **500** with `logSecurityEvent` / `console.error`.

> Public or webhook routes skip step 2, or replace it with signature verification (e.g. Stripe).

---

## Quick Reference

| Topic | Primary files |
|---|---|
| Route implementations | `app/api/**/route.ts` |
| Validation & sanitization | `lib/validation.ts` |
| Security config & logging | `lib/security.ts` |
| Global API rate limits | `middleware.ts` |
| Supabase in route handlers | `lib/supabase/server.ts` |
| Full security overview | [SECURITY.md](../SECURITY.md) |

---

## Route Exports (Next.js)

Many routes set the following at the top of the file:

```ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
```

Add these when the route must not be statically cached or depends on Node.js APIs. Match the pattern of neighboring routes in the same feature area.