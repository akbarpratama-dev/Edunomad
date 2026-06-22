"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/authStore";
import type { AccountStatus } from "@/types/user";

const STATUS_BANNER: Record<
  AccountStatus,
  { variant: "default" | "warning" | "success" | "destructive"; icon: typeof Clock; title: string; desc: string }
> = {
  PENDING_VERIFICATION: {
    variant: "warning",
    icon: Clock,
    title: "Menunggu Verifikasi",
    desc: "Akun Anda sedang ditinjau admin. Sementara menunggu, Anda dapat melengkapi profil, menambah keahlian, dan menjelajahi proyek.",
  },
  VERIFIED: {
    variant: "success",
    icon: CheckCircle2,
    title: "Akun Terverifikasi",
    desc: "Akun Anda telah terverifikasi. Anda memiliki akses penuh sesuai peran Anda.",
  },
  REJECTED: {
    variant: "destructive",
    icon: XCircle,
    title: "Verifikasi Ditolak",
    desc: "Verifikasi akun Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.",
  },
  SUSPENDED: {
    variant: "destructive",
    icon: Ban,
    title: "Akun Ditangguhkan",
    desc: "Akun Anda telah ditangguhkan dan tidak dapat mengakses fitur platform.",
  },
};

function DashboardContent() {
  const router = useRouter();
  const appUser = useAuthStore((s) => s.appUser)!;

  // Admins use the dedicated admin dashboard.
  useEffect(() => {
    if (appUser.role === "ADMIN") router.replace("/admin/dashboard");
  }, [appUser.role, router]);

  const banner = STATUS_BANNER[appUser.status];
  const Icon = banner.icon;

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-h1 text-neutral-dark">Halo, {appUser.name} 👋</h1>
          <p className="text-body text-neutral-gray">
            Peran: {appUser.role} · Status: {appUser.status.replace("_", " ")}
          </p>
        </div>

        <Alert variant={banner.variant}>
          <Icon />
          <AlertTitle>{banner.title}</AlertTitle>
          <AlertDescription>{banner.desc}</AlertDescription>
        </Alert>
      </div>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
