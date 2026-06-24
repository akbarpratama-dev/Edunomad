"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { RegistrationProgress } from "@/components/auth/RegistrationProgress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signupAccount } from "@/services/authApi";
import { signIn } from "@/services/auth";
import { useRegistrationStore, type RegRole } from "@/stores/registrationStore";
import { ApiError } from "@/lib/apiClient";

const VALID_ROLES: RegRole[] = ["BEGINNER", "SENIOR", "UMKM"];

const schema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z.string().min(8, "Minimal 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Kata sandi tidak cocok",
  });

type Form = z.infer<typeof schema>;

export default function RegisterStep1() {
  const router = useRouter();
  const setName = useRegistrationStore((s) => s.setName);
  const setRole = useRegistrationStore((s) => s.setRole);
  const [submitting, setSubmitting] = useState(false);

  // Pre-select the role when arriving from a landing CTA (?role=BEGINNER|SENIOR|UMKM).
  // Read client-side to avoid needing a Suspense boundary for useSearchParams.
  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get("role");
    if (role && (VALID_ROLES as string[]).includes(role)) {
      setRole(role as RegRole);
    }
  }, [setRole]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Form) => {
    setSubmitting(true);
    try {
      await signupAccount({ name: values.name, email: values.email, password: values.password });
      // Email is auto-confirmed server-side, so sign-in works immediately.
      const { error } = await signIn(values.email, values.password);
      if (error) throw new Error(error.message);
      setName(values.name);
      toast.success("Akun dibuat");
      router.push("/auth/register/role");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : (err as Error).message;
      toast.error("Gagal membuat akun: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Buat Akun">
      <RegistrationProgress current={1} />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input id="name" placeholder="Masukkan nama lengkap" {...register("name")} />
          {errors.name && <p className="text-body-sm text-error">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Alamat Email</Label>
          <Input id="email" type="email" placeholder="nama@email.com" {...register("email")} />
          {errors.email && <p className="text-body-sm text-error">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Kata Sandi</Label>
          <PasswordInput id="password" placeholder="Minimal 8 karakter" {...register("password")} />
          {errors.password && <p className="text-body-sm text-error">{errors.password.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Ulang kata sandi"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-body-sm text-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Memproses..." : "Buat Akun →"}
        </Button>

        <p className="text-center text-body-sm text-neutral-gray">
          Sudah punya akun?{" "}
          <Link href="/auth/login" className="text-[#5f8c00] font-semibold hover:underline">
            Masuk
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
