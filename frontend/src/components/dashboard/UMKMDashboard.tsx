"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, Users, FileSignature, Award, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/common/LoadingState";
import { useAuthStore } from "@/stores/authStore";
import { projectApi, type ProjectListItem } from "@/services/projectApi";
import {
  Panel,
  StatCard,
  WelcomeHeader,
  CardHead,
  AgendaCard,
  ProjectMiniRow,
  PlaceholderActivityCard,
  PlaceholderNotifCard,
  type AgendaItem,
} from "./dashboardKit";

export function UMKMDashboard() {
  const appUser = useAuthStore((s) => s.appUser)!;
  const [projects, setProjects] = useState<ProjectListItem[] | null>(null);

  useEffect(() => {
    let active = true;
    projectApi
      .myProjects({ limit: 100 })
      .then((r) => active && setProjects(r.data))
      .catch(() => active && setProjects([]));
    return () => {
      active = false;
    };
  }, []);

  const list = projects ?? [];
  const activeCount = list.filter((p) => p.status === "ACTIVE").length;
  const recruitingCount = list.filter((p) => p.status === "RECRUITING").length;

  const agenda: AgendaItem[] = useMemo(
    () =>
      list
        .filter((p) => p.status === "ACTIVE" || p.status === "AWAITING_COMPLETION")
        .map((p) => ({ date: new Date(p.deadline), title: `Deadline ${p.title}`, time: "23:59 WIB" }))
        .sort((a, b) => +a.date - +b.date),
    [list]
  );

  const firstName = appUser.name.split(/\s+/)[0];

  return (
    <div className="flex flex-col gap-6">
      <WelcomeHeader
        name={firstName}
        subtitle="Kelola proyek, rekrut tim, dan pantau progres kolaborasi bersama mentor dan mahasiswa."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Briefcase}
          tone="bg-[#eef7d6] text-[#5f8c00]"
          value={`${activeCount}/5`}
          label="Proyek Aktif"
          trend={activeCount > 0 ? "Sedang berjalan" : "Belum ada"}
          trendTone="text-[#5f8c00]"
        />
        <StatCard
          icon={Users}
          tone="bg-violet-100 text-violet-700"
          value={String(recruitingCount)}
          label="Sedang Rekrutmen"
          trend="Membuka lowongan tim"
          trendTone="text-amber-600"
        />
        <StatCard
          icon={FileSignature}
          tone="bg-sky-100 text-sky-700"
          value="4"
          label="Lamaran Senior"
          trend="Perlu ditinjau"
          trendTone="text-amber-600"
          sample
        />
        <StatCard
          icon={Award}
          tone="bg-amber-100 text-amber-700"
          value="0"
          label="Sertifikat Terbit"
          trend="Terbit usai proyek selesai"
          trendTone="text-muted-foreground"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1.5fr_1.1fr_1fr]">
        {/* Proyek Saya */}
        <Panel className="app-reveal flex flex-col p-5">
          <CardHead title="Proyek Saya" href="/my-projects" />
          {projects === null ? (
            <div className="mt-4">
              <ListSkeleton rows={2} />
            </div>
          ) : list.length === 0 ? (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
              <Briefcase className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">Belum Ada Proyek</p>
                <p className="mt-0.5 max-w-xs text-sm text-muted-foreground">
                  Publikasikan kebutuhan proyek UMKM-mu dan mulai rekrut tim.
                </p>
              </div>
              <Button render={<Link href="/projects/create" />}>
                <Plus className="size-4" /> Buat Proyek
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3 divide-y divide-border [&>*:not(:first-child)]:pt-3">
              {list.slice(0, 5).map((p) => (
                <ProjectMiniRow
                  key={p.id}
                  project={p}
                  href={`/projects/${p.id}`}
                  subtitle={p.category.name}
                />
              ))}
            </div>
          )}
          <Link
            href="/projects/create"
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-muted/60 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="size-4" /> Buat proyek baru
          </Link>
        </Panel>

        <PlaceholderActivityCard />

        <div className="flex flex-col gap-4">
          <PlaceholderNotifCard />
          <AgendaCard items={agenda} />
        </div>
      </div>
    </div>
  );
}
