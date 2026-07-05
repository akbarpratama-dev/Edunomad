"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Code2,
  Link2,
  Globe,
  Mail,
  Pencil,
  CalendarDays,
  ShieldCheck,
  FolderCheck,
  FolderKanban,
  Star,
  Award,
  Download,
  ExternalLink,
  BadgeCheck,
  Clock,
  Sparkles,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { EmptyState } from "@/components/common/EmptyState";
import { ProjectThumb } from "@/components/artifact/shared";
import {
  SKILL_LEVEL_PCT,
  SKILL_LEVEL_LABEL,
  isMemberProject,
  type ProfileOverview,
  type ProfileProject,
} from "@/services/profileApi";
import { reviewApi, type UserReview } from "@/services/reviewApi";
import type { Role } from "@/types/user";

const ROLE_LABEL: Record<Role, string> = {
  BEGINNER: "Beginner",
  SENIOR: "Mentor",
  UMKM: "UMKM",
  ADMIN: "Admin",
};

const PROJECT_STATUS_TINT: Record<string, string> = {
  ACTIVE: "border-emerald-300 bg-emerald-50 text-emerald-700",
  AWAITING_COMPLETION: "border-sky-300 bg-sky-50 text-sky-700",
  COMPLETED: "border-violet-300 bg-violet-50 text-violet-700",
  RECRUITING: "border-amber-300 bg-amber-50 text-amber-700",
};
const PROJECT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Berjalan",
  AWAITING_COMPLETION: "Menunggu Selesai",
  COMPLETED: "Selesai",
  RECRUITING: "Rekrutmen",
  DRAFT: "Draf",
  PENDING_REVIEW: "Menunggu Tinjauan",
};

type TabKey = "about" | "projects" | "portfolio" | "reviews";

