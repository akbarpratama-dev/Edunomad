"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

// The landing `/` is the public entry point. Once the Supabase session has
// resolved (client-side), authenticated users are sent straight to /dashboard.
// Renders nothing; the public landing still paints instantly for logged-out
// visitors (no loader gate), and signed-in users are redirected in the bg.
export function AuthedRedirect() {
  const router = useRouter();
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard");
  }, [isLoading, isAuthenticated, router]);

  return null;
}
