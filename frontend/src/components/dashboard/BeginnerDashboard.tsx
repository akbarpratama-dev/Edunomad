"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ClipboardCheck,
  Award,
  Users,
  ArrowRight,
  ArrowUpRight,
  Plus,
  MessageSquare,
  FileText,
  BadgeCheck,
  Bell,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/common/LoadingState";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { projectApi, type MyMembership } from "@/services/projectApi";

// ── helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
const AVATAR_TONES = [
  "bg-[#d8f277] text-[#0b0b0b]",
  "bg-sky-200 text-sky-900",
  "bg-amber-200 text-amber-900",
  "bg-pink-200 text-pink-900",
  "bg-violet-200 text-violet-900",
];
function Avatar({ name, i = 0, ring = "ring-card" }: { name: string; i?: number; ring?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full text-[10px] font-bold ring-2",
        AVATAR_TONES[i % AVATAR_TONES.length],
        ring
      )}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
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
const MONTHS_ID = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

export function BeginnerDashboard() {
  const appUser = useAuthStore((s) => s.appUser)!;
  const [memberships, setMemberships] = useState<MyMembership[] | null>(null);

  useEffect(() => {
    let active = true;
    projectApi
      .myMemberships()
      .then((m) => active && setMemberships(m))
      .catch(() => active && setMemberships([]));
    return () => {
      active = false;
    };
  }, []);

  const activeProjects = useMemo(
    () => (memberships ?? []).filter((m) => m.project.status === "ACTIVE"),
    [memberships]
  );

  // Real "Agenda Mendatang" from each active project's deadline.
  const agenda = useMemo(() => {
    return activeProjects
      .map((m) => ({
        date: new Date(m.project.deadline),
        title: `Deadline ${m.project.title}`,
        time: "23:59 WIB",
      }))
      .sort((a, b) => +a.date - +b.date);
  }, [activeProjects]);

  const firstName = appUser.name.split(/\s+/)[0];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Welcome ── */}
      <div className="app-reveal">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">
          Selamat datang kembali, {firstName}! <span className="align-middle">👋</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Kelola proyek, kolaborasi dengan tim, dan bangun portofolio terbaikmu bersama EduNomad.
        </p>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Briefcase}
          tone="bg-[#eef7d6] text-[#5f8c00]"
          value={String(activeProjects.length)}
          label="Proyek Aktif"
          trend={activeProjects.length > 0 ? "Sedang berjalan" : "Belum ada"}
          trendTone="text-[#5f8c00]"
        />
        <StatCard
          icon={ClipboardCheck}
          tone="bg-violet-100 text-violet-700"
          value="5"
          label="Tugas Berjalan"
          trend="2 mendekati deadline"
          trendTone="text-amber-600"
          sample
        />
        <StatCard
          icon={Award}
          tone="bg-sky-100 text-sky-700"
          value="0"
          label="Artifact"
          trend="Terbit usai proyek selesai"
          trendTone="text-muted-foreground"
        />
        <StatCard
          icon={Users}
          tone="bg-amber-100 text-amber-700"
          value="8"
          label="Diskusi Baru"
          trend="3 hari ini"
          trendTone="text-[#5f8c00]"
          sample
        />
      </div>

      {/* ── Main bento: Proyek Saya | Aktivitas | Notifikasi+Agenda ── */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1.5fr_1.1fr_1fr]">
        {/* Proyek Saya */}
        <Panel className="app-reveal flex flex-col p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight">Proyek Saya</h2>
            <Link
              href="/my-projects"
              className="rounded-full border border-border px-3 py-1 text-xs font-semibold transition-colors hover:bg-muted"
            >
              Lihat Semua
            </Link>
          </div>

          {memberships === null ? (
            <div className="mt-4">
              <ListSkeleton rows={2} />
            </div>
          ) : activeProjects.length === 0 ? (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
              <Briefcase className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">Belum Ada Proyek Aktif</p>
                <p className="mt-0.5 max-w-xs text-sm text-muted-foreground">
                  Jelajahi proyek yang tersedia dan mulai bangun pengalaman nyata bersama EduNomad.
                </p>
              </div>
              <Button render={<Link href="/projects" />}>Cari Proyek</Button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {activeProjects.map((m) => (
                <ProjectRow key={m.id} membership={m} />
              ))}
            </div>
          )}

          <Link
            href="/projects"
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-muted/60 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="size-4" /> Jelajahi proyek baru untuk bergabung
          </Link>
        </Panel>

        {/* Aktivitas Terbaru (placeholder) */}
        <Panel className="app-reveal flex flex-col p-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight">Aktivitas Terbaru</h2>
            <SampleTag />
          </div>
          <ul className="mt-4 flex-1 space-y-4">
            {SAMPLE_ACTIVITY.map((a) => (
              <li key={a.text} className="flex gap-3">
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", a.tone)}>
                  <a.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm leading-snug">
                    <span className="font-semibold">{a.who}</span> {a.text}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
          <button className="mt-4 w-full rounded-2xl border border-border py-2.5 text-sm font-semibold transition-colors hover:bg-muted">
            Lihat Semua Aktivitas
          </button>
        </Panel>

        {/* Notifikasi + Agenda */}
        <div className="flex flex-col gap-4">
          <Panel className="app-reveal p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Notifikasi</h2>
                <SampleTag />
              </div>
            </div>
            <ul className="mt-4 space-y-4">
              {SAMPLE_NOTIF.map((n) => (
                <li key={n.text} className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      n.unread ? "bg-[#8ef05a]" : "bg-border"
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-foreground/90">{n.text}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="app-reveal p-5">
            <h2 className="text-base font-bold tracking-tight">Agenda Mendatang</h2>
            {agenda.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Belum ada agenda. Tenggat proyek aktifmu akan muncul di sini.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {agenda.map((a, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-muted">
                      <span className="text-base font-bold leading-none tabular-nums">
                        {a.date.getDate()}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {MONTHS_ID[a.date.getMonth()]}
                      </span>
                    </div>
                    <div className="min-w-0 border-l-2 border-[#8ef05a] pl-3">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function ProjectRow({ membership }: { membership: MyMembership }) {
  const p = membership.project;
  const team = p.projectMembers.map((m) => m.user.name);
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* decorative thumbnail */}
      <div className="relative hidden h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#201f31] to-[#3a3850] sm:block">
        <div className="absolute inset-2 rounded-md bg-white/5" />
        <div className="absolute left-3 top-3 h-1.5 w-10 rounded-full bg-[#d8f277]/70" />
        <div className="absolute bottom-3 left-3 right-3 h-6 rounded-md bg-[#d8f277]/25" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge className="border-transparent bg-[#67c957]/15 text-[#3f7a2e]">Aktif</Badge>
        </div>
        <h3 className="mt-1.5 font-semibold tracking-tight">{p.title}</h3>
        <p className="text-sm text-muted-foreground">Bersama {p.umkm.name}</p>
        <p className="mt-1 line-clamp-2 text-sm text-foreground/80">{p.description}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center -space-x-2">
            {team.slice(0, 4).map((n, i) => (
              <Avatar key={n + i} name={n} i={i} />
            ))}
            {team.length > 4 && (
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground ring-2 ring-card">
                +{team.length - 4}
              </span>
            )}
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Deadline</p>
            <p className="text-sm font-medium tabular-nums">
              {new Date(p.deadline).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  tone,
  value,
  label,
  trend,
  trendTone,
  sample,
}: {
  icon: LucideIcon;
  tone: string;
  value: string;
  label: string;
  trend: string;
  trendTone: string;
  sample?: boolean;
}) {
  return (
    <Panel className="app-reveal p-5">
      <div className="flex items-start justify-between">
        <span className={cn("grid size-11 place-items-center rounded-2xl", tone)}>
          <Icon className="size-5" />
        </span>
        {sample && <SampleTag />}
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1 inline-flex items-center gap-1 text-xs font-medium", trendTone)}>
        <ArrowUpRight className="size-3" /> {trend}
      </p>
    </Panel>
  );
}

// Placeholder content — no activity feed / notifications backend yet (Phase 9).
const SAMPLE_ACTIVITY = [
  {
    who: "Budi Santoso",
    text: "memberikan feedback pada desain UI/UX.",
    time: "2 jam lalu",
    icon: MessageSquare,
    tone: "bg-violet-100 text-violet-700",
  },
  {
    who: "Tugas",
    text: '"Revisi Landing Page" diperbarui.',
    time: "4 jam lalu",
    icon: ClipboardCheck,
    tone: "bg-sky-100 text-sky-700",
  },
  {
    who: "Artifact",
    text: '"Sistem Kasir UMKM" berhasil diverifikasi.',
    time: "1 hari lalu",
    icon: BadgeCheck,
    tone: "bg-[#eef7d6] text-[#5f8c00]",
  },
  {
    who: "Rina Hidayah",
    text: "mengunggah file baru di diskusi.",
    time: "1 hari lalu",
    icon: FileText,
    tone: "bg-amber-100 text-amber-700",
  },
];

const SAMPLE_NOTIF = [
  { text: 'Deadline tugas "Revisi Landing Page" tinggal 2 hari lagi.', time: "2 jam lalu", unread: true },
  { text: "Mentor memberikan feedback baru pada proyek Anda.", time: "4 jam lalu", unread: true },
  { text: 'Diskusi baru pada proyek "Sistem Kasir UMKM".', time: "6 jam lalu", unread: false },
];
