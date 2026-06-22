import { z } from "zod";

const SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const LINK_TYPES = ["GITHUB", "FIGMA", "BEHANCE", "LINKEDIN", "OTHER"] as const;

// POST /auth/register — full registration payload. id/email come from the
// validated Supabase token (requireSupabaseUser), NOT the body. role is limited
// to self-registerable roles (ADMIN is seed-only). status is forced to
// PENDING_VERIFICATION server-side. Role-specific UI fields are pre-composed by
// the frontend into headline/bio/experiences/portfolioLinks per the approved
// mapping (decisions.md 2026-06-20).
export const registerSchema = z.object({
  name: z.string().min(1).max(255),
  role: z.enum(["BEGINNER", "SENIOR", "UMKM"]),
  profile: z
    .object({
      bio: z.string().optional(),
      headline: z.string().max(255).optional(),
      phone: z.string().max(30).optional(),
      linkedin_url: z.string().url().max(1000).optional(),
      photo: z.string().url().max(1000).optional(),
    })
    .default({}),
  skills: z
    .array(z.object({ skill_id: z.string().uuid(), level: z.enum(SKILL_LEVELS) }))
    .default([]),
  experiences: z
    .array(
      z.object({
        title: z.string().min(1).max(255),
        organization: z.string().min(1).max(255),
        description: z.string().optional(),
        start_date: z.coerce.date(),
        end_date: z.coerce.date().nullable().optional(),
      })
    )
    .default([]),
  portfolio_links: z
    .array(
      z.object({
        title: z.string().min(1).max(255),
        url: z.string().url().max(1000),
        type: z.enum(LINK_TYPES),
      })
    )
    .default([]),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// POST /auth/signup — Step 1 account creation. The backend creates an
// email-confirmed Supabase Auth user (the project has email confirmation ON,
// which would otherwise block the multi-step wizard from getting a session).
export const signupSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(255),
  email: z.string().email(),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

export type SignupInput = z.infer<typeof signupSchema>;
