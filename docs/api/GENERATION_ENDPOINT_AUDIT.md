# Generation API endpoint audit (#849)

## Canonical (v2)

| Endpoint                                      | Purpose                                |
| --------------------------------------------- | -------------------------------------- |
| `POST /api/v2/generate/resume`                | ATS resume from prompt (credits)       |
| `POST /api/v2/generate/resume/smart`          | Resume from free-form text + ATS score |
| `POST /api/v2/generate/resume/improve`        | AI chat improvements                   |
| `POST /api/v2/generate/resume/guided`         | Guided wizard resume                   |
| `POST /api/v2/generate/resume/guidance`       | Per-step guidance                      |
| `POST /api/v2/generate/resume/enhance-bullet` | Single bullet enhancement              |
| `POST /api/v2/generate/resume/ats-score`      | ATS analysis                           |
| `POST /api/v2/generate/presentation`          | Presentation generation                |
| `POST /api/v2/generate/letter`                | Letter / cover letter                  |
| `POST /api/v2/generate/diagram`               | Mermaid diagram                        |

## Deprecated (backward compatible)

Legacy paths call the same handlers and return `Deprecation`, `Sunset`, `Link` (successor + migration guide), `X-API-Deprecated`, and `X-API-Successor` headers.

See `LEGACY_GENERATION_ENDPOINTS` in `lib/api-versioning/legacy-endpoint.ts`.

## Related (not consolidated in this pass)

| Endpoint                                 | Notes                             |
| ---------------------------------------- | --------------------------------- |
| `POST /api/generate/presentation-full`   | Full deck variant                 |
| `POST /api/generate-presentation-stream` | SSE stream                        |
| `POST /api/generate/modify-presentation` | Edit existing deck                |
| `POST /api/v1/generate/resume`           | v1 shape + v1 deprecation headers |

## Versioning

- **v1** (`/api/v1/*`): deprecated, field adapters in `lib/api-versioning`
- **v2** (`/api/v2/generate/*`): current generation surface
- **Unversioned** (`/api/generate/*`, `/api/resume/*`): deprecated with successor headers
