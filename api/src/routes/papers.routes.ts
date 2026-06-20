import { Router, Request, Response, NextFunction } from "express";
import { listPaperSummaries, getPaperById } from "../repositories/papers.repository.ts";
import { buildQuiz, scorePaper } from "../services/papers.service.ts";
import { validateBody } from "../middleware/validate.ts";
import { scoreSchema, quizQuerySchema } from "../schemas/paper.schema.ts";

const router = Router();

// GET /api/papers — list papers (metadata + subject blueprint, no questions)
router.get("/papers", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const papers = await listPaperSummaries();
    res.json({ data: papers, meta: { total: papers.length } });
  } catch (err) {
    next(err);
  }
});

// GET /api/papers/:id — full paper with questions and answers (review mode)
router.get("/papers/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const paper = await getPaperById(id);
    if (!paper) {
      res.status(404).json({ error: `Paper '${id}' not found` });
      return;
    }
    res.json({ data: paper });
  } catch (err) {
    next(err);
  }
});

// GET /api/papers/:id/quiz?count=20&subject=Thermodynamics&shuffle=true
router.get("/papers/:id/quiz", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = quizQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    const id = String(req.params.id);
    const paper = await getPaperById(id);
    if (!paper) {
      res.status(404).json({ error: `Paper '${id}' not found` });
      return;
    }
    const questions = buildQuiz(paper, {
      count: parsed.data.count,
      subject: parsed.data.subject,
      shuffle: req.query.shuffle === "true",
    });
    res.json({ data: questions, meta: { total: questions.length } });
  } catch (err) {
    next(err);
  }
});

// POST /api/papers/:id/score — body { answers: { "1": "A", ... } }
router.post(
  "/papers/:id/score",
  validateBody(scoreSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const paper = await getPaperById(id);
      if (!paper) {
        res.status(404).json({ error: `Paper '${id}' not found` });
        return;
      }
      const result = scorePaper(paper, req.body);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
