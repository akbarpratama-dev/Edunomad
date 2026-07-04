import { Request, Response, NextFunction } from "express";
import { notificationService } from "../../services/notification.service";
import { successResponse, paginatedResponse } from "../../utils/response";
import { listNotificationsQuerySchema } from "../../validators/notification.validator";

export const notificationController = {
  // GET /notifications?is_read=&page=&limit=
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const q = listNotificationsQuerySchema.parse(req.query);
      const { data, total, unreadCount } = await notificationService.list(
        req.user!.id,
        q.is_read,
        q.page,
        q.limit
      );
      res.json({
        ...paginatedResponse(data, {
          page: q.page,
          limit: q.limit,
          total,
          lastPage: Math.max(1, Math.ceil(total / q.limit)),
        }),
        unreadCount,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /notifications/:id/read
  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const unreadCount = await notificationService.markAsRead(req.user!.id, req.params.id);
      res.json(successResponse({ unreadCount }, "Notification marked read"));
    } catch (err) {
      next(err);
    }
  },

  // POST /notifications/read-all
  async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      res.json(successResponse({ unreadCount: 0 }, "All notifications marked read"));
    } catch (err) {
      next(err);
    }
  },
};
