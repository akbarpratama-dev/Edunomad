import { z } from "zod";

// POST /projects/:id/senior-apply (API spec: body { message }).
export const applyAsMentorSchema = z.object({
  message: z.string().max(2000).optional(),
});

export const seniorApplicationIdParamSchema = z.object({ id: z.string().uuid() });

export type ApplyAsMentorInput = z.infer<typeof applyAsMentorSchema>;
