import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";
import { AuditAction, EntityType } from "../constants/auditActions";
import { ProjectStatus } from "../constants/projectStatus";
import { MemberStatus } from "../constants/applicationStatus";

const detailInclude = {
  umkm: { select: { id: true, name: true, email: true } },
  senior: { select: { id: true, name: true, email: true } },
  category: true,
  milestones: { orderBy: { dueDate: "asc" } },
  projectRoles: { include: { roleSkills: { include: { skill: true } } } },
} satisfies Prisma.ProjectInclude;

const listInclude = {
  umkm: { select: { id: true, name: true } },
  category: true,
} satisfies Prisma.ProjectInclude;

// Richer payload for the public "Telusuri Proyek" cards (mentor, role slots, tech).
const browseInclude = {
  umkm: { select: { id: true, name: true } },
  category: true,
  senior: { select: { id: true, name: true } },
  projectRoles: {
    select: {
      id: true,
      roleName: true,
      capacity: true,
      roleSkills: { select: { skill: { select: { id: true, name: true } } } },
    },
  },
} satisfies Prisma.ProjectInclude;

export const projectRepository = {
  findById(id: string) {
    // Soft-deleted projects are treated as non-existent.
    return prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: detailInclude,
    });
  },

  // Bare row (for ownership/status checks without the relation graph).
  findRawById(id: string) {
    return prisma.project.findFirst({ where: { id, deletedAt: null } });
  },

  async findManyPaginated(where: Prisma.ProjectWhereInput, page: number, limit: number) {
    const fullWhere: Prisma.ProjectWhereInput = { ...where, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where: fullWhere,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: listInclude,
      }),
      prisma.project.count({ where: fullWhere }),
    ]);
    return { data, total };
  },

  // Public browse — same filtering as findManyPaginated but with the richer
  // card payload (mentor + role slots + technologies).
  async findManyPaginatedBrowse(where: Prisma.ProjectWhereInput, page: number, limit: number) {
    const fullWhere: Prisma.ProjectWhereInput = { ...where, deletedAt: null };
    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where: fullWhere,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: browseInclude,
      }),
      prisma.project.count({ where: fullWhere }),
    ]);
    return { data, total };
  },

  countActiveByUmkm(umkmId: string) {
    return prisma.project.count({
      where: { umkmId, status: ProjectStatus.ACTIVE, deletedAt: null },
    });
  },

  // BR-002 (PRD): a senior may handle max 5 projects that are RECRUITING +
  // ACTIVE at once. Counts projects where this senior is the assigned mentor.
  countAssignedActiveBySenior(seniorId: string) {
    return prisma.project.count({
      where: {
        seniorId,
        status: { in: [ProjectStatus.RECRUITING, ProjectStatus.ACTIVE] },
        deletedAt: null,
      },
    });
  },

  // RBAC senior constraint at activation: count this senior's already-ACTIVE
  // projects (ACTIVE only, unlike countAssignedActiveBySenior which is BR-002).
  countActiveAssignedBySenior(seniorId: string) {
    return prisma.project.count({
      where: { seniorId, status: ProjectStatus.ACTIVE, deletedAt: null },
    });
  },

  setSenior(projectId: string, seniorId: string) {
    return prisma.project.update({ where: { id: projectId }, data: { seniorId } });
  },

  // Workflow 15: UMKM confirms completion. Project → COMPLETED (read-only) with
  // completedAt set, every still-ACTIVE member → COMPLETED, and a PROJECT_COMPLETED
  // audit entry — all in one transaction.
  completeWithAudit(projectId: string, umkmId: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.COMPLETED, completedAt: new Date() },
        include: detailInclude,
      });
      await tx.projectMember.updateMany({
        where: { projectId, status: MemberStatus.ACTIVE },
        data: { status: MemberStatus.COMPLETED },
      });
      await tx.auditLog.create({
        data: {
          userId: umkmId,
          action: AuditAction.PROJECT_COMPLETED,
          entityType: EntityType.PROJECT,
          entityId: projectId,
        },
      });
      return updated;
    });
  },

  create(data: Prisma.ProjectUncheckedCreateInput) {
    return prisma.project.create({ data, include: detailInclude });
  },

  update(id: string, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({ where: { id }, data, include: detailInclude });
  },

  softDelete(id: string) {
    return prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  // Admin approve/reject: status change + audit log in one transaction.
  setStatusWithAudit(
    projectId: string,
    status: string,
    adminId: string,
    action: typeof AuditAction.PROJECT_APPROVED | typeof AuditAction.PROJECT_REJECTED,
    reason?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.project.update({
        where: { id: projectId },
        data: { status },
        include: detailInclude,
      });
      await tx.auditLog.create({
        data: {
          userId: adminId,
          action,
          entityType: EntityType.PROJECT,
          entityId: projectId,
          ...(reason ? { metadata: { reason } } : {}),
        },
      });
      return updated;
    });
  },
};
