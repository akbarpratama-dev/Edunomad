"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/apiClient";
import { projectApi, type ProjectDetail } from "@/services/projectApi";
import {
  applicationApi,
  APPLICATION_STATUS_META,
  type ApplicationStatus,
  type BeginnerApplicant,
} from "@/services/applicationApi";

type TabKey = ApplicationStatus;
const TABS: { key: TabKey; label: string }[] = [
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

  return (
    <AppShell
      breadcrumbs={[
        { label: "Telusuri Proyek", href: "/projects" },
        { label: project?.title ?? "Pelamar" },
      ]}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div>
          <h1 className="text-h1 text-neutral-dark">Pelamar Beginner</h1>
          {project && <p className="text-body-sm text-neutral-gray">{project.title}</p>}
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "whitespace-nowrap px-4 py-2 text-body font-medium",
                tab === t.key
                  ? "border-b-2 border-[#a3ce00] text-foreground"
                  : "text-neutral-gray hover:text-neutral-dark"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

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
            {visible.map((app) => (
              <Card key={app.id}>
                <CardContent className="flex flex-col gap-2 pt-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-body font-semibold text-neutral-dark">
                        {app.beginner.name}
                      </p>
                      <p className="text-body-sm text-neutral-gray">
                        Peran: {app.projectRole.roleName}
                        {app.beginner.profile?.headline
                          ? ` · ${app.beginner.profile.headline}`
                          : ""}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  {app.beginner.userSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {app.beginner.userSkills.map((us) => (
                        <Badge key={us.skill.id} variant="secondary">
                          {us.skill.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {app.motivation && (
                    <p className="text-body-sm text-neutral-dark whitespace-pre-wrap">
                      &ldquo;{app.motivation}&rdquo;
                    </p>
                  )}
                  {app.status === "PENDING" && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={busyId === app.id}
                        onClick={() => decide(app, "accept")}
                      >
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
                </CardContent>
              </Card>
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
