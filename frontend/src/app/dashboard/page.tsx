"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  ArrowRight,
  FolderKanban,
  FolderPlus,
  FileSignature,
  Award,
  type LucideIcon,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/authStore";
import type { AccountStatus, Role } from "@/types/user";

const STATUS_BANNER: Record<
  AccountStatus,
  { variant: "default" | "warning" | "success" | "destructive"; icon: LucideIcon; title: string; desc: string }
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

const ROLE_LABEL: Record<Role, string> = {
  BEGINNER: "Mahasiswa",
  SENIOR: "Mentor",
  UMKM: "UMKM",
  ADMIN: "Admin",
};

interface QuickAction {
  label: string;
  desc: string;
  href: string;
  icon: LucideIcon;
}

// Role-aware shortcuts — real navigation, no fabricated metrics (Figma has no
// dashboard page; improvised on-theme per CLAUDE.md UI guidance).
const QUICK_ACTIONS: Record<Role, QuickAction[]> = {
  BEGINNER: [
    { label: "Telusuri Proyek", desc: "Temukan proyek nyata dan lamar perannya.", href: "/projects", icon: FolderKanban },
    { label: "Lamaran Saya", desc: "Pantau status lamaran proyekmu.", href: "/applications", icon: FileSignature },
    { label: "Artifacts", desc: "Portofolio terverifikasi dari kontribusimu.", href: "/artifacts", icon: Award },
  ],
  SENIOR: [
    { label: "Telusuri Proyek", desc: "Cari proyek yang butuh mentor.", href: "/projects", icon: FolderKanban },
    { label: "Lamaran Mentor", desc: "Kelola lamaran mentoring kamu.", href: "/applications/mentor", icon: FileSignature },
    { label: "Artifacts", desc: "Riwayat artefak yang kamu terbitkan.", href: "/artifacts", icon: Award },
  ],
  UMKM: [
    { label: "Buat Proyek", desc: "Publikasikan kebutuhan proyek UMKM-mu.", href: "/projects/create", icon: FolderPlus },
    { label: "Proyek Saya", desc: "Kelola proyek dan rekrutmen tim.", href: "/my-projects", icon: FolderKanban },
    { label: "Telusuri Proyek", desc: "Lihat proyek lain di platform.", href: "/projects", icon: FolderKanban },
  ],
  ADMIN: [],
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
  const actions = QUICK_ACTIONS[appUser.role];

  return (
    <AppShell breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        {/* Greeting hero */}
        <section className="app-dark app-reveal overflow-hidden rounded-3xl border border-border bg-[#201f31] p-8 text-white">
          <p className="text-[13px] font-medium text-[#9b9ba6]">{ROLE_LABEL[appUser.role]}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Halo, {appUser.name} <span className="align-middle">👋</span>
          </h1>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[#b6b6c0]">
            Selamat datang kembali di EduNomad. Kelola proyek, kolaborasi tim, dan portofolio
            terverifikasimu dari sini.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            {appUser.status.replace("_", " ").toLowerCase()}
          </span>
        </section>

        <Alert variant={banner.variant}>
          <Icon />
          <AlertTitle>{banner.title}</AlertTitle>
          <AlertDescription>{banner.desc}</AlertDescription>
        </Alert>

        {actions.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Aksi Cepat</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {actions.map((a, i) => {
                const ActionIcon = a.icon;
                return (
                  <Link
                    key={a.href + a.label}
                    href={a.href}
                    style={{ animationDelay: `${i * 70}ms` }}
                    className="app-reveal group flex flex-col rounded-2xl border border-border bg-card p-5 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(32,31,49,0.08)] active:translate-y-0"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                      <ActionIcon className="size-5" />
                    </span>
                    <p className="mt-4 font-semibold text-foreground">{a.label}</p>
                    <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {a.desc}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#5f8c00]">
                      Buka
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
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
