"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, FolderKanban, Award, ShieldCheck, ScrollText } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { adminApi, type DashboardStats } from "@/services/adminApi";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="pt-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function Content() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(false);
    adminApi
      .dashboard()
      .then(setStats)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  return (
    <AppShell breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button render={<Link href="/admin/users/verification" />}>
              <ShieldCheck className="size-4" /> Verifikasi
            </Button>
            <Button variant="outline" render={<Link href="/admin/audit-logs" />}>
              <ScrollText className="size-4" /> Audit Logs
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <ErrorState message="Gagal memuat statistik" onAction={load} />
        ) : stats ? (
          <>
            <section className="flex flex-col gap-2">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Users className="size-4" /> Pengguna ({stats.users.total})
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard label="Pending" value={stats.users.byStatus.PENDING_VERIFICATION ?? 0} />
                <StatCard label="Verified" value={stats.users.byStatus.VERIFIED ?? 0} />
                <StatCard label="Rejected" value={stats.users.byStatus.REJECTED ?? 0} />
                <StatCard label="Suspended" value={stats.users.byStatus.SUSPENDED ?? 0} />
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <FolderKanban className="size-4" /> Proyek ({stats.projects.total})
              </h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard label="Total Proyek" value={stats.projects.total} />
                <StatCard label="Active" value={stats.projects.byStatus.ACTIVE ?? 0} />
                <StatCard label="Pending Review" value={stats.projects.byStatus.PENDING_REVIEW ?? 0} />
                <StatCard label="Sertifikat" value={stats.artifacts} />
              </div>
            </section>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="size-4" /> Aktivitas Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {stats.recentActivities.map((a) => (
                      <li key={a.id} className="flex justify-between text-sm">
                        <span className="text-foreground">
                          {a.action} · {a.entityType}
                        </span>
                        <span className="text-muted-foreground">
                          {a.user?.name} · {new Date(a.createdAt).toLocaleString("id-ID")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <Content />
    </AuthGuard>
  );
}
