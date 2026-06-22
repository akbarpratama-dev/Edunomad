import { z } from "zod";

export const memberIdParamSchema = z.object({ id: z.string().uuid() });

// POST /members/:id/remove (API spec: body { reason }). Reason is required so the
// reviewing admin (Workflow 17) has the justification for the removal request.
export const requestRemovalSchema = z.object({
  reason: z.string().min(1).max(2000),
});

export type RequestRemovalInput = z.infer<typeof requestRemovalSchema>;
