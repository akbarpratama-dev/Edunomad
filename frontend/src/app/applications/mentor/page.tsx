"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Inbox, GraduationCap } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { PillTabs } from "@/components/common/PillTabs";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ApiError } from "@/lib/apiClient";
import {
  applicationApi,
  APPLICATION_STATUS_META,
  type ApplicationStatus,
  type SeniorApplicationMine,
} from "@/services/applicationApi";

const TAB_DEFS: { key: ApplicationStatus; label: string }[] = [
  { key: "PENDING", label: "Menunggu" },
  { key: "ACCEPTED", label: "Diterima" },
  { key: "REJECTED", label: "Ditolak" },
  { key: "WITHDRAWN", label: "Ditarik" },
];

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = APPLICATION_STATUS_META[status];
  return (
    <Badge variant={meta.variant} className={meta.className}>
      {meta.label}
    </Badge>
  );
}

function Content() {
  const [tab, setTab] = useState<ApplicationStatus>("PENDING");
  const [items, setItems] = useState<SeniorApplicationMine[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState<SeniorApplicationMine | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    applicationApi
      .mySeniorApplications()
      .then(setItems)
      .catch(() => toast.error("Gagal memuat lamaran"))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const confirmWithdraw = async () => {
    if (!withdrawing) return;
    setBusy(true);
    try {
      await applicationApi.withdrawSenior(withdrawing.id);
      toast.success("Lamaran ditarik");
      setWithdrawing(null);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menarik lamaran");
    } finally {
      setBusy(false);
    }
  };

  const visible = items.filter((a) => a.status === tab);
  const tabs = TAB_DEFS.map((t) => ({
    ...t,
    count: items.filter((a) => a.status === t.key).length,
  }));

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader title="Lamaran Mentor" subtitle="Kelola lamaran mentoring yang kamu ajukan ke proyek." />

        <PillTabs tabs={tabs} value={tab} onChange={setTab} ariaLabel="Filter status lamaran" />

        {loading ? (
          <ListSkeleton rows={4} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Inbox}
            heading="Belum Ada Lamaran"
            message="Telusuri proyek yang membutuhkan mentor dan ajukan lamaran sebagai mentor."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((a, i) => (
              <article
                key={a.id}
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                className="app-reveal flex flex-col gap-3 rounded-[20px] border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef7d6] text-[#5f8c00]"
                      aria-hidden="true"
                    >
                      <GraduationCap className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold tracking-tight text-foreground">{a.project.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {a.project.umkm.name} · {a.project.category.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Dilamar {new Date(a.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                {a.message && (
                  <p className="whitespace-pre-wrap rounded-xl bg-muted/50 px-3.5 py-2.5 text-sm text-foreground/80">
                    &ldquo;{a.message}&rdquo;
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/projects/${a.project.id}`} />}
                  >
                    Lihat Proyek
                  </Button>
                  {a.status === "ACCEPTED" && (
                    <Button
                      size="sm"
                      render={<Link href={`/my-projects/${a.project.id}/applicants`} />}
                    >
                      Kelola Lamaran Beginner
                    </Button>
                  )}
                  {a.status === "PENDING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => setWithdrawing(a)}
                    >
                      Tarik Lamaran
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!withdrawing}
        onOpenChange={(o) => !o && setWithdrawing(null)}
        title="Tarik Lamaran"
        description={`Tarik lamaran mentor untuk "${withdrawing?.project.title}"?`}
        confirmLabel="Tarik"
        cancelLabel="Batal"
        destructive
        onConfirm={confirmWithdraw}
      />
    </AppShell>
  );
}

export default function MentorApplicationsPage() {
  return (
    <AuthGuard allowedRoles={["SENIOR"]}>
      <Content />
    </AuthGuard>
  );
}
