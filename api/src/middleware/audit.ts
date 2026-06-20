import { Request, Response, NextFunction } from "express";
import { recordAudit } from "../repositories/audit.repository.ts";

// Records an append-only audit entry for every request once the response finishes:
// who (actor), what (method + route), result (status), and where from (ip / agent).
// Fire-and-forget so an audit write never blocks or fails the actual response.
export function audit(req: Request, res: Response, next: NextFunction): void {
  res.on("finish", () => {
    const ua = req.headers["user-agent"];
    const resourceId = typeof req.params?.id === "string" ? req.params.id : null;
    void recordAudit({
      actor: req.user?.email ?? "anonymous",
      action: `${req.method} ${req.route?.path ?? req.path}`,
      method: req.method,
      path: req.originalUrl,
      resourceId,
      statusCode: res.statusCode,
      ip: req.ip ?? null,
      userAgent: typeof ua === "string" ? ua : null,
    }).catch((err) => console.error("[audit] failed to record:", (err as Error).message));
  });
  next();
}
