import { z } from "zod";

const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export const listSkillsQuerySchema = z.object({
  category: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const addUserSkillSchema = z.object({
  skill_id: z.string().uuid(),
  level: z.enum(SKILL_LEVELS),
});

export const updateUserSkillSchema = z.object({
  level: z.enum(SKILL_LEVELS),
});

export const userSkillIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type ListSkillsQuery = z.infer<typeof listSkillsQuerySchema>;
export type AddUserSkillInput = z.infer<typeof addUserSkillSchema>;
export type UpdateUserSkillInput = z.infer<typeof updateUserSkillSchema>;
