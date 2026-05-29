# Go Config Loader and Environment Validation

## Overview

This module introduces a centralized configuration loader for the Go backend migration.

The configuration package provides:

- centralized environment variable management
- required environment validation
- optional environment handling
- default fallback values
- reusable configuration loading across services

---

## Location

```text
backend/go/config/config.go