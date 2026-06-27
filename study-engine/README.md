# Study Engine

NestJS microservice for **Phoenix** — the learning layer. Manages study **content** (DSA patterns, system-design questions, exam topics), tracks **progress** with spaced repetition, and emits scheduled **review reminders**.

> Part of the [Phoenix](../README.md) platform. See [BIG_PICTURE.md](../docs/BIG_PICTURE.md) — this service is the *serve & orchestrate* layer (I/O-bound); heavy analytics will live in a separate Java service.

## Stack
NestJS · TypeScript · TypeORM · PostgreSQL · `@nestjs/schedule` (cron) · class-validator · Jest.

## Modules
| Module | Responsibility |
|--------|----------------|
| `topics` | DSA patterns / system-design topics (categories) |
| `questions` | questions under a topic (coding / system-design / mcq) |
| `submissions` | answers — DSA text/solution, or a system-design diagram (JSON); a self-grade advances spaced repetition |
| `progress` | SM-2 spaced-repetition state per (user, topic); due-for-review queries |
| `notifications` | daily cron that surfaces topics due for review |

## API
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | health check |
| GET | `/topics?category=dsa` | list patterns / system-design topics |
| GET | `/topics/:id/questions` | questions under a topic |
| GET | `/questions/:id` | a question |
| POST | `/questions/:id/submissions` | submit an answer (`answerText` or `diagram`, optional `selfGrade`) |
| GET | `/questions/:id/submissions` | past attempts |
| GET | `/progress` · `/progress/due` | spaced-repetition state / what's due today |
| POST | `/topics/:id/review` | record a review `{ grade: 0-5 }` and reschedule |

## Run

```bash
cp .env.example .env
docker compose up --build      # study-engine + its own PostgreSQL (phoenix_study), seeded
# → http://localhost:3001/health
```

Local (non-Docker):
```bash
npm install
# point DATABASE_URL at a Postgres with a `phoenix_study` database, then:
npm run build && npm run db:seed   # TypeORM `synchronize` creates the schema, then seeds
npm run start:dev                  # http://localhost:3001
```

## Test
```bash
npm test     # unit tests (spaced-repetition logic) — no database needed
```

## Notes
- **Schema** is managed by TypeORM `synchronize` (dev convenience); switch to migrations for production.
- **Spaced repetition** is an SM-2 variant: grade 0–5; `<3` resets the interval, good grades grow it (1 → 6 → interval × ease).
- The system-design **diagram** is stored as JSON (React Flow nodes + edges) — the drag-and-drop editor is a frontend feature in the web app.
