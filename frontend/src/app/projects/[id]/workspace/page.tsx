"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Building2, GraduationCap } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ProjectMembersPanel } from "@/components/project/ProjectMembersPanel";
import { DiscussionTab } from "@/components/workspace/DiscussionTab";
import { DirectMessageDialog } from "@/components/workspace/DirectMessageDialog";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import {
  projectApi,
  PROJECT_STATUS_META,
  type ProjectDetail,
  type ProjectMember,
} from "@/services/projectApi";

type TabKey = "overview" | "milestones" | "discussion" | "members";
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Ringkasan" },
  { key: "milestones", label: "Milestone" },
  { key: "discussion", label: "Diskusi" },
  { key: "members", label: "Anggota" },
];

function WorkspaceInner() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    let active = true;
    projectApi
      .detail(id)
      .then((p) => active && setProject(p))
      .catch((err) =>
        active && setError(err instanceof ApiError ? err.message : "Gagal memuat proyek")
      );
    return () => {
      active = false;
    };
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!project) return <ListSkeleton />;

  const statusMeta = PROJECT_STATUS_META[project.status];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Kembali ke detail proyek
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
          <Badge variant={statusMeta.variant} className={statusMeta.className}>
            {statusMeta.label}
          </Badge>
        </div>
      </div>

      <nav className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-ring text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && <OverviewTab project={project} />}
      {tab === "milestones" && <MilestonesTab project={project} />}
      {tab === "discussion" && <DiscussionTab project={project} />}
      {tab === "members" && <MembersTab project={project} />}
    </div>
  );
}

function OverviewTab({ project }: { project: ProjectDetail }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground">Deskripsi</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm">{project.description}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground">Ekspektasi Deliverable</h2>
            <p className="mt-1 whitespace-pre-wrap text-sm">{project.expectedDeliverables}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-6 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">UMKM:</span>
            <span className="font-medium">{project.umkm.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Senior:</span>
            <span className="font-medium">{project.senior?.name ?? "Belum ada"}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Deadline:</span>
            <span className="font-medium">
              {new Date(project.deadline).toLocaleDateString("id-ID")}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MilestonesTab({ project }: { project: ProjectDetail }) {
  if (project.milestones.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        Belum ada milestone.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {project.milestones.map((m) => (
        <Card key={m.id}>
          <CardContent className="flex items-start justify-between gap-4 p-4">
            <div>
              <p className="font-medium">{m.title}</p>
              {m.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{m.description}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Tenggat: {new Date(m.dueDate).toLocaleDateString("id-ID")}
              </p>
            </div>
            <Badge variant="outline">{m.status}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Members tab = the shared lifecycle panel + DM launchers for other participants.
function MembersTab({ project }: { project: ProjectDetail }) {
  const myId = useAuthStore((s) => s.user?.id);
  const [members, setMembers] = useState<ProjectMember[] | null>(null);

  useEffect(() => {
    let active = true;
    projectApi.members(project.id).then((m) => active && setMembers(m));
    return () => {
      active = false;
    };
  }, [project.id]);

  // DM targets = senior + active members, minus self.
  const dmTargets = useMemo(() => {
    const map = new Map<string, string>();
    if (project.senior) map.set(project.senior.id, project.senior.name);
    members
      ?.filter((m) => m.status === "ACTIVE")
      .forEach((m) => map.set(m.user.id, m.user.name));
    if (myId) map.delete(myId);
    return [...map.entries()].map(([uid, name]) => ({ uid, name }));
  }, [members, project.senior, myId]);

  return (
    <div className="space-y-6">
      <ProjectMembersPanel project={project} />

      <Card>
        <CardContent className="space-y-3 p-6">
          <h3 className="text-sm font-semibold">Pesan Langsung</h3>
          {dmTargets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada anggota lain untuk dihubungi.</p>
          ) : (
            <ul className="divide-y divide-border">
              {dmTargets.map((t) => (
                <li key={t.uid} className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-medium">{t.name}</span>
                  <DirectMessageDialog targetUserId={t.uid} targetName={t.name} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <AuthGuard>
      <AppShell>
        <WorkspaceInner />
      </AppShell>
    </AuthGuard>
  );
}
