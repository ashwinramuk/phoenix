import { z } from "zod";

// answers: { "1": "A", "2": "C", ... } — keys are question numbers, values A–D.
export const scoreSchema = z.object({
  answers: z.record(z.string(), z.enum(["A", "B", "C", "D"])),
});

// Query params for the quiz endpoint (shuffle is handled separately in the route).
export const quizQuerySchema = z.object({
  count: z.coerce.number().int().positive().max(500).optional(),
  subject: z.string().min(1).optional(),
});
