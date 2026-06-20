import { Router, Request, Response } from "express";
import { UserProfile } from "../types/exam.ts";
import { getEligibleExams, getAllExams } from "../services/eligibility.service.ts";
import { validateBody } from "../middleware/validate.ts";
import { profileSchema } from "../schemas/eligibility.schema.ts";

const router = Router();

// GET /api/exams — list all active exams
router.get("/exams", (_req: Request, res: Response) => {
  const exams = getAllExams();
  res.json({ data: exams, meta: { total: exams.length } });
});

// POST /api/eligibility — check eligibility for a user profile
router.post("/eligibility", validateBody(profileSchema), (req: Request, res: Response) => {
  const profile = req.body as UserProfile;

  const results = getEligibleExams(profile);
  const eligible = results.filter((r) => r.isEligible);
  const ineligible = results.filter((r) => !r.isEligible);

  res.json({
    data: { eligible, ineligible },
    meta: {
      totalExams: results.length,
      eligibleCount: eligible.length,
      ineligibleCount: ineligible.length,
    },
  });
});

export default router;
