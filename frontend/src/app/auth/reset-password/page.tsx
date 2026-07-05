"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { updatePassword } from "@/services/auth";

const schema = z
  .object({
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Konfirmasi kata sandi tidak cocok",
  });
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  // The reset email link establishes a recovery session. Confirm one exists so
  // we can show a helpful message instead of a silent failure.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setHasSession(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (values: FormValues) => {
    const { error } = await updatePassword(values.password);
    if (error) {
      toast.error("Gagal memperbarui kata sandi: " + error.message);
      return;
    }
    toast.success("Kata sandi diperbarui. Silakan login.");
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (ready && !hasSession) {
    return (
      <AuthCard title="Tautan Tidak Valid" backHref="/auth/login">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Tautan reset kata sandi tidak valid atau sudah kedaluwarsa. Minta tautan baru dari halaman{" "}
          <Link href="/auth/forgot-password" className="font-semibold text-[#5f8c00] hover:underline">
            Lupa Password
          </Link>
          .
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Atur Ulang Kata Sandi" subtitle="Masukkan kata sandi barumu." backHref={null}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Kata Sandi Baru</Label>
          <PasswordInput id="password" placeholder="Minimal 8 karakter" {...register("password")} />
          {errors.password && <p className="text-sm text-error">{errors.password.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">Konfirmasi Kata Sandi</Label>
          <PasswordInput id="confirm" placeholder="Ulangi kata sandi" {...register("confirm")} />
          {errors.confirm && <p className="text-sm text-error">{errors.confirm.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting || !hasSession} className="w-full">
          {isSubmitting ? "Menyimpan..." : "Simpan Kata Sandi"}
        </Button>
      </form>
    </AuthCard>
  );
}
