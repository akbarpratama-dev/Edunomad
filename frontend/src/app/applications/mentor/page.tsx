"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/apiClient";
import {
  applicationApi,
  APPLICATION_STATUS_META,
  type ApplicationStatus,
  type SeniorApplicationMine,
} from "@/services/applicationApi";

const TABS: { key: ApplicationStatus; label: string }[] = [
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

  return (
    <AppShell breadcrumbs={[{ label: "Lamaran Mentor" }]}>
      <div className="flex flex-col gap-4">
        <PageHeader title="Lamaran Mentor" subtitle="Kelola lamaran mentoring yang kamu ajukan ke proyek." />

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
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Inbox}
            heading="Belum Ada Lamaran"
            message="Telusuri proyek yang membutuhkan mentor dan ajukan lamaran sebagai mentor."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex flex-col gap-2 pt-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {a.project.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {a.project.umkm.name} · {a.project.category.name}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  {a.message && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      &ldquo;{a.message}&rdquo;
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Dilamar: {new Date(a.createdAt).toLocaleDateString("id-ID")}
                  </p>
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
                        render={<Link href={`/projects/${a.project.id}/applicants`} />}
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
                </CardContent>
              </Card>
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
