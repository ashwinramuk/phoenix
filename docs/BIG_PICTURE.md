# Phoenix — Big Picture (North Star)

## Thesis
Phoenix is **a learning platform you build *by* learning.** One system, triple duty:
1. it **tracks your own interview/exam prep**,
2. it **is the portfolio that proves you're hireable**, and
3. it **seeds a future product** for exam aspirants.

The same daily action — preparing — powers all three.

## Architecture — right tool for the job
Polyglot by **need**, not novelty. Each service uses the stack suited to its *compute profile*.

| Service | Stack | Profile | Why this stack | Skill proven |
|---|---|---|---|---|
| Web | Next.js / React / TS | client | UI, SSR, PWA | React |
| Eligibility & Core API ✅ | Express / TS | I/O | simple fast REST + auth/audit | secure Node |
| **Study Engine** | **NestJS / TS** | I/O-bound | modular serving, DI, real-time, scheduling; content + progress + spaced-repetition + reminders | NestJS / enterprise Node |
| Analytics Engine | Java / Spring | CPU-bound | heavy metrics, predictions, nightly batch (Spring Batch); precise compute | Java backend |
| AI Pipeline | Python / FastAPI | AI + data | LLM / RAG / NLP, ETL — the GenAI ecosystem lives here | GenAI / Python |
| Data | PostgreSQL | — | relational + JSONB | SQL / data modeling |

**Principle:** serve & orchestrate (I/O) → Node/NestJS · compute (CPU/batch) → Java · intelligence (AI/data) → Python.

## The learning loop (Study Engine + Analytics)
- **NestJS Study Engine** runs the *experience*: topics (DSA, system design, exam), progress, spaced repetition, study plans, reminders, serving.
- **Java Analytics Engine** crunches the *numbers*: mastery scores, weak-area detection, predictions, batch recompute over the progress data.
- Two layers, not competitors — NestJS serves, Java computes.

## Three flywheels (one input, three outputs)
1. **Prep loop** — study → log → spaced-rep schedules a review → reminder → study.
2. **Career loop** — build a service to learn a stack → it proves the skill → interviews → offers.
3. **Product loop** — content made for yourself → seeds the aspirant product.

## What we deliberately did NOT add (and why)
- **Blockchain / DLT** — Phoenix is a centralized app with a trusted operator; a database beats a blockchain on speed, cost, and simplicity for everything here. The "immutable ledger" need is already met by the append-only `audit_log` table. Bolting on a chain would be resume-driven architecture — a red flag to senior engineers. *One* legitimate future niche: tamper-proof **verifiable certificates** — and even that is better served by signed W3C Verifiable Credentials than a public chain. **Decision: not used.** Knowing when *not* to reach for a technology is itself a senior signal.

## Phasing
- **North star:** career-lifecycle super-app (eligibility → prep → jobs).
- **Now:** NestJS Study Engine (DSA + system design + progress + reminders).
- **Next:** Python AI Pipeline (highest job-market value for GenAI roles).
- **Later:** Java Analytics Engine (once there's data worth crunching).

## Honest anchor
The platform is scaffolding around the prep, not a substitute for it. **Goal = employment.** Grind the actual DSA + system-design + applications daily; build services as focused learning sprints, not endlessly.
