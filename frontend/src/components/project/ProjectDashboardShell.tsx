"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, ArrowRight, CalendarClock, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ProjectThumb } from "@/components/artifact/shared";
import { PROJECT_STATUS_META, type ProjectListItem } from "@/services/projectApi";

// Shared building blocks for the "Proyek Saya" (UMKM) / "Proyek Mentoring"
// (SENIOR) dashboards. All figures are derived from REAL data returned by the
// dashboard endpoints (milestones, members, role skills) — nothing invented.

// --- Derived helpers --------------------------------------------------------

export function projectProgress(item: ProjectListItem): { pct: number; done: number; total: number } {
  const ms = item.milestones ?? [];
  const total = ms.length;
  const done = ms.filter((m) => m.status === "COMPLETED").length;
  const pct = item.status === "COMPLETED" ? 100 : total > 0 ? Math.round((done / total) * 100) : 0;
  return { pct, done, total };
}

export function projectTech(item: ProjectListItem): string[] {
  const names = (item.projectRoles ?? []).flatMap((r) => r.roleSkills.map((rs) => rs.skill.name));
  return Array.from(new Set(names));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// --- Progress bar -----------------------------------------------------------

export function ProgressBar({ pct, tone = "bg-[#8bc34a]" }: { pct: number; tone?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}

// --- Rich project card ------------------------------------------------------

export function RichProjectCard({
  item,
  actions,
  i = 0,
}: {
  item: ProjectListItem;
  actions: ReactNode;
  i?: number;
}) {
  const meta = PROJECT_STATUS_META[item.status];
  const { pct, done, total } = projectProgress(item);
  const tech = projectTech(item);
  const members = item.projectMembers ?? [];
  const isReview = item.status === "AWAITING_COMPLETION";

  return (
    <article
      style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
      className="app-reveal flex flex-col gap-4 rounded-[20px] border border-border bg-card p-4 sm:flex-row"
    >
      <ProjectThumb
        title={item.title}
        imageUrl={item.imageUrl ?? null}
        className="h-36 w-full shrink-0 rounded-xl sm:h-auto sm:w-44"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Badge variant={meta.variant} className={cn("w-fit", meta.className)}>
          {meta.label}
        </Badge>
        <h3 className="mt-2 font-bold leading-tight tracking-tight text-foreground">{item.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>

        {tech.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {tech.slice(0, 5).map((t) => (
              <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-3 text-xs text-muted-foreground">
          {members.length > 0 && (
            <span className="flex items-center gap-2">
              <span className="flex -space-x-2">
                {members.slice(0, 4).map((m) => (
                  <UserAvatar
                    key={m.user.id}
                    name={m.user.name}
                    className="size-6 text-[9px] font-bold ring-2 ring-card bg-[#d8f277] text-[#0b0b0b]"
                  />
                ))}
              </span>
              <span className="font-medium text-foreground/80">{members.length} Mahasiswa</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="size-3.5" /> Mulai {fmtDate(item.startDate)}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarCheck className="size-3.5" /> Est. {fmtDate(item.deadline)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col justify-between gap-3 border-t border-border pt-3 sm:w-48 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
        <div>
          <p className={cn("text-xs font-medium", isReview ? "text-amber-600" : "text-muted-foreground")}>
            {isReview ? "Perlu Review" : "Progress Proyek"}
          </p>
          <p className="text-2xl font-bold tabular-nums tracking-tight">{pct}%</p>
          <div className="mt-1.5">
            <ProgressBar pct={pct} tone={isReview ? "bg-amber-400" : "bg-[#8bc34a]"} />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {total > 0 ? `${done}/${total} Milestone selesai` : item.status === "COMPLETED" ? "Proyek selesai" : "Belum ada milestone"}
          </p>
        </div>
        <div className="flex flex-col gap-2">{actions}</div>
      </div>
    </article>
  );
}

// --- Sidebar pieces ---------------------------------------------------------

export interface StatItem {
  icon: typeof CheckCircle2;
  label: string;
  value: number | string;
  tone: string;
}

export function StatGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((s, i) => (
        <div key={i} className="rounded-[18px] border border-border bg-card p-4">
          <span className={cn("grid size-9 place-items-center rounded-xl", s.tone)}>
            <s.icon className="size-4" />
          </span>
          <p className="mt-2.5 text-2xl font-bold tabular-nums tracking-tight">{s.value}</p>
          <p className="text-xs leading-tight text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export function SidebarCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[20px] border border-border bg-card p-5">
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold tracking-tight text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ActiveProjectsList({
  items,
  base,
}: {
  items: ProjectListItem[];
  base: string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Belum ada proyek berjalan.</p>;
  }
  return (
    <ul className="flex flex-col gap-3.5">
      {items.map((p) => {
        const { pct } = projectProgress(p);
        return (
          <li key={p.id}>
            <Link href={`${base}/${p.id}`} className="group flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#eef7d6] text-[#5f8c00]">
                <CheckCircle2 className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground group-hover:text-[#5f8c00]">
                  {p.title}
                </p>
                <div className="mt-1"><ProgressBar pct={pct} /></div>
              </div>
              <span className="text-xs font-semibold tabular-nums text-muted-foreground">{pct}%</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function TipsCard({
  icon: Icon,
  title,
  tips,
  cta,
}: {
  icon: typeof CheckCircle2;
  title: string;
  tips: string[];
  cta?: { label: string; href: string };
}) {
  return (
    <section className="rounded-[20px] border border-[#cfe89a] bg-[#f6fbe8]/60 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-[#d8f277] text-[#0b0b0b]">
          <Icon className="size-4" />
        </span>
        <h2 className="text-sm font-bold tracking-tight">{title}</h2>
      </div>
      <ul className="flex flex-col gap-2">
        {tips.map((t, i) => (
          <li key={i} className="flex gap-2 text-sm text-foreground/85">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#5f8c00]" />
            {t}
          </li>
        ))}
      </ul>
      {cta && (
        <Link
          href={cta.href}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          {cta.label} <ArrowRight className="size-4" />
        </Link>
      )}
    </section>
  );
}

// --- Layout wrapper ---------------------------------------------------------

export function DashboardLayout({
  header,
  toolbar,
  main,
  sidebar,
}: {
  header: ReactNode;
  toolbar: ReactNode;
  main: ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-5">
        {header}
        {toolbar}
        {main}
      </div>
      <aside className="flex flex-col gap-5">{sidebar}</aside>
    </div>
  );
}
