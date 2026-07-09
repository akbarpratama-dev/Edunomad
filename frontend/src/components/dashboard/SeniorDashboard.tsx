"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GraduationCap, FileSignature, Users, Award, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/common/LoadingState";
import { useAuthStore } from "@/stores/authStore";
import { projectApi, type ProjectListItem } from "@/services/projectApi";
import { artifactApi } from "@/services/artifactApi";
import {
  applicationApi,
  APPLICATION_STATUS_META,
  type SeniorApplicationMine,
} from "@/services/applicationApi";
import {
  Panel,
  StatCard,
  WelcomeHeader,
  CardHead,
  AgendaCard,
  ProjectMiniRow,
  ActivityCard,
  type AgendaItem,
} from "./dashboardKit";

export function SeniorDashboard() {
  const appUser = useAuthStore((s) => s.appUser)!;
  const [projects, setProjects] = useState<ProjectListItem[] | null>(null);
  const [apps, setApps] = useState<SeniorApplicationMine[]>([]);
  const [certCount, setCertCount] = useState(0);

  useEffect(() => {
    let active = true;
    projectApi
      .mentoredProjects()
      .then(async (p) => {
        if (!active) return;
        setProjects(p);
        // Issued certificates across finished/finishing mentored projects.
        const finished = p.filter(
          (x) => x.status === "COMPLETED" || x.status === "AWAITING_COMPLETION"
        );
        const lists = await Promise.all(
          finished.map((x) => artifactApi.listForProject(x.id).catch(() => []))
        );
        if (active) setCertCount(lists.reduce((sum, a) => sum + a.length, 0));
      })
      .catch(() => active && setProjects([]));
    applicationApi
      .mySeniorApplications()
      .then((a) => active && setApps(a))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const list = projects ?? [];
  const activeCount = list.filter((p) => p.status === "ACTIVE").length;
  const recruitingCount = list.filter((p) => p.status === "RECRUITING").length;
  const pendingApps = apps.filter((a) => a.status === "PENDING");
  // Students mentored = active members across the mentor's ACTIVE projects.
  const mentoredStudents = list
    .filter((p) => p.status === "ACTIVE")
    .reduce((sum, p) => sum + (p.projectMembers?.length ?? 0), 0);

  const agenda: AgendaItem[] = useMemo(
    () =>
      list
        .filter((p) => p.status === "ACTIVE")
        .map((p) => ({ date: new Date(p.deadline), title: `Deadline ${p.title}`, time: "23:59 WIB" }))
        .sort((a, b) => +a.date - +b.date),
    [list]
  );

  const firstName = appUser.name.split(/\s+/)[0];

  return (
    <div className="flex flex-col gap-6">
      <WelcomeHeader
        name={firstName}
        subtitle="Bimbing tim, tinjau hasil kerja, dan bantu mahasiswa tumbuh lewat proyek nyata."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={GraduationCap}
          tone="bg-[#eef7d6] text-[#5f8c00]"
          value={`${activeCount}/5`}
          label="Proyek Saya"
          trend={recruitingCount > 0 ? `${recruitingCount} dalam rekrutmen` : "Aktif"}
          trendTone="text-[#5f8c00]"
        />
        <StatCard
          icon={FileSignature}
          tone="bg-violet-100 text-violet-700"
          value={String(pendingApps.length)}
          label="Lamaran Mentor"
          trend="Menunggu keputusan UMKM"
          trendTone="text-amber-600"
        />
        <StatCard
          icon={Users}
          tone="bg-sky-100 text-sky-700"
          value={String(mentoredStudents)}
          label="Mahasiswa Dibimbing"
          trend={mentoredStudents > 0 ? "Di proyek aktif" : "Belum ada"}
          trendTone="text-[#5f8c00]"
        />
        <StatCard
          icon={Award}
          tone="bg-amber-100 text-amber-700"
          value={String(certCount)}
          label="Sertifikat Terbit"
          trend={certCount > 0 ? "Sudah diterbitkan" : "Terbit usai proyek selesai"}
          trendTone={certCount > 0 ? "text-[#5f8c00]" : "text-muted-foreground"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1.5fr_1.1fr_1fr]">
        {/* Proyek Saya */}
        <Panel className="app-reveal flex flex-col p-5">
          <CardHead title="Proyek Saya" />
          {projects === null ? (
            <div className="mt-4">
              <ListSkeleton rows={2} />
            </div>
          ) : list.length === 0 ? (
            <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
              <GraduationCap className="size-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-semibold">Belum Membimbing Proyek</p>
                <p className="mt-0.5 max-w-xs text-sm text-muted-foreground">
                  Lamar sebagai mentor pada proyek yang membutuhkan dan mulai membimbing tim.
                </p>
              </div>
              <Button render={<Link href="/projects" />}>
                <Search className="size-4" /> Cari Proyek
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3 divide-y divide-border [&>*:not(:first-child)]:pt-3">
              {list.map((p) => (
                <ProjectMiniRow
                  key={p.id}
                  project={p}
                  href={`/my-projects/${p.id}/workspace`}
                  subtitle={`Untuk ${p.umkm.name}`}
                />
              ))}
            </div>
          )}
        </Panel>

        <ActivityCard />

        <div className="flex flex-col gap-4">
          {/* Lamaran Mentor Saya (real) */}
          <Panel className="app-reveal p-5">
            <CardHead title="Lamaran Mentor Saya" />
            {apps.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Belum ada lamaran mentor.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {apps.slice(0, 4).map((a) => {
                  const meta = APPLICATION_STATUS_META[a.status];
                  return (
                    <li key={a.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.project.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{a.project.umkm.name}</p>
                      </div>
                      <Badge variant={meta.variant} className={meta.className}>
                        {meta.label}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <AgendaCard items={agenda} />
        </div>
      </div>
    </div>
  );
}
