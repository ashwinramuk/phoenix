import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, authorize } from "../middleware/authenticate.ts";
import { listAudit } from "../repositories/audit.repository.ts";

const router = Router();

// GET /api/admin/audit — view the audit trail. Requires authentication AND the
// 'admin' role (authN + authZ). Demonstrates RBAC over a sensitive resource.
router.get(
  "/audit",
  requireAuth,
  authorize("admin"),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await listAudit(100);
      res.json({ data: rows, meta: { total: rows.length } });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
