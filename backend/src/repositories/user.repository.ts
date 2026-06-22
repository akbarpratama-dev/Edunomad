import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";

// Data access only — no business logic (ARCH Repository Responsibilities).
export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  // User + profile, for GET /users/me and GET /users/:id.
  findByIdWithProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  },

  // Full profile graph (profile + skills + experiences + portfolio links).
  findByIdWithRelations(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        userSkills: { include: { skill: true } },
        experiences: true,
        portfolioLinks: true,
      },
    });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  },

  // Atomically update the users row (name) and upsert the 1:1 user_profiles row
  // (phone/photo/headline/bio/linkedin). Either side may be empty. Returns the
  // refreshed user + profile.
  updateUserAndProfile(
    userId: string,
    userData: Prisma.UserUpdateInput,
    profileData: Prisma.UserProfileCreateWithoutUserInput
  ) {
    return prisma.$transaction(async (tx) => {
      if (Object.keys(userData).length > 0) {
        await tx.user.update({ where: { id: userId }, data: userData });
      }
      if (Object.keys(profileData).length > 0) {
        await tx.userProfile.upsert({
          where: { userId },
          update: profileData,
          create: { ...profileData, user: { connect: { id: userId } } },
        });
      }
      return tx.user.findUnique({ where: { id: userId }, include: { profile: true } });
    });
  },
};
