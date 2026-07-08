"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "@/stores/notificationStore";

// Header notification bell — links straight to the /notifications page (no
// dropdown). Just the icon + unread-count badge.
export function NotificationBell() {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <Link
      href="/notifications"
      aria-label="Notifikasi"
      className="relative grid size-9 place-items-center rounded-md text-foreground transition-colors hover:bg-muted"
    >
      <Bell className="size-5" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[10px]">
          {unreadCount}
        </Badge>
      )}
    </Link>
  );
}
