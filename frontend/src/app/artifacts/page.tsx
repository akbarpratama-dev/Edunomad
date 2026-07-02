"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Box, ShieldCheck, Clock, Sparkles, Share2, GraduationCap, Users } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { PillTabs } from "@/components/common/PillTabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ProjectThumb, STATUS_META, ArtifactInfoDialog, StageRow } from "@/components/artifact/shared";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { artifactApi, type PipelineItem, type PipelineStatus } from "@/services/artifactApi";

type TabKey = "ALL" | PipelineStatus | "REJECTED";
const TABS: { key: TabKey; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: "VERIFIED", label: "Terverifikasi" },
  { key: "IN_PROGRESS", label: "Dalam Proses" },
  { key: "READY", label: "Siap Diterbitkan" },
  { key: "REJECTED", label: "Ditolak" },
];

function StatCard({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: typeof Box;
  tone: string;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="app-reveal rounded-[20px] border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tone}`}>
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tabular-nums tracking-tight">{value}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function Card({ item }: { item: PipelineItem }) {
  const meta = STATUS_META[item.status];
  return (
    <article className="app-reveal flex flex-col gap-4 rounded-[20px] border border-border bg-card p-4 sm:flex-row">
      <ProjectThumb
        title={item.projectTitle}
        imageUrl={item.projectImageUrl}
        className="h-32 w-full shrink-0 rounded-xl sm:h-auto sm:w-40"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Badge className={meta.badge}>{meta.label}</Badge>
        <h3 className="mt-2 font-bold tracking-tight text-foreground">{item.projectTitle}</h3>
        <p className="text-sm text-muted-foreground">Proyek: {item.projectTitle}</p>
        <p className="mt-1 line-clamp-2 text-sm text-foreground/80">{item.projectDescription}</p>
        {item.technologies.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.technologies.slice(0, 5).map((t) => (
              <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        )}
        {item.team.length > 0 && (
          <div className="mt-3 flex -space-x-2">
            {item.team.slice(0, 4).map((m) => (
              <UserAvatar key={m.id} name={m.name} className="size-7 text-[10px] font-bold ring-2 ring-card bg-[#d8f277] text-[#0b0b0b]" />
            ))}
            {item.team.length > 4 && (
              <span className="grid size-7 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground ring-2 ring-card">
                +{item.team.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col justify-between gap-3 border-t border-border pt-3 sm:w-48 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
        <div>
          {item.artifact ? (
            <>
              <p className="text-xs text-muted-foreground">Diverifikasi oleh</p>
              <div className="mt-1.5 flex items-center gap-2">
                <UserAvatar name={item.senior?.name ?? "?"} className="size-7 text-[10px] font-bold bg-muted" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.senior?.name ?? "—"}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#5f8c00]">
                    <GraduationCap className="size-3" /> Mentor
                  </span>
                </div>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                {new Date(item.artifact.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className={`mt-1 text-sm font-semibold ${meta.dot}`}>{meta.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">Mentor: {item.senior?.name ?? "—"}</p>
            </>
          )}
        </div>
        <Button variant="outline" size="sm" render={<Link href={`/artifacts/${item.projectId}`} />}>
          {item.artifact ? "Lihat Detail" : "Lihat Progress"}
        </Button>
      </div>
    </article>
  );
}

// Right sidebar: progress toward the next (first not-yet-verified) artifact.
function NextArtifactPanel({ items }: { items: PipelineItem[] }) {
  const next = items.find((i) => i.status !== "VERIFIED");
  return (
    <div className="app-reveal rounded-[20px] border border-border bg-card p-5">
      <h2 className="font-bold tracking-tight">Progres Menuju Artifact Berikutnya</h2>
      {next ? (
        <>
          <p className="mt-1 text-sm text-muted-foreground">
            Selesaikan langkah berikut untuk mendapatkan artifact terverifikasi selanjutnya.
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {next.projectTitle}
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {(() => {
              const firstTodo = next.stages.findIndex((s) => !s.done);
              return next.stages.map((s, i) => (
                <StageRow key={s.key} label={s.label} done={s.done} current={i === firstTodo} />
              ));
            })()}
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Semua kontribusimu sudah menjadi artifact terverifikasi. Kerja bagus! 🎉
        </p>
      )}
    </div>
  );
}

function Content() {
  const userId = useAuthStore((s) => s.appUser?.id);
  const [items, setItems] = useState<PipelineItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("ALL");
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    let active = true;
    artifactApi
      .pipeline()
      .then((p) => active && setItems(p))
      .catch((err) => active && setError(err instanceof ApiError ? err.message : "Gagal memuat artifact"));
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const s = { verified: 0, progress: 0, ready: 0 };
    (items ?? []).forEach((i) => {
      if (i.status === "VERIFIED") s.verified++;
      else if (i.status === "READY") s.ready++;
      else s.progress++;
    });
    return s;
  }, [items]);

  const visible = useMemo(() => {
    if (!items) return [];
    if (tab === "ALL") return items;
    if (tab === "REJECTED") return [];
    return items.filter((i) => i.status === tab);
  }, [items, tab]);

  if (error) return <ErrorState message={error} />;
  if (items === null) return <ListSkeleton rows={4} />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Artifact Saya"
        subtitle="Semua artifact terverifikasi dari proyek yang telah Anda kontribusikan. Dapat digunakan sebagai bukti pengalaman dan portofolio Anda."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              render={<Link href={userId ? `/portfolio/${userId}` : "/portfolio"} />}
            >
              <Share2 className="size-4" /> Bagikan Profil Portofolio
            </Button>
            <Button onClick={() => setInfoOpen(true)}>
              <Sparkles className="size-4" /> Lihat Cara Mendapatkan Artifact
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Box} tone="bg-[#eef7d6] text-[#5f8c00]" label="Total Artifact" value={stats.verified} sub="Sertifikat terverifikasi" />
        <StatCard icon={ShieldCheck} tone="bg-violet-100 text-violet-700" label="Terverifikasi" value={stats.verified} sub="Sudah diterbitkan" />
        <StatCard icon={Clock} tone="bg-sky-100 text-sky-700" label="Dalam Proses" value={stats.progress} sub="Menuju artifact" />
        <StatCard icon={Sparkles} tone="bg-amber-100 text-amber-700" label="Siap Diterbitkan" value={stats.ready} sub="Menunggu mentor menerbitkan" />
      </div>

      <PillTabs tabs={TABS} value={tab} onChange={(v) => setTab(v as TabKey)} ariaLabel="Filter status artifact" />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-3">
          {visible.length === 0 ? (
            <EmptyState
              icon={Box}
              heading={tab === "REJECTED" ? "Tidak Ada yang Ditolak" : "Belum Ada Artifact"}
              message={
                tab === "REJECTED"
                  ? "Tidak ada artifact yang ditolak."
                  : "Selesaikan kontribusi proyek untuk mulai mengumpulkan artifact terverifikasi."
              }
            />
          ) : (
            visible.map((i) => <Card key={i.projectId} item={i} />)
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <NextArtifactPanel items={items} />
          <div className="app-reveal rounded-[20px] border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-xl bg-[#eef7d6] text-[#5f8c00]">
                <Box className="size-4" />
              </span>
              <h2 className="font-bold tracking-tight">Apa itu Artifact?</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Artifact adalah bukti kontribusi nyata yang telah diverifikasi oleh mentor dan UMKM.
              Dapat digunakan untuk portofolio dan peluang kariermu.
            </p>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => setInfoOpen(true)}>
              Pelajari Lebih Lanjut
            </Button>
          </div>
          <div className="app-reveal flex items-center gap-2 rounded-[20px] border border-border bg-card p-4 text-sm text-muted-foreground">
            <Users className="size-4 shrink-0" /> Bagikan portofolio untuk memperkuat peluang kariermu.
          </div>
        </aside>
      </div>

      <ArtifactInfoDialog open={infoOpen} onOpenChange={setInfoOpen} />
    </div>
  );
}

export default function ArtifactsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <Content />
      </AppShell>
    </AuthGuard>
  );
}
