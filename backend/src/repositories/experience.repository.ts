import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";

export const experienceRepository = {
  listByUser(userId: string) {
    return prisma.experience.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
    });
  },

  findById(id: string) {
    return prisma.experience.findUnique({ where: { id } });
  },

  create(data: Prisma.ExperienceUncheckedCreateInput) {
    return prisma.experience.create({ data });
  },

  update(id: string, data: Prisma.ExperienceUpdateInput) {
    return prisma.experience.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.experience.delete({ where: { id } });
  },
};
