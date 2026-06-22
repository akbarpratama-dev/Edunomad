import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";
import { ApplicationStatus } from "../constants/applicationStatus";

// Applicant (senior) summary shown to the reviewing UMKM.
const seniorSelect = {
  id: true,
  name: true,
  email: true,
  profile: { select: { headline: true, bio: true, photo: true, linkedinUrl: true } },
} satisfies Prisma.UserSelect;

const projectSummaryInclude = {
  category: true,
  umkm: { select: { id: true, name: true } },
} satisfies Prisma.ProjectInclude;

const detailInclude = {
  senior: { select: seniorSelect },
  project: { include: projectSummaryInclude },
} satisfies Prisma.SeniorApplicationInclude;

export const seniorApplicationRepository = {
  findById(id: string) {
    return prisma.seniorApplication.findUnique({ where: { id }, include: detailInclude });
  },

  // An in-flight application by this senior for this project (PENDING/ACCEPTED).
  findOpenByProjectAndSenior(projectId: string, seniorId: string) {
    return prisma.seniorApplication.findFirst({
      where: {
        projectId,
        seniorId,
        status: { in: [ApplicationStatus.PENDING, ApplicationStatus.ACCEPTED] },
      },
    });
  },

  // UMKM: every application for a project (newest first).
  listByProject(projectId: string) {
    return prisma.seniorApplication.findMany({
      where: { projectId },
      include: { senior: { select: seniorSelect } },
      orderBy: { createdAt: "desc" },
    });
  },

  // Senior: own applications across all projects.
  listBySenior(seniorId: string) {
    return prisma.seniorApplication.findMany({
      where: { seniorId },
      include: { project: { include: projectSummaryInclude } },
      orderBy: { createdAt: "desc" },
    });
  },

  create(data: { projectId: string; seniorId: string; message: string | null }) {
    return prisma.seniorApplication.create({
      data: { ...data, status: ApplicationStatus.PENDING },
      include: detailInclude,
    });
  },

  updateStatus(id: string, status: string) {
    return prisma.seniorApplication.update({
      where: { id },
      data: { status },
      include: detailInclude,
    });
  },

  // Accept (Workflow 3): mark ACCEPTED, assign the senior to the project, and
  // reject every other PENDING application for that project — one transaction.
  accept(applicationId: string, projectId: string, seniorId: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.seniorApplication.update({
        where: { id: applicationId },
        data: { status: ApplicationStatus.ACCEPTED },
        include: detailInclude,
      });
      await tx.project.update({ where: { id: projectId }, data: { seniorId } });
      await tx.seniorApplication.updateMany({
        where: { projectId, status: ApplicationStatus.PENDING, id: { not: applicationId } },
        data: { status: ApplicationStatus.REJECTED },
      });
      return updated;
    });
  },
};
