"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  MessageSquare,
  ClipboardCheck,
  BadgeCheck,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_META, type ProjectListItem } from "@/services/projectApi";

// ── primitives ───────────────────────────────────────────────────────────────
export function initials(name: string) {
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

export function Avatar({ name, i = 0, ring = "ring-card" }: { name: string; i?: number; ring?: string }) {
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

// "No backend yet" marker so placeholder widgets stay honest.
export function SampleTag() {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      Contoh
    </span>
  );
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-[20px] border border-border bg-card", className)}>
      {children}
    </section>
  );
}

export function WelcomeHeader({ name, subtitle }: { name: string; subtitle: string }) {
  return (
    <div className="app-reveal">
      <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">
        Selamat datang kembali, {name}! <span className="align-middle">👋</span>
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function StatCard({
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

// ── shared cards ─────────────────────────────────────────────────────────────
const MONTHS_ID = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

export interface AgendaItem {
  date: Date;
  title: string;
  time: string;
}

export function AgendaCard({ items }: { items: AgendaItem[] }) {
  return (
    <Panel className="app-reveal p-5">
      <h2 className="text-base font-bold tracking-tight">Agenda Mendatang</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Belum ada agenda. Tenggat proyek aktif akan muncul di sini.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((a, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-muted">
                <span className="text-base font-bold leading-none tabular-nums">{a.date.getDate()}</span>
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
  );
}

// Placeholder activity feed — no activity-feed backend yet (Phase 9).
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

export function PlaceholderActivityCard() {
  return (
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
      <button
        disabled
        title="Segera hadir"
        className="mt-4 w-full cursor-not-allowed rounded-2xl border border-border py-2.5 text-sm font-semibold text-muted-foreground opacity-60"
      >
        Lihat Semua Aktivitas
      </button>
    </Panel>
  );
}

const SAMPLE_NOTIF = [
  { text: 'Deadline tugas "Revisi Landing Page" tinggal 2 hari lagi.', time: "2 jam lalu", unread: true },
  { text: "Mentor memberikan feedback baru pada proyek Anda.", time: "4 jam lalu", unread: true },
  { text: 'Diskusi baru pada proyek "Sistem Kasir UMKM".', time: "6 jam lalu", unread: false },
];

export function PlaceholderNotifCard() {
  return (
    <Panel className="app-reveal p-5">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold tracking-tight">Notifikasi</h2>
        <SampleTag />
      </div>
      <ul className="mt-4 space-y-4">
        {SAMPLE_NOTIF.map((n) => (
          <li key={n.text} className="flex items-start gap-2.5">
            <span
              className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.unread ? "bg-[#8ef05a]" : "bg-border")}
            />
            <div className="min-w-0">
              <p className="text-sm leading-snug text-foreground/90">{n.text}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

// Compact project row for the Senior / UMKM dashboard project lists.
export function ProjectMiniRow({
  project,
  href,
  subtitle,
}: {
  project: ProjectListItem;
  href: string;
  subtitle: string;
}) {
  const meta = PROJECT_STATUS_META[project.status];
  return (
    <Link
      href={href}
      className="group -m-2 flex flex-col gap-1 rounded-2xl p-2 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold tracking-tight">{project.title}</h3>
        <Badge variant={meta.variant} className={cn("shrink-0", meta.className)}>
          {meta.label}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      <p className="line-clamp-2 text-sm text-foreground/80">{project.description}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Deadline{" "}
        {new Date(project.deadline).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
    </Link>
  );
}

// Section header with an optional "see all" link.
export function CardHead({ title, href, action }: { title: string; href?: string; action?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold tracking-tight">{title}</h2>
      {href && (
        <Link
          href={href}
          className="rounded-full border border-border px-3 py-1 text-xs font-semibold transition-colors hover:bg-muted"
        >
          {action ?? "Lihat Semua"}
        </Link>
      )}
    </div>
  );
}
