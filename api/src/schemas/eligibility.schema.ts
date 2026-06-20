import { z } from "zod";

// Required identity fields for an eligibility check; extra profile fields
// (degree, branch, etc.) pass through to the eligibility engine.
export const profileSchema = z
  .object({
    dateOfBirth: z.string().min(1),
    qualification: z.string().min(1),
    category: z.string().min(1),
  })
  .passthrough();
