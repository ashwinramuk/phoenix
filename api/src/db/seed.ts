// Seeds the database with the question paper and demo users.
// Safe to re-run: all inserts upsert.
import bcrypt from "bcryptjs";
import { pool } from "./pool.ts";
import { SCHEMA_SQL } from "./schema.ts";
import paperJson from "../data/papers/tnpsc-cts-mech-2018.json" with { type: "json" };

const DEMO_USERS = [
  { email: "analyst@phoenix.local", password: "Analyst@123", role: "analyst" },
  { email: "admin@phoenix.local", password: "Admin@123", role: "admin" },
];

async function seed(): Promise<void> {
  await pool.query(SCHEMA_SQL);

  const paper = paperJson as { id: string };
  await pool.query(
    `INSERT INTO papers (id, data) VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
    [paper.id, paperJson],
  );
  console.log(`✅ Seeded paper: ${paper.id}`);

  for (const user of DEMO_USERS) {
    const hash = bcrypt.hashSync(user.password, 12);
    await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role`,
      [user.email, hash, user.role],
    );
    console.log(`✅ Seeded user: ${user.email} (${user.role})`);
  }

  console.log("✅ Seed complete");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
