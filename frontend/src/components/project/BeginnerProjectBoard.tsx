"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  TrendingUp,
  Star,
  CalendarDays,
  MessageSquare,
  FileText,
  Users,
  CheckCircle2,
  Circle,
  Download,
  Plus,
  FolderKanban,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/common/LoadingState";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useAuthStore } from "@/stores/authStore";
import { projectApi, type ProjectDetail, type ProjectMember } from "@/services/projectApi";
import { deliverableApi, type Deliverable } from "@/services/deliverableApi";
import { contributionApi, type Contribution } from "@/services/contributionApi";
import { reviewApi, type ProjectReview } from "@/services/reviewApi";

// ── helpers ──────────────────────────────────────────────────────────────────
const MILESTONE_DONE = /done|complete|selesai|approved/i;
const AVATAR_TONES = [
  "bg-[#d8f277] text-[#0b0b0b]",
  "bg-sky-200 text-sky-900",
  "bg-amber-200 text-amber-900",
  "bg-pink-200 text-pink-900",
  "bg-violet-200 text-violet-900",
];
function Avatar({ name, i = 0, className }: { name: string; i?: number; className?: string }) {
  return (
    <UserAvatar
      name={name}
      className={cn(
        "text-[11px] font-bold ring-2 ring-card",
        AVATAR_TONES[i % AVATAR_TONES.length],
        className ?? "size-8"
      )}
    />
  );
}

// Small "no backend yet" marker so placeholder widgets stay honest.
function SampleTag() {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      Contoh
    </span>
  );
}

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-[20px] border border-border bg-card", className)}>
      {children}
    </section>
  );
}

function SectionHead({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold tracking-tight">{title}</h2>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#5f8c00] hover:underline"
        >
          Lihat Semua <ArrowRight className="size-3" />
        </Link>
      )}
    </div>
  );
}

interface BoardData {
  project: ProjectDetail;
  roleName: string | null;
  members: ProjectMember[];
  deliverables: Deliverable[];
  contributions: Contribution[];
  reviews: ProjectReview[];
}

