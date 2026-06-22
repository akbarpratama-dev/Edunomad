import { z } from "zod";

// PUT /users/me — partial profile update (profile is built incrementally, so
// every field is optional). `name` lives on users; the rest on user_profiles.
// API spec: name, phone, photo, headline, bio, linkedin_url.
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(30).optional(),
  photo: z.string().url().max(1000).optional(),
  headline: z.string().max(255).optional(),
  bio: z.string().optional(),
  linkedin_url: z.string().url().max(1000).optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
