"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileView } from "@/components/profile/ProfileView";
import { ErrorState } from "@/components/common/ErrorState";
import { useAuthStore } from "@/stores/authStore";
import { profileApi, type ProfileOverview } from "@/services/profileApi";

function Content({ id }: { id: string }) {
  const appUser = useAuthStore((s) => s.appUser);
  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    setOverview(null);
    profileApi
      .getOverview(id)
      .then(setOverview)
      .catch(() => {
        setError(true);
        toast.error("Gagal memuat profil");
      });
  }, [id]);

  return (
    <AppShell backHref="/projects">
      {error ? (
        <ErrorState message="Profil tidak ditemukan." />
      ) : !overview ? (
        <div className="h-64 animate-pulse rounded-[24px] bg-muted" />
      ) : (
        <ProfileView overview={overview} isOwn={appUser?.id === id} />
      )}
    </AppShell>
  );
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <Content id={id} />
    </AuthGuard>
  );
}
