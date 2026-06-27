"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Inbox, FolderKanban } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/common/PageHeader";
import { PillTabs } from "@/components/common/PillTabs";
import { ListSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ProjectDetailView } from "@/components/project/ProjectDetailView";
import { ApiError } from "@/lib/apiClient";
import {
  projectApi,
  type ProjectListItem,
  type ProjectDetail,
} from "@/services/projectApi";

type TabKey = "PENDING" | "APPROVED" | "REJECTED";
const TABS: { key: TabKey; label: string }[] = [
  { key: "PENDING", label: "Menunggu" },
  { key: "APPROVED", label: "Disetujui" },
  { key: "REJECTED", label: "Ditolak" },
];

function Content() {
  const [tab, setTab] = useState<TabKey>("PENDING");
  const [items, setItems] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejecting, setRejecting] = useState<ProjectListItem | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const req =
      tab === "PENDING"
        ? projectApi.pending(1, 100)
        : tab === "APPROVED"
          ? projectApi.list({ status: "RECRUITING", limit: 100 })
          : Promise.resolve({ data: [], meta: { page: 1, limit: 0, total: 0, lastPage: 1 } });
    req
      .then((r) => setItems(r.data))
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [tab]);
  useEffect(load, [load]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      setDetail(await projectApi.detail(id));
    } catch {
      toast.error("Gagal memuat detail proyek");
    } finally {
      setDetailLoading(false);
    }
  };

  const approve = async (item: ProjectListItem) => {
    setBusy(true);
    try {
      await projectApi.approve(item.id);
      toast.success(`Proyek "${item.title}" disetujui`);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyetujui");
    } finally {
      setBusy(false);
    }
  };

  const submitReject = async () => {
    if (!rejecting || !reason.trim()) {
      toast.error("Alasan wajib diisi");
      return;
    }
    setBusy(true);
    try {
      await projectApi.reject(rejecting.id, reason.trim());
      toast.success("Proyek ditolak");
      setRejecting(null);
      setReason("");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menolak");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Tinjau Proyek"
          subtitle="Setujui atau tolak proyek yang diajukan UMKM sebelum dibuka untuk rekrutmen."
        />

        <PillTabs tabs={TABS} value={tab} onChange={setTab} ariaLabel="Filter status proyek" />

        {tab === "REJECTED" ? (
          <EmptyState
            icon={Inbox}
            heading="Histori Penolakan"
            message="Daftar proyek yang ditolak belum tersedia pada tampilan ini."
          />
        ) : loading ? (
          <ListSkeleton rows={4} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            heading="Tidak Ada Proyek"
            message={
              tab === "PENDING"
                ? "Tidak ada proyek yang menunggu tinjauan."
                : "Belum ada proyek yang disetujui."
            }
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
                      <p className="text-sm text-muted-foreground">
                        {item.umkm.name} · {item.category.name}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openDetail(item.id)}>
                    Lihat Detail
                  </Button>
                  {tab === "PENDING" && (
                    <>
                      <Button size="sm" disabled={busy} onClick={() => approve(item)}>
                        Setujui
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => {
                          setRejecting(item);
                          setReason("");
                        }}
                      >
                        Tolak
                      </Button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={detailLoading || !!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Proyek</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <ListSkeleton rows={3} />
          ) : detail ? (
            <ProjectDetailView project={detail} />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Proyek — {rejecting?.title}</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={3}
            placeholder="Alasan penolakan"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Batal
            </Button>
            <Button variant="destructive" disabled={busy} onClick={submitReject}>
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export default function ProjectReviewPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <Content />
    </AuthGuard>
  );
}
