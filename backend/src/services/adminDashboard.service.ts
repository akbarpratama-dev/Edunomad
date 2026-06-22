import { adminStatsRepository } from "../repositories/adminStats.repository";
import { auditLogRepository } from "../repositories/auditLog.repository";

// Turns Prisma groupBy rows into a { KEY: count } map.
function toMap(rows: { status: string; _count: { _all: number } }[]) {
  return rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = r._count._all;
    return acc;
  }, {});
}

export const adminDashboardService = {
  // GET /admin/dashboard — aggregate platform stats (task 2.3.1).
  async getStats() {
    const [userRows, projectRows, artifacts, recent] = await Promise.all([
      adminStatsRepository.userCountsByStatus(),
      adminStatsRepository.projectCountsByStatus(),
      adminStatsRepository.artifactCount(),
      auditLogRepository.findRecent(10),
    ]);

    const usersByStatus = toMap(userRows);
    const projectsByStatus = toMap(projectRows);

    return {
      users: {
        byStatus: usersByStatus,
        total: Object.values(usersByStatus).reduce((a, b) => a + b, 0),
      },
      projects: {
        byStatus: projectsByStatus,
        total: Object.values(projectsByStatus).reduce((a, b) => a + b, 0),
      },
      artifacts,
      recentActivities: recent,
    };
  },
};
