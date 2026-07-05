import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";
import { MemberStatus } from "../constants/applicationStatus";
import { ProjectStatus } from "../constants/projectStatus";

// Lightweight project shape reused across the profile Proyek tab / cards.
const profileProjectSelect = {
  id: true,
  title: true,
  status: true,
  imageUrl: true,
  category: { select: { id: true, name: true } },
} satisfies Prisma.ProjectSelect;

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

  // VERIFIED seniors — candidate pool for admin senior replacement (Workflow 16).
  // Capacity (<5 active) is checked per-candidate in the service.
  listVerifiedSeniors() {
    return prisma.user.findMany({
      where: { role: "SENIOR", status: "VERIFIED" },
      select: { id: true, name: true, email: true, profile: { select: { headline: true } } },
      orderBy: { name: "asc" },
    });
  },

  // --- Profile overview aggregates (Phase 10) ---

  // Verified certificates earned as a beginner — an Artifact row only exists once
  // a certificate has been generated (post-verification), so its presence IS the
  // "verified" state. Powers the Sertifikat/Portofolio tab + the stat card.
  listVerifiedArtifacts(userId: string) {
    return prisma.artifact.findMany({
      where: { beginnerId: userId },
      select: {
        id: true,
        artifactCode: true,
        verificationUrl: true,
        currentVersion: true,
        issuedAt: true,
        project: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });
  },

  // Average rating + count of reviews received (revieweeId), for the stat card.
  reviewAggregate(userId: string) {
    return prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: true,
    });
  },

  // Count of COMPLETED projects the user was part of — role-aware (member for
  // Beginner, lead for Senior, owner for UMKM). Admin has none.
  countCompletedProjects(userId: string, role: string) {
    if (role === "SENIOR") {
      return prisma.project.count({
        where: { seniorId: userId, status: ProjectStatus.COMPLETED, deletedAt: null },
      });
    }
    if (role === "UMKM") {
      return prisma.project.count({
        where: { umkmId: userId, status: ProjectStatus.COMPLETED, deletedAt: null },
      });
    }
    if (role === "BEGINNER") {
      return prisma.projectMember.count({
        where: {
          userId,
          status: { not: MemberStatus.WITHDRAWN },
          project: { status: ProjectStatus.COMPLETED, deletedAt: null },
        },
      });
    }
    return Promise.resolve(0);
  },

  // Count of ongoing (ACTIVE / AWAITING_COMPLETION) projects — role-aware.
  countCurrentProjects(userId: string, role: string) {
    const live = { in: [ProjectStatus.ACTIVE, ProjectStatus.AWAITING_COMPLETION] };
    if (role === "SENIOR") {
      return prisma.project.count({ where: { seniorId: userId, status: live, deletedAt: null } });
    }
    if (role === "UMKM") {
      return prisma.project.count({ where: { umkmId: userId, status: live, deletedAt: null } });
    }
    if (role === "BEGINNER") {
      return prisma.projectMember.count({
        where: {
          userId,
          status: { not: MemberStatus.WITHDRAWN },
          project: { status: live, deletedAt: null },
        },
      });
    }
    return Promise.resolve(0);
  },

  // Projects for the profile Proyek tab — role-aware. Beginner sees memberships
  // (with their role name); Senior sees mentored; UMKM sees owned.
  listProfileProjects(userId: string, role: string) {
    if (role === "BEGINNER") {
      return prisma.projectMember.findMany({
        where: { userId, status: { not: MemberStatus.WITHDRAWN } },
        select: {
          status: true,
          projectRole: { select: { roleName: true } },
          project: { select: profileProjectSelect },
        },
        orderBy: { joinedAt: "desc" },
      });
    }
    if (role === "SENIOR") {
      return prisma.project.findMany({
        where: { seniorId: userId, deletedAt: null },
        select: profileProjectSelect,
        orderBy: { createdAt: "desc" },
      });
    }
    if (role === "UMKM") {
      return prisma.project.findMany({
        where: { umkmId: userId, deletedAt: null },
        select: profileProjectSelect,
        orderBy: { createdAt: "desc" },
      });
    }
    return Promise.resolve([]);
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
