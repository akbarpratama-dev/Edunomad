"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { sendPasswordReset } from "@/services/auth";

const schema = z.object({ email: z.string().email("Email tidak valid") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    const { error } = await sendPasswordReset(values.email);
    setSubmitting(false);
    // Don't reveal whether an email exists — always show the sent state.
    if (error && error.status && error.status >= 500) {
      toast.error("Gagal mengirim email. Coba lagi.");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthCard title="Cek Email Kamu" backHref="/auth/login">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-[#eef7d6] text-[#5f8c00]">
            <MailCheck className="size-7" />
          </span>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Jika <strong className="text-foreground">{getValues("email")}</strong> terdaftar, kami telah
            mengirim tautan untuk mengatur ulang kata sandi. Periksa juga folder spam.
          </p>
          <Button variant="outline" className="w-full" render={<Link href="/auth/login" />}>
            Kembali ke Login
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Lupa Password"
      subtitle="Masukkan emailmu, kami akan mengirim tautan untuk mengatur ulang kata sandi."
      backHref="/auth/login"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="nama@email.com" {...register("email")} />
          {errors.email && <p className="text-sm text-error">{errors.email.message}</p>}
        </div>
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Mengirim..." : "Kirim Tautan Reset"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Ingat kata sandimu?{" "}
          <Link href="/auth/login" className="font-semibold text-[#5f8c00] hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
