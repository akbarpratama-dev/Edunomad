import { z } from "zod";

// start_date required, end_date nullable (ongoing). Dates accepted as ISO
// strings / date strings and coerced to Date for the @db.Date columns.
export const createExperienceSchema = z.object({
  title: z.string().min(1).max(255),
  organization: z.string().min(1).max(255),
  description: z.string().optional(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable().optional(),
});

// PUT reuses the same shape (full replace per API spec "Body: Same as create").
export const updateExperienceSchema = createExperienceSchema;

export const experienceIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
