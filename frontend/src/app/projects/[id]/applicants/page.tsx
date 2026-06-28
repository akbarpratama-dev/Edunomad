"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { PillTabs } from "@/components/common/PillTabs";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { initials } from "@/components/dashboard/dashboardKit";
import { ApiError } from "@/lib/apiClient";
import { projectApi, type ProjectDetail } from "@/services/projectApi";
import {
  applicationApi,
  APPLICATION_STATUS_META,
  type ApplicationStatus,
  type BeginnerApplicant,
} from "@/services/applicationApi";

type TabKey = ApplicationStatus;
const TAB_DEFS: { key: TabKey; label: string }[] = [
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
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<TabKey>("PENDING");
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [items, setItems] = useState<BeginnerApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([projectApi.detail(id), applicationApi.projectApplications(id)])
      .then(([p, apps]) => {
        setProject(p);
        setItems(apps);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [id]);
  useEffect(load, [load]);

  const decide = async (app: BeginnerApplicant, action: "accept" | "reject") => {
    setBusyId(app.id);
    try {
      if (action === "accept") {
        await applicationApi.acceptApplication(app.id);
        toast.success(`${app.beginner.name} diterima ke tim`);
      } else {
        await applicationApi.rejectApplication(app.id);
        toast.success("Lamaran ditolak");
      }
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal memproses lamaran");
    } finally {
      setBusyId(null);
    }
  };

  const visible = items.filter((a) => a.status === tab);
  const tabs = TAB_DEFS.map((t) => ({
    ...t,
    count: items.filter((a) => a.status === t.key).length,
  }));

  return (
    <AppShell backHref={`/projects/${id}`}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <PageHeader
          title="Pelamar Beginner"
          subtitle={project ? project.title : "Kelola lamaran beginner untuk proyek ini."}
        />

        <PillTabs tabs={tabs} value={tab} onChange={setTab} ariaLabel="Filter status pelamar" />

        {loading ? (
          <ListSkeleton rows={4} />
        ) : error ? (
          <ErrorState message={error} onAction={load} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Inbox}
            heading="Belum Ada Pelamar"
            message="Belum ada beginner pada status ini."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((app, i) => (
              <article
                key={app.id}
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                className="app-reveal flex flex-col gap-3 rounded-[20px] border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-sky-200 text-sm font-bold text-sky-900"
                      aria-hidden="true"
                    >
                      {initials(app.beginner.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold tracking-tight text-foreground">{app.beginner.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Peran: {app.projectRole.roleName}
                        {app.beginner.profile?.headline ? ` · ${app.beginner.profile.headline}` : ""}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                {app.beginner.userSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {app.beginner.userSkills.map((us) => (
                      <Badge key={us.skill.id} variant="secondary">
                        {us.skill.name}
                      </Badge>
                    ))}
                  </div>
                )}
                {app.motivation && (
                  <p className="whitespace-pre-wrap rounded-xl bg-muted/50 px-3.5 py-2.5 text-sm text-foreground/80">
                    &ldquo;{app.motivation}&rdquo;
                  </p>
                )}
                {app.status === "PENDING" && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" disabled={busyId === app.id} onClick={() => decide(app, "accept")}>
                      Terima
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === app.id}
                      onClick={() => decide(app, "reject")}
                    >
                      Tolak
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

export default function BeginnerApplicantsPage() {
  return (
    <AuthGuard allowedRoles={["SENIOR"]}>
      <Content />
    </AuthGuard>
  );
}
