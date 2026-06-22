import { userRepository } from "../repositories/user.repository";
import { skillRepository } from "../repositories/skill.repository";
import { registrationRepository } from "../repositories/registration.repository";
import { supabaseAdmin } from "../config/supabase";
import { BusinessRuleError, NotFoundError, ValidationError } from "../utils/errors";
import type { RegisterInput, SignupInput } from "../validators/auth.validator";

interface SyncUserParams {
  id: string; // = auth.users.id (Supabase Auth)
  email: string;
  name: string;
  role: string; // ADMIN | UMKM | SENIOR | BEGINNER
}

export const authService = {
  // POST /auth/signup — create an email-confirmed Supabase Auth user so the
  // multi-step registration wizard can immediately obtain a session (the
  // project requires email confirmation, which would block a plain client
  // signUp). Does NOT create the public.users row — that happens at
  // completion via register(). Name is stashed in user_metadata.
  async signup({ name, email, password }: SignupInput) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error || !data.user) {
      // Most common: email already registered.
      throw new BusinessRuleError(error?.message ?? "Could not create account");
    }
    return { id: data.user.id, email: data.user.email };
  },

  // GET /auth/me — current user with profile.
  async getCurrentUser(userId: string) {
    const user = await userRepository.findByIdWithProfile(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  },

  // Ensure a public.users row exists for a Supabase Auth identity. users.id
  // mirrors auth.users.id (no separate auth_user_id column, per docs/03).
  // New accounts start as PENDING_VERIFICATION (docs/06 Account Status).
  // Idempotent: returns the existing row if already synced.
  async syncUserFromSupabase({ id, email, name, role }: SyncUserParams) {
    const existing = await userRepository.findById(id);
    if (existing) {
      return existing;
    }
    return userRepository.create({
      id,
      email,
      name,
      role,
      status: "PENDING_VERIFICATION",
    });
  },

  // POST /auth/register — single-use account bootstrap. id/email come from the
  // validated Supabase token; status forced to PENDING_VERIFICATION. Creates
  // the full account graph + verification_request in one transaction.
  async register(authUser: { id: string; email: string }, input: RegisterInput) {
    const existing = await userRepository.findById(authUser.id);
    if (existing) {
      throw new BusinessRuleError("Account already registered");
    }

    // Validate referenced skills exist and are APPROVED (master list only
    // surfaces APPROVED skills, but never trust the client).
    if (input.skills.length > 0) {
      const ids = input.skills.map((s) => s.skill_id);
      const found = await skillRepository.findManyByIds(ids);
      const approved = new Set(found.filter((s) => s.status === "APPROVED").map((s) => s.id));
      const invalid = ids.filter((id) => !approved.has(id));
      if (invalid.length > 0) {
        throw new ValidationError("One or more skills are invalid or not approved", {
          skills: invalid,
        });
      }
    }

    return registrationRepository.createRegistration({
      id: authUser.id,
      email: authUser.email,
      name: input.name,
      role: input.role,
      profile: {
        bio: input.profile.bio,
        headline: input.profile.headline,
        phone: input.profile.phone,
        linkedinUrl: input.profile.linkedin_url,
        photo: input.profile.photo,
      },
      skills: input.skills.map((s) => ({ skillId: s.skill_id, level: s.level })),
      experiences: input.experiences.map((e) => ({
        title: e.title,
        organization: e.organization,
        description: e.description ?? null,
        startDate: e.start_date,
        endDate: e.end_date ?? null,
      })),
      portfolioLinks: input.portfolio_links,
    });
  },
};
