import { z } from "zod";

export const createMilestoneSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  due_date: z.coerce.date(),
});

export const updateMilestoneSchema = createMilestoneSchema;
export const milestoneIdParamSchema = z.object({ id: z.string().uuid() });
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
