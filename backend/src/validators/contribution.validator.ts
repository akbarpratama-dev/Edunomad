import { z } from "zod";

export const contributionIdParamSchema = z.object({ id: z.string().uuid() });

// POST /projects/:id/contributions — summary + the skills used (skill ids).
export const submitContributionSchema = z.object({
  contribution_summary: z.string().min(1, "Ringkasan wajib diisi").max(5000),
  skills: z.array(z.string().uuid()).max(30).optional(),
});

// PUT /contributions/:id — same shape; partial edits allowed.
export const updateContributionSchema = z.object({
  contribution_summary: z.string().min(1).max(5000).optional(),
  skills: z.array(z.string().uuid()).max(30).optional(),
});

export type SubmitContributionInput = z.infer<typeof submitContributionSchema>;
