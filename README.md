# Phoenix

A full-stack exam-preparation platform for Indian government-exam aspirants — exam **eligibility matching** plus a previous-year **question-paper quiz engine** (build a quiz, take it, get TNPSC-style scoring).

> Personal full-stack project, built to production-quality engineering standards: typed end-to-end, tested, containerized, CI, and security-audited.

## Structure

| Path | Stack | What it is |
|------|-------|------------|
| [`api/`](api) | Node.js · Express · TypeScript · PostgreSQL | REST API — eligibility engine, quiz engine, JWT/bcrypt auth, RBAC, audit trail. See [api/README](api/README.md) and [api/SECURITY](api/SECURITY.md). |
| [`web/`](web) | Next.js · React · TypeScript · Tailwind | Frontend — eligibility checker + practice/quiz UI. |

## Quick start (API)

```bash
cd api
cp .env.example .env
docker compose up --build   # API + PostgreSQL, migrations + seed run automatically
# → http://localhost:4000/health
```

See [api/README.md](api/README.md) for local (non-Docker) setup and the full API reference.

## Engineering highlights

- **Secure REST API** — JWT + bcrypt auth, role-based access control (RBAC), append-only audit trail, Zod input validation, Helmet security headers, rate limiting.
- **PostgreSQL** data layer (papers stored as JSONB).
- **Dockerized** — multi-stage build, non-root runtime, docker-compose with Postgres.
- **Tested** — Vitest unit + Supertest integration tests.
- **CI / DevSecOps** — GitHub Actions: type-check → build → dependency security scan → migrate/seed → test against a live PostgreSQL service.
