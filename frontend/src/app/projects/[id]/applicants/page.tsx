"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Inbox, Sparkles, ArrowUpDown, RefreshCw } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { PillTabs } from "@/components/common/PillTabs";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ProfileLink } from "@/components/common/ProfileLink";
import { MatchScoreBadge } from "@/components/ai/MatchScoreBadge";
import { AiUnavailable } from "@/components/ai/AiUnavailable";
import { ApiError } from "@/lib/apiClient";
import { projectApi, type ProjectDetail } from "@/services/projectApi";
import {
  applicationApi,
  APPLICATION_STATUS_META,
  type ApplicationStatus,
  type BeginnerApplicant,
} from "@/services/applicationApi";
import { aiApi, type AiResult, type ApplicantRanking, type ApplicantRankingRow } from "@/services/aiApi";

type TabKey = ApplicationStatus;
const TAB_DEFS: { key: TabKey; label: string }[] = [
  { key: "PENDING", label: "Menunggu" },
  { key: "ACCEPTED", label: "Diterima" },
  { key: "REJECTED", label: "Ditolak" },
  { key: "WITHDRAWN", label: "Ditarik" },
];

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = APPLICATION_STATUS_META[status];
  return (
    <Badge variant={meta.variant} className={meta.className}>
      {meta.label}
    </Badge>
  );
}

