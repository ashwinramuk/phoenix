import { Request, Response, NextFunction } from "express";
import { ApiError } from "../lib/errors.ts";
import { env } from "../config/env.ts";

// Central error handler. Client errors (4xx) surface their message; server
// errors (5xx) return a generic message and never leak stack traces in prod.
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const status = err instanceof ApiError ? err.statusCode : 500;

  if (status >= 500) {
    console.error(`[ERROR] ${err.stack ?? err.message}`);
  }

  res.status(status).json({
    error: status >= 500 ? "Internal server error" : err.message,
    ...(!env.isProd && status >= 500 ? { details: err.message } : {}),
  });
}
