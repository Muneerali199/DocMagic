# DraftDeckAI Go Backend

## Run locally

Set environment variable:

```bash
set SUPABASE_JWT_SECRET=testsecret
```

Run server:

```bash
make run
```

Server runs on:

http://localhost:8080

## Run tests

```bash
make test
```

## Run lint

```bash
make lint
```

## Project structure

```text
go/
  cmd/server
  internal
  pkg
```

This structure follows standard Go project layout for backend migration.