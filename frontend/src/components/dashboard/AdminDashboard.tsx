"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Briefcase, ShieldCheck, ClipboardCheck, ScrollText, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/common/LoadingState";
import { useAuthStore } from "@/stores/authStore";
import { adminApi, type DashboardStats, type VerificationRequestItem } from "@/services/adminApi";
import { projectApi, type ProjectListItem } from "@/services/projectApi";
import { Panel, StatCard, WelcomeHeader, CardHead, Avatar } from "./dashboardKit";

const ROLE_LABEL: Record<string, string> = {
  BEGINNER: "Mahasiswa",
  SENIOR: "Mentor",
  UMKM: "UMKM",
  ADMIN: "Admin",
};

function humanize(s: string) {
  return s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export function AdminDashboard() {
  const appUser = useAuthStore((s) => s.appUser)!;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [verifs, setVerifs] = useState<VerificationRequestItem[]>([]);
  const [verifTotal, setVerifTotal] = useState(0);
  const [pendingProjects, setPendingProjects] = useState<ProjectListItem[]>([]);

  useEffect(() => {
    let active = true;
    adminApi.dashboard().then((s) => active && setStats(s)).catch(() => active && setStats(null));
    adminApi
      .listVerifications("PENDING", 1, 5)
      .then((r) => {
        if (!active) return;
        setVerifs(r.data);
        setVerifTotal(r.meta.total);
      })
      .catch(() => {});
    projectApi
      .pending(1, 5)
      .then((r) => active && setPendingProjects(r.data))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const firstName = appUser.name.split(/\s+/)[0];
  const u = stats?.users.byStatus ?? {};
  const p = stats?.projects.byStatus ?? {};

  return (
    <div className="flex flex-col gap-6">
      <WelcomeHeader
        name={firstName}
        subtitle="Pantau kesehatan platform, verifikasi pengguna, dan tinjau proyek yang masuk."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          tone="bg-[#eef7d6] text-[#5f8c00]"
          value={String(stats?.users.total ?? 0)}
          label="Total Pengguna"
          trend={`${u.VERIFIED ?? 0} terverifikasi`}
          trendTone="text-[#5f8c00]"
        />
        <StatCard
          icon={Briefcase}
          tone="bg-sky-100 text-sky-700"
          value={String(p.ACTIVE ?? 0)}
          label="Proyek Aktif"
          trend={`${stats?.projects.total ?? 0} total proyek`}
          trendTone="text-muted-foreground"
        />
        <StatCard
          icon={ShieldCheck}
          tone="bg-amber-100 text-amber-700"
          value={String(verifTotal)}
          label="Verifikasi Pending"
          trend="Perlu ditinjau"
          trendTone="text-amber-600"
        />
        <StatCard
          icon={ClipboardCheck}
          tone="bg-violet-100 text-violet-700"
          value={String(p.PENDING_REVIEW ?? 0)}
          label="Tinjau Proyek"
          trend="Menunggu persetujuan"
          trendTone="text-amber-600"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1.2fr_1.2fr_1.1fr]">
        {/* Antrian Verifikasi (real) */}
        <Panel className="app-reveal flex flex-col p-5">
          <CardHead title="Antrian Verifikasi" href="/admin/users/verification" />
          {stats === null ? (
            <div className="mt-4">
              <ListSkeleton rows={2} />
            </div>
          ) : verifs.length === 0 ? (
            <p className="mt-4 flex-1 text-sm text-muted-foreground">
              Tidak ada permintaan verifikasi yang menunggu. 🎉
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {verifs.map((v, i) => (
                <li key={v.id} className="flex items-center gap-3">
                  <Avatar name={v.user.name} i={i} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{v.user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{v.user.email}</p>
                  </div>
                  <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                    {ROLE_LABEL[v.user.role] ?? v.user.role}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Antrian Tinjau Proyek (real) */}
        <Panel className="app-reveal flex flex-col p-5">
          <CardHead title="Tinjau Proyek" href="/admin/projects/review" />
          {stats === null ? (
            <div className="mt-4">
              <ListSkeleton rows={2} />
            </div>
          ) : pendingProjects.length === 0 ? (
            <p className="mt-4 flex-1 text-sm text-muted-foreground">
              Tidak ada proyek yang menunggu tinjauan.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingProjects.map((pr) => (
                <li key={pr.id} className="min-w-0">
                  <Link
                    href="/admin/projects/review"
                    className="group -m-2 block rounded-xl p-2 transition-colors hover:bg-muted/50"
                  >
                    <p className="truncate text-sm font-medium">{pr.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {pr.umkm.name} · {pr.category.name}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Aktivitas / Audit (real) */}
        <Panel className="app-reveal flex flex-col p-5">
          <CardHead title="Aktivitas Terbaru" href="/admin/audit-logs" />
          {stats === null ? (
            <div className="mt-4">
              <ListSkeleton rows={3} />
            </div>
          ) : stats.recentActivities.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Belum ada aktivitas.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {stats.recentActivities.slice(0, 6).map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                    <ScrollText className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold">{humanize(a.action)}</span>{" "}
                      <span className="text-muted-foreground">· {humanize(a.entityType)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.user?.name ?? "Sistem"} · {new Date(a.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/audit-logs"
            className="mt-4 inline-flex items-center justify-center gap-1 rounded-2xl border border-border py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Buka Audit Logs <ArrowRight className="size-3.5" />
          </Link>
        </Panel>
      </div>
    </div>
  );
}
