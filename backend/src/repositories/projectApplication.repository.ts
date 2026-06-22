import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";
import { ApplicationStatus, MemberStatus } from "../constants/applicationStatus";

// Applicant (beginner) summary shown to the reviewing senior, incl. skills.
const beginnerSelect = {
  id: true,
  name: true,
  email: true,
  profile: { select: { headline: true, bio: true, photo: true } },
  userSkills: { select: { level: true, skill: { select: { id: true, name: true } } } },
} satisfies Prisma.UserSelect;

const roleSelect = { id: true, roleName: true } satisfies Prisma.ProjectRoleSelect;

const projectSummaryInclude = {
  category: true,
  umkm: { select: { id: true, name: true } },
} satisfies Prisma.ProjectInclude;

const detailInclude = {
  beginner: { select: beginnerSelect },
  projectRole: { select: roleSelect },
  project: { include: projectSummaryInclude },
} satisfies Prisma.ProjectApplicationInclude;

export const projectApplicationRepository = {
  findById(id: string) {
    return prisma.projectApplication.findUnique({ where: { id }, include: detailInclude });
  },

  // An in-flight application by this beginner for this project (PENDING/ACCEPTED).
  findOpenByProjectAndBeginner(projectId: string, beginnerId: string) {
    return prisma.projectApplication.findFirst({
      where: {
        projectId,
        beginnerId,
        status: { in: [ApplicationStatus.PENDING, ApplicationStatus.ACCEPTED] },
      },
    });
  },

  // SENIOR lead: every beginner application for a project (newest first).
  listByProject(projectId: string) {
    return prisma.projectApplication.findMany({
      where: { projectId },
      include: { beginner: { select: beginnerSelect }, projectRole: { select: roleSelect } },
      orderBy: { createdAt: "desc" },
    });
  },

  // BEGINNER: own applications across all projects.
  listByBeginner(beginnerId: string) {
    return prisma.projectApplication.findMany({
      where: { beginnerId },
      include: {
        project: { include: projectSummaryInclude },
        projectRole: { select: roleSelect },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  create(data: {
    projectId: string;
    projectRoleId: string;
    beginnerId: string;
    motivation: string | null;
  }) {
    return prisma.projectApplication.create({
      data: { ...data, status: ApplicationStatus.PENDING },
      include: detailInclude,
    });
  },

  updateStatus(id: string, status: string) {
    return prisma.projectApplication.update({
      where: { id },
      data: { status },
      include: detailInclude,
    });
  },

  // Accept (Workflow 4): mark ACCEPTED, create the ACTIVE project_member, and
  // BR-005 auto-withdraw this beginner's other PENDING applications — one txn.
  accept(application: {
    id: string;
    projectId: string;
    projectRoleId: string;
    beginnerId: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.projectApplication.update({
        where: { id: application.id },
        data: { status: ApplicationStatus.ACCEPTED },
        include: detailInclude,
      });
      await tx.projectMember.create({
        data: {
          projectId: application.projectId,
          userId: application.beginnerId,
          projectRoleId: application.projectRoleId,
          status: MemberStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });
      // BR-005: once accepted, all other pending applications are withdrawn.
      await tx.projectApplication.updateMany({
        where: {
          beginnerId: application.beginnerId,
          status: ApplicationStatus.PENDING,
          id: { not: application.id },
        },
        data: { status: ApplicationStatus.WITHDRAWN },
      });
      return updated;
    });
  },
};
