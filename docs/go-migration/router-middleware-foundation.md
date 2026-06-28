# Go Router and Middleware Foundation

## Overview

This module introduces the foundational HTTP router and middleware stack for the Go backend migration.

The implementation provides:
- centralized router setup
- reusable middleware chain
- request tracing support
- panic recovery
- timeout handling
- CORS handling
- standardized JSON error responses

---

## Added Structure

```text
backend/go/router/router.go
backend/go/middleware/middleware.go
backend/go/utils/errors.go