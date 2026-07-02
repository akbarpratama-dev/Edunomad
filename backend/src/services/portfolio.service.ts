import { userRepository } from "../repositories/user.repository";
import { artifactRepository } from "../repositories/artifact.repository";
import { NotFoundError } from "../utils/errors";

// Public portfolio (D-P8-5). Exposes only presentational, non-sensitive fields
// of a user plus their issued (verified) artifacts. No email, no ids beyond the
// artifact code needed for public verification.
export const portfolioService = {
  async getPublicPortfolio(userId: string) {
    const user = await userRepository.findByIdWithRelations(userId);
    if (!user) throw new NotFoundError("Portofolio tidak ditemukan");

    const artifacts = await artifactRepository.listByBeginner(userId);

    return {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        headline: user.profile?.headline ?? null,
        bio: user.profile?.bio ?? null,
        photo: user.profile?.photo ?? null,
      },
      skills: user.userSkills.map((us) => ({
        id: us.skill.id,
        name: us.skill.name,
        level: us.level,
      })),
      experiences: user.experiences.map((e) => ({
        id: e.id,
        title: e.title,
        organization: e.organization,
        description: e.description,
        startDate: e.startDate,
        endDate: e.endDate,
      })),
      portfolioLinks: user.portfolioLinks.map((l) => ({
        id: l.id,
        title: l.title,
        url: l.url,
        type: l.type,
      })),
      artifacts: artifacts.map((a) => ({
        artifactCode: a.artifactCode,
        projectTitle: a.project.title,
        umkmName: a.project.umkm?.name ?? null,
        seniorName: a.senior.name,
        issuedAt: a.issuedAt,
      })),
    };
  },
};
