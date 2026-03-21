"# CW-Engine: Collaborative Whiteboard Application

> A real-time collaborative whiteboarding platform with governance, analytics tracking, and production-ready architecture.

## 📋 Overview

CW-Engine is a full-stack collaborative whiteboard application built with:

- **Frontend:** Next.js 16 + React 19 + TLDraw
- **Backend:** Express.js + WebSocket + Prisma ORM
- **Database:** PostgreSQL + Supabase
- **Real-time:** Event Bus + WebSocket pub/sub pattern
- **Analytics:** Event tracking + metrics snapshots

Perfect for collaborative brainstorming, design sessions, and facilitated workshops.

---

## 🚀 Quick Start (Development)

### Prerequisites

- **Node.js** 18+ or 20+
- **pnpm** 10.28.2+ ([install](https://pnpm.io/installation))
- **Docker & Docker Compose** (for PostgreSQL/Redis)
- **Git**

### 1. Clone & Install

```bash
git clone <your-repo>
cd cw-engine
pnpm install
```

### 2. Setup Environment Variables

Copy the example files and fill in your secrets:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env.local

# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local
```

**For local development**, use these minimal values:

**`apps/backend/.env.local`:**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/whiteboard_dev"
JWT_SECRET="development-secret-key-min-32-chars-long-1234567890ab"
NODE_ENV="development"
PORT=4000
FRONTEND_URL="http://localhost:3000"
CORS_ORIGIN="http://localhost:3000"
OAUTH_GOOGLE_CLIENT_ID="your-google-client-id"
OAUTH_GOOGLE_CLIENT_SECRET="your-google-client-secret"
ALLOW_INSECURE_HTTP="true"
```

**`apps/frontend/.env.local`:**

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_API_WS_URL="ws://localhost:4000"
NEXT_PUBLIC_OAUTH_GOOGLE_CLIENT_ID="your-google-client-id"
NODE_ENV="development"
```

### 3. Start Database

```bash
# Start PostgreSQL + Redis in Docker
docker-compose up -d

# Verify database is running
docker-compose ps
```

### 4. Run Database Migrations

```bash
cd apps/backend
pnpm prisma migrate deploy
# For development with schema changes:
# pnpm prisma migrate dev --name "description of change"
```

### 5. Start Development Servers

**Terminal 1 - Backend:**

```bash
cd apps/backend
pnpm dev
# Backend running on http://localhost:4000
```

**Terminal 2 - Frontend:**

```bash
cd apps/frontend
pnpm dev
# Frontend running on http://localhost:3000
```

### 6. Access the App

Open **<http://localhost:3000>** in your browser.

---

## 📁 Project Structure

```
cw-engine/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── routes/           # API endpoints
│   │   │   ├── websocket/        # WebSocket handlers
│   │   │   ├── services/         # Business logic
│   │   │   ├── middleware/       # Express middleware
│   │   │   ├── governance/       # Role & mode management
│   │   │   ├── event-bus/        # Pub/sub system
│   │   │   └── telemetry/        # Analytics tracking
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database schema
│   │   │   └── migrations/       # Database migrations
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── app/              # Next.js routes
│       │   ├── components/       # React components
│       │   ├── context/          # React context providers
│       │   ├── hooks/            # Custom hooks
│       │   ├── lib/              # Utilities & services
│       │   └── services/         # API clients
│       └── package.json
├── docker-compose.yml            # Local development environment
├── .github/workflows/            # CI/CD pipelines
├── .env.example                  # Root env template
└── pnpm-workspace.yaml           # Monorepo config
```

---

## 🏗️ Architecture

### Real-time Sync Architecture

```
User Action (draw) 
    ↓
Frontend (TLDraw store emit)
    ↓
WebSocket client sends CANVAS_EVENT
    ↓
Backend WebSocket handler validates
    ↓
Governance Engine (check role + mode permissions)
    ↓
Event Bus publish (CANVAS_EVENT)
    ↓
Broadcast to all clients in session
    ↓
Persist to EventLog (async)
    ↓
Telemetry Engine updates metrics
```

### Database Schema

Key models:

- **User** — User profiles with roles
- **Session** — Whiteboard sessions with modes
- **SessionParticipant** — Users in sessions
- **EventLog** — All canvas events (for audit trail)
- **MetricsSnapshot** — Session metrics snapshots

See [schema.prisma](apps/backend/prisma/schema.prisma) for full schema.

---

## 🔑 Key Features (Current)

✅ **Real-time Collaboration**

- TLDraw canvas with Yjs CRDT sync
- WebSocket bidirectional communication
- Multi-user presence

✅ **Governance System**

- Roles: FACILITATOR, CONTRIBUTOR, OBSERVER
- Modes: FREE, LOCKED, DECISION
- Permission-based drawing access

✅ **Event Tracking**

- All canvas events logged to database
- Telemetry metrics per session
- Activity timeline data

✅ **Analytics**

- Per-user edit counts
- Dominance ratio
- Active user count
- Session metrics snapshots

---

## 🛠️ Development Commands

### Backend

```bash
cd apps/backend

# Development with auto-reload
pnpm dev

# Build
pnpm build

# Run tests
pnpm test

# Linting
pnpm lint

# Database
pnpm prisma studio       # Visual DB explorer
pnpm prisma migrate dev  # Create migration
pnpm prisma migrate deploy
```

### Frontend

```bash
cd apps/frontend

# Development with hot reload
pnpm dev

# Build
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint
```

### Root (Monorepo)

```bash
# Install all dependencies
pnpm install

# Run script in specific app
pnpm --filter=backend <script>
pnpm --filter=frontend <script>

# Run script in all apps
pnpm -r <script>
```

---

## 🗄️ Database Management

### Local Development

**View data:**

```bash
# Using Prisma Studio (GUI)
cd apps/backend
pnpm prisma studio
# Opens at http://localhost:5555

# Using psql (CLI)
psql postgresql://postgres:postgres@localhost:5432/whiteboard_dev
```

**Create migration:**

```bash
cd apps/backend
pnpm prisma migrate dev --name "add_feature_name"
# This creates migration file in prisma/migrations/
```

**Reset database (⚠️ development only):**

```bash
cd apps/backend
pnpm prisma migrate reset
# Drops DB, recreates, and seed (if seed.ts exists)
```

### Production Database (Supabase)

1. Go to [supabase.com](https://supabase.com) and create project
2. Get connection string from **Settings → Database**
3. Set `DATABASE_URL` in environment
4. Run migrations: `pnpm prisma migrate deploy`

---

## 🔐 Environment Configuration

### Required Secrets

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pwd@host:5432/db` |
| `JWT_SECRET` | Signing key for JWTs | 32+ random characters |
| `OAUTH_GOOGLE_CLIENT_ID` | Google OAuth app ID | From Google Cloud Console |
| `OAUTH_GOOGLE_CLIENT_SECRET` | Google OAuth secret | From Google Cloud Console |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_EXPIRES_IN` | Token expiry | `12h` |
| `SMTP_HOST` | Email server | Not used in dev |
| `LOG_LEVEL` | Logging verbosity | `debug` |
| `RATE_LIMIT_MAX_REQUESTS` | Per-window limit | `100` |

### Development vs Production

**Development (.env.local):**

- Use local PostgreSQL/Redis via Docker
- `ALLOW_INSECURE_HTTP=true`
- Detailed logging

**Production (.env):**

- Use Supabase PostgreSQL
- Real OAuth credentials
- Strong JWT_SECRET
- HTTPS only

---

## 🚢 Deployment

### Pre-deployment Checklist

- [ ] All tests passing: `pnpm test`
- [ ] Linting clean: `pnpm lint`
- [ ] TypeScript strict: `pnpm typecheck`
- [ ] Database migrations tested
- [ ] Environment variables set in platform
- [ ] CORS configured for production URL
- [ ] OAuth credentials for production domain
- [ ] Backups configured (Supabase auto-backup)

### Deploy to Production

Currently configured for:

- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** Supabase

See [.github/workflows/deploy.yml](.github/workflows/deploy.yml) for CI/CD pipeline.

**Manual deploy:**

```bash
# Frontend (Vercel)
vercel --prod

# Backend (Railway)
railway up --service backend
```

---

## 📊 Monitoring & Debugging

### Health Check

```bash
curl http://localhost:4000/health
# Response: {"status":"ok"}
```

### Logs

**Backend:**

```bash
# View real-time logs
docker logs -f whiteboard_postgres

# Backend logs in console
pnpm --filter=backend dev
```

**Frontend:**

```bash
# Browser DevTools
F12 → Console tab
```

### Database Debugging

```bash
# Prisma Studio (interactive)
cd apps/backend && pnpm prisma studio

# Query directly
psql -U postgres -d whiteboard_dev
SELECT * FROM "User";
```

---

## 🧪 Testing

### Run Tests

```bash
# Backend tests
pnpm --filter=backend test

# Frontend tests
pnpm --filter=frontend test

# All tests
pnpm -r test
```

### Test Coverage

```bash
pnpm --filter=backend test --coverage
pnpm --filter=frontend test --coverage
```

---

## 📝 API Documentation

See [API_DOCS.md](./API_DOCS.md) for full endpoint documentation (coming soon).

Key endpoints:

- `POST /api/auth/register` — User signup
- `POST /api/auth/login` — User login
- `POST /api/sessions` — Create session
- `POST /api/sessions/:id/join` — Join session
- `GET /api/metrics/:sessionId` — Get session metrics
- `GET /api/mode/:sessionId` — Get current mode
- `WebSocket /` — Connect for real-time events

---

## 🐛 Troubleshooting

### Database connection error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**

```bash
# Ensure Docker is running
docker-compose ps
docker-compose up -d
```

### WebSocket connection fails

```
WebSocket is closed before the connection is established
```

**Solution:**

- Ensure backend is running on port 4000
- Check `NEXT_PUBLIC_API_WS_URL` in frontend .env.local
- Frontend and backend CORS must match

### Port already in use

```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solution:**

```bash
# Find process using port
lsof -i :4000
# Kill process
kill -9 <PID>
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request

---

## 📄 License

[Your License Here]

---

## 📚 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [TLDraw Docs](https://tldraw.dev/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Express Docs](https://expressjs.com/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

## 🚀 Production Roadmap

- [ ] Phase 1: Authentication (email/password + OAuth)
- [ ] Phase 2: Session management (create/join/share)
- [ ] Phase 3: Error handling (validation, rate limiting)
- [ ] Phase 4: WebSocket hardening (reconnection, offline queue)
- [ ] Phase 5: Frontend routing (complete UX)
- [ ] Phase 6: Deployment (Docker, CI/CD)
- [ ] Phase 7: Testing (unit + E2E)
- [ ] Phase 8: Launch checklist

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed roadmap.

---

**Questions?** Check [Discussions](https://github.com/your-repo/discussions) or open an [Issue](https://github.com/your-repo/issues)."
