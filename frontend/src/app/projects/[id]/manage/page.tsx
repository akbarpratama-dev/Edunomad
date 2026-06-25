"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
import { ApiError } from "@/lib/apiClient";
import { projectApi, type ProjectDetail } from "@/services/projectApi";
import {
  applicationApi,
  APPLICATION_STATUS_META,
  type ApplicationStatus,
  type SeniorApplicant,
} from "@/services/applicationApi";

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
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [items, setItems] = useState<SeniorApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([projectApi.detail(id), applicationApi.projectSeniorApplications(id)])
      .then(([p, apps]) => {
        setProject(p);
        setItems(apps);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Gagal memuat data")
      )
      .finally(() => setLoading(false));
  }, [id]);
  useEffect(load, [load]);

  const decide = async (app: SeniorApplicant, action: "accept" | "reject") => {
    setBusyId(app.id);
    try {
      if (action === "accept") {
        await applicationApi.acceptSenior(app.id);
        toast.success(`${app.senior.name} diterima sebagai mentor`);
      } else {
        await applicationApi.rejectSenior(app.id);
        toast.success("Lamaran ditolak");
      }
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal memproses lamaran");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppShell
      breadcrumbs={[
        { label: "Proyek Saya", href: "/my-projects" },
        { label: project?.title ?? "Kelola" },
      ]}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Lamaran Senior</h1>
          {project && (
            <p className="text-sm text-muted-foreground">
              {project.title}
              {project.senior ? ` · Mentor: ${project.senior.name}` : ""}
            </p>
          )}
        </div>

        {loading ? (
          <ListSkeleton rows={4} />
        ) : error ? (
          <ErrorState message={error} onAction={load} />
        ) : project?.senior ? (
          <Card>
            <CardContent className="flex flex-col gap-2 pt-2">
              <p className="text-sm font-semibold text-foreground">
                Mentor sudah ditetapkan
              </p>
              <p className="text-sm text-muted-foreground">
                {project.senior.name} adalah mentor proyek ini. Lamaran lain otomatis ditolak.
              </p>
              <Button variant="outline" render={<Link href={`/projects/${id}`} />}>
                Lihat Proyek
              </Button>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            heading="Belum Ada Pelamar"
            message="Belum ada senior yang melamar menjadi mentor untuk proyek ini."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((app) => (
              <Card key={app.id}>
                <CardContent className="flex flex-col gap-2 pt-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {app.senior.name}
                      </p>
                      {app.senior.profile?.headline && (
                        <p className="text-sm text-muted-foreground">
                          {app.senior.profile.headline}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  {app.senior.profile?.bio && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {app.senior.profile.bio}
                    </p>
                  )}
                  {app.message && (
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      &ldquo;{app.message}&rdquo;
                    </p>
                  )}
                  {app.senior.profile?.linkedinUrl && (
                    <a
                      href={app.senior.profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#5f8c00] hover:underline"
                    >
                      LinkedIn
                    </a>
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

export default function ManageSeniorApplicationsPage() {
  return (
    <AuthGuard allowedRoles={["UMKM"]}>
      <Content />
    </AuthGuard>
  );
}
