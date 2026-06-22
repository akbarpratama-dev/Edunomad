import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";
import { AuditAction, EntityType } from "../constants/auditActions";

export const skillRepository = {
  // Admin: custom skills awaiting approval (is_system=false, status PENDING).
  async findPendingPaginated(page: number, limit: number) {
    const where: Prisma.SkillWhereInput = { status: "PENDING" };
    const [data, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.skill.count({ where }),
    ]);
    return { data, total };
  },

  // Approve/reject a custom skill + audit log, in one transaction.
  setStatusWithAudit(skillId: string, status: "APPROVED" | "REJECTED", adminId: string, reason?: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.skill.update({ where: { id: skillId }, data: { status } });
      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: status === "APPROVED" ? AuditAction.SKILL_APPROVED : AuditAction.SKILL_REJECTED,
          entityType: EntityType.SKILL,
          entityId: skillId,
          ...(reason ? { metadata: { reason } } : {}),
        },
      });
      return updated;
    });
  },
  // Master skills list with optional filters + pagination.
  async findManyPaginated(
    where: Prisma.SkillWhereInput,
    page: number,
    limit: number
  ) {
    const [data, total] = await Promise.all([
      prisma.skill.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.skill.count({ where }),
    ]);
    return { data, total };
  },

  findSkillById(id: string) {
    return prisma.skill.findUnique({ where: { id } });
  },

  findManyByIds(ids: string[]) {
    return prisma.skill.findMany({ where: { id: { in: ids } } });
  },

  // --- user_skills ---
  findUserSkillById(id: string) {
    return prisma.userSkill.findUnique({ where: { id } });
  },

  findUserSkill(userId: string, skillId: string) {
    return prisma.userSkill.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });
  },

  listUserSkills(userId: string) {
    return prisma.userSkill.findMany({
      where: { userId },
      include: { skill: true },
      orderBy: { createdAt: "asc" },
    });
  },

  createUserSkill(data: Prisma.UserSkillUncheckedCreateInput) {
    return prisma.userSkill.create({ data, include: { skill: true } });
  },

  updateUserSkill(id: string, data: Prisma.UserSkillUpdateInput) {
    return prisma.userSkill.update({ where: { id }, data, include: { skill: true } });
  },

  deleteUserSkill(id: string) {
    return prisma.userSkill.delete({ where: { id } });
  },
};
