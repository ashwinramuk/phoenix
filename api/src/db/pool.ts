import pg from "pg";
import { env } from "../config/env.ts";

const { Pool } = pg;

// A single shared connection pool for the process.
export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err: Error) => {
  // Don't crash the process on an idle-client error — log and let the pool recover.
  console.error("[db] unexpected pool error:", err.message);
});

export function query(text: string, params?: unknown[]) {
  return pool.query(text, params as never);
}
