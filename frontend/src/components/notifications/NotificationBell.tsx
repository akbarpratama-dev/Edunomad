"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/stores/notificationStore";
import { notificationApi } from "@/services/notificationApi";

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hr lalu`;
}

export function NotificationBell() {
  const router = useRouter();
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAsReadLocal = useNotificationStore((s) => s.markAsRead);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const recent = notifications.slice(0, 8);

  const open = async (id: string, actionUrl?: string | null) => {
    markAsReadLocal(id);
    notificationApi.markRead(id).catch(() => {});
    if (actionUrl) router.push(actionUrl);
  };

  const markAll = async () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    notificationApi.markAllRead().catch(() => {});
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Notifikasi"
        className="relative grid size-9 cursor-pointer place-items-center rounded-md text-foreground transition-colors hover:bg-muted"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[10px]">
            {unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="text-sm font-semibold">Notifikasi</span>
          {unreadCount > 0 && (
            <button onClick={markAll} className="inline-flex items-center gap-1 text-xs font-medium text-[#5f8c00] hover:underline">
              <CheckCheck className="size-3.5" /> Tandai semua dibaca
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">Belum ada notifikasi.</p>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {recent.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => open(n.id, n.actionUrl)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 border-b border-border px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
                    !n.isRead && "bg-[#eef7d6]/40"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {!n.isRead && <span className="size-2 shrink-0 rounded-full bg-[#5f8c00]" />}
                    <span className="truncate text-sm font-semibold">{n.title}</span>
                  </div>
                  <span className="line-clamp-2 text-xs text-muted-foreground">{n.message}</span>
                  <span className="text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/notifications"
          className="block border-t border-border px-3 py-2.5 text-center text-sm font-medium text-[#5f8c00] hover:bg-muted/60"
        >
          Lihat semua
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
