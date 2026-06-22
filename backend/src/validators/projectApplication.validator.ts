import { z } from "zod";

// POST /projects/:id/apply (API spec: body { project_role_id, motivation }).
export const applyToRoleSchema = z.object({
  project_role_id: z.string().uuid(),
  motivation: z.string().max(2000).optional(),
});

export const projectApplicationIdParamSchema = z.object({ id: z.string().uuid() });

export type ApplyToRoleInput = z.infer<typeof applyToRoleSchema>;
