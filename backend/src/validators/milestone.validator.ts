import { z } from "zod";

export const createMilestoneSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  due_date: z.coerce.date(),
});

// Update also allows changing the milestone status (PENDING → IN_PROGRESS →
// COMPLETED) so the project lead can mark progress; drives the progress bar.
export const updateMilestoneSchema = createMilestoneSchema.extend({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
});
export const milestoneIdParamSchema = z.object({ id: z.string().uuid() });
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
