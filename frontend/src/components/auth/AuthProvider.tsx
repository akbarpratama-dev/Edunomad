"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { fetchMe } from "@/services/authApi";

// Bootstraps auth state on load and keeps it in sync with Supabase Auth.
// After a session exists, loads the app user (role/status) from GET /auth/me.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const setAppUser = useAuthStore((s) => s.setAppUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) {
        setAppUser(await fetchMe());
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      setSession(session);
      if (session) {
        setAppUser(await fetchMe());
      } else {
        clear();
      }
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [setSession, setAppUser, setLoading, clear]);

  return <>{children}</>;
}
