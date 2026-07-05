import { userRepository } from "../repositories/user.repository";
import { NotFoundError } from "../utils/errors";
import type { UpdateProfileInput } from "../validators/user.validator";

export const userService = {
  // GET /users/me — core profile (user + profile row).
  async getMyProfile(userId: string) {
    const user = await userRepository.findByIdWithProfile(userId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  // PUT /users/me — partial update. `name` → users; rest → user_profiles
  // (mapping the API's snake_case linkedin_url to the camelCase column).
  async updateMyProfile(userId: string, input: UpdateProfileInput) {
    const userData: Record<string, unknown> = {};
    if (input.name !== undefined) userData.name = input.name;

    const profileData: Record<string, unknown> = {};
    if (input.phone !== undefined) profileData.phone = input.phone;
    if (input.photo !== undefined) profileData.photo = input.photo;
    if (input.headline !== undefined) profileData.headline = input.headline;
    if (input.bio !== undefined) profileData.bio = input.bio;
    if (input.linkedin_url !== undefined) profileData.linkedinUrl = input.linkedin_url;

    return userRepository.updateUserAndProfile(userId, userData, profileData);
  },

  // GET /users/:id — another user's profile (auth required, enforced at route).
  async getUserProfile(targetUserId: string) {
    const user = await userRepository.findByIdWithProfile(targetUserId);
    if (!user) throw new NotFoundError("User not found");
    return user;
  },

  // GET /users/:id/portfolio — docs/06 Portfolio Includes: experiences, skills,
  // portfolio links. Visible to authenticated users only (enforced at route).
  async getUserPortfolio(targetUserId: string) {
    const user = await userRepository.findByIdWithRelations(targetUserId);
    if (!user) throw new NotFoundError("User not found");
    return {
      userId: user.id,
      name: user.name,
      skills: user.userSkills,
      experiences: user.experiences,
      portfolioLinks: user.portfolioLinks,
    };
  },

  // GET /users/:id/profile-overview — composite payload for the profile page
  // (Phase 10): core identity + profile + skills + experiences + links, plus the
  // stat cards, the verified-certificate grid (Portofolio tab) and role-aware
  // project list. Reviews stay on the dedicated /users/:id/reviews endpoint.
  async getProfileOverview(targetUserId: string) {
    const user = await userRepository.findByIdWithRelations(targetUserId);
    if (!user) throw new NotFoundError("User not found");

    const [artifacts, completedProjects, reviewAgg, projects] = await Promise.all([
      userRepository.listVerifiedArtifacts(targetUserId),
      userRepository.countCompletedProjects(targetUserId, user.role),
      userRepository.reviewAggregate(targetUserId),
      userRepository.listProfileProjects(targetUserId, user.role),
    ]);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
      },
      profile: user.profile,
      skills: user.userSkills,
      experiences: user.experiences,
      portfolioLinks: user.portfolioLinks,
      stats: {
        verifiedArtifacts: artifacts.length,
        completedProjects,
        avgRating: reviewAgg._avg.rating,
        reviewCount: reviewAgg._count,
      },
      artifacts,
      projects,
    };
  },
};
