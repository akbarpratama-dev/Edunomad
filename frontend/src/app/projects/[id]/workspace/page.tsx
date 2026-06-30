"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { CalendarDays, Building2, GraduationCap, CalendarClock } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { PillTabs } from "@/components/common/PillTabs";
import { ProjectMembersPanel } from "@/components/project/ProjectMembersPanel";
import { DiscussionTab } from "@/components/workspace/DiscussionTab";
import { DeliverablesTab } from "@/components/workspace/DeliverablesTab";
import { ContributionTab } from "@/components/workspace/ContributionTab";
import { ReviewTab } from "@/components/workspace/ReviewTab";
import { DirectMessageDialog } from "@/components/workspace/DirectMessageDialog";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import {
  projectApi,
  PROJECT_STATUS_META,
  type ProjectDetail,
  type ProjectMember,
} from "@/services/projectApi";

type TabKey =
  | "overview"
  | "milestones"
  | "discussion"
  | "deliverables"
  | "contributions"
  | "reviews"
  | "members";
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Ringkasan" },
  { key: "milestones", label: "Milestone" },
  { key: "discussion", label: "Diskusi" },
  { key: "deliverables", label: "Deliverables" },
  { key: "contributions", label: "Kontribusi" },
  { key: "reviews", label: "Review" },
  { key: "members", label: "Anggota" },
];

function WorkspaceInner() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");

  // Deep-link a tab via ?tab=discussion (e.g. "Diskusi" shortcut from Proyek
  // Mentoring / Proyek Saya). Read client-side to skip a Suspense boundary,
  // matching the register page's ?role= pattern.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && TABS.some((tab) => tab.key === t)) setTab(t as TabKey);
  }, []);

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
    <div className="flex flex-col gap-5">
      <div className="app-reveal">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-pretty sm:text-[28px]">
            {project.title}
          </h1>
          <Badge variant={statusMeta.variant} className={statusMeta.className}>
            {statusMeta.label}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Workspace proyek — kolaborasi tim & progres.</p>
      </div>

      <PillTabs tabs={TABS} value={tab} onChange={setTab} ariaLabel="Navigasi workspace" />

      {tab === "overview" && <OverviewTab project={project} />}
      {tab === "milestones" && <MilestonesTab project={project} />}
      {tab === "discussion" && <DiscussionTab project={project} />}
      {tab === "deliverables" && <DeliverablesTab project={project} />}
      {tab === "contributions" && <ContributionTab project={project} />}
      {tab === "reviews" && <ReviewTab project={project} />}
      {tab === "members" && <MembersTab project={project} />}
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground" aria-hidden="true">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function OverviewTab({ project }: { project: ProjectDetail }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="app-reveal md:col-span-2">
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Deskripsi</h2>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">{project.description}</p>
          </div>
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ekspektasi Deliverable</h2>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">{project.expectedDeliverables}</p>
          </div>
        </CardContent>
      </Card>
      <Card className="app-reveal">
        <CardContent className="space-y-3">
          <MetaRow icon={Building2} label="UMKM" value={project.umkm.name} />
          <MetaRow icon={GraduationCap} label="Mentor" value={project.senior?.name ?? "Belum ada"} />
          <MetaRow
            icon={CalendarDays}
            label="Deadline"
            value={new Date(project.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function MilestonesTab({ project }: { project: ProjectDetail }) {
  if (project.milestones.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        heading="Belum Ada Milestone"
        message="Milestone proyek akan tampil di sini setelah ditetapkan."
      />
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {project.milestones.map((m, i) => (
        <article
          key={m.id}
          style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
          className="app-reveal flex items-start justify-between gap-4 rounded-[20px] border border-border bg-card p-5"
        >
          <div className="flex min-w-0 gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef7d6] text-[#5f8c00]" aria-hidden="true">
              <CalendarClock className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold tracking-tight">{m.title}</p>
              {m.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{m.description}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Tenggat {new Date(m.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0">{m.status}</Badge>
        </article>
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
    <div className="flex flex-col gap-5">
      <ProjectMembersPanel project={project} />

      <Card className="app-reveal">
        <CardContent className="space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Pesan Langsung
          </h3>
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
  const params = useParams();
  const id = params.id as string;
  // Back goes to the section you came from (/my-projects/:id or /projects/:id).
  const pathname = usePathname();
  const base = pathname.startsWith("/my-projects") ? "/my-projects" : "/projects";
  return (
    <AuthGuard>
      <AppShell backHref={`${base}/${id}`}>
        <WorkspaceInner />
      </AppShell>
    </AuthGuard>
  );
}
