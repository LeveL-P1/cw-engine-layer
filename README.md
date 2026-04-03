# CW-Engine

Governed collaborative whiteboard built with Next.js, TLDraw, Express WebSocket APIs, Prisma, and Supabase-backed auth/data services.

## Current State

This repository is under active production-readiness work. The implemented core today is:

- Next.js frontend in `apps/frontend`
- Express + WebSocket backend in `apps/backend`
- Prisma schema and migrations in `apps/backend/prisma`
- Supabase client auth wiring in the frontend
- Governed canvas events, session metrics, and dashboard/summary pages in progress

This README documents only what is currently checked into the repo.

## Workspace

The repo uses a single pnpm workspace rooted at the repository root.

```bash
corepack pnpm install
```

## Environment Setup

Copy and fill these files:

```bash
apps/backend/.env
apps/frontend/.env.local
```

Minimum expected variables are documented in:

- `apps/backend/.env.example`
- `apps/frontend/.env.example`

## Development

Backend:

```bash
cd apps/backend
pnpm dev
```

Frontend:

```bash
cd apps/frontend
pnpm dev
```

## Available Apps

- `apps/frontend`: Next.js web application
- `apps/backend`: Express API + WebSocket server

## Verification Commands

Frontend lint:

```bash
cd apps/frontend
pnpm lint
```

Backend typecheck:

```bash
cd apps/backend
pnpm typecheck
```

Prisma checks:

```bash
cd apps/backend
pnpm prisma:validate
pnpm prisma:status
```

## Notes

- There is currently no committed Docker setup in this repo.
- There is currently no committed CI workflow in this repo.
- The root README should stay aligned with checked-in code, not future plans.
- For Supabase connection strings, percent-encode special password characters and prefer a separate `DIRECT_URL` for Prisma CLI workflows.
- The backend now expects Supabase auth verification variables too, using `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` or the matching `NEXT_PUBLIC_*` fallbacks.
