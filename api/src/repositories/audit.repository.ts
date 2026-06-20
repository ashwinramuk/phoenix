import { pool } from "../db/pool.ts";

export interface AuditEntry {
  actor: string;
  action: string;
  method: string;
  path: string;
  resourceType?: string | null;
  resourceId?: string | null;
  statusCode?: number | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: unknown;
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  await pool.query(
    `INSERT INTO audit_log
       (actor, action, method, path, resource_type, resource_id, status_code, ip, user_agent, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      entry.actor,
      entry.action,
      entry.method,
      entry.path,
      entry.resourceType ?? null,
      entry.resourceId ?? null,
      entry.statusCode ?? null,
      entry.ip ?? null,
      entry.userAgent ?? null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
    ],
  );
}

export async function listAudit(limit = 100): Promise<unknown[]> {
  const { rows } = await pool.query(
    "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT $1",
    [limit],
  );
  return rows;
}
