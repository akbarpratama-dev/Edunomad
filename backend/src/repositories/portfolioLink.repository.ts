import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";

export const portfolioLinkRepository = {
  listByUser(userId: string) {
    return prisma.portfolioLink.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  },

  findById(id: string) {
    return prisma.portfolioLink.findUnique({ where: { id } });
  },

  create(data: Prisma.PortfolioLinkUncheckedCreateInput) {
    return prisma.portfolioLink.create({ data });
  },

  update(id: string, data: Prisma.PortfolioLinkUpdateInput) {
    return prisma.portfolioLink.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.portfolioLink.delete({ where: { id } });
  },
};
