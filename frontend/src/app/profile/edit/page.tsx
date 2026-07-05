"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/apiClient";
import { useAuthStore } from "@/stores/authStore";
import { fetchMe } from "@/services/authApi";
import { profileApi, type ProfileOverview } from "@/services/profileApi";
import {
  SkillsManager,
  ExperiencesManager,
  LinksManager,
} from "@/components/profile/ProfileEditManagers";

// Mirrors backend updateProfileSchema (URLs optional; empty string allowed).
const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  headline: z.string().max(255).optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  photo: z.string().url("URL foto tidak valid").max(1000).optional().or(z.literal("")),
  linkedin_url: z.string().url("URL LinkedIn tidak valid").max(1000).optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

function Content() {
  const router = useRouter();
  const appUser = useAuthStore((s) => s.appUser);
  const setAppUser = useAuthStore((s) => s.setAppUser);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  // UMKM profiles don't surface skills/experiences (see D-P10-2), so hide those
  // managers; links apply to everyone.
  const professional = appUser?.role !== "UMKM";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!appUser?.id) return;
    profileApi
      .getOverview(appUser.id)
      .then((o) => {
        setOverview(o);
        reset({
          name: o.user.name,
          headline: o.profile?.headline ?? "",
          bio: o.profile?.bio ?? "",
          phone: o.profile?.phone ?? "",
          photo: o.profile?.photo ?? "",
          linkedin_url: o.profile?.linkedinUrl ?? "",
        });
      })
      .catch(() => toast.error("Gagal memuat profil"))
      .finally(() => setLoading(false));
  }, [appUser?.id, reset]);

  const onSubmit = async (values: FormValues) => {
    // Send only non-empty fields; empty strings clear optional profile fields.
    const payload = {
      name: values.name,
      headline: values.headline ?? "",
      bio: values.bio ?? "",
      phone: values.phone ?? "",
      photo: values.photo || undefined, // photo must be a valid URL if set
      linkedin_url: values.linkedin_url || undefined,
    };
    try {
      await profileApi.updateMe(payload);
      // Refresh the cached appUser (name/photo shown in header).
      const me = await fetchMe();
      if (me) setAppUser(me);
      toast.success("Profil diperbarui");
      router.push("/profile");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyimpan profil");
    }
  };

  const photoUrl = watch("photo");

  return (
    <AppShell backHref="/profile">
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <PageHeader title="Edit Profil" subtitle="Perbarui informasi profil dan tautan sosialmu." />

        <Card>
          <CardContent className="flex flex-col gap-5 p-6">
            {loading ? (
              <div className="h-72 animate-pulse rounded-xl bg-muted" />
            ) : (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="headline">Headline</Label>
                  <Input id="headline" placeholder="Frontend Developer" {...register("headline")} />
                  {errors.headline && <p className="text-sm text-error">{errors.headline.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" rows={4} placeholder="Ceritakan tentang dirimu..." {...register("bio")} />
                  {errors.bio && <p className="text-sm text-error">{errors.bio.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Telepon</Label>
                  <Input id="phone" placeholder="08xxxxxxxxxx" {...register("phone")} />
                  {errors.phone && <p className="text-sm text-error">{errors.phone.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="photo">URL Foto Profil</Label>
                  <Input id="photo" placeholder="https://..." {...register("photo")} />
                  {errors.photo && <p className="text-sm text-error">{errors.photo.message}</p>}
                  {photoUrl && !errors.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl}
                      alt="Pratinjau"
                      className="mt-1 size-16 rounded-full object-cover ring-1 ring-border"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="linkedin_url">URL LinkedIn</Label>
                  <Input id="linkedin_url" placeholder="https://linkedin.com/in/..." {...register("linkedin_url")} />
                  {errors.linkedin_url && <p className="text-sm text-error">{errors.linkedin_url.message}</p>}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/profile")}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>

      {/* Sub-resource managers persist immediately (own API calls), so they live
          outside the core-profile form. */}
      {overview && (
        <div className="mx-auto mt-6 flex w-full max-w-2xl flex-col gap-6">
          {professional && <SkillsManager initial={overview.skills} />}
          {professional && <ExperiencesManager initial={overview.experiences} />}
          <LinksManager initial={overview.portfolioLinks} />
        </div>
      )}
    </AppShell>
  );
}

export default function EditProfilePage() {
  return (
    <AuthGuard>
      <Content />
    </AuthGuard>
  );
}
