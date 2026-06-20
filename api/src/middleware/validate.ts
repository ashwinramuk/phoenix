import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

// Validate (and narrow) the request body against a Zod schema before the handler runs.
// On failure, returns 400 with structured field errors — never reaches business logic.
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: "Validation failed", details: result.error.flatten() });
      return;
    }
    req.body = result.data;
    next();
  };
}
