# Security & Secure-Coding Practices

Practices applied in this codebase, grouped by concern. (DevSecOps = security built into the dev workflow and pipeline, not bolted on after.)

## Authentication & authorization
- **Password hashing** with bcrypt (cost factor 12) — plaintext passwords are never stored.
- **JWT** bearer tokens, short-lived (`JWT_EXPIRES_IN`, default 1h), signed with a secret from the environment.
- **Soft auth** (`attachUser`) populates the request actor when a valid token is present; **hard auth** (`requireAuth`) gates protected routes.
- **Role-based access control** (`authorize("admin")`) — the audit endpoint requires the `admin` role (authN + authZ).
- **Case-insensitive email** lookup at login to avoid a common auth edge case.

## Input handling
- **Schema validation** with Zod on every request body and on query params — malformed input is rejected with `400` before reaching business logic.
- **Parameterized SQL** everywhere (`$1, $2 …`) — no string-concatenated queries, so no SQL injection.
- **Request body size limit** (`100kb`) to blunt large-payload abuse.

## Transport & headers
- **Helmet** sets secure HTTP headers (CSP, HSTS, `X-Content-Type-Options`, frameguard, etc.).
- **CORS allowlist** — only configured origins (`CORS_ORIGINS`) may call the API from a browser.
- `x-powered-by` disabled (no framework fingerprinting).

## Abuse protection
- **Rate limiting** (`express-rate-limit`) per window, configurable via env.

## Auditability
- **Append-only audit trail** (`audit_log`) records actor, action, method, path, status, IP, and user-agent for every request — the "who did what, when" record expected in regulated/financial domains.
- **Per-request id** (`x-request-id`) for traceability across logs.

## Secrets & logging
- **No secrets in code** — all secrets come from environment variables; `.env` is git-ignored, with a committed `.env.example` template.
- **Fail-fast config** — missing `JWT_SECRET`/`DATABASE_URL` throws at startup in production rather than at first request.
- **Sanitized logging** — access logs never include Authorization headers or tokens.
- **Safe error responses** — 5xx errors return a generic message; stack traces are never sent to clients in production.

## Supply chain & build
- **Dependency scanning** in CI: `npm audit --omit=dev --audit-level=high` fails the build on known production vulnerabilities.
- **Pinned, locked dependencies** (`package-lock.json`, `npm ci`).

## Container hardening
- **Multi-stage Docker build** — dev dependencies and source are not shipped in the runtime image.
- **Non-root** runtime (`USER node`) — least privilege.

## Known follow-ups (honest TODOs)
- Constant-time handling on login to fully prevent user enumeration.
- Refresh-token rotation / token revocation list.
- Move audit writes to a queue if write volume grows.
