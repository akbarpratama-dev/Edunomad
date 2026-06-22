import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";

export const auditLogRepository = {
  // Accepts an optional transaction client so audit logs can be written inside
  // the same transaction as the action they record.
  create(data: Prisma.AuditLogUncheckedCreateInput, tx?: Prisma.TransactionClient) {
    return (tx ?? prisma).auditLog.create({ data });
  },

  async findManyPaginated(where: Prisma.AuditLogWhereInput, page: number, limit: number) {
    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { data, total };
  },

  // Recent activity feed for the admin dashboard.
  findRecent(limit: number) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { id: true, name: true, role: true } } },
    });
  },
};
