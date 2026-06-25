"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { signIn } from "@/services/auth";

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    setSubmitting(true);
    const { error } = await signIn(values.email, values.password);
    setSubmitting(false);
    if (error) {
      toast.error("Login gagal: " + error.message);
      return;
    }
    toast.success("Berhasil masuk");
    router.push("/dashboard");
  };

  return (
    <AuthCard title="Login">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="nama@email.com" {...register("email")} />
          {errors.email && <p className="text-sm text-error">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" placeholder="Masukkan password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-error">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox onCheckedChange={(c) => setValue("remember", c === true)} />
            Ingat Saya
          </label>
          <Link href="/auth/forgot-password" className="text-sm text-[#5f8c00] font-semibold hover:underline">
            Lupa Password?
          </Link>
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Memproses..." : "Masuk →"}
        </Button>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          atau
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button type="button" variant="outline" className="w-full" disabled title="Segera hadir">
          Masuk dengan Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="text-[#5f8c00] font-semibold hover:underline">
            Daftar Sekarang
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
