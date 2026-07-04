"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore, type AppNotification } from "@/stores/notificationStore";
import { notificationApi } from "@/services/notificationApi";

// Bootstraps the notification list once the app user is known and keeps the
// unread badge live via Supabase Realtime (INSERT on the user's own rows). New
// notifications are written by the Express backend; clients only read (RLS
// SELECT-only), so a fresh row means a real event → prepend + toast.
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const userId = useAuthStore((s) => s.appUser?.id);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const clear = useNotificationStore((s) => s.clear);

  useEffect(() => {
    if (!userId) {
      clear();
      return;
    }
    let active = true;

    notificationApi
      .list({ limit: 20 })
      .then((r) => active && setNotifications(r.data))
      .catch(() => {});

    let cleanup = () => {};
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) supabase.realtime.setAuth(token);
      const channel = supabase
        .channel(`notif-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (!active) return;
            const n = payload.new as {
              id: string;
              type: string;
              title: string;
              message: string;
              action_url: string | null;
              is_read: boolean;
              created_at: string;
            };
            const notif: AppNotification = {
              id: n.id,
              type: n.type,
              title: n.title,
              message: n.message,
              actionUrl: n.action_url,
              isRead: n.is_read,
              createdAt: n.created_at,
            };
            addNotification(notif);
            toast(n.title, { description: n.message });
          }
        )
        .subscribe();
      cleanup = () => supabase.removeChannel(channel);
    })();

    return () => {
      active = false;
      cleanup();
    };
  }, [userId, setNotifications, addNotification, clear]);

  return <>{children}</>;
}
