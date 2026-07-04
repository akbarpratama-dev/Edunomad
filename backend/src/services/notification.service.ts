import { notificationRepository } from "../repositories/notification.repository";
import type { NotificationTypeValue } from "../constants/notificationType";

export const notificationService = {
  // Fire-and-forget creation used by trigger sites in other services. Never
  // throws — a notification failure must not roll back the action it follows.
  async notify(args: {
    userId: string;
    type: NotificationTypeValue;
    title: string;
    message: string;
    actionUrl?: string | null;
  }): Promise<void> {
    try {
      await notificationRepository.create({
        userId: args.userId,
        type: args.type,
        title: args.title,
        message: args.message,
        actionUrl: args.actionUrl ?? null,
      });
    } catch {
      // swallow — best effort
    }
  },

  // GET /notifications
  async list(userId: string, isRead: boolean | undefined, page: number, limit: number) {
    const [{ data, total }, unreadCount] = await Promise.all([
      notificationRepository.findManyByUser(userId, isRead, page, limit),
      notificationRepository.countUnread(userId),
    ]);
    return { data, total, unreadCount };
  },

  async markAsRead(userId: string, id: string) {
    await notificationRepository.markRead(id, userId);
    return notificationRepository.countUnread(userId);
  },

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllRead(userId);
    return 0;
  },
};
