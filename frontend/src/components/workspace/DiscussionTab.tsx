"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MessagesSquare, Plus, CheckCircle2, Circle, GraduationCap } from "lucide-react";
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
  SENIOR: { label: "Mentor", className: "bg-accent text-accent-foreground" },
  BEGINNER: { label: "Mahasiswa", className: "bg-sky-100 text-sky-700" },
  UMKM: { label: "UMKM", className: "bg-amber-100 text-amber-700" },
  ADMIN: { label: "Admin", className: "bg-zinc-200 text-zinc-700" },
};

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

  const statusMeta = PROJECT_STATUS_META[project.status];
  const activeMembers = members.filter((m) => m.status === "ACTIVE");
  // Team = senior + active members, de-duplicated by user id.
  const team = [
    ...(project.senior ? [{ id: project.senior.id, name: project.senior.name, role: "SENIOR" }] : []),
    ...activeMembers.map((m) => ({ id: m.user.id, name: m.user.name, role: "BEGINNER" })),
  ].filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {/* ── Main feed ── */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Diskusi Proyek</h2>
            <p className="text-sm text-muted-foreground">
              Diskusikan progres, kendala, dan kebutuhan proyek bersama tim.
            </p>
          </div>
          {canCreate && (
            <Button onClick={create} disabled={creating}>
              <Plus className="mr-1.5 size-4" /> Buat Diskusi
            </Button>
          )}
        </div>

        {/* Project status strip */}
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4">
          <StripItem label="Proyek" value={project.title} />
          <StripItem label="Status" value={<Badge variant={statusMeta.variant} className={statusMeta.className}>{statusMeta.label}</Badge>} />
          <StripItem label="Mentor" value={project.senior?.name ?? "Belum ada"} />
          <StripItem
            label="Deadline"
            value={new Date(project.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          />
        </div>

        {discussions === null ? (
          <p className="text-sm text-muted-foreground">Memuat diskusi…</p>
        ) : discussions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
            <MessagesSquare className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Belum ada diskusi grup.</p>
            {canCreate ? (
              <Button onClick={create} disabled={creating}>
                <Plus className="mr-1.5 size-4" /> Buat Diskusi Grup
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Senior atau pemilik UMKM dapat membuat diskusi.</p>
            )}
          </div>
        ) : (
          <>
            {/* Discussion chips (replaces Figma category tabs — backend has no categories) */}
            {discussions.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {discussions.map((d, i) => (
                  <button
                    key={d.id}
                    onClick={() => setActiveId(d.id)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                      d.id === activeId
                        ? "border-transparent bg-[#201f31] text-white"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Diskusi {i + 1}
                  </button>
                ))}
              </div>
            )}
            {activeId && <DiscussionFeed channelId={activeId} />}
          </>
        )}
      </div>

      {/* ── Right rail ── */}
      <aside className="flex flex-col gap-4">
        {/* Milestone */}
        <RailCard icon={<CheckCircle2 className="size-4" />} title="Milestone">
          {project.milestones.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada milestone.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {project.milestones.map((m) => {
                const done = m.status === "COMPLETED";
                return (
                  <li key={m.id} className="flex items-start gap-2.5">
                    {done ? (
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#5da316]" />
                    ) : (
                      <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm", done ? "text-muted-foreground line-through" : "font-medium text-foreground")}>
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

        {/* Team */}
        <RailCard icon={<GraduationCap className="size-4" />} title="Tim">
          {team.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada anggota.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {team.map((t) => {
                const badge = ROLE_BADGE[t.role];
                return (
                  <li key={t.id} className="flex items-center gap-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#201f31] text-[12px] font-bold text-white">
                      {t.name.charAt(0).toUpperCase()}
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
  );
}

function StripItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <div className="mt-1 truncate text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function RailCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}
