import { z } from "zod";

export const reviewIdParamSchema = z.object({ id: z.string().uuid() });
export const reviewUserIdParamSchema = z.object({ id: z.string().uuid() });

const ratingSchema = z.coerce.number().int().min(1, "Rating minimal 1").max(5, "Rating maksimal 5");

// POST /projects/:id/reviews/beginner — SENIOR or UMKM reviews a beginner member.
export const reviewBeginnerSchema = z.object({
  reviewee_id: z.string().uuid(),
  rating: ratingSchema,
  comment: z.string().max(2000).optional(),
});

// POST /projects/:id/reviews/senior — UMKM reviews the project's senior.
export const reviewSeniorSchema = z.object({
  rating: ratingSchema,
  comment: z.string().max(2000).optional(),
});

// PUT /reviews/:id — reviewer edits (before project closure).
export const updateReviewSchema = z.object({
  rating: ratingSchema.optional(),
  comment: z.string().max(2000).optional(),
});

export type ReviewBeginnerInput = z.infer<typeof reviewBeginnerSchema>;
export type ReviewSeniorInput = z.infer<typeof reviewSeniorSchema>;
