import { z } from "zod";

export const createRoleSchema = z.object({
  role_name: z.string().min(1).max(100),
  capacity: z.coerce.number().int().min(1, "Kapasitas minimal 1"),
  requirements: z.string().optional(),
  skills: z.array(z.string().uuid()).default([]),
});

export const updateRoleSchema = createRoleSchema;
export const roleIdParamSchema = z.object({ id: z.string().uuid() });
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
