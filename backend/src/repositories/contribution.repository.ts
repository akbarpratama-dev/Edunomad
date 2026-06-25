import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";
import { ContributionStatus } from "../constants/deliverableStatus";
import { AuditAction, EntityType } from "../constants/auditActions";

const detailInclude = {
  beginner: { select: { id: true, name: true, email: true } },
  contributionSkills: { include: { skill: { select: { id: true, name: true } } } },
  project: { select: { id: true, title: true, seniorId: true, umkmId: true, status: true } },
} satisfies Prisma.ContributionReportInclude;

export const contributionRepository = {
  // BR: one report per beginner per project.
  findByBeginnerAndProject(projectId: string, beginnerId: string) {
    return prisma.contributionReport.findFirst({ where: { projectId, beginnerId } });
  },

  listByProject(projectId: string) {
    return prisma.contributionReport.findMany({
      where: { projectId },
      include: {
        beginner: { select: { id: true, name: true, email: true } },
        contributionSkills: { include: { skill: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.contributionReport.findUnique({ where: { id }, include: detailInclude });
  },

  create(args: {
    projectId: string;
    beginnerId: string;
    contributionSummary: string;
    skillIds: string[];
  }) {
    return prisma.contributionReport.create({
      data: {
        projectId: args.projectId,
        beginnerId: args.beginnerId,
        contributionSummary: args.contributionSummary,
        status: ContributionStatus.PENDING,
        contributionSkills: {
          create: args.skillIds.map((skillId) => ({ skillId })),
        },
      },
      include: detailInclude,
    });
  },

  // Update summary and/or replace the skill set (only when skillIds provided).
  update(id: string, args: { contributionSummary?: string; skillIds?: string[] }) {
    return prisma.$transaction(async (tx) => {
      if (args.contributionSummary !== undefined) {
        await tx.contributionReport.update({
          where: { id },
          data: { contributionSummary: args.contributionSummary },
        });
      }
      if (args.skillIds !== undefined) {
        await tx.contributionSkill.deleteMany({ where: { contributionReportId: id } });
        if (args.skillIds.length > 0) {
          await tx.contributionSkill.createMany({
            data: args.skillIds.map((skillId) => ({ contributionReportId: id, skillId })),
            skipDuplicates: true,
          });
        }
      }
      return tx.contributionReport.findUnique({ where: { id }, include: detailInclude });
    });
  },

  approve(id: string, seniorId: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.contributionReport.update({
        where: { id },
        data: { status: ContributionStatus.APPROVED, reviewedBy: seniorId },
        include: detailInclude,
      });
      await tx.auditLog.create({
        data: {
          userId: seniorId,
          action: AuditAction.CONTRIBUTION_APPROVED,
          entityType: EntityType.CONTRIBUTION_REPORT,
          entityId: id,
        },
      });
      return updated;
    });
  },
};
