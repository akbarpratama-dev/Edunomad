"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { UploadCloud, FileCheck2, X } from "lucide-react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegistrationProgress } from "@/components/auth/RegistrationProgress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useRequireSession } from "@/hooks/useRequireSession";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase/client";

const BIO_MAX = 300;
const CV_MAX_BYTES = 5 * 1024 * 1024;
const CV_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function RegisterStep4() {
  const router = useRouter();
  useRequireSession();
  const portfolio = useRegistrationStore((s) => s.portfolio);
  const setPortfolio = useRegistrationStore((s) => s.setPortfolio);
  const userId = useAuthStore((s) => s.user?.id);

  const [bio, setBio] = useState(portfolio.bio ?? "");
  const [github, setGithub] = useState(portfolio.github ?? "");
  const [linkedin, setLinkedin] = useState(portfolio.linkedin ?? "");
  const [portfolioUrl, setPortfolioUrl] = useState(portfolio.portfolio ?? "");
  const [behance, setBehance] = useState(portfolio.behance ?? "");
  const [cvUrl, setCvUrl] = useState(portfolio.cvUrl);
  const [cvName, setCvName] = useState(portfolio.cvName);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!CV_TYPES.includes(file.type)) {
      toast.error("Format CV harus PDF atau DOCX");
      return;
    }
    if (file.size > CV_MAX_BYTES) {
      toast.error("Ukuran CV maksimal 5 MB");
      return;
    }
    if (!userId) {
      toast.error("Sesi tidak ditemukan, silakan ulangi");
      return;
    }
    setUploading(true);
    const path = `${userId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("cvs").upload(path, file, { upsert: true });
    if (error) {
      setUploading(false);
      toast.error("Gagal mengunggah CV: " + error.message);
      return;
    }
    const { data } = supabase.storage.from("cvs").getPublicUrl(path);
    setCvUrl(data.publicUrl);
    setCvName(file.name);
    setUploading(false);
    toast.success("CV terunggah");
  };

  const onContinue = () => {
    setPortfolio({
      bio,
      github: github || undefined,
      linkedin: linkedin || undefined,
      portfolio: portfolioUrl || undefined,
      behance: behance || undefined,
      cvUrl,
      cvName,
    });
    router.push("/auth/register/skills");
  };

  return (
    <AuthCard title="Portofolio & Pengalaman" wide>
      <RegistrationProgress current={4} />
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bio">Tentang Saya</Label>
          <Textarea
            id="bio"
            rows={4}
            maxLength={BIO_MAX}
            placeholder="Ceritakan dirimu, minatmu, dan tujuanmu bergabung di EduNomad."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <p className="text-right text-body-sm text-neutral-gray">
            {BIO_MAX - bio.length} tersisa
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Label>Portofolio & Profil Profesional</Label>
          <p className="-mt-1 text-body-sm text-neutral-gray">
            Semua kolom opsional, namun sangat disarankan untuk meningkatkan peluang diterima.
          </p>
          <Input placeholder="GitHub URL" value={github} onChange={(e) => setGithub(e.target.value)} />
          <Input placeholder="LinkedIn URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
          <Input placeholder="Portfolio URL" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} />
          <Input placeholder="Behance/Dribbble URL" value={behance} onChange={(e) => setBehance(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>CV</Label>
          <p className="-mt-1 text-body-sm text-neutral-gray">Unggah CV jika tersedia (PDF/DOCX, maks 5 MB).</p>
          {cvUrl ? (
            <div className="flex items-center justify-between rounded-lg border border-success bg-success/5 p-3">
              <span className="flex items-center gap-2 text-body text-neutral-dark">
                <FileCheck2 className="size-4 text-success" />
                {cvName} <span className="text-success">· Valid</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setCvUrl(undefined);
                  setCvName(undefined);
                }}
                aria-label="Hapus CV"
                className="text-neutral-gray hover:text-error"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
              }}
              className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-neutral-gray-light p-6 text-neutral-gray hover:bg-neutral-light"
            >
              <UploadCloud className="size-6" />
              <span className="text-body-sm">
                {uploading ? "Mengunggah..." : "Klik untuk unggah atau seret file di sini"}
              </span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => router.push("/auth/register/about")}>
          Kembali
        </Button>
        <Button onClick={onContinue} disabled={uploading}>
          Selesaikan Profil →
        </Button>
      </div>
    </AuthCard>
  );
}
