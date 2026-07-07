"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  MessageSquare,
  ClipboardCheck,
  BadgeCheck,
  FileText,
  Star,
  Award,
  Briefcase,
  ShieldCheck,
  Bell,
  UserPlus,
  UserX,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { PROJECT_STATUS_META, type ProjectListItem } from "@/services/projectApi";
import { useNotificationStore, type AppNotification } from "@/stores/notificationStore";

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
    <UserAvatar
      name={name}
      className={cn("size-7 text-[10px] font-bold ring-2", AVATAR_TONES[i % AVATAR_TONES.length], ring)}
    />
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
      <h1 className="text-h1 tracking-tight text-balance">
        Selamat datang kembali, {name}! <span className="align-middle">👋</span>
      </h1>
      <p className="mt-1.5 max-w-[65ch] text-body-lg text-pretty text-muted-foreground">{subtitle}</p>
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
        <span className={cn("grid size-11 place-items-center rounded-2xl", tone)} aria-hidden="true">
          <Icon className="size-5" />
        </span>
        {sample && <SampleTag />}
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1 inline-flex items-center gap-1 text-xs font-medium", trendTone)}>
        <ArrowUpRight className="size-3" aria-hidden="true" /> {trend}
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

// ── real notifications feed (Phase 9) ────────────────────────────────────────
// The notification store is bootstrapped app-wide by NotificationProvider and
// kept live via Supabase Realtime, so these cards read straight from it — no
// extra fetch. Icon/tone are derived from the notification type.
const NOTIF_META: Record<string, { icon: LucideIcon; tone: string }> = {
  APPLICATION_ACCEPTED: { icon: UserPlus, tone: "bg-[#eef7d6] text-[#5f8c00]" },
  APPLICATION_REJECTED: { icon: UserX, tone: "bg-rose-100 text-rose-700" },
  DELIVERABLE_SUBMITTED: { icon: FileText, tone: "bg-sky-100 text-sky-700" },
  DELIVERABLE_APPROVED: { icon: ClipboardCheck, tone: "bg-[#eef7d6] text-[#5f8c00]" },
  DELIVERABLE_REVISION: { icon: FileText, tone: "bg-amber-100 text-amber-700" },
  CONTRIBUTION_APPROVED: { icon: BadgeCheck, tone: "bg-[#eef7d6] text-[#5f8c00]" },
  REVIEW_RECEIVED: { icon: Star, tone: "bg-amber-100 text-amber-700" },
  ARTIFACT_GENERATED: { icon: Award, tone: "bg-[#eef7d6] text-[#5f8c00]" },
  VERIFICATION_APPROVED: { icon: ShieldCheck, tone: "bg-[#eef7d6] text-[#5f8c00]" },
  VERIFICATION_REJECTED: { icon: ShieldCheck, tone: "bg-rose-100 text-rose-700" },
  PROJECT_APPROVED: { icon: Briefcase, tone: "bg-[#eef7d6] text-[#5f8c00]" },
  PROJECT_REJECTED: { icon: Briefcase, tone: "bg-rose-100 text-rose-700" },
  COMPLETION_REQUESTED: { icon: ClipboardCheck, tone: "bg-violet-100 text-violet-700" },
  MEMBER_REMOVED: { icon: UserX, tone: "bg-rose-100 text-rose-700" },
  SENIOR_ASSIGNED: { icon: GraduationCap, tone: "bg-[#eef7d6] text-[#5f8c00]" },
  SENIOR_REMOVED: { icon: GraduationCap, tone: "bg-rose-100 text-rose-700" },
};

function notifMeta(type: string) {
  return NOTIF_META[type] ?? { icon: MessageSquare, tone: "bg-muted text-muted-foreground" };
}

// Relative "x lalu" timestamp in Indonesian.
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Baru saja";
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} hari lalu`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk} minggu lalu`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

// Recent activity feed — real notifications rendered as an activity stream.
export function ActivityCard({ limit = 5 }: { limit?: number }) {
  const notifications = useNotificationStore((s) => s.notifications);
  const items = notifications.slice(0, limit);

  return (
    <Panel className="app-reveal flex flex-col p-5">
      <CardHead title="Aktivitas Terbaru" href="/notifications" />
      {items.length === 0 ? (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
          <Bell className="size-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
        </div>
      ) : (
        <ul className="mt-4 flex-1 space-y-4">
          {items.map((n) => {
            const meta = notifMeta(n.type);
            return (
              <li key={n.id}>
                <Link
                  href={n.actionUrl || "/notifications"}
                  className="group -m-1.5 flex gap-3 rounded-xl p-1.5 transition-colors hover:bg-muted/50"
                >
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", meta.tone)}>
                    <meta.icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug">{n.title}</p>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{n.message}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

// Notifications card — unread-first view of the same live store.
export function NotifCard({ limit = 5 }: { limit?: number }) {
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const unread = notifications.filter((n) => !n.isRead);
  const items: AppNotification[] = (unread.length > 0 ? unread : notifications).slice(0, limit);

  return (
    <Panel className="app-reveal p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold tracking-tight">Notifikasi</h2>
          {unreadCount > 0 && (
            <span className="grid min-w-5 place-items-center rounded-full bg-[#8ef05a] px-1.5 text-[11px] font-bold text-[#0b0b0b]">
              {unreadCount}
            </span>
          )}
        </div>
        <Link
          href="/notifications"
          className="rounded-full border border-border px-3 py-1 text-xs font-semibold transition-colors hover:bg-muted"
        >
          Lihat Semua
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Tidak ada notifikasi baru.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={n.actionUrl || "/notifications"}
                className="group flex items-start gap-2.5"
              >
                <span
                  className={cn("mt-1.5 size-2 shrink-0 rounded-full", !n.isRead ? "bg-[#8ef05a]" : "bg-border")}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-snug text-foreground/90 group-hover:text-foreground">
                    {n.title}
                  </p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{n.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
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
