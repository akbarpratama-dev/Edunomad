import { prisma } from "../config/database";

export const adminStatsRepository = {
  userCountsByStatus() {
    return prisma.user.groupBy({ by: ["status"], _count: { _all: true } });
  },

  projectCountsByStatus() {
    return prisma.project.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: { deletedAt: null },
    });
  },

  artifactCount() {
    return prisma.artifact.count();
  },
};
