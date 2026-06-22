"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import type { Role } from "@/types/user";

// Protects pages: requires a session + a completed app account. Optionally
// restricts by role. Verification-status handling (pending/rejected/suspended)
// is left to the page content (e.g. the dashboard banner), per RBAC Rule 2
// (PENDING users may access the dashboard).
export function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
}) {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const appUser = useAuthStore((s) => s.appUser);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }
    // Signed in but registration not completed (no public.users row yet).
    if (!appUser) {
      router.replace("/auth/register/role");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(appUser.role)) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, appUser, allowedRoles, router]);

  if (isLoading || !isAuthenticated || !appUser) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-gray">
        Memuat...
      </div>
    );
  }
  if (allowedRoles && !appUser.role) return null;

  return <>{children}</>;
}
