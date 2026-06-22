import { prisma } from "../config/database";

interface RoleData {
  roleName: string;
  capacity: number;
  requirements?: string | null;
  skillIds: string[];
}

export const projectRoleRepository = {
  listByProject(projectId: string) {
    return prisma.projectRole.findMany({
      where: { projectId },
      include: { roleSkills: { include: { skill: true } } },
      orderBy: { createdAt: "asc" },
    });
  },

  findById(id: string) {
    return prisma.projectRole.findUnique({ where: { id } });
  },

  // Create role + its role_skills in one transaction.
  createWithSkills(projectId: string, data: RoleData) {
    return prisma.$transaction(async (tx) => {
      const role = await tx.projectRole.create({
        data: {
          projectId,
          roleName: data.roleName,
          capacity: data.capacity,
          requirements: data.requirements ?? null,
        },
      });
      if (data.skillIds.length > 0) {
        await tx.roleSkill.createMany({
          data: data.skillIds.map((skillId) => ({ projectRoleId: role.id, skillId })),
          skipDuplicates: true,
        });
      }
      return tx.projectRole.findUnique({
        where: { id: role.id },
        include: { roleSkills: { include: { skill: true } } },
      });
    });
  },

  // Update role + replace its role_skills.
  updateWithSkills(roleId: string, data: RoleData) {
    return prisma.$transaction(async (tx) => {
      await tx.projectRole.update({
        where: { id: roleId },
        data: {
          roleName: data.roleName,
          capacity: data.capacity,
          requirements: data.requirements ?? null,
        },
      });
      await tx.roleSkill.deleteMany({ where: { projectRoleId: roleId } });
      if (data.skillIds.length > 0) {
        await tx.roleSkill.createMany({
          data: data.skillIds.map((skillId) => ({ projectRoleId: roleId, skillId })),
          skipDuplicates: true,
        });
      }
      return tx.projectRole.findUnique({
        where: { id: roleId },
        include: { roleSkills: { include: { skill: true } } },
      });
    });
  },

  delete(id: string) {
    return prisma.projectRole.delete({ where: { id } });
  },
};
