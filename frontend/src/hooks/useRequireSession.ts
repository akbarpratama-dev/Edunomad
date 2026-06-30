"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase/client";

// Redirects to `redirectTo` once auth state has loaded and there is no session.
// Used to guard the registration steps 2-5 (which need an authenticated user).
export function useRequireSession(redirectTo = "/auth/register") {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    // Same post-sign-in race as AuthGuard: the SIGNED_IN event can lag the
    // navigation here (e.g. coming from step 1 right after signing in), so the
    // store flag is briefly false while a session already exists. Confirm with
    // the auth client before redirecting back to the start.
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && !data.session) router.replace(redirectTo);
    });
    return () => {
      cancelled = true;
    };
  }, [isLoading, isAuthenticated, router, redirectTo]);

  return { isLoading, isAuthenticated };
}
