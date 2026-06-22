"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GraduationCap, Briefcase, Building2 } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegistrationProgress } from "@/components/auth/RegistrationProgress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRegistrationStore, type RegRole } from "@/stores/registrationStore";
import { useRequireSession } from "@/hooks/useRequireSession";

const ROLES: { role: RegRole; title: string; desc: string; icon: typeof GraduationCap }[] = [
  {
    role: "BEGINNER",
    title: "Mahasiswa",
    desc: "Membangun pengalaman dan portofolio melalui proyek nyata.",
    icon: GraduationCap,
  },
  {
    role: "SENIOR",
    title: "Mentor",
    desc: "Membimbing mahasiswa dan berbagi pengalaman profesional.",
    icon: Briefcase,
  },
  {
    role: "UMKM",
    title: "UMKM",
    desc: "Mengerjakan proyek dan mendapatkan solusi dari tim mahasiswa.",
    icon: Building2,
  },
];

export default function RegisterStep2() {
  const router = useRouter();
  useRequireSession();
  const storedRole = useRegistrationStore((s) => s.role);
  const setRole = useRegistrationStore((s) => s.setRole);
  const [selected, setSelected] = useState<RegRole | null>(storedRole);

  const onContinue = () => {
    if (!selected) {
      toast.error("Pilih peran terlebih dahulu");
      return;
    }
    setRole(selected);
    router.push("/auth/register/about");
  };

  return (
    <AuthCard
      title="Pilih Peran Anda"
      subtitle="Pilih peran yang sesuai untuk memulai perjalanan Anda di EduNomad."
      wide
    >
      <RegistrationProgress current={2} />
      <div className="flex flex-col gap-3">
        {ROLES.map(({ role, title, desc, icon: Icon }) => (
          <button
            key={role}
            type="button"
            onClick={() => setSelected(role)}
            className={cn(
              "flex items-start gap-4 rounded-lg border p-4 text-left transition-colors",
              selected === role
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-neutral-light"
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-md",
                selected === role ? "bg-primary text-primary-foreground" : "bg-neutral-light text-neutral-gray"
              )}
            >
              <Icon className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-body font-semibold text-neutral-dark">{title}</span>
              <span className="text-body-sm text-neutral-gray">{desc}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={onContinue}>Lanjutkan →</Button>
      </div>
    </AuthCard>
  );
}
