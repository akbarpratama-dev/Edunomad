"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, ClipboardCheck, Award, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/common/LoadingState";
import { useAuthStore } from "@/stores/authStore";
import { projectApi, type MyMembership } from "@/services/projectApi";
import {
  Avatar,
  Panel,
  StatCard,
  WelcomeHeader,
  CardHead,
  AgendaCard,
  PlaceholderActivityCard,
  PlaceholderNotifCard,
  type AgendaItem,
} from "./dashboardKit";

export function BeginnerDashboard() {
  const appUser = useAuthStore((s) => s.appUser)!;
  const [memberships, setMemberships] = useState<MyMembership[] | null>(null);

  useEffect(() => {
    let active = true;
    projectApi
      .myMemberships()
      .then((m) => active && setMemberships(m))
      .catch(() => active && setMemberships([]));
    return () => {
      active = false;
    };
  }, []);

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
          icon={ClipboardCheck}
          tone="bg-violet-100 text-violet-700"
          value="5"
          label="Tugas Berjalan"
          trend="2 mendekati deadline"
          trendTone="text-amber-600"
          sample
        />
        <StatCard
          icon={Award}
          tone="bg-sky-100 text-sky-700"
          value="0"
          label="Artifact"
          trend="Terbit usai proyek selesai"
          trendTone="text-muted-foreground"
        />
        <StatCard
          icon={Users}
          tone="bg-amber-100 text-amber-700"
          value="8"
          label="Diskusi Baru"
          trend="3 hari ini"
          trendTone="text-[#5f8c00]"
          sample
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

        <PlaceholderActivityCard />

        <div className="flex flex-col gap-4">
          <PlaceholderNotifCard />
          <AgendaCard items={agenda} />
        </div>
      </div>
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
      <div className="relative hidden h-24 w-36 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#201f31] to-[#3a3850] sm:block">
        <div className="absolute inset-2 rounded-md bg-white/5" />
        <div className="absolute left-3 top-3 h-1.5 w-10 rounded-full bg-[#d8f277]/70" />
        <div className="absolute bottom-3 left-3 right-3 h-6 rounded-md bg-[#d8f277]/25" />
      </div>
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
