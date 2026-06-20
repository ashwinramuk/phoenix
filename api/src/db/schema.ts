// Schema as a SQL string so it ships with the compiled output (no file-copy step)
// and can be applied idempotently by `npm run db:migrate`.

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'analyst',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS papers (
  id         TEXT PRIMARY KEY,
  data       JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Append-only audit trail: who did what, when, from where.
CREATE TABLE IF NOT EXISTS audit_log (
  id            BIGSERIAL PRIMARY KEY,
  actor         TEXT NOT NULL DEFAULT 'anonymous',
  action        TEXT NOT NULL,
  method        TEXT NOT NULL,
  path          TEXT NOT NULL,
  resource_type TEXT,
  resource_id   TEXT,
  status_code   INTEGER,
  ip            TEXT,
  user_agent    TEXT,
  metadata      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor      ON audit_log (actor);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log (created_at DESC);
`;
