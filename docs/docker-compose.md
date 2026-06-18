# Docker Development Guide

This project supports local development using Docker Compose. This setup includes the Next.js frontend application and a PostgreSQL database.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Services

The `docker-compose.yml` defines the following services:

1.  **app**: The Next.js frontend application.
2.  **db**: A PostgreSQL 16 database for local development.

## Setup & Usage

### 1. Environment Variables

Create a `.env.local` file in the root directory (you can copy from `.env.example`).
The Docker setup uses some default environment variables, but you can override them:

- `SUPABASE_JWT_SECRET`: Secret used for JWT signing/verification.
- `DATABASE_URL`: Connection string for the database (defaults to the `db` service).

### 2. Starting the Services

To start all services in development mode:

```bash
docker compose up
```

This will:

- Start the PostgreSQL database and wait for it to be healthy.
- Build and start the Next.js application in development mode (using the `docker-compose.override.yml`).

### 3. Production Build

To test the production build locally:

```bash
docker compose -f docker-compose.yml up --build
```

## Networking

Services are connected via a shared bridge network named `draftdeck-network`.

- The database is accessible within the network at `db:5432`.
- The application is accessible at `http://localhost:3000`.

## Volumes

- `postgres_data`: Persists PostgreSQL data across container restarts.

## Healthchecks

The application service (`app`) depends on the database service (`db`) being healthy. The database health is checked using `pg_isready`.
