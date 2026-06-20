# Phoenix API

Backend for **Project Phoenix**, an exam-preparation platform. A TypeScript/Express REST API with an exam-eligibility engine and a previous-year question-paper quiz engine (build a quiz, take it, get TNPSC-style scoring), backed by PostgreSQL.

> Personal full-stack project. Built to production-quality engineering standards (typed, tested, containerized, CI, audited) — not an enterprise production deployment.

## Tech stack

| Concern | Choice |
|---------|--------|
| Language / runtime | TypeScript (ES modules), Node.js 22 |
| Web framework | Express |
| Database | PostgreSQL (`pg`), papers stored as JSONB |
| Auth | JWT (`jsonwebtoken`) + bcrypt password hashing |
| Validation | Zod (request body + query) |
| Security | Helmet, CORS allowlist, rate limiting, audit trail |
| Tests | Vitest + Supertest (unit + integration) |
| Packaging | Docker (multi-stage) + docker-compose |
| CI | GitHub Actions (type-check, build, security scan, test) |

## Architecture

```
routes/        HTTP layer — validation, status codes
  ├── auth.routes.ts        POST /api/auth/login
  ├── eligibility.routes.ts GET /api/exams, POST /api/eligibility
  ├── papers.routes.ts      GET /api/papers[...], POST /api/papers/:id/score
  └── admin.routes.ts       GET /api/admin/audit  (admin only)
services/      Pure business logic (scoring, quiz building, auth)
repositories/  Data access (PostgreSQL)
middleware/    auth, audit, validation, logging, error handling
schemas/       Zod request schemas
db/            pool, schema, migrate, seed
```

Scoring/quiz logic is kept **pure** (takes a `Paper`, returns a result) so it's unit-tested without a database; all I/O lives in repositories.

## Getting started

### Option A — Docker (one command)

```bash
docker compose up --build
# API on http://localhost:4000, migrations + seed run automatically
```

### Option B — Local

```bash
cp .env.example .env          # then edit values
npm install
# bring up a Postgres (or use the compose one):
docker compose up -d postgres
npm run db:migrate
npm run db:seed
npm run dev                   # http://localhost:4000
```

### Environment

See [.env.example](.env.example). Key vars: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `RATE_LIMIT_*`.

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/health` | — | Health check |
| POST | `/api/auth/login` | — | Email + password → JWT |
| GET  | `/api/exams` | — | List active exams |
| POST | `/api/eligibility` | — | Eligibility check for a profile |
| GET  | `/api/papers` | — | List papers (no questions) |
| GET  | `/api/papers/:id` | — | Full paper (review mode) |
| GET  | `/api/papers/:id/quiz` | — | Quiz questions (answers stripped) |
| POST | `/api/papers/:id/score` | — | Score a submission |
| GET  | `/api/admin/audit` | **admin** | View the audit trail |

Seeded demo users: `analyst@phoenix.local / Analyst@123` (analyst), `admin@phoenix.local / Admin@123` (admin).

```bash
# Log in, then call the admin-only audit endpoint
TOKEN=$(curl -s localhost:4000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"admin@phoenix.local","password":"Admin@123"}' | jq -r .data.token)
curl localhost:4000/api/admin/audit -H "authorization: Bearer $TOKEN"
```

## Testing

```bash
npm run test:unit   # pure logic, no database
npm test            # unit + integration (integration runs when DATABASE_URL is set)
```

## Security

See [SECURITY.md](SECURITY.md) for the secure-coding practices applied (authn/authz, input validation, rate limiting, audit trail, secrets handling, dependency scanning, container hardening).
