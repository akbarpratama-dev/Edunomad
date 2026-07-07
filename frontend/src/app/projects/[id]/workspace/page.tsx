"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { CalendarDays, Building2, GraduationCap, CalendarClock, Users, ArrowRight, MessageSquare } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { PillTabs } from "@/components/common/PillTabs";
import { ProjectMembersPanel } from "@/components/project/ProjectMembersPanel";
import { ProjectThumb } from "@/components/artifact/shared";
import { DeliverablesTab } from "@/components/workspace/DeliverablesTab";
import { ContributionTab } from "@/components/workspace/ContributionTab";
import { ReviewTab } from "@/components/workspace/ReviewTab";
import { ArtifactTab } from "@/components/workspace/ArtifactTab";
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
  | "deliverables"
  | "contributions"
  | "reviews"
  | "artifacts"
  | "members";
// Diskusi is now its own page (/workspace/diskusi), not a tab.
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Ringkasan" },
  { key: "milestones", label: "Milestone" },
  { key: "deliverables", label: "Deliverables" },
  { key: "contributions", label: "Kontribusi" },
  { key: "reviews", label: "Review" },
  { key: "artifacts", label: "Sertifikat" },
  { key: "members", label: "Anggota" },
];

function WorkspaceInner() {
  const params = useParams();
  const id = params.id as string;
  const wsPathname = usePathname();
  const wsBase = wsPathname.startsWith("/my-projects") ? "/my-projects" : "/projects";
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
      <div className="app-reveal flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-4">
          {project.imageUrl && (
            <ProjectThumb
              title={project.title}
              imageUrl={project.imageUrl}
              className="hidden h-16 w-24 shrink-0 rounded-xl sm:block"
            />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-h1 tracking-tight text-balance">
                {project.title}
              </h1>
              <Badge variant={statusMeta.variant} className={statusMeta.className}>
                {statusMeta.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Workspace proyek — kolaborasi tim & progres.</p>
          </div>
        </div>
        <Button variant="outline" render={<Link href={`${wsBase}/${id}/workspace/diskusi`} />}>
          <MessageSquare className="size-4" /> Buka Diskusi
        </Button>
      </div>

      <PillTabs tabs={TABS} value={tab} onChange={setTab} ariaLabel="Navigasi workspace" />

      {tab === "overview" && <OverviewTab project={project} />}
      {tab === "milestones" && <MilestonesTab project={project} />}
      {tab === "deliverables" && <DeliverablesTab project={project} />}
      {tab === "contributions" && <ContributionTab project={project} />}
      {tab === "reviews" && <ReviewTab project={project} />}
      {tab === "artifacts" && <ArtifactTab project={project} />}
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
  const pathname = usePathname();
  const base = pathname.startsWith("/my-projects") ? "/my-projects" : "/projects";
  const [members, setMembers] = useState<ProjectMember[] | null>(null);
  useEffect(() => {
    let active = true;
    projectApi.members(project.id).then((m) => active && setMembers(m)).catch(() => {});
    return () => {
      active = false;
    };
  }, [project.id]);
  const team = (members ?? []).filter((m) => m.status === "ACTIVE");

  return (
    <div className="flex flex-col gap-4">
      {/* Anggota tim + jalan ke detail proyek (judul/status sudah di header halaman). */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          {team.length > 0 && (
            <div className="flex -space-x-2">
              {team.slice(0, 5).map((m) => (
                <UserAvatar
                  key={m.user.id}
                  name={m.user.name}
                  className="size-8 text-[11px] font-bold ring-2 ring-card bg-[#d8f277] text-[#0b0b0b]"
                />
              ))}
              {team.length > 5 && (
                <span className="grid size-8 place-items-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground ring-2 ring-card">
                  +{team.length - 5}
                </span>
              )}
            </div>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="size-4" /> {team.length} anggota
          </span>
        </div>
        <Button variant="outline" size="sm" render={<Link href={`${base}/${project.id}`} />}>
          Lihat Detail Proyek <ArrowRight className="size-4" />
        </Button>
      </div>

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
  const pathname = usePathname();
  const base = pathname.startsWith("/my-projects") ? "/my-projects" : "/projects";
  const role = useAuthStore((s) => s.appUser?.role);
  // Beginner's /my-projects is the board (no per-project detail page in their flow).
  // Back from workspace goes straight to the list, not to the detail.
  const backHref =
    role === "BEGINNER" && base === "/my-projects" ? "/my-projects" : `${base}/${id}`;
  return (
    <AuthGuard>
      <AppShell backHref={backHref}>
        <WorkspaceInner />
      </AppShell>
    </AuthGuard>
  );
}
