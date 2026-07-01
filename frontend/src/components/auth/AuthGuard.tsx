"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase/client";
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
      // Don't bounce to login on the store's `isAuthenticated` flag alone: right
      // after sign-in (and on token refresh / multi-tab) the SIGNED_IN event can
      // land AFTER the navigation that mounted this guard, so the flag is briefly
      // false while a real session already exists in the auth client. Confirm
      // there is genuinely no session before redirecting; if one exists, the
      // store catches up via onAuthStateChange and this guard re-renders.
      let cancelled = false;
      supabase.auth.getSession().then(({ data }) => {
        if (!cancelled && !data.session) router.replace("/auth/login");
      });
      return () => {
        cancelled = true;
      };
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
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Memuat...
      </div>
    );
  }
  if (allowedRoles && !appUser.role) return null;

  return <>{children}</>;
}
