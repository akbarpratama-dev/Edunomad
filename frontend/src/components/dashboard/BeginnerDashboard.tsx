"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, CheckCircle2, Award, Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ProjectThumb } from "@/components/artifact/shared";
import { useAuthStore } from "@/stores/authStore";
import { projectApi, type MyMembership } from "@/services/projectApi";
import { profileApi, type ProfileStats } from "@/services/profileApi";
import {
  applicationApi,
  APPLICATION_STATUS_META,
  type BeginnerApplicationMine,
} from "@/services/applicationApi";
import {
  Avatar,
  Panel,
  StatCard,
  WelcomeHeader,
  CardHead,
  AgendaCard,
  ActivityCard,
  NotifCard,
  type AgendaItem,
} from "./dashboardKit";

export function BeginnerDashboard() {
  const appUser = useAuthStore((s) => s.appUser)!;
  const [memberships, setMemberships] = useState<MyMembership[] | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [applications, setApplications] = useState<BeginnerApplicationMine[] | null>(null);

  useEffect(() => {
    let active = true;
    projectApi
      .myMemberships()
      .then((m) => active && setMemberships(m))
      .catch(() => active && setMemberships([]));
    profileApi
      .getOverview(appUser.id)
      .then((o) => active && setStats(o.stats))
      .catch(() => {});
    applicationApi
      .myApplications()
      .then((a) => active && setApplications(a))
      .catch(() => active && setApplications([]));
    return () => {
      active = false;
    };
  }, [appUser.id]);

  const activeProjects = useMemo(
    () => (memberships ?? []).filter((m) => m.project.status === "ACTIVE"),
    [memberships]
  );

  const agenda: AgendaItem[] = useMemo(
    () =>
      activeProjects
        .map((m) => ({
          date: new Date(m.project.deadline),
          title: `Deadline ${m.project.title}`,
          time: "23:59 WIB",
        }))
        .sort((a, b) => +a.date - +b.date),
    [activeProjects]
  );

  const firstName = appUser.name.split(/\s+/)[0];

  return (
    <div className="flex flex-col gap-6">
      <WelcomeHeader
        name={firstName}
        subtitle="Kelola proyek, kolaborasi dengan tim, dan bangun portofolio terbaikmu bersama EduNomad."
      />

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
          icon={CheckCircle2}
          tone="bg-violet-100 text-violet-700"
          value={stats ? String(stats.completedProjects) : "—"}
          label="Proyek Selesai"
          trend={stats && stats.completedProjects > 0 ? "Berkontribusi nyata" : "Belum ada"}
          trendTone="text-[#5f8c00]"
        />
        <StatCard
          icon={Award}
          tone="bg-sky-100 text-sky-700"
          value={stats ? String(stats.verifiedArtifacts) : "—"}
          label="Sertifikat"
          trend={stats && stats.verifiedArtifacts > 0 ? "Terverifikasi" : "Terbit usai proyek selesai"}
          trendTone={stats && stats.verifiedArtifacts > 0 ? "text-[#5f8c00]" : "text-muted-foreground"}
        />
        <StatCard
          icon={Star}
          tone="bg-amber-100 text-amber-700"
          value={stats && stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}
          label="Rata Ulasan"
          trend={stats && stats.reviewCount > 0 ? `${stats.reviewCount} ulasan diterima` : "Belum ada ulasan"}
          trendTone="text-[#5f8c00]"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1.5fr_1.1fr_1fr]">
        {/* Proyek Saya */}
        <Panel className="app-reveal flex flex-col p-5">
          <CardHead title="Proyek Saya" href="/my-projects" />
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

        <ActivityCard />

        <div className="flex flex-col gap-4">
          <NotifCard />
          <AgendaCard items={agenda} />
        </div>
      </div>

      {/* Lamaran Saya — status lamaran proyek (dulu halaman /applications). */}
      <Panel className="app-reveal flex flex-col p-5">
        <CardHead title="Lamaran Saya" />
        {applications === null ? (
          <div className="mt-4">
            <ListSkeleton rows={2} />
          </div>
        ) : applications.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border py-10 text-center">
            <p className="text-sm text-muted-foreground">
              Belum ada lamaran. Jelajahi proyek dan lamar peran yang cocok.
            </p>
            <Button className="mt-3" render={<Link href="/projects" />}>
              Cari Proyek
            </Button>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {applications.map((a) => {
              const meta = APPLICATION_STATUS_META[a.status];
              return (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                  <Link href={`/projects/${a.project.id}`} className="min-w-0 hover:opacity-80">
                    <p className="truncate font-medium tracking-tight">{a.project.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.projectRole.roleName} · {a.project.umkm.name}
                    </p>
                  </Link>
                  <Badge variant={meta.variant} className={meta.className}>
                    {meta.label}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function ProjectRow({ membership }: { membership: MyMembership }) {
  const p = membership.project;
  const team = p.projectMembers.map((m) => m.user.name);
  return (
    <Link
      href={`/my-projects/${p.id}/workspace`}
      className="group -m-2 flex flex-col gap-3 rounded-2xl p-2 transition-colors hover:bg-muted/50 sm:flex-row"
    >
      <ProjectThumb
        title={p.title}
        imageUrl={p.imageUrl ?? null}
        className="hidden h-24 w-36 shrink-0 rounded-xl sm:block"
      />
      <div className="min-w-0 flex-1">
        <Badge className="border-transparent bg-[#67c957]/15 text-[#3f7a2e]">Aktif</Badge>
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
    </Link>
  );
}