export function BeginnerProjectBoard() {
  const appUser = useAuthStore((s) => s.appUser);
  const [data, setData] = useState<BoardData | null>(null);
  const [state, setState] = useState<"loading" | "empty" | "ready">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const memberships = await projectApi.myMemberships();
        // The beginner's current project = their ACTIVE (or awaiting-completion) membership.
        const current =
          memberships.find(
            (m) => m.status === "ACTIVE" && m.project.status === "ACTIVE"
          ) ??
          memberships.find(
            (m) => m.project.status === "ACTIVE" || m.project.status === "AWAITING_COMPLETION"
          );
        if (!current) {
          if (active) setState("empty");
          return;
        }
        const pid = current.project.id;
        const [project, members, deliverables, contributions, reviews] = await Promise.all([
          projectApi.detail(pid),
          projectApi.members(pid).catch(() => [] as ProjectMember[]),
          deliverableApi.listForProject(pid).catch(() => [] as Deliverable[]),
          contributionApi.listForProject(pid).catch(() => [] as Contribution[]),
          reviewApi.listForProject(pid).catch(() => [] as ProjectReview[]),
        ]);
        if (!active) return;
        setData({
          project,
          roleName: current.projectRole?.roleName ?? null,
          members,
          deliverables,
          contributions,
          reviews,
        });
        setState("ready");
      } catch {
        if (active) setState("empty");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const derived = useMemo(() => {
    if (!data) return null;
    const { project, deliverables, contributions, reviews } = data;
    const totalM = project.milestones.length;
    const doneM = project.milestones.filter((m) => MILESTONE_DONE.test(m.status)).length;
    const progress = totalM > 0 ? Math.round((doneM / totalM) * 100) : 0;
    const daysLeft = Math.max(
      0,
      Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86_400_000)
    );
    const myContribution = contributions.find((c) => c.beginnerId === appUser?.id) ?? null;
    const approved = deliverables.filter((d) => d.status === "APPROVED").length;
    // Latest review I received from the mentor (senior).
    const mentorFeedback =
      reviews
        .filter((r) => r.revieweeId === appUser?.id && r.reviewer.role === "SENIOR" && r.comment)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0] ?? null;
    return { totalM, doneM, progress, daysLeft, myContribution, approved, mentorFeedback };
  }, [data, appUser?.id]);

  if (state === "loading") return <ListSkeleton rows={4} />;
  if (state === "empty" || !data || !derived) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-border py-16 text-center">
        <FolderKanban className="size-10 text-muted-foreground" />
        <h3 className="text-base font-semibold text-foreground">Belum Ada Proyek Aktif</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Kamu belum tergabung di proyek yang sedang berjalan. Telusuri proyek dan lamar perannya
          untuk mulai berkolaborasi.
        </p>
        <Button className="mt-1" render={<Link href="/projects" />}>
          <FolderKanban className="size-4" /> Telusuri Proyek
        </Button>
      </div>
    );
  }

  const { project, roleName, members, deliverables } = data;
  const activeMembers = members.filter((m) => m.status === "ACTIVE");
  const workspace = `/my-projects/${project.id}/workspace`;
  const teamAvatars = [
    ...(project.senior ? [project.senior.name] : []),
    ...activeMembers.map((m) => m.user.name),
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ── Hero (navy) ── */}
      <section className="app-reveal overflow-hidden rounded-[24px] bg-[#201f31] p-5 text-[#e8e8ec] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
          {/* decorative project panel */}
          <div className="hidden w-44 shrink-0 flex-col gap-2 rounded-2xl bg-black/30 p-4 sm:flex">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#e5484d]" />
              <span className="size-2.5 rounded-full bg-[#ffa500]" />
              <span className="size-2.5 rounded-full bg-[#67c957]" />
            </div>
            <div className="mt-2 h-2 w-3/4 rounded-full bg-[#d8f277]/70" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 rounded-lg bg-white/5" />
              <div className="h-10 rounded-lg bg-white/5" />
              <div className="h-10 rounded-lg bg-white/5" />
              <div className="h-10 rounded-lg bg-white/5" />
            </div>
            <div className="mt-1 h-2 w-full rounded-full bg-white/10" />
            <div className="h-6 w-full rounded-lg bg-[#d8f277]/30" />
          </div>

          {/* main */}
          <div className="flex flex-1 flex-col">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge className="border-transparent bg-[#67c957]/15 text-[#9be88e]">
                  ● {project.status === "ACTIVE" ? "Aktif" : "Menunggu Penyelesaian"}
                </Badge>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
                  {project.title}
                </h1>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9595a1]">
                  Tim Proyek
                </p>
                <div className="mt-1.5 flex items-center -space-x-2">
                  {teamAvatars.slice(0, 4).map((n, i) => (
                    <Avatar key={n + i} name={n} i={i} />
                  ))}
                  {teamAvatars.length > 4 && (
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold ring-2 ring-[#201f31]">
                      +{teamAvatars.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <HeroMeta label="UMKM" value={project.umkm.name} />
              <HeroMeta label="Mentor" value={project.senior?.name ?? "Belum ada"} />
              <HeroMeta
                label="Deadline"
                value={new Date(project.deadline).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            </div>

            <div className="mt-auto flex flex-col gap-4 pt-6 sm:flex-row sm:items-end">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#9595a1]">Progress Keseluruhan</span>
                  <span className="font-bold tabular-nums text-[#d8f277]">{derived.progress}%</span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#d8f277] transition-[width] duration-500"
                    style={{ width: `${derived.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button render={<Link href={workspace} />}>
                  <MessageSquare className="size-4" /> Lihat Diskusi
                </Button>
                <Button
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                  render={<Link href={workspace} />}
                >
                  <FileText className="size-4" /> Lihat Deliverable
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          tone="bg-sky-100 text-sky-700"
          value={String(deliverables.length)}
          label="Deliverable"
          sub={`${derived.approved} disetujui`}
        />
        <StatCard
          icon={TrendingUp}
          tone="bg-[#eef7d6] text-[#5f8c00]"
          value={`${derived.doneM}/${derived.totalM}`}
          label="Milestone"
          sub="Selesai"
        />
        <StatCard
          icon={Star}
          tone="bg-amber-100 text-amber-700"
          value={String(derived.myContribution?.contributionSkills.length ?? 0)}
          label="Kontribusi"
          sub="Skill tercatat"
        />
        <StatCard
          icon={CalendarDays}
          tone="bg-rose-100 text-rose-700"
          value={String(derived.daysLeft)}
          label="Hari Tersisa"
          sub="Sebelum deadline"
        />
      </div>

      {/* ── Tasks (placeholder) + Milestones (real) ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">Tugas Saya</h2>
              <SampleTag />
            </div>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {SAMPLE_TASKS.map((t) => (
              <li key={t.title} className="flex items-center gap-3 py-3">
                {t.status === "Done" ? (
                  <CheckCircle2 className="size-5 shrink-0 text-[#67c957]" />
                ) : (
                  <Circle className="size-5 shrink-0 text-border" />
                )}
                <div className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                      t.tagTone
                    )}
                  >
                    {t.tag}
                  </span>
                  <p
                    className={cn(
                      "mt-1 truncate text-sm font-medium",
                      t.status === "Done" && "text-muted-foreground line-through"
                    )}
                  >
                    {t.title}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <Badge variant="outline" className={t.statusTone}>
                    {t.status}
                  </Badge>
                  <p className="mt-1 text-xs text-muted-foreground">{t.date}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-xl border border-dashed border-border py-2.5 text-center text-xs text-muted-foreground">
            <Plus className="mr-1 inline size-3.5" /> Sistem tugas per-anggota menyusul
          </p>
        </Panel>

        <Panel className="p-5">
          <SectionHead title="Milestone Proyek" href={workspace} />
          {project.milestones.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Belum ada milestone.</p>
          ) : (
            <ol className="mt-4">
              {project.milestones.map((m, i) => {
                const done = MILESTONE_DONE.test(m.status);
                const current =
                  !done &&
                  project.milestones.slice(0, i).every((p) => MILESTONE_DONE.test(p.status));
                const last = i === project.milestones.length - 1;
                return (
                  <li key={m.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {done ? (
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#d8f277] text-[#0b0b0b]">
                          <CheckCircle2 className="size-4" />
                        </span>
                      ) : current ? (
                        <span className="size-6 rounded-full border-[3px] border-[#0b0b0b] bg-card" />
                      ) : (
                        <span className="size-6 rounded-full border border-border bg-muted" />
                      )}
                      {!last && (
                        <span
                          className={cn("w-0.5 flex-1", done ? "bg-[#d8f277]" : "bg-border")}
                          style={{ minHeight: 20 }}
                        />
                      )}
                    </div>
                    <div className={cn("pb-5", last && "pb-0")}>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          done && "text-muted-foreground line-through",
                          current && "text-foreground"
                        )}
                      >
                        {m.title}
                      </p>
                      {current && (
                        <span className="text-xs font-medium text-[#5f8c00]">Sedang berjalan</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      </div>

      {/* ── Activity (placeholder) + Team (real) + Deliverables (real) ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight">Aktivitas Terbaru</h2>
            <SampleTag />
          </div>
          <ul className="mt-4 space-y-4">
            {SAMPLE_ACTIVITY.map((a, i) => (
              <li key={a.text} className="flex items-start gap-3">
                <Avatar name={a.who} i={i} className="size-8 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5">
          <SectionHead title="Tim Proyek" href={workspace} />
          {project.senior && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <Avatar name={project.senior.name} i={0} className="size-9 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{project.senior.name}</p>
                <p className="text-xs text-muted-foreground">Mentor</p>
              </div>
              <Badge className="border-transparent bg-[#eef7d6] text-[#3f4d00]">
                <GraduationCap className="mr-1 size-3" /> Mentor
              </Badge>
            </div>
          )}
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Anggota Tim
          </p>
          <ul className="mt-2 space-y-3">
            {activeMembers.length === 0 && (
              <li className="text-sm text-muted-foreground">Belum ada anggota.</li>
            )}
            {activeMembers.map((m, i) => (
              <li key={m.id} className="flex items-center gap-3">
                <Avatar name={m.user.name} i={i + 1} className="size-8 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{m.user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.projectRole.roleName}</p>
                </div>
                <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                  Mahasiswa
                </Badge>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5">
          <SectionHead title="Deliverable Terbaru" href={workspace} />
          {deliverables.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Belum ada deliverable.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {deliverables.slice(0, 4).map((d) => {
                const link = d.evidences.find((e) => e.type === "LINK" && e.url)?.url ?? null;
                return (
                  <li key={d.id} className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-[10px] font-bold text-violet-700">
                      {fileKind(d, link)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {new Date(d.createdAt).toLocaleDateString("id-ID")} ·{" "}
                        {DELIVERABLE_LABEL[d.status]}
                      </p>
                    </div>
                    {link && (
                      <Button
                        size="sm"
                        variant="outline"
                        render={<Link href={link} target="_blank" rel="noopener noreferrer" />}
                      >
                        <Download className="size-3.5" /> Buka
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      {/* ── Feedback (real) + My contribution (real) + total ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-1">
          <SectionHead title="Feedback Mentor Terbaru" href={workspace} />
          {derived.mentorFeedback ? (
            <div className="mt-4">
              <div className="flex items-center gap-3">
                <Avatar name={derived.mentorFeedback.reviewer.name} className="size-9 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{derived.mentorFeedback.reviewer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Mentor · {new Date(derived.mentorFeedback.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>
              <p className="mt-3 rounded-xl bg-[#eef7d6]/60 p-3 text-sm text-foreground/90">
                {derived.mentorFeedback.comment}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Belum ada feedback dari mentor. Feedback dari review akan muncul di sini.
            </p>
          )}
        </Panel>

        <Panel className="p-5 lg:col-span-1">
          <h2 className="text-base font-bold tracking-tight">Kontribusi Saya</h2>
          {derived.myContribution ? (
            <>
              <p className="mt-3 text-sm text-foreground/90">
                {derived.myContribution.contributionSummary}
              </p>
              {derived.myContribution.contributionSkills.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {derived.myContribution.contributionSkills.map((cs) => (
                    <li key={cs.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="size-4 shrink-0 text-[#67c957]" />
                      {cs.skill.name}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Kamu belum mencatat kontribusi. Buka workspace untuk menambahkannya.
            </p>
          )}
        </Panel>

        <Panel className="flex flex-col items-center justify-center p-5 text-center lg:col-span-1">
          <p className="text-5xl font-bold tabular-nums">
            {derived.myContribution?.contributionSkills.length ?? 0}
          </p>
          <p className="mt-1 text-sm font-semibold">Skill Tercatat</p>
          <p className="text-xs text-muted-foreground">Total Kontribusi</p>
        </Panel>
      </div>
    </div>
  );
}

function HeroMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9595a1]">
        {label}
      </p>
      <p className="mt-0.5 font-semibold text-white">{value}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  tone,
  value,
  label,
  sub,
}: {
  icon: typeof ClipboardList;
  tone: string;
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <Panel className="app-reveal p-5">
      <span className={cn("inline-flex size-9 items-center justify-center rounded-xl", tone)}>
        <Icon className="size-4.5" />
      </span>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </Panel>
  );
}

function fileKind(d: Deliverable, link: string | null) {
  const src = (link ?? d.title).toLowerCase();
  if (/\.fig/.test(src)) return "FIG";
  if (/\.zip|\.rar/.test(src)) return "ZIP";
  if (/\.pdf/.test(src)) return "PDF";
  if (/figma\.com/.test(src)) return "FIG";
  if (/github\.com/.test(src)) return "GIT";
  return "URL";
}

const DELIVERABLE_LABEL: Record<Deliverable["status"], string> = {
  DRAFT: "Draf",
  SUBMITTED: "Menunggu Review",
  REVISION_REQUESTED: "Perlu Revisi",
  APPROVED: "Disetujui",
};

// Placeholder data — there is no per-member task system or activity feed in the
// MVP backend yet (marked with a "Contoh" tag in the UI).
const SAMPLE_TASKS = [
  {
    tag: "Frontend",
    tagTone: "bg-sky-100 text-sky-700",
    title: "Membuat Halaman Login",
    status: "In Progress",
    statusTone: "border-sky-200 bg-sky-50 text-sky-700",
    date: "12 Jul 2026",
  },
  {
    tag: "Frontend",
    tagTone: "bg-sky-100 text-sky-700",
    title: "Implementasi Dashboard",
    status: "To Do",
    statusTone: "border-border bg-muted text-muted-foreground",
    date: "15 Jul 2026",
  },
  {
    tag: "Frontend",
    tagTone: "bg-sky-100 text-sky-700",
    title: "Perbaikan Responsive",
    status: "Done",
    statusTone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    date: "8 Jul 2026",
  },
  {
    tag: "Dokumentasi",
    tagTone: "bg-amber-100 text-amber-700",
    title: "Menyusun Dokumentasi API",
    status: "To Do",
    statusTone: "border-border bg-muted text-muted-foreground",
    date: "18 Jul 2026",
  },
];

const SAMPLE_ACTIVITY = [
  { who: "Rizky Pratama", text: "Rizky mengunggah Deliverable v2", time: "10 mnt lalu" },
  { who: "Budi Santoso", text: "Mentor memberikan feedback", time: "1 jam lalu" },
  { who: "Wira Tama", text: "UMKM menyetujui milestone", time: "3 jam lalu" },
  { who: "Alya Lestari", text: "Alya mengunggah UI Design", time: "5 jam lalu" },
];
