# Migration Guide: v1 → v2

**v1 sunset date: 2026-12-31.** After this date, v1 endpoints will return `410 Gone`.
Migrate before then to avoid service disruption.

---

## What Changed

v2 standardises on flat request bodies with consistent field names.
v1 used nested objects (`personalInfo`) and inconsistent naming (`name` vs `title`).

---

## Endpoint Changes

### POST /api/generate/resume

#### v1 request body (deprecated)

```json
{
  "personalInfo": {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "phone": "+1 555 000 0000"
  },
  "jobTitle": "Software Engineer",
  "yearsOfExperience": 5,
  "skills": "TypeScript, React, Node.js",
  "additionalContext": "Focus on backend systems."
}
```

#### v2 request body (current)

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "prompt": "Create a professional resume for a Software Engineer position. The candidate has 5 years of experience. Key skills: TypeScript, React, Node.js. Focus on backend systems."
}
```

#### Field mapping

| v1 field                    | v2 field  | Notes                                              |
|-----------------------------|-----------|----------------------------------------------------|
| `personalInfo.name`         | `name`    | Moved to top level                                 |
| `personalInfo.email`        | `email`   | Moved to top level                                 |
| `personalInfo.phone`        | *(in prompt)* | Include in `prompt` if needed                  |
| `jobTitle`                  | `prompt`  | Becomes the opening sentence of `prompt`           |
| `yearsOfExperience`         | `prompt`  | Appended to `prompt` automatically by v1 adapter   |
| `skills` *(comma string)*   | `prompt`  | Split and included in `prompt` as a list           |
| `additionalContext`         | `prompt`  | Appended at the end of `prompt`                    |

#### curl examples

**v1 (deprecated):**
```bash
curl -X POST https://draftdeckai.com/api/v1/generate/resume \
  -H "Content-Type: application/json" \
  -d '{
    "personalInfo": { "name": "Ada Lovelace", "email": "ada@example.com" },
    "jobTitle": "Software Engineer",
    "skills": "TypeScript, React"
  }'
```

**v2 (current):**
```bash
curl -X POST https://draftdeckai.com/api/v2/generate/resume \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "prompt": "Create a professional resume for a Software Engineer. Key skills: TypeScript, React."
  }'
```

---

### GET/POST /api/documents

#### v1 POST request body (deprecated)

```json
{
  "name": "My Resume",
  "type": "resume",
  "data": { "sections": [] },
  "tags": { "template": "modern" },
  "parts": ["summary", "experience"]
}
```

#### v2 POST request body (current)

```json
{
  "title": "My Resume",
  "documentType": "resume",
  "content": { "sections": [] },
  "metadata": { "template": "modern" },
  "sections": ["summary", "experience"]
}
```

#### Field mapping

| v1 field | v2 field       | Notes                    |
|----------|----------------|--------------------------|
| `name`   | `title`        | Required                 |
| `type`   | `documentType` | Required                 |
| `data`   | `content`      | Optional                 |
| `tags`   | `metadata`     | Optional                 |
| `parts`  | `sections`     | Optional                 |

#### curl examples

**v1 (deprecated):**
```bash
curl -X POST https://draftdeckai.com/api/v1/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{ "name": "My Resume", "type": "resume" }'
```

**v2 (current):**
```bash
curl -X POST https://draftdeckai.com/api/v2/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{ "title": "My Resume", "documentType": "resume" }'
```

---

### GET /api/health

No request body changes. The only difference is the response includes v1
deprecation headers when called via `/api/v1/health`.

```bash
# v2 — no deprecation headers
curl https://draftdeckai.com/api/v2/health

# v1 — includes Deprecation, Sunset, Warning headers
curl https://draftdeckai.com/api/v1/health
```

---

## Recognising Deprecation Headers

Update your client to log or alert when it receives these headers on any response:

```http
Deprecation: true
Sunset: 2026-12-31T23:59:59Z
Warning: 299 - "API v1 is deprecated..."
```

JavaScript example:

```js
const res = await fetch('/api/v1/generate/resume', { ... });

if (res.headers.get('Deprecation') === 'true') {
  const sunset = res.headers.get('X-API-Sunset');
  console.warn(`[DraftDeckAI] This endpoint is deprecated. Migrate before ${sunset}.`);
}
```

---

## Migration Checklist

- [ ] Replace `/api/v1/` URL prefix with `/api/v2/` across all API calls
- [ ] Flatten `personalInfo.name/email` to top-level `name`/`email` in resume requests
- [ ] Replace `jobTitle` + `skills` + `yearsOfExperience` with a single `prompt` string
- [ ] Rename document fields: `name→title`, `type→documentType`, `data→content`, `tags→metadata`, `parts→sections`
- [ ] Remove any client-side handling of the legacy fields
- [ ] Add deprecation header detection to surface warnings early (see above)
- [ ] Test with both endpoints before cutting over

---

## Support

Open an issue on GitHub if you encounter problems during migration.
