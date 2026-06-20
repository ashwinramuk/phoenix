import { Router, Request, Response, NextFunction } from "express";
import { validateBody } from "../middleware/validate.ts";
import { loginSchema } from "../schemas/auth.schema.ts";
import { verifyCredentials, issueToken } from "../services/auth.service.ts";

const router = Router();

// POST /api/auth/login — exchange email + password for a short-lived JWT.
router.post("/login", validateBody(loginSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await verifyCredentials(email, password);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }
    const token = issueToken(user);
    res.json({ data: { token, user: { email: user.email, role: user.role } } });
  } catch (err) {
    next(err);
  }
});

export default router;
