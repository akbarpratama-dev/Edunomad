"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FolderKanban, Search, UserCog, Users } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { PillTabs } from "@/components/common/PillTabs";
import { ListSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ProjectThumb } from "@/components/artifact/shared";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/apiClient";
import { adminApi, type AdminProjectItem, type SeniorCandidate } from "@/services/adminApi";

const STATUS_META: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draf", className: "border-border bg-muted text-muted-foreground" },
  PENDING_REVIEW: { label: "Menunggu Tinjauan", className: "border-amber-300 bg-amber-50 text-amber-700" },
  RECRUITING: { label: "Rekrutmen", className: "border-sky-300 bg-sky-50 text-sky-700" },
  REJECTED: { label: "Ditolak", className: "border-red-300 bg-red-50 text-red-700" },
  ACTIVE: { label: "Berjalan", className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  AWAITING_COMPLETION: { label: "Menunggu Selesai", className: "border-sky-300 bg-sky-50 text-sky-700" },
  COMPLETED: { label: "Selesai", className: "border-violet-300 bg-violet-50 text-violet-700" },
};

const FILTERS: { key: string; label: string }[] = [
  { key: "", label: "Semua" },
  { key: "RECRUITING", label: "Rekrutmen" },
  { key: "ACTIVE", label: "Berjalan" },
  { key: "AWAITING_COMPLETION", label: "Menunggu Selesai" },
  { key: "COMPLETED", label: "Selesai" },
];

const REPLACEABLE = ["ACTIVE", "AWAITING_COMPLETION"];

function Content() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<AdminProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [replacing, setReplacing] = useState<AdminProjectItem | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .listProjects({ status: status || undefined, q: q || undefined, limit: 100 })
      .then((r) => setItems(r.data))
      .catch(() => toast.error("Gagal memuat proyek"))
      .finally(() => setLoading(false));
  }, [status, q]);
  useEffect(load, [load]);

  // Debounce the free-text search into the query.
  useEffect(() => {
    const t = setTimeout(() => setQ(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader title="Pantau Proyek" subtitle="Awasi seluruh proyek dan kelola penggantian mentor." />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PillTabs
            tabs={FILTERS.map((f) => ({ ...f }))}
            value={status}
            onChange={setStatus}
            ariaLabel="Filter status proyek"
          />
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari proyek..."
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <ListSkeleton rows={5} />
        ) : items.length === 0 ? (
          <EmptyState icon={FolderKanban} heading="Tidak Ada Proyek" message="Tidak ada proyek yang cocok dengan filter." />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((p) => {
              const meta = STATUS_META[p.status] ?? { label: p.status, className: "" };
              return (
                <article
                  key={p.id}
                  className="flex flex-col gap-3 rounded-[20px] border border-border bg-card p-4 sm:flex-row sm:items-center"
                >
                  <ProjectThumb title={p.title} imageUrl={p.imageUrl} className="h-16 w-full shrink-0 rounded-xl sm:w-24" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold tracking-tight text-foreground">{p.title}</p>
                      <Badge variant="outline" className={cn("text-[11px]", meta.className)}>
                        {meta.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {p.umkm.name} · {p.category.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <UserCog className="size-3.5" />
                        {p.senior ? p.senior.name : "Belum ada mentor"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" />
                        {p._count.projectMembers} anggota
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button variant="outline" size="sm" render={<Link href={`/projects/${p.id}`} />}>
                      Detail
                    </Button>
                    {REPLACEABLE.includes(p.status) && p.senior && (
                      <Button size="sm" className="gap-1.5" onClick={() => setReplacing(p)}>
                        <UserCog className="size-4" />
                        Ganti Mentor
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ReplaceSeniorDialog project={replacing} onClose={() => setReplacing(null)} onDone={load} />
    </AppShell>
  );
}

function ReplaceSeniorDialog({
  project,
  onClose,
  onDone,
}: {
  project: AdminProjectItem | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [candidates, setCandidates] = useState<SeniorCandidate[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!project) {
      setCandidates(null);
      return;
    }
    adminApi
      .seniorCandidates(project.id)
      .then(setCandidates)
      .catch(() => setCandidates([]));
  }, [project]);

  const replace = async (candidate: SeniorCandidate) => {
    if (!project) return;
    setBusyId(candidate.id);
    try {
      await adminApi.replaceSenior(project.id, candidate.id);
      toast.success(`Mentor diganti ke ${candidate.name}`);
      onClose();
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengganti mentor");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog open={!!project} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ganti Mentor</DialogTitle>
          <DialogDescription>
            Pilih mentor pengganti untuk &ldquo;{project?.title}&rdquo;. Mentor saat ini:{" "}
            <strong>{project?.senior?.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {candidates === null ? (
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
        ) : candidates.length === 0 ? (
          <EmptyState
            icon={UserCog}
            heading="Tidak Ada Kandidat"
            message="Tidak ada mentor terverifikasi dengan kapasitas tersisa saat ini."
          />
        ) : (
          <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {candidates.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.profile?.headline ?? c.email} · {c.activeCount}/5 proyek aktif
                  </p>
                </div>
                <Button size="sm" disabled={busyId !== null} onClick={() => replace(c)}>
                  {busyId === c.id ? "Mengganti..." : "Pilih"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AdminProjectsMonitoringPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <Content />
    </AuthGuard>
  );
}
