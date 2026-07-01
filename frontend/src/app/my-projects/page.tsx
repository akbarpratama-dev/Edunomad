"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FolderKanban, Plus, MessageSquare } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { PillTabs } from "@/components/common/PillTabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { BeginnerProjectBoard } from "@/components/project/BeginnerProjectBoard";
import { useAuthStore } from "@/stores/authStore";
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
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Proyek Saya"
          subtitle="Kelola proyek yang kamu publikasikan dan rekrutmen timnya."
          action={
            <Button render={<Link href="/projects/create" />}>
              <Plus className="size-4" /> Buat Proyek
            </Button>
          }
        />

        <PillTabs tabs={TABS} value={tab} onChange={setTab} ariaLabel="Filter status proyek" />

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
            {items.map((item, i) => (
              <article
                key={item.id}
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                className="app-reveal flex flex-col gap-3 rounded-[20px] border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef7d6] text-[#5f8c00]"
                      aria-hidden="true"
                    >
                      <FolderKanban className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold tracking-tight text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.category.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Deadline {new Date(item.deadline).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {(item.status === "DRAFT" ||
                  item.status === "ACTIVE" ||
                  item.status === "AWAITING_COMPLETION") && (
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
                    {item.status === "DRAFT" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => setDeleting(item)}
                        >
                          Hapus
                        </Button>
                        <Button size="sm" disabled={busy} onClick={() => submit(item)}>
                          Kirim untuk Ditinjau
                        </Button>
                      </>
                    )}
                    {(item.status === "ACTIVE" || item.status === "AWAITING_COMPLETION") && (
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/my-projects/${item.id}/workspace?tab=discussion`} />}
                      >
                        <MessageSquare className="size-4" /> Diskusi
                      </Button>
                    )}
                  </div>
                )}
              </article>
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

// Senior "Proyek Mentoring" — the projects this senior leads, each a route into
// its workspace (and the Diskusi tab). Discussion stays per-project per docs/08;
// this only gives the senior a sidebar path to it, like Beginner/UMKM have.
function SeniorView() {
  const [tab, setTab] = useState<ProjectStatus | "ALL">("ALL");
  const [items, setItems] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    projectApi
      .mentoredProjects()
      .then((p) => active && setItems(p))
      .catch(() => active && toast.error("Gagal memuat proyek"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const visible = tab === "ALL" ? items : items.filter((p) => p.status === tab);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Proyek Mentoring"
          subtitle="Proyek yang kamu bimbing — buka workspace untuk diskusi, deliverable, dan review tim."
        />

        <PillTabs tabs={TABS} value={tab} onChange={setTab} ariaLabel="Filter status proyek" />

        {loading ? (
          <ListSkeleton rows={4} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            heading="Belum Ada Proyek Mentoring"
            message="Lamar sebagai mentor pada proyek yang membutuhkan untuk mulai membimbing tim."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((item, i) => (
              <article
                key={item.id}
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                className="app-reveal flex flex-col gap-3 rounded-[20px] border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef7d6] text-[#5f8c00]"
                      aria-hidden="true"
                    >
                      <FolderKanban className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold tracking-tight text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.category.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Deadline {new Date(item.deadline).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {(item.status === "ACTIVE" || item.status === "AWAITING_COMPLETION") && (
                  <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      render={<Link href={`/my-projects/${item.id}/workspace?tab=discussion`} />}
                    >
                      <MessageSquare className="size-4" /> Diskusi
                    </Button>
                    <Button size="sm" render={<Link href={`/my-projects/${item.id}/workspace`} />}>
                      Buka Workspace
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// Beginner "Proyek Saya" — bento dashboard for their active project (docs/08
// "My Projects - Beginner"; Figma node 262:2).
function BeginnerView() {
  return (
    <AppShell>
      <div className="flex flex-col gap-5">
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
  if (role === "SENIOR") return <SeniorView />;
  return <Content />;
}

export default function MyProjectsPage() {
  return (
    <AuthGuard allowedRoles={["UMKM", "BEGINNER", "SENIOR"]}>
      <RoleRouter />
    </AuthGuard>
  );
}
