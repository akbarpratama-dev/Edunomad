"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  MessagesSquare,
  Plus,
  CheckCircle2,
  Circle,
  Users,
  CalendarClock,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { discussionApi, type Discussion } from "@/services/discussionApi";
import {
  projectApi,
  PROJECT_STATUS_META,
  type ProjectDetail,
  type ProjectMember,
} from "@/services/projectApi";
import { DiscussionFeed } from "./DiscussionFeed";

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  SENIOR: { label: "Mentor", className: "bg-[#eef7d6] text-[#5f8c00]" },
  BEGINNER: { label: "Mahasiswa", className: "bg-sky-100 text-sky-700" },
  UMKM: { label: "UMKM", className: "bg-amber-100 text-amber-700" },
  ADMIN: { label: "Admin", className: "bg-zinc-200 text-zinc-700" },
};

const AVATAR_TONES = [
  "bg-[#201f31] text-white",
  "bg-sky-500 text-white",
  "bg-rose-500 text-white",
  "bg-violet-500 text-white",
  "bg-emerald-500 text-white",
];
function toneFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % AVATAR_TONES.length;
  return AVATAR_TONES[h];
}
function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.round(h / 24);
  if (d === 1) return "kemarin";
  return `${d} hari lalu`;
}

export function DiscussionTab({ project }: { project: ProjectDetail }) {
  const appUser = useAuthStore((s) => s.appUser);
  const [discussions, setDiscussions] = useState<Discussion[] | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const canCreate =
    (appUser?.role === "SENIOR" && project.senior?.id === appUser.id) ||
    (appUser?.role === "UMKM" && project.umkm.id === appUser.id);

  const load = useCallback(async () => {
    try {
      const [list, mem] = await Promise.all([
        discussionApi.listProjectDiscussions(project.id),
        projectApi.members(project.id),
      ]);
      setDiscussions(list);
      setMembers(mem);
      setActiveId((cur) => cur ?? list[0]?.id ?? null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal memuat diskusi");
      setDiscussions([]);
    }
  }, [project.id]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setCreating(true);
    try {
      const activeIds = members.filter((m) => m.status === "ACTIVE").map((m) => m.user.id);
      const created = await discussionApi.createGroupDiscussion(project.id, activeIds);
      toast.success("Diskusi dibuat");
      setActiveId(created.id);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal membuat diskusi");
    } finally {
      setCreating(false);
    }
  };

  const activeMembers = members.filter((m) => m.status === "ACTIVE");
  // Team = senior + active members, de-duplicated by user id.
  const team = [
    ...(project.senior ? [{ id: project.senior.id, name: project.senior.name, role: "SENIOR" }] : []),
    ...activeMembers.map((m) => ({ id: m.user.id, name: m.user.name, role: "BEGINNER" })),
  ].filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Diskusi Proyek</h2>
          <p className="text-sm text-muted-foreground">
            Diskusikan ide, bagikan pembaruan, ajukan pertanyaan, dan dapatkan masukan langsung dari
            mentor serta anggota tim.
          </p>
        </div>
        {canCreate && (
          <Button onClick={create} disabled={creating}>
            <Plus className="size-4" /> Buat Diskusi Baru
          </Button>
        )}
      </div>

      {/* Project summary card */}
      <ProjectSummaryCard project={project} team={team} />

      {discussions === null ? (
        <p className="text-sm text-muted-foreground">Memuat diskusi…</p>
      ) : discussions.length === 0 ? (
        <EmptyDiscussions canCreate={canCreate} creating={creating} onCreate={create} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)] xl:grid-cols-[290px_minmax(0,1fr)_280px]">
          {/* Discussion list */}
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Daftar Diskusi
            </p>
            {discussions.map((d, i) => (
              <DiscussionListCard
                key={d.id}
                index={i}
                discussion={d}
                active={d.id === activeId}
                onSelect={() => setActiveId(d.id)}
              />
            ))}
            {canCreate && (
              <button
                onClick={create}
                disabled={creating}
                className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-[#a3ce00] hover:text-foreground disabled:opacity-60"
              >
                <Plus className="size-4" /> Diskusi Baru
              </button>
            )}
          </div>

          {/* Active thread */}
          {activeId && (
            <DiscussionFeed
              key={activeId}
              channelId={activeId}
              count={discussions.find((d) => d.id === activeId)?._count?.messages}
            />
          )}

          {/* Right rail (xl only — key info already in summary card) */}
          <aside className="hidden flex-col gap-4 xl:flex">
            <RailCard icon={<CheckCircle2 className="size-4" />} title="Milestone Berikutnya">
              {project.milestones.length === 0 ? (
                <p className="text-xs text-muted-foreground">Belum ada milestone.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {project.milestones.slice(0, 5).map((m) => {
                    const done = m.status === "COMPLETED";
                    return (
                      <li key={m.id} className="flex items-start gap-2.5">
                        {done ? (
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#5da316]" />
                        ) : (
                          <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm",
                              done ? "text-muted-foreground line-through" : "font-medium text-foreground"
                            )}
                          >
                            {m.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(m.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </RailCard>

            <RailCard icon={<GraduationCap className="size-4" />} title="Anggota Tim">
              {team.length === 0 ? (
                <p className="text-xs text-muted-foreground">Belum ada anggota.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {team.map((t) => {
                    const badge = ROLE_BADGE[t.role];
                    return (
                      <li key={t.id} className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "grid size-8 shrink-0 place-items-center rounded-full text-[12px] font-bold",
                            toneFor(t.id)
                          )}
                        >
                          {initials(t.name)}
                        </span>
                        <span className="flex-1 truncate text-sm font-medium">{t.name}</span>
                        {badge && (
                          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", badge.className)}>
                            {badge.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </RailCard>
          </aside>
        </div>
      )}
    </div>
  );
}

// ── Project summary card (real data) ─────────────────────────────────────────
function ProjectSummaryCard({
  project,
  team,
}: {
  project: ProjectDetail;
  team: { id: string; name: string; role: string }[];
}) {
  const statusMeta = PROJECT_STATUS_META[project.status];
  return (
    <section className="flex flex-col gap-4 rounded-[24px] border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eef7d6] text-[#5f8c00]"
          aria-hidden="true"
        >
          <MessagesSquare className="size-6" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold tracking-tight text-foreground">{project.title}</h3>
            <Badge variant={statusMeta.variant} className={statusMeta.className}>
              {statusMeta.label}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">Bersama {project.umkm.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap className="size-3.5" /> Mentor: {project.senior?.name ?? "Belum ada"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5" />
              {new Date(project.deadline).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
        <AvatarStack team={team} />
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/projects/${project.id}`} />}
          className="shrink-0"
        >
          Lihat Detail Proyek <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}

function AvatarStack({ team }: { team: { id: string; name: string }[] }) {
  const shown = team.slice(0, 5);
  const extra = team.length - shown.length;
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {shown.map((t) => (
          <span
            key={t.id}
            title={t.name}
            className={cn(
              "grid size-8 place-items-center rounded-full text-[11px] font-bold ring-2 ring-card",
              toneFor(t.id)
            )}
          >
            {initials(t.name)}
          </span>
        ))}
        {extra > 0 && (
          <span className="grid size-8 place-items-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground ring-2 ring-card">
            +{extra}
          </span>
        )}
      </div>
      <span className="ml-2.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="size-3.5" /> {team.length}
      </span>
    </div>
  );
}

// ── Discussion list card (real: message count + last activity + members) ──────
function DiscussionListCard({
  discussion,
  index,
  active,
  onSelect,
}: {
  discussion: Discussion;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  const memberCount = discussion.members?.length ?? 0;
  const msgCount = discussion._count?.messages ?? 0;
  return (
    <button
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-[border-color,background-color,box-shadow] duration-200",
        active
          ? "border-[#a3ce00] bg-[#f6fae9] shadow-[0_8px_24px_rgba(32,31,49,0.06)]"
          : "border-border bg-card hover:border-foreground/15 hover:bg-muted/40"
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          active ? "bg-[#d8f277] text-[#0b0b0b]" : "bg-muted text-muted-foreground"
        )}
        aria-hidden="true"
      >
        <MessagesSquare className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          Diskusi Tim{discussion._count ? ` ${index + 1}` : ""}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {memberCount} anggota · {timeAgo(discussion.updatedAt) || "Aktif"}
        </p>
      </div>
      <span className="grid min-w-7 shrink-0 place-items-center rounded-full bg-muted px-1.5 text-xs font-semibold tabular-nums text-muted-foreground">
        {msgCount}
      </span>
    </button>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyDiscussions({
  canCreate,
  creating,
  onCreate,
}: {
  canCreate: boolean;
  creating: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="app-reveal flex flex-col items-center gap-3 rounded-[24px] border border-dashed border-border py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-[#eef7d6] text-[#5f8c00]" aria-hidden="true">
        <MessagesSquare className="size-7" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-foreground">Belum Ada Diskusi</h3>
        <p className="mx-auto mt-0.5 max-w-sm text-sm text-muted-foreground">
          Mulai diskusi pertama untuk membantu tim berkolaborasi menyelesaikan proyek.
        </p>
      </div>
      {canCreate ? (
        <Button onClick={onCreate} disabled={creating} className="mt-1">
          <Plus className="size-4" /> Buat Diskusi Baru
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">Senior atau pemilik UMKM dapat membuat diskusi.</p>
      )}
    </div>
  );
}

function RailCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-border bg-card p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
        <span className="text-[#5f8c00]">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}
