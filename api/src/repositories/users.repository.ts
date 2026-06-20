import { pool } from "../db/pool.ts";

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  role: string;
}

// Email lookup is case-insensitive: users registered as "Foo@x.com" can log in
// as "foo@x.com". (A real-world auth edge case worth normalizing here.)
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await pool.query(
    "SELECT id, email, password_hash, role FROM users WHERE lower(email) = lower($1)",
    [email],
  );
  return rows.length ? (rows[0] as UserRow) : null;
}
