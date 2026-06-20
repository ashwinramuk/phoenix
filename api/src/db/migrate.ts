// Idempotent migration runner: applies the schema, then exits.
import { pool } from "./pool.ts";
import { SCHEMA_SQL } from "./schema.ts";

async function migrate(): Promise<void> {
  await pool.query(SCHEMA_SQL);
  console.log("✅ Migration complete — schema applied");
  await pool.end();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
