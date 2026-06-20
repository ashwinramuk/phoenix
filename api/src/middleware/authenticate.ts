import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth.service.ts";

function bearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.slice("Bearer ".length);
  return null;
}

// Soft auth: if a valid token is present, attach the user; never rejects.
// Used globally so the audit trail can capture the real actor when known.
export function attachUser(req: Request, _res: Response, next: NextFunction): void {
  const token = bearerToken(req);
  if (token) {
    const user = verifyToken(token);
    if (user) req.user = user;
  }
  next();
}

// Hard auth: 401 unless a valid user is attached.
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

// Role-based authorization: 403 unless the user holds one of the given roles.
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}
