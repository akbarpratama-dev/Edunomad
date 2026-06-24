"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegistrationProgress } from "@/components/auth/RegistrationProgress";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListSkeleton } from "@/components/common/LoadingState";
import { cn } from "@/lib/utils";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useRequireSession } from "@/hooks/useRequireSession";
import { useAuthStore } from "@/stores/authStore";
import { fetchSkills, type Skill } from "@/services/skillApi";
import { registerUser } from "@/services/authApi";
import { fetchMe } from "@/services/authApi";
import { buildRegisterPayload } from "@/lib/buildRegisterPayload";
import { ApiError } from "@/lib/apiClient";

const LEVELS = [
  { value: "BEGINNER", label: "Pemula" },
  { value: "INTERMEDIATE", label: "Menengah" },
  { value: "ADVANCED", label: "Mahir" },
] as const;

const LEARNING_INTERESTS = [
  "Frontend",
  "Backend",
  "Mobile",
  "UI/UX",
  "Data",
  "DevOps",
  "Product",
  "Marketing",
];

export default function RegisterStep5() {
  const router = useRouter();
  useRequireSession();
  const store = useRegistrationStore();
  const setAppUser = useAuthStore((s) => s.setAppUser);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [level, setLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">(
    store.skills.experienceLevel ?? "INTERMEDIATE"
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(store.skills.skillIds);
  const [interests, setInterests] = useState<string[]>(store.skills.learningInterests);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSkills()
      .then(setSkills)
      .catch(() => toast.error("Gagal memuat daftar keahlian"))
      .finally(() => setLoadingSkills(false));
  }, []);

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

  const onFinish = async () => {
    if (!store.role) {
      router.replace("/auth/register/role");
      return;
    }
    // Persist final step into the store, then build + submit.
    store.setSkills({ experienceLevel: level, skillIds: selectedSkillIds, learningInterests: interests });
    const payload = buildRegisterPayload({
      name: store.name,
      role: store.role,
      about: store.about,
      portfolio: store.portfolio,
      skills: { ...store.skills, experienceLevel: level, skillIds: selectedSkillIds, learningInterests: interests },
    });

    setSubmitting(true);
    try {
      await registerUser(payload);
      const me = await fetchMe();
      setAppUser(me);
      store.reset();
      toast.success("Pendaftaran selesai!");
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : (err as Error).message;
      toast.error("Gagal menyelesaikan pendaftaran: " + msg);
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title="Keahlian & Minat" wide>
      <RegistrationProgress current={5} />
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label>Tingkat Pengalaman</Label>
          <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Keahlian & Tools</Label>
          <p className="-mt-1 text-body-sm text-neutral-gray">
            Pilih keahlian yang kamu kuasai (tingkat di atas berlaku untuk semua).
          </p>
          {loadingSkills ? (
            <ListSkeleton rows={3} />
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="flex flex-col gap-1.5">
                  <span className="text-body-sm font-semibold text-neutral-dark">{category}</span>
                  <div className="flex flex-wrap gap-2">
                    {items.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSkillIds((p) => toggle(p, s.id))}
                        className={cn(
                          "rounded-full border px-3 py-1 text-body-sm transition-colors",
                          selectedSkillIds.includes(s.id)
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-neutral-dark hover:bg-neutral-light"
                        )}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Bidang yang Ingin Dipelajari</Label>
          <div className="flex flex-wrap gap-2">
            {LEARNING_INTERESTS.map((it) => (
              <button
                key={it}
                type="button"
                onClick={() => setInterests((p) => toggle(p, it))}
                className={cn(
                  "rounded-full border px-3 py-1 text-body-sm transition-colors",
                  interests.includes(it)
                    ? "border-[#a3ce00] bg-[#eef7d6] text-[#5f8c00]"
                    : "border-border text-neutral-dark hover:bg-neutral-light"
                )}
              >
                {it}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => router.push("/auth/register/portfolio")}>
          Kembali
        </Button>
        <Button onClick={onFinish} disabled={submitting}>
          {submitting ? "Menyelesaikan..." : "Selesaikan Pendaftaran"}
        </Button>
      </div>
    </AuthCard>
  );
}
