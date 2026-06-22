"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegistrationProgress } from "@/components/auth/RegistrationProgress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegistrationStore, type AboutData } from "@/stores/registrationStore";
import { useRequireSession } from "@/hooks/useRequireSession";

const BEGINNER_STATUSES = [
  "Mahasiswa",
  "Fresh Graduate",
  "Career Switcher",
  "Pelajar SMK",
  "Lainnya",
];

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
      {helper && <p className="text-body-sm text-neutral-gray">{helper}</p>}
    </div>
  );
}

export default function RegisterStep3() {
  const router = useRouter();
  useRequireSession();
  const role = useRegistrationStore((s) => s.role);
  const storedAbout = useRegistrationStore((s) => s.about);
  const setAbout = useRegistrationStore((s) => s.setAbout);
  const [form, setForm] = useState<AboutData>(storedAbout);

  useEffect(() => {
    if (role === null) router.replace("/auth/register/role");
  }, [role, router]);

  const set = (patch: Partial<AboutData>) => setForm((f) => ({ ...f, ...patch }));

  const onContinue = () => {
    const required =
      role === "BEGINNER"
        ? [form.status, form.institution, form.fieldOfStudy, form.city]
        : role === "SENIOR"
          ? [form.company, form.position, form.yearsOfExperience, form.city]
          : [form.businessName, form.businessType, form.location];
    if (required.some((v) => !v?.trim())) {
      toast.error("Lengkapi semua field");
      return;
    }
    setAbout(form);
    router.push("/auth/register/portfolio");
  };

  return (
    <AuthCard
      title="Ceritakan tentang diri Anda"
      subtitle="Bantu kami mempersonalisasi rekomendasi proyek dan peluang terbaik untuk Anda."
      wide
    >
      <RegistrationProgress current={3} />
      <div className="flex flex-col gap-4">
        {role === "BEGINNER" && (
          <>
            <Field label="Status Saat Ini" helper="Pilih status yang paling menggambarkan kondisi Anda.">
              <Select value={form.status} onValueChange={(v) => set({ status: v ?? undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {BEGINNER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Institusi/Universitas" helper="Universitas, perusahaan, atau organisasi tempat Anda bernaung.">
              <Input
                placeholder="cth. Universitas Indonesia"
                value={form.institution ?? ""}
                onChange={(e) => set({ institution: e.target.value })}
              />
            </Field>
            <Field label="Bidang Studi/Keahlian" helper="Bidang studi atau keahlian utama Anda.">
              <Input
                placeholder="cth. Informatika, UI/UX Design"
                value={form.fieldOfStudy ?? ""}
                onChange={(e) => set({ fieldOfStudy: e.target.value })}
              />
            </Field>
            <Field label="Kota Domisili" helper="Proyek akan dicocokkan berdasarkan lokasi Anda.">
              <Input
                placeholder="cth. Jakarta, Bandung"
                value={form.city ?? ""}
                onChange={(e) => set({ city: e.target.value })}
              />
            </Field>
          </>
        )}

        {role === "SENIOR" && (
          <>
            <Field label="Perusahaan" helper="Tempat Anda bekerja saat ini.">
              <Input
                placeholder="cth. Tokopedia"
                value={form.company ?? ""}
                onChange={(e) => set({ company: e.target.value })}
              />
            </Field>
            <Field label="Jabatan">
              <Input
                placeholder="cth. Senior Software Engineer"
                value={form.position ?? ""}
                onChange={(e) => set({ position: e.target.value })}
              />
            </Field>
            <Field label="Tahun Pengalaman">
              <Input
                type="number"
                min={0}
                placeholder="cth. 5"
                value={form.yearsOfExperience ?? ""}
                onChange={(e) => set({ yearsOfExperience: e.target.value })}
              />
            </Field>
            <Field label="Kota Domisili">
              <Input
                placeholder="cth. Jakarta"
                value={form.city ?? ""}
                onChange={(e) => set({ city: e.target.value })}
              />
            </Field>
          </>
        )}

        {role === "UMKM" && (
          <>
            <Field label="Nama Bisnis">
              <Input
                placeholder="cth. Kopi Nusantara"
                value={form.businessName ?? ""}
                onChange={(e) => set({ businessName: e.target.value })}
              />
            </Field>
            <Field label="Tipe Bisnis" helper="Industri atau bidang usaha Anda.">
              <Input
                placeholder="cth. F&B, Retail, Jasa"
                value={form.businessType ?? ""}
                onChange={(e) => set({ businessType: e.target.value })}
              />
            </Field>
            <Field label="Lokasi">
              <Input
                placeholder="cth. Surabaya"
                value={form.location ?? ""}
                onChange={(e) => set({ location: e.target.value })}
              />
            </Field>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => router.push("/auth/register/role")}>
          Kembali
        </Button>
        <Button onClick={onContinue}>Lanjutkan →</Button>
      </div>
    </AuthCard>
  );
}
