"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2, Download, FileText, ExternalLink, Building2, GraduationCap,
  CalendarDays, Clock, UserCog, Award, Users,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { PillTabs } from "@/components/common/PillTabs";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ProfileLink } from "@/components/common/ProfileLink";
import { StarRating } from "@/components/review/StarRating";
import { ProjectThumb, STATUS_META, StageRow } from "@/components/artifact/shared";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { PROJECT_STATUS_META } from "@/services/projectApi";
import { artifactApi, type PipelineDetail } from "@/services/artifactApi";

type TabKey = "detail" | "verification" | "feedback" | "activity";
const TABS: { key: TabKey; label: string }[] = [
  { key: "detail", label: "Detail Sertifikat" },
  { key: "verification", label: "Proses Verifikasi" },
  { key: "feedback", label: "Feedback Mentor" },
  { key: "activity", label: "Riwayat Aktivitas" },
];

function MetaCard({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-border bg-card p-4">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—";
}

function Content() {
  const params = useParams<{ projectId: string }>();
  const userId = useAuthStore((s) => s.appUser?.id);
  const [d, setD] = useState<PipelineDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("detail");

  useEffect(() => {
    let active = true;
    artifactApi
      .pipelineDetail(params.projectId)
      .then((r) => active && setD(r))
      .catch((err) => active && setError(err instanceof ApiError ? err.message : "Gagal memuat detail"));
    return () => {
      active = false;
    };
  }, [params.projectId]);

  const duration = useMemo(() => {
    if (!d) return "—";
    const end = d.project.completedAt ?? d.project.deadline;
    const weeks = Math.max(1, Math.round((new Date(end).getTime() - new Date(d.project.startDate).getTime()) / (7 * 86_400_000)));
    return `${weeks} Minggu`;
  }, [d]);

  if (error) return <ErrorState message={error} />;
  if (!d) return <ListSkeleton rows={6} />;

  const meta = STATUS_META[d.status];
  const projMeta = PROJECT_STATUS_META[d.project.status as keyof typeof PROJECT_STATUS_META];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      {/* Header */}
      <div className="app-reveal grid gap-5 lg:grid-cols-[1fr_360px]">
        <div>
          <Badge className={meta.badge}>{meta.label}</Badge>
          <h1 className="mt-2 text-h1 tracking-tight text-balance">
            {d.artifact ? `${d.project.title} — Sertifikat` : d.project.title}
          </h1>
          <p className="mt-1.5 text-body-lg text-muted-foreground">Proyek: {d.project.title}</p>
          <p className="mt-2 max-w-2xl text-sm text-foreground/80">{d.project.description}</p>
          {d.technologies.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {d.technologies.map((t) => (
                <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{t}</span>
              ))}
            </div>
          )}
        </div>
        <ProjectThumb title={d.project.title} imageUrl={d.project.imageUrl} className="h-48 w-full rounded-[20px] lg:h-full" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="flex min-w-0 flex-col gap-4">
          <PillTabs tabs={TABS} value={tab} onChange={(v) => setTab(v as TabKey)} ariaLabel="Navigasi detail sertifikat" />

          {tab === "detail" && (
            <div className="flex flex-col gap-4">
              <section className="rounded-[20px] border border-border bg-card p-5">
                <h2 className="font-bold tracking-tight">Tentang Sertifikat</h2>
                <p className="mt-1.5 text-sm text-foreground/80">
                  {d.contributionSummary ?? "Ringkasan kontribusi belum tersedia."}
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetaCard icon={UserCog} label="Peran Saya" value={d.roleName ?? "—"} />
                  <MetaCard icon={CheckCircle2} label="Kontribusi" value={d.contributionApproved ? "Disetujui" : "Dalam Proses"} />
                  <MetaCard icon={CalendarDays} label="Tanggal Selesai" value={fmt(d.project.completedAt ?? d.project.deadline)} />
                  <MetaCard icon={Clock} label="Durasi Pengerjaan" value={duration} />
                </div>
              </section>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-[20px] border border-border bg-card p-5">
                  <h2 className="font-bold tracking-tight">Kontribusi dan Pencapaian</h2>
                  {d.achievements.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Belum ada rincian kontribusi.</p>
                  ) : (
                    <ul className="mt-3 flex flex-col gap-2.5">
                      {d.achievements.map((a, i) => (
                        <li key={i} className="flex gap-2.5 text-sm">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#5f8c00]" />
                          <span className="text-foreground/85">{a}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="rounded-[20px] border border-border bg-card p-5">
                  <h2 className="font-bold tracking-tight">Hasil Kerja</h2>
                  {d.deliverables.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Belum ada hasil kerja.</p>
                  ) : (
                    <ul className="mt-3 flex flex-col gap-2.5">
                      {d.deliverables.map((dl) => {
                        const link = dl.evidences.find((e) => e.url)?.url ?? null;
                        return (
                          <li key={dl.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700">
                              <FileText className="size-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{dl.title}</p>
                              <p className="text-xs text-muted-foreground">{dl.status}</p>
                            </div>
                            {link && (
                              <Button size="sm" variant="outline" render={<Link href={link} target="_blank" rel="noopener noreferrer" />}>
                                {/^https?:/.test(link) ? <ExternalLink className="size-3.5" /> : <Download className="size-3.5" />}
                              </Button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </div>

              {d.technologies.length > 0 && (
                <section className="rounded-[20px] border border-border bg-card p-5">
                  <h2 className="font-bold tracking-tight">Teknologi yang Digunakan</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {d.technologies.map((t) => (
                      <span key={t} className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium">{t}</span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {tab === "verification" && (
            <section className="rounded-[20px] border border-border bg-card p-5">
              <h2 className="font-bold tracking-tight">Proses Verifikasi</h2>
              <p className="mt-1 text-sm text-muted-foreground">Tahapan verifikasi sertifikat oleh mentor dan UMKM.</p>
              <div className="mt-4 flex flex-col gap-4">
                {(() => {
                  const firstTodo = d.timeline.findIndex((s) => !s.done);
                  return d.timeline.map((s, i) => (
                    <StageRow key={s.key} label={s.label} done={s.done} current={i === firstTodo} meta={s.by} date={s.at} />
                  ));
                })()}
              </div>
            </section>
          )}

          {tab === "feedback" && (
            <section className="rounded-[20px] border border-border bg-card p-5">
              <h2 className="font-bold tracking-tight">Feedback Mentor</h2>
              {d.seniorReview ? (
                <div className="mt-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={d.seniorReview.reviewerName} className="size-9 bg-muted text-xs font-bold" />
                    <div>
                      <p className="text-sm font-semibold">{d.seniorReview.reviewerName}</p>
                      <p className="text-xs text-muted-foreground">Mentor · {fmt(d.seniorReview.createdAt)}</p>
                    </div>
                  </div>
                  <div className="mt-2"><StarRating value={d.seniorReview.rating} /></div>
                  {d.seniorReview.comment && (
                    <p className="mt-3 rounded-xl bg-[#eef7d6]/60 p-3 text-sm text-foreground/90">{d.seniorReview.comment}</p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">Belum ada feedback dari mentor.</p>
              )}
            </section>
          )}

          {tab === "activity" && (
            <section className="rounded-[20px] border border-border bg-card p-5">
              <h2 className="font-bold tracking-tight">Riwayat Aktivitas</h2>
              <ol className="mt-4 flex flex-col gap-4">
                {d.timeline.filter((t) => t.done && t.at).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
                ) : (
                  d.timeline
                    .filter((t) => t.done && t.at)
                    .map((t) => (
                      <li key={t.key} className="flex gap-3">
                        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#eef7d6] text-[#5f8c00]">
                          <CheckCircle2 className="size-4" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">{t.label}{t.by ? ` · ${t.by}` : ""}</p>
                          <p className="text-xs text-muted-foreground tabular-nums">{fmt(t.at)}</p>
                        </div>
                      </li>
                    ))
                )}
              </ol>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4">
          <div className="app-reveal rounded-[20px] border border-border bg-card p-5">
            <h2 className="font-bold tracking-tight">Progres Verifikasi</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tahapan verifikasi sertifikat oleh mentor dan UMKM.</p>
            <div className="mt-4 flex flex-col gap-4">
              {(() => {
                const firstTodo = d.timeline.findIndex((s) => !s.done);
                return d.timeline.map((s, i) => (
                  <StageRow key={s.key} label={s.label} done={s.done} current={i === firstTodo} meta={s.by} date={s.at} />
                ));
              })()}
            </div>
            <Button className="mt-4 w-full" render={<Link href="/profile" />}>
              <Award className="size-4" /> Lihat di Profil
            </Button>
          </div>

          <div className="app-reveal rounded-[20px] border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <h2 className="font-bold tracking-tight">Informasi Proyek</h2>
              {projMeta && <Badge variant={projMeta.variant} className={projMeta.className}>{projMeta.label}</Badge>}
            </div>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <div className="flex items-center gap-2"><Building2 className="size-4 text-muted-foreground" /> <span className="text-muted-foreground">UMKM:</span> <span className="font-medium">{d.umkm?.name ?? "—"}</span></div>
              <div className="flex items-center gap-2"><GraduationCap className="size-4 text-muted-foreground" /> <span className="text-muted-foreground">Mentor:</span> <span className="font-medium">{d.senior?.name ?? "—"}</span></div>
              <div className="flex items-center gap-2"><CalendarDays className="size-4 text-muted-foreground" /> <span className="text-muted-foreground">Periode:</span> <span className="font-medium tabular-nums">{fmt(d.project.startDate)} – {fmt(d.project.completedAt ?? d.project.deadline)}</span></div>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full" render={<Link href={`/projects/${d.project.id}`} />}>
              Lihat Detail Proyek
            </Button>
          </div>
        </aside>
      </div>

      {/* Team */}
      <section className="app-reveal rounded-[20px] border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold tracking-tight">Tim Proyek</h2>
        </div>
        {d.team.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Belum ada anggota.</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-4">
            {d.team.map((m) => (
              <ProfileLink key={m.id} userId={m.id} className="flex items-center gap-2.5 hover:no-underline">
                <UserAvatar name={m.name} className="size-9 bg-[#d8f277] text-[#0b0b0b] text-xs font-bold" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium hover:text-[#5f8c00]">
                    {m.name}
                    {m.id === userId && <span className="ml-1 rounded bg-[#eef7d6] px-1.5 py-0.5 text-[10px] font-semibold text-[#5f8c00]">Anda</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{m.roleName ?? "Anggota"}</p>
                </div>
              </ProfileLink>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ArtifactDetailPage() {
  return (
    <AuthGuard>
      <AppShell backHref="/artifacts">
        <Content />
      </AppShell>
    </AuthGuard>
  );
}
