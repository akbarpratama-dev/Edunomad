"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ListSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ProjectDetailView } from "@/components/project/ProjectDetailView";
import { cn } from "@/lib/utils";
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
    <AppShell breadcrumbs={[{ label: "Admin" }, { label: "Tinjau Proyek" }]}>
      <div className="flex flex-col gap-4">
        <h1 className="text-h1 text-neutral-dark">Tinjau Proyek</h1>

        <div className="flex gap-2 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-4 py-2 text-body font-medium",
                tab === t.key
                  ? "border-b-2 border-primary text-primary"
                  : "text-neutral-gray hover:text-neutral-dark"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

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
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex flex-col gap-2 pt-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-body font-semibold text-neutral-dark">{item.title}</p>
                      <p className="text-body-sm text-neutral-gray">
                        {item.umkm.name} · {item.category.name}
                      </p>
                    </div>
                    <span className="shrink-0 text-body-sm text-neutral-gray">
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
                </CardContent>
              </Card>
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
