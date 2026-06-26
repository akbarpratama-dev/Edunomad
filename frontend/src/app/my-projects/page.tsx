"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FolderKanban, Plus } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { BeginnerProjectBoard } from "@/components/project/BeginnerProjectBoard";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/apiClient";
import {
  projectApi,
  PROJECT_STATUS_META,
  type ProjectListItem,
  type ProjectStatus,
} from "@/services/projectApi";

const TABS: { key: ProjectStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: "DRAFT", label: "Draf" },
  { key: "PENDING_REVIEW", label: "Menunggu Tinjauan" },
  { key: "RECRUITING", label: "Rekrutmen" },
  { key: "ACTIVE", label: "Aktif" },
  { key: "COMPLETED", label: "Selesai" },
  { key: "REJECTED", label: "Ditolak" },
];

function StatusBadge({ status }: { status: ProjectStatus }) {
  const meta = PROJECT_STATUS_META[status];
  return (
    <Badge variant={meta.variant} className={meta.className}>
      {meta.label}
    </Badge>
  );
}

function Content() {
  const [tab, setTab] = useState<ProjectStatus | "ALL">("ALL");
  const [items, setItems] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<ProjectListItem | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    projectApi
      .myProjects({ status: tab === "ALL" ? undefined : tab, limit: 100 })
      .then((r) => setItems(r.data))
      .catch(() => toast.error("Gagal memuat proyek"))
      .finally(() => setLoading(false));
  }, [tab]);
  useEffect(load, [load]);

  const submit = async (item: ProjectListItem) => {
    setBusy(true);
    try {
      await projectApi.submit(item.id);
      toast.success("Proyek dikirim untuk ditinjau");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengirim proyek");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await projectApi.remove(deleting.id);
      toast.success("Proyek dihapus");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menghapus proyek");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell breadcrumbs={[{ label: "Proyek Saya" }]}>
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Proyek Saya"
          subtitle="Kelola proyek yang kamu publikasikan dan rekrutmen timnya."
          action={
            <Button render={<Link href="/projects/create" />}>
              <Plus className="size-4" /> Buat Proyek
            </Button>
          }
        />

        <div className="flex gap-2 overflow-x-auto border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "whitespace-nowrap px-4 py-2 text-sm font-medium",
                tab === t.key
                  ? "border-b-2 border-[#a3ce00] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <ListSkeleton rows={4} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            heading="Belum Ada Proyek"
            message="Buat proyek pertama Anda untuk mulai berkolaborasi."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex flex-col gap-2 pt-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.category.name}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Deadline: {new Date(item.deadline).toLocaleDateString("id-ID")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" render={<Link href={`/projects/${item.id}`} />}>
                      Lihat Detail
                    </Button>
                    {item.status === "DRAFT" && (
                      <>
                        <Button size="sm" disabled={busy} onClick={() => submit(item)}>
                          Kirim untuk Ditinjau
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => setDeleting(item)}
                        >
                          Hapus
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Hapus Proyek"
        description={`Yakin ingin menghapus "${deleting?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        destructive
        onConfirm={confirmDelete}
      />
    </AppShell>
  );
}

// Beginner "Proyek Saya" — bento dashboard for their active project (docs/08
// "My Projects - Beginner"; Figma node 262:2).
function BeginnerView() {
  return (
    <AppShell breadcrumbs={[{ label: "Proyek Saya" }]}>
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Proyek Saya"
          subtitle="Pantau progres, tugas, milestone, dan kontribusi Anda dalam proyek yang sedang berjalan."
        />
        <BeginnerProjectBoard />
      </div>
    </AppShell>
  );
}

function RoleRouter() {
  const role = useAuthStore((s) => s.appUser?.role);
  if (role === "BEGINNER") return <BeginnerView />;
  return <Content />;
}

export default function MyProjectsPage() {
  return (
    <AuthGuard allowedRoles={["UMKM", "BEGINNER"]}>
      <RoleRouter />
    </AuthGuard>
  );
}