function Content() {
  const { id } = useParams<{ id: string }>();
  const pathname = usePathname();
  const base = pathname.startsWith("/my-projects") ? "/my-projects" : "/projects";
  const [tab, setTab] = useState<TabKey>("PENDING");
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [items, setItems] = useState<BeginnerApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // AI ranking (D-AI-1) — fetched separately so it never blocks the applicant
  // list; failure only affects the badges, not the page.
  const [rank, setRank] = useState<AiResult<ApplicantRanking> | null>(null);
  const [rankLoading, setRankLoading] = useState(false);
  const [sortByMatch, setSortByMatch] = useState(false);

  const loadRanking = useCallback(
    (regenerate?: boolean) => {
      setRankLoading(true);
      aiApi
        .applicantRanking(id, regenerate)
        .then(setRank)
        .catch(() => setRank({ available: false, reason: "Gagal memuat peringkat AI." }))
        .finally(() => setRankLoading(false));
    },
    [id]
  );

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([projectApi.detail(id), applicationApi.projectApplications(id)])
      .then(([p, apps]) => {
        setProject(p);
        setItems(apps);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [id]);
  useEffect(load, [load]);
  useEffect(() => loadRanking(), [loadRanking]);

  const rankMap = useMemo(() => {
    const m = new Map<string, ApplicantRankingRow>();
    if (rank?.available) rank.data.rankings.forEach((r) => m.set(r.applicationId, r));
    return m;
  }, [rank]);

  const decide = async (app: BeginnerApplicant, action: "accept" | "reject") => {
    setBusyId(app.id);
    try {
      if (action === "accept") {
        await applicationApi.acceptApplication(app.id);
        toast.success(`${app.beginner.name} diterima ke tim`);
      } else {
        await applicationApi.rejectApplication(app.id);
        toast.success("Lamaran ditolak");
      }
      load();
      loadRanking(); // pending set changed → refresh scores
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal memproses lamaran");
    } finally {
      setBusyId(null);
    }
  };

  const visible = useMemo(() => {
    const rows = items.filter((a) => a.status === tab);
    if (tab === "PENDING" && sortByMatch) {
      return [...rows].sort(
        (a, b) => (rankMap.get(b.id)?.score ?? -1) - (rankMap.get(a.id)?.score ?? -1)
      );
    }
    return rows;
  }, [items, tab, sortByMatch, rankMap]);
  const showAiControls = tab === "PENDING" && items.some((a) => a.status === "PENDING");
  const tabs = TAB_DEFS.map((t) => ({
    ...t,
    count: items.filter((a) => a.status === t.key).length,
  }));

  return (
    <AppShell backHref={`${base}/${id}`}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <PageHeader
          title="Pelamar Beginner"
          subtitle={project ? project.title : "Kelola lamaran beginner untuk proyek ini."}
        />

        <PillTabs tabs={tabs} value={tab} onChange={setTab} ariaLabel="Filter status pelamar" />

        {/* AI ranking controls — PENDING tab only (D-AI-1) */}
        {showAiControls && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={sortByMatch ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                disabled={!rank?.available}
                onClick={() => setSortByMatch((v) => !v)}
              >
                <ArrowUpDown className="size-4" />
                Urutkan berdasarkan kecocokan AI
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                disabled={rankLoading}
                onClick={() => loadRanking(true)}
              >
                <RefreshCw className={"size-3.5 " + (rankLoading ? "animate-spin" : "")} /> Perbarui peringkat
              </Button>
              {rankLoading && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5 animate-pulse" /> AI menilai pelamar…
                </span>
              )}
            </div>
            {rank && !rank.available && <AiUnavailable compact reason={rank.reason} onRetry={() => loadRanking(true)} />}
          </div>
        )}

        {loading ? (
          <ListSkeleton rows={4} />
        ) : error ? (
          <ErrorState message={error} onAction={load} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Inbox}
            heading="Belum Ada Pelamar"
            message="Belum ada beginner pada status ini."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((app, i) => {
              const r = app.status === "PENDING" ? rankMap.get(app.id) : undefined;
              return (
              <article
                key={app.id}
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                className="app-reveal flex flex-col gap-3 rounded-[20px] border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <ProfileLink userId={app.beginner.id} className="flex min-w-0 items-start gap-3 hover:no-underline">
                    <UserAvatar
                      name={app.beginner.name}
                      className="size-11 shrink-0 bg-sky-200 text-sm font-bold text-sky-900"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold tracking-tight text-foreground hover:text-[#5f8c00]">{app.beginner.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Peran: {app.projectRole.roleName}
                        {app.beginner.profile?.headline ? ` · ${app.beginner.profile.headline}` : ""}
                      </p>
                    </div>
                  </ProfileLink>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <StatusBadge status={app.status} />
                    {r && <MatchScoreBadge score={r.score} reason={r.reason} />}
                  </div>
                </div>
                {r && (r.reason || r.matchedSkills.length > 0 || r.missingSkills.length > 0) && (
                  <div className="rounded-xl border border-[#cfe89a] bg-[#f6fbe8]/60 p-3">
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#5f8c00]">
                      <Sparkles className="size-3.5" /> Analisis AI
                    </div>
                    {r.reason && <p className="text-sm text-foreground/85">{r.reason}</p>}
                    {(r.matchedSkills.length > 0 || r.missingSkills.length > 0) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {r.matchedSkills.map((s) => (
                          <Badge key={"m" + s} variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                            ✓ {s}
                          </Badge>
                        ))}
                        {r.missingSkills.map((s) => (
                          <Badge key={"x" + s} variant="outline" className="text-muted-foreground">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {app.beginner.userSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {app.beginner.userSkills.map((us) => (
                      <Badge key={us.skill.id} variant="secondary">
                        {us.skill.name}
                      </Badge>
                    ))}
                  </div>
                )}
                {app.motivation && (
                  <p className="whitespace-pre-wrap rounded-xl bg-muted/50 px-3.5 py-2.5 text-sm text-foreground/80">
                    &ldquo;{app.motivation}&rdquo;
                  </p>
                )}
                {app.status === "PENDING" && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" disabled={busyId === app.id} onClick={() => decide(app, "accept")}>
                      Terima
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === app.id}
                      onClick={() => decide(app, "reject")}
                    >
                      Tolak
                    </Button>
                  </div>
                )}
              </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function BeginnerApplicantsPage() {
  return (
    <AuthGuard allowedRoles={["SENIOR"]}>
      <Content />
    </AuthGuard>
  );
}
