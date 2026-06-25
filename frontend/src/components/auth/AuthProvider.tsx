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

    // Load the app user; a stale/expired session token makes /auth/me 401 — sign
    // out so it doesn't error-loop and the guard redirects cleanly to login.
    const loadAppUser = async () => {
      try {
        setAppUser(await fetchMe());
      } catch {
        await supabase.auth.signOut();
        clear();
      }
    };

    // Single source of truth: onAuthStateChange fires INITIAL_SESSION immediately
    // on subscribe (with the stored session, or null). A separate getSession() call
    // would just duplicate the /auth/me fetch on load, so we drop it. The async work
    // is deferred out of the callback (setTimeout 0) because awaiting other supabase
    // calls inside an onAuthStateChange handler can deadlock the auth client.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSession(session);
      if (session) {
        setTimeout(async () => {
          if (!active) return;
          await loadAppUser();
          setLoading(false);
        }, 0);
      } else {
        clear();
        setLoading(false);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [setSession, setAppUser, setLoading, clear]);

  return <>{children}</>;
}
