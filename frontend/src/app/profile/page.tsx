"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileView } from "@/components/profile/ProfileView";
import { ErrorState } from "@/components/common/ErrorState";
import { useAuthStore } from "@/stores/authStore";
import { profileApi, type ProfileOverview } from "@/services/profileApi";

function Content() {
  const appUser = useAuthStore((s) => s.appUser);
  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!appUser?.id) return;
    setError(false);
    profileApi
      .getOverview(appUser.id)
      .then(setOverview)
      .catch(() => {
        setError(true);
        toast.error("Gagal memuat profil");
      });
  }, [appUser?.id]);

  return (
    <AppShell>
      {error ? (
        <ErrorState message="Gagal memuat profil." onAction={() => window.location.reload()} />
      ) : !overview ? (
        <div className="h-64 animate-pulse rounded-[24px] bg-muted" />
      ) : (
        <ProfileView overview={overview} isOwn />
      )}
    </AppShell>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Content />
    </AuthGuard>
  );
}
