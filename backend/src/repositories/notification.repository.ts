import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";

export const notificationRepository = {
  create(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({ data });
  },

  async findManyByUser(
    userId: string,
    isRead: boolean | undefined,
    page: number,
    limit: number
  ) {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(isRead === undefined ? {} : { isRead }),
    };
    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);
    return { data, total };
  },

  countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  },

  // Ownership enforced via the where clause (only the owner's row updates).
  markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId, isRead: false },
      data: { isRead: true },
    });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },
};
