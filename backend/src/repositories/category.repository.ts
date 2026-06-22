import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";

export const categoryRepository = {
  async findManyPaginated(page: number, limit: number) {
    const [data, total] = await Promise.all([
      prisma.projectCategory.findMany({
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.projectCategory.count(),
    ]);
    return { data, total };
  },

  findAll() {
    return prisma.projectCategory.findMany({ orderBy: { name: "asc" } });
  },

  findById(id: string) {
    return prisma.projectCategory.findUnique({ where: { id } });
  },

  countProjects(categoryId: string) {
    return prisma.project.count({ where: { categoryId } });
  },

  create(data: Prisma.ProjectCategoryCreateInput) {
    return prisma.projectCategory.create({ data });
  },

  update(id: string, data: Prisma.ProjectCategoryUpdateInput) {
    return prisma.projectCategory.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.projectCategory.delete({ where: { id } });
  },
};
