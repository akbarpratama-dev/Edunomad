import { z } from "zod";

// `?regenerate=true` bypasses the cache and forces a fresh AI call (D-AI-1).
export const regenerateQuerySchema = z.object({
  regenerate: z.enum(["true", "false"]).optional(),
});
