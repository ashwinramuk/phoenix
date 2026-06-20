import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

// Per-request structured logging. Assigns a request id (returned via x-request-id),
// logs method/path/status/timing only — never Authorization headers or tokens.
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  req.id = randomUUID();
  res.setHeader("x-request-id", req.id);
  const start = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.id} ${req.method} ${req.path} ${res.statusCode} ${ms}ms`,
    );
  });

  next();
}
