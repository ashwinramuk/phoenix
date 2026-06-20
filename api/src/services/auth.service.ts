import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env.ts";
import { findUserByEmail } from "../repositories/users.repository.ts";
import { AuthUser } from "../types/auth.ts";

/**
 * Verify email + password against the stored bcrypt hash.
 * Returns the user (sans hash) on success, null otherwise.
 * Note: production would add constant-time handling to avoid user enumeration.
 */
export async function verifyCredentials(email: string, password: string): Promise<AuthUser | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return null;
  return { id: user.id, email: user.email, role: user.role };
}

export function issueToken(user: AuthUser): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwtSecret, options);
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const payload = jwt.verify(token, env.jwtSecret) as unknown as {
      sub: number;
      email: string;
      role: string;
    };
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}
