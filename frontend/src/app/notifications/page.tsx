"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, CheckCheck } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { PillTabs } from "@/components/common/PillTabs";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/apiClient";
import { notificationApi } from "@/services/notificationApi";
import { useNotificationStore, type AppNotification } from "@/stores/notificationStore";

type Filter = "ALL" | "UNREAD";
const TABS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: "UNREAD", label: "Belum Dibaca" },
];

function fmt(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Content() {
  const router = useRouter();
  const setStore = useNotificationStore((s) => s.setNotifications);
  const markReadLocal = useNotificationStore((s) => s.markAsRead);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setItems(null);
    notificationApi
      .list({ is_read: filter === "UNREAD" ? false : undefined, page, limit: 20 })
      .then((r) => {
        setItems(r.data);
        setLastPage(r.meta.lastPage);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Gagal memuat notifikasi"));
  }, [filter, page]);
  useEffect(load, [load]);

  const open = (n: AppNotification) => {
    if (!n.isRead) {
      markReadLocal(n.id);
      notificationApi.markRead(n.id).catch(() => {});
    }
    if (n.actionUrl) router.push(n.actionUrl);
  };

  const markAll = async () => {
    try {
      await notificationApi.markAllRead();
      const refreshed = await notificationApi.list({ limit: 20 });
      setStore(refreshed.data);
      toast.success("Semua ditandai dibaca");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal");
    }
  };

  if (error) return <EmptyState icon={Bell} heading="Gagal Memuat" message={error} />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Notifikasi"
        subtitle="Pemberitahuan aktivitas proyek, lamaran, review, dan sertifikatmu."
        action={
          <Button variant="outline" onClick={markAll}>
            <CheckCheck className="size-4" /> Tandai semua dibaca
          </Button>
        }
      />

      <PillTabs
        tabs={TABS}
        value={filter}
        onChange={(v) => {
          setPage(1);
          setFilter(v as Filter);
        }}
        ariaLabel="Filter notifikasi"
      />

      {items === null ? (
        <ListSkeleton rows={5} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          heading="Belum Ada Notifikasi"
          message="Notifikasi aktivitas akan muncul di sini."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => open(n)}
              className={cn(
                "flex items-start gap-3 rounded-[16px] border border-border bg-card p-4 text-left transition-colors hover:bg-muted/50",
                !n.isRead && "border-[#cfe89a] bg-[#f6fbe8]"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl",
                  n.isRead ? "bg-muted text-muted-foreground" : "bg-[#eef7d6] text-[#5f8c00]"
                )}
              >
                <Bell className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="size-2 shrink-0 rounded-full bg-[#5f8c00]" />}
                  <p className="truncate font-semibold text-foreground">{n.title}</p>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground tabular-nums">{fmt(n.createdAt)}</p>
              </div>
            </button>
          ))}

          {lastPage > 1 && (
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground">Hal {page} / {lastPage}</span>
              <Button variant="outline" size="sm" disabled={page >= lastPage} onClick={() => setPage((p) => p + 1)}>
                Berikutnya
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <Content />
      </AppShell>
    </AuthGuard>
  );
}
