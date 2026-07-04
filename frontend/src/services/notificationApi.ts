import { apiClient } from "@/lib/apiClient";
import type { AppNotification } from "@/stores/notificationStore";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface NotificationsPage {
  data: AppNotification[];
  meta: { page: number; limit: number; total: number; lastPage: number };
  unreadCount: number;
}

export const notificationApi = {
  async list(params: { is_read?: boolean; page?: number; limit?: number } = {}): Promise<NotificationsPage> {
    const res = await apiClient.get<NotificationsPage>("/notifications", {
      params: {
        is_read: params.is_read,
        page: params.page,
        limit: params.limit,
      },
    });
    return res.data;
  },

  async markRead(id: string): Promise<number> {
    const res = await apiClient.post<Envelope<{ unreadCount: number }>>(`/notifications/${id}/read`);
    return res.data.data.unreadCount;
  },

  async markAllRead(): Promise<void> {
    await apiClient.post("/notifications/read-all");
  },
};
