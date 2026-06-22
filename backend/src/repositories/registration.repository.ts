import { prisma } from "../config/database";

interface RegistrationData {
  id: string;
  email: string;
  name: string;
  role: string;
  profile: {
    bio?: string;
    headline?: string;
    phone?: string;
    linkedinUrl?: string;
    photo?: string;
  };
  skills: { skillId: string; level: string }[];
  experiences: {
    title: string;
    organization: string;
    description?: string | null;
    startDate: Date;
    endDate?: Date | null;
  }[];
  portfolioLinks: { title: string; url: string; type: string }[];
}

export const registrationRepository = {
  // Creates the full account graph in one transaction: users + user_profiles
  // + user_skills + experiences + portfolio_links + verification_requests
  // (status PENDING). users.id mirrors auth.users.id.
  createRegistration(data: RegistrationData) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          status: "PENDING_VERIFICATION",
        },
      });

      const hasProfile = Object.values(data.profile).some((v) => v !== undefined);
      if (hasProfile) {
        await tx.userProfile.create({
          data: {
            userId: user.id,
            bio: data.profile.bio ?? null,
            headline: data.profile.headline ?? null,
            phone: data.profile.phone ?? null,
            linkedinUrl: data.profile.linkedinUrl ?? null,
            photo: data.profile.photo ?? null,
          },
        });
      }

      if (data.skills.length > 0) {
        await tx.userSkill.createMany({
          data: data.skills.map((s) => ({
            userId: user.id,
            skillId: s.skillId,
            level: s.level,
          })),
          skipDuplicates: true,
        });
      }

      if (data.experiences.length > 0) {
        await tx.experience.createMany({
          data: data.experiences.map((e) => ({
            userId: user.id,
            title: e.title,
            organization: e.organization,
            description: e.description ?? null,
            startDate: e.startDate,
            endDate: e.endDate ?? null,
          })),
        });
      }

      if (data.portfolioLinks.length > 0) {
        await tx.portfolioLink.createMany({
          data: data.portfolioLinks.map((l) => ({
            userId: user.id,
            title: l.title,
            url: l.url,
            type: l.type,
          })),
        });
      }

      await tx.verificationRequest.create({
        data: { userId: user.id, status: "PENDING" },
      });

      return tx.user.findUnique({ where: { id: user.id }, include: { profile: true } });
    });
  },
};
