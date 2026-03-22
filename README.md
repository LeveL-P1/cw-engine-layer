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
npm run dev
```

Frontend:

```bash
cd apps/frontend
npm run dev
```

## Available Apps

- `apps/frontend`: Next.js web application
- `apps/backend`: Express API + WebSocket server

## Verification Commands

Frontend lint:

```bash
cd apps/frontend
npm run lint
```

Backend typecheck:

```bash
cd apps/backend
.\node_modules\.bin\tsc.cmd --noEmit
```

## Notes

- There is currently no committed Docker setup in this repo.
- There is currently no committed CI workflow in this repo.
- The root README should stay aligned with checked-in code, not future plans.
