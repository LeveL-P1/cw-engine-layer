# Deployment Checklist

This project deploys cleanly as three services:

- Frontend: Next.js app from `apps/frontend`
- Backend: Node/Express/WebSocket service from `apps/backend`
- Data/Auth: Supabase PostgreSQL and Supabase Auth

## Backend

Set the backend service root to `apps/backend`.

Recommended production commands:

```bash
npm ci
npm run prisma:migrate:deploy
npm run build
npm run start
```

Required environment variables:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NODE_ENV="production"
PORT="4000"
CORS_ORIGIN="https://your-frontend-domain.com"
SUPABASE_URL="https://PROJECT_REF.supabase.co"
SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"
```

Use comma-separated values for `CORS_ORIGIN` when you need to allow multiple frontend origins.

## Frontend

Set the frontend service root to `apps/frontend`.

Recommended production commands:

```bash
npm ci
npm run build
npm run start
```

Required environment variables:

```bash
NEXT_PUBLIC_API_URL="https://your-backend-domain.com"
NEXT_PUBLIC_API_WS_URL="wss://your-backend-domain.com"
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT_REF.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"
```

## Supabase

Configure Auth URL settings before testing production login:

- Site URL: your deployed frontend URL
- Redirect URLs: your deployed frontend URL plus auth callback/reset paths used by the app
- Database: run production migrations with `npm run prisma:migrate:deploy` from `apps/backend`

## Pre-Deploy Checks

Run these from the repository root:

```bash
npm run build:backend
npm run build:frontend
```

## Smoke Test

After deployment, verify:

- Landing page loads
- Sign up, sign in, sign out
- Email verification and password reset
- Create session
- Join session
- Whiteboard realtime sync between two browser windows
- Mode switching for facilitator
- Dashboard and summary pages
- Export/copy actions
- `/health` returns healthy database status on the backend
