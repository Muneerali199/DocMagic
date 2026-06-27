# PostgreSQL Repository Migration Strategy

## Overview

This migration introduces a repository-based access layer to reduce direct database queries inside API handlers.

The goal is to improve:
- maintainability
- testability
- backend portability
- future Go migration compatibility

---

## Current Architecture

Previously, API routes directly accessed Supabase queries inline.

Example:
- `app/api/generate/resume/route.ts`

Problems:
- duplicated DB logic
- tightly coupled handlers
- difficult migration path
- reduced code reuse

---

## Repository Layer Introduction

A repository layer was introduced under:

```text
lib/repositories/
```

---

## Rollout Strategy

### Phase 1
- Introduce repository abstraction layer
- Migrate critical credit-related handlers
- Preserve existing Supabase schema compatibility

### Phase 2
- Expand repositories across remaining API routes
- Remove remaining inline database access
- Introduce centralized database service layer

### Phase 3
- Prepare PostgreSQL-native backend compatibility
- Align repository contracts with future Go services
- Introduce connection pooling and transactional services

---

## Validation Checklist

- Existing schema remains unchanged
- API response behavior remains backward compatible
- Repository layer isolates Supabase-specific queries
- Handlers avoid direct database access where possible