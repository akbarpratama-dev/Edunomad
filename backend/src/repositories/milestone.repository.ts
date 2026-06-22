import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";

export const milestoneRepository = {
  listByProject(projectId: string) {
    return prisma.milestone.findMany({ where: { projectId }, orderBy: { dueDate: "asc" } });
  },
  findById(id: string) {
    return prisma.milestone.findUnique({ where: { id } });
  },
  create(data: Prisma.MilestoneUncheckedCreateInput) {
    return prisma.milestone.create({ data });
  },
  update(id: string, data: Prisma.MilestoneUpdateInput) {
    return prisma.milestone.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.milestone.delete({ where: { id } });
  },
};
