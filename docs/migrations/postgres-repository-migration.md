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