const TABS: { key: TabKey; label: string }[] = [
  { key: "about", label: "Tentang Saya" },
  { key: "projects", label: "Proyek" },
  { key: "portfolio", label: "Sertifikat" },
  { key: "reviews", label: "Ulasan & Rekomendasi" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
function fmtMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

// Normalise a role-aware project row into flat fields for a card.
function flatProject(p: ProfileProject) {
  if (isMemberProject(p)) {
    return { ...p.project, roleName: p.projectRole.roleName };
  }
  return { ...p, roleName: null as string | null };
}

export function ProfileView({
  overview,
  isOwn,
}: {
  overview: ProfileOverview;
  isOwn: boolean;
}) {
  const { user, profile, skills, experiences, portfolioLinks, stats, artifacts, projects } = overview;

  // UMKM is a business owner, not a contributor — skills / contribution / review
  // stats / certificate & review tabs don't apply. Everyone else ("professional")
  // gets the full set (D-P10-2).
  const professional = user.role !== "UMKM";
  const tabs = professional ? TABS : TABS.filter((t) => t.key === "about" || t.key === "projects");

  // Top Skill = highest-level skill (ADVANCED > INTERMEDIATE > BEGINNER), first wins.
  const topSkill = useMemo(() => {
    if (skills.length === 0) return null;
    const rank = { ADVANCED: 3, INTERMEDIATE: 2, BEGINNER: 1 } as const;
    return [...skills].sort((a, b) => (rank[b.level] ?? 0) - (rank[a.level] ?? 0))[0];
  }, [skills]);

  const [tab, setTab] = useState<TabKey>("about");

  const [reviews, setReviews] = useState<UserReview[] | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  useEffect(() => {
    if (tab !== "reviews" || reviews !== null) return;
    setReviewsLoading(true);
    reviewApi
      .listForUser(user.id)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [tab, reviews, user.id]);

  const isVerified = user.status === "VERIFIED";
  const joinLabel = fmtMonthYear(user.createdAt);

  // Social links: explicit linkedin + email, plus any portfolio links (github/web).
  const socials = useMemo(() => {
    const out: { icon: typeof Globe; href: string; label: string }[] = [];
    for (const l of portfolioLinks) {
      const t = l.type.toUpperCase();
      const icon = t === "GITHUB" ? Code2 : t === "LINKEDIN" ? Link2 : Globe;
      out.push({ icon, href: l.url, label: l.title || t });
    }
    if (profile?.linkedinUrl && !portfolioLinks.some((l) => l.type.toUpperCase() === "LINKEDIN")) {
      out.push({ icon: Link2, href: profile.linkedinUrl, label: "LinkedIn" });
    }
    if (isOwn) out.push({ icon: Mail, href: `mailto:${user.email}`, label: user.email });
    return out;
  }, [portfolioLinks, profile?.linkedinUrl, isOwn, user.email]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* ---- Main column ---- */}
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[24px] border border-border bg-gradient-to-br from-[#eef7d6]/70 via-card to-card p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <UserAvatar
              name={user.name}
              src={profile?.photo ?? undefined}
              className="size-24 shrink-0 rounded-full text-2xl font-bold ring-4 ring-white/70"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{user.name}</h1>
                {isVerified && (
                  <Badge className="gap-1 border-emerald-300 bg-emerald-50 text-emerald-700" variant="outline">
                    <BadgeCheck className="size-3.5" />
                    Verified {ROLE_LABEL[user.role]}
                  </Badge>
                )}
              </div>
              {profile?.headline && (
                <p className="mt-1 text-[15px] font-medium text-foreground/70">{profile.headline}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="size-4" />
                  {ROLE_LABEL[user.role]}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  Bergabung sejak {joinLabel}
                </span>
                {professional && topSkill && (
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="size-4" />
                    Top skill: {topSkill.skill.name}
                  </span>
                )}
              </div>
              {profile?.bio && (
                <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                  {profile.bio}
                </p>
              )}
              {socials.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {socials.map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      title={s.label}
                      className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <s.icon className="size-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            {isOwn && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5"
                render={<Link href="/profile/edit" />}
              >
                <Pencil className="size-4" />
                Edit Profil
              </Button>
            )}
          </div>
        </section>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Bagian profil">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
                  tab === t.key
                    ? "border-[#8bc34a] text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        {tab === "about" && (
          <AboutTab overview={overview} isOwn={isOwn} />
        )}
        {tab === "projects" && (
          <ProjectsTab projects={projects} />
        )}
        {tab === "portfolio" && (
          <PortfolioTab artifacts={artifacts} />
        )}
        {tab === "reviews" && (
          <ReviewsTab reviews={reviews} loading={reviewsLoading} />
        )}
      </div>

      {/* ---- Right sidebar ---- */}
      <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-[300px]">
        {/* Stat cards — contributor-oriented, hidden for UMKM */}
        {professional && (
          <div className="grid grid-cols-2 gap-3">
            <StatBox icon={ShieldCheck} value={stats.verifiedArtifacts} label="Sertifikat Terverifikasi" tone="bg-emerald-50 text-emerald-700" />
            <StatBox icon={FolderCheck} value={stats.completedProjects} label="Proyek Selesai" tone="bg-violet-50 text-violet-700" />
            <StatBox icon={FolderKanban} value={stats.currentProjects} label="Proyek Berjalan" tone="bg-sky-50 text-sky-700" />
            <StatBox icon={MessageSquare} value={stats.reviewCount} label="Total Ulasan" tone="bg-indigo-50 text-indigo-700" />
            <StatBox icon={Clock} value={stats.contributionHours} label="Total Jam Kontribusi" tone="bg-orange-50 text-orange-700" />
            <StatBox
              icon={Star}
              value={stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}
              label="Rata-rata Ulasan"
              tone="bg-amber-50 text-amber-700"
            />
          </div>
        )}

        {/* Skills + Top Skill — hidden for UMKM */}
        {professional && (
          <SidebarCard title="Skills">
            {skills.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada skill.</p>
            ) : (
              <>
                {topSkill && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl bg-[#eef7d6] px-3 py-2">
                    <Sparkles className="size-4 text-[#5f8c00]" />
                    <span className="text-xs text-muted-foreground">Top skill</span>
                    <span className="ml-auto text-sm font-semibold text-foreground">{topSkill.skill.name}</span>
                  </div>
                )}
                <ul className="flex flex-col gap-3">
                  {skills.map((s) => {
                    const pct = SKILL_LEVEL_PCT[s.level] ?? 40;
                    return (
                      <li key={s.id}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{s.skill.name}</span>
                          <span className="text-xs text-muted-foreground">{SKILL_LEVEL_LABEL[s.level]}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-[#8bc34a]" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </SidebarCard>
        )}

        {/* Social / portfolio links — all roles */}
        {socials.length > 0 && (
          <SidebarCard title="Tautan Sosial">
            <ul className="flex flex-col gap-1">
              {socials.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.href}
                    target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-muted"
                  >
                    <s.icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{s.label}</span>
                    <ExternalLink className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
                  </a>
                </li>
              ))}
            </ul>
          </SidebarCard>
        )}

        {/* CV — placeholder (out of scope), contributor-oriented → non-UMKM only */}
        {professional && (
          <SidebarCard title="Unduh CV">
            <p className="mb-3 text-sm text-muted-foreground">
              Fitur CV PDF akan tersedia pada fase berikutnya.
            </p>
            <Button variant="outline" size="sm" disabled className="w-full gap-1.5">
              <Download className="size-4" />
              Unduh CV (PDF)
            </Button>
          </SidebarCard>
        )}
      </aside>
    </div>
  );
}

function StatBox({
  icon: Icon,
  value,
  label,
  tone,
  span,
}: {
  icon: typeof Star;
  value: number | string;
  label: string;
  tone: string;
  span?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-[20px] border border-border bg-card p-4",
        span && "col-span-2"
      )}
    >
      <span className={cn("grid size-8 place-items-center rounded-lg", tone)}>
        <Icon className="size-4" />
      </span>
      <span className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</span>
      <span className="text-xs leading-tight text-muted-foreground">{label}</span>
    </div>
  );
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-border bg-card p-5">
      <h2 className="mb-3 text-sm font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function AboutTab({ overview, isOwn }: { overview: ProfileOverview; isOwn: boolean }) {
  const { profile, experiences, skills } = overview;
  const hasAny = profile?.bio || experiences.length > 0 || skills.length > 0;
  if (!hasAny) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <EmptyState
          icon={Award}
          heading="Profil Belum Lengkap"
          message={
            isOwn
              ? "Tambahkan bio, pengalaman, dan skill agar profilmu lebih menonjol."
              : "Pengguna ini belum menambahkan bio, pengalaman, atau skill."
          }
        />
        {isOwn && (
          <Button size="sm" className="gap-1.5" render={<Link href="/profile/edit" />}>
            <Pencil className="size-4" />
            Lengkapi Profil
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {profile?.bio && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Bio</h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{profile.bio}</p>
        </section>
      )}
      {experiences.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Pengalaman</h3>
          <ul className="flex flex-col gap-4">
            {experiences.map((e) => (
              <li key={e.id} className="border-l-2 border-border pl-4">
                <p className="font-medium text-foreground">{e.title}</p>
                <p className="text-sm text-muted-foreground">{e.organization}</p>
                <p className="text-xs text-muted-foreground">
                  {fmtMonthYear(e.startDate)} – {e.endDate ? fmtMonthYear(e.endDate) : "Sekarang"}
                </p>
                {e.description && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/80">{e.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {skills.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <Badge key={s.id} variant="outline" className="gap-1.5">
                {s.skill.name}
                <span className="text-[10px] text-muted-foreground">{SKILL_LEVEL_LABEL[s.level]}</span>
              </Badge>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProjectsTab({ projects }: { projects: ProfileProject[] }) {
  if (projects.length === 0) {
    return <EmptyState icon={FolderCheck} heading="Belum Ada Proyek" message="Proyek yang diikuti akan muncul di sini." />;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {projects.map((p) => {
        const fp = flatProject(p);
        return (
          <Link
            key={fp.id}
            href={`/projects/${fp.id}`}
            className="group flex flex-col overflow-hidden rounded-[20px] border border-border bg-card transition-colors hover:border-[#8bc34a]"
          >
            <ProjectThumb title={fp.title} imageUrl={fp.imageUrl} className="h-28 w-full" />
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold leading-tight tracking-tight text-foreground">{fp.title}</p>
                <Badge
                  variant="outline"
                  className={cn("shrink-0 text-[11px]", PROJECT_STATUS_TINT[fp.status] ?? "")}
                >
                  {PROJECT_STATUS_LABEL[fp.status] ?? fp.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {fp.category.name}
                {fp.roleName ? ` · ${fp.roleName}` : ""}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function PortfolioTab({ artifacts }: { artifacts: ProfileOverview["artifacts"] }) {
  if (artifacts.length === 0) {
    return (
      <EmptyState
        icon={Award}
        heading="Belum Ada Sertifikat"
        message="Sertifikat terverifikasi dari proyek yang selesai akan tampil di sini."
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {artifacts.map((a) => (
        <article
          key={a.id}
          className="flex flex-col overflow-hidden rounded-[20px] border border-border bg-card"
        >
          <div className="relative">
            <ProjectThumb title={a.project.title} imageUrl={a.project.imageUrl} className="h-32 w-full" />
            <Badge className="absolute left-2 top-2 gap-1 border-emerald-300 bg-emerald-50 text-emerald-700" variant="outline">
              <ShieldCheck className="size-3" />
              Terverifikasi
            </Badge>
          </div>
          <div className="flex flex-1 flex-col gap-2 p-4">
            <Badge variant="outline" className="w-fit text-[11px]">{a.project.category.name}</Badge>
            <p className="font-semibold leading-tight tracking-tight text-foreground">{a.project.title}</p>
            <p className="text-xs text-muted-foreground">
              {a.artifactCode} · Diterbitkan {fmtDate(a.issuedAt)}
            </p>
            <a
              href={a.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex w-fit items-center gap-1 text-sm font-medium text-[#5f8c00] hover:underline"
            >
              Verifikasi <ExternalLink className="size-3.5" />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

function ReviewsTab({ reviews, loading }: { reviews: UserReview[] | null; loading: boolean }) {
  if (loading || reviews === null) {
    return <div className="h-32 animate-pulse rounded-[20px] bg-muted" />;
  }
  if (reviews.length === 0) {
    return <EmptyState icon={Star} heading="Belum Ada Ulasan" message="Ulasan dari mentor atau UMKM akan muncul di sini." />;
  }
  return (
    <div className="flex flex-col gap-3">
      {reviews.map((r) => (
        <article key={r.id} className="flex flex-col gap-2 rounded-[20px] border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <UserAvatar name={r.reviewer.name} className="size-9 text-sm" />
              <div>
                <p className="text-sm font-semibold text-foreground">{r.reviewer.name}</p>
                <p className="text-xs text-muted-foreground">{r.project.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn("size-4", i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
                />
              ))}
            </div>
          </div>
          {r.comment && <p className="whitespace-pre-wrap text-sm text-foreground/80">{r.comment}</p>}
          <p className="text-xs text-muted-foreground">{fmtDate(r.createdAt)}{r.isEdited ? " · disunting" : ""}</p>
        </article>
      ))}
    </div>
  );
}
