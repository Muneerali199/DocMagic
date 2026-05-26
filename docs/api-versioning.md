# API Versioning — DraftDeckAI

## Overview

DraftDeckAI uses **URL path versioning** as the primary versioning mechanism.
All API versions run in parallel — no breaking changes are made to existing clients
when a new version is introduced.

---

## Version Support Matrix

| Version | Status     | Introduced | Sunset Date | Notes                          |
|---------|------------|------------|-------------|--------------------------------|
| v1      | Deprecated | Launch     | 2026-12-31  | Legacy param shapes supported  |
| v2      | Stable     | 2026-05-21 | —           | Current canonical version      |

---

## How to Specify a Version

Three mechanisms are supported, evaluated in this priority order:

### 1. URL path (recommended)

```http
GET  /api/v2/health
POST /api/v2/documents
POST /api/v2/generate/resume

GET  /api/v1/health          ← deprecated
POST /api/v1/documents       ← deprecated
POST /api/v1/generate/resume ← deprecated
```

### 2. Request header

```http
API-Version: 2
```

Accepts bare numbers (`1`, `2`) or prefixed (`v1`, `v2`). Case-insensitive.

### 3. Query parameter (avoid in production — pollutes logs and caches)

```http
GET /api/health?api_version=2
```

### Default

Requests that do not specify a version are treated as **v2**.

---

## Deprecation Headers

Every response from a v1 endpoint includes these headers:

| Header            | Example value                                        | Standard       |
|-------------------|------------------------------------------------------|----------------|
| `Deprecation`     | `true`                                               | RFC 8594       |
| `Sunset`          | `2026-12-31T23:59:59Z`                               | RFC 8594       |
| `Warning`         | `299 - "API v1 is deprecated..."`                    | RFC 7234 §5.5  |
| `Link`            | `<https://draftdeckai.com/docs/migration-v1-v2>; rel="deprecation"` | RFC 8594 |
| `X-API-Version`   | `v1`                                                 | Custom         |
| `X-API-Deprecated`| `true`                                               | Custom         |
| `X-API-Sunset`    | `2026-12-31`                                         | Custom         |

v2 responses carry **none** of these headers.

---

## Versioned Endpoints

### Currently versioned

| Endpoint                    | v1 path                        | v2 path                        |
|-----------------------------|--------------------------------|--------------------------------|
| Health check                | `GET /api/v1/health`           | `GET /api/v2/health`           |
| Documents                   | `GET/POST /api/v1/documents`   | `GET/POST /api/v2/documents`   |
| Resume generation           | `POST /api/v1/generate/resume` | `POST /api/v2/generate/resume` |

### Unversioned routes

All other routes (e.g. `/api/generate/presentation`, `/api/credits`) remain
at their current paths and behave as v2. They will receive explicit v2 aliases
in a follow-up PR.

---

## Rate Limiting

Versioned paths share the same rate-limit bucket as their unversioned equivalents.
`/api/v1/generate/resume` counts against the same GENERATE bucket (20 req / 5 min)
as `/api/generate/resume`.

---

## Version Lifecycle

```text
Introduced → Stable → Deprecated (Sunset header set) → Removed (after sunset date)
```

- A version is **deprecated** when a stable successor exists and a sunset date is announced.
- A version is **removed** no earlier than its published sunset date.
- Clients receive at least **6 months notice** before removal.

---

## Adding a New Version (for maintainers)

1. Add the new version to `ApiVersion` in `lib/api-versioning/types.ts`
2. Add its config to `VERSION_CONFIGS` (set `deprecated: false`, leave `sunsetDate` empty)
3. Mark the previous version as `deprecated: true` and set a `sunsetDate`
4. Create `app/api/v3/` route files (re-exports or new handlers)
5. Update this document and `docs/migration-v1-v2.md` with the new migration guide
