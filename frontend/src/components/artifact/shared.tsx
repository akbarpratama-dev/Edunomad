"use client";

import Image from "next/image";
import { CheckCircle2, ShieldCheck, Clock, Sparkles, Box } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { PipelineStatus } from "@/services/artifactApi";

export const STATUS_META: Record<
  PipelineStatus,
  { label: string; badge: string; dot: string }
> = {
  VERIFIED: {
    label: "Terverifikasi",
    badge: "border-transparent bg-[#eef7d6] text-[#3f6b00]",
    dot: "text-[#5f8c00]",
  },
  READY: {
    label: "Siap Diterbitkan",
    badge: "border-transparent bg-amber-100 text-amber-700",
    dot: "text-amber-600",
  },
  IN_PROGRESS: {
    label: "Dalam Proses",
    badge: "border-transparent bg-sky-100 text-sky-700",
    dot: "text-sky-600",
  },
};

const GRADIENTS = [
  "from-[#d8f277] to-[#8fbf3f]",
  "from-sky-200 to-sky-400",
  "from-violet-200 to-violet-400",
  "from-amber-200 to-amber-400",
  "from-rose-200 to-rose-400",
  "from-emerald-200 to-emerald-400",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(title: string) {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// Project cover: real image when set, else a deterministic gradient + initials.
export function ProjectThumb({
  title,
  imageUrl,
  className,
}: {
  title: string;
  imageUrl?: string | null;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image src={imageUrl} alt={title} fill className="object-cover" unoptimized />
      </div>
    );
  }
  const g = GRADIENTS[hash(title) % GRADIENTS.length];
  return (
    <div
      className={cn(
        "grid place-items-center bg-gradient-to-br text-[#20301a]",
        g,
        className
      )}
      aria-hidden="true"
    >
      <span className="text-lg font-black tracking-tight opacity-80">{initials(title)}</span>
    </div>
  );
}

export const STAT_ICON = { total: Box, verified: ShieldCheck, progress: Clock, ready: Sparkles };

// "Apa itu Artifact?" explainer (shared by the header CTA + sidebar card).
export function ArtifactInfoDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const steps = [
    "Catat kontribusimu di proyek dan minta mentor menyetujuinya.",
    "Mentor memberi review atas hasil kerjamu.",
    "UMKM menyetujui hasil pekerjaan proyek.",
    "Mentor menerbitkan sertifikat — bukti kontribusi terverifikasi.",
    "Sertifikat tampil di portofolio publikmu & bisa diverifikasi lewat kode.",
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cara Mendapatkan Sertifikat</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Sertifikat adalah bukti kontribusi nyata yang telah diverifikasi oleh mentor dan UMKM.
          Dapat digunakan untuk portofolio dan peluang kariermu.
        </p>
        <ol className="mt-2 flex flex-col gap-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#eef7d6] text-xs font-bold text-[#5f8c00]">
                {i + 1}
              </span>
              <span className="text-sm text-foreground/90">{s}</span>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}

// Small verification checklist row (shared list + detail sidebar).
export function StageRow({
  label,
  done,
  current,
  meta,
  date,
}: {
  label: string;
  done: boolean;
  current?: boolean;
  meta?: string | null;
  date?: string | null;
}) {
  return (
    <div className="flex gap-3">
      <span
        className={cn(
          "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full",
          done ? "bg-[#eef7d6] text-[#5f8c00]" : current ? "border-2 border-[#5f8c00] bg-card" : "border border-border bg-muted"
        )}
      >
        {done && <CheckCircle2 className="size-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-sm font-semibold", !done && !current && "text-muted-foreground")}>
            {label}
          </p>
          <span
            className={cn(
              "shrink-0 text-[11px] font-semibold",
              done ? "text-[#5f8c00]" : current ? "text-amber-600" : "text-muted-foreground"
            )}
          >
            {done ? "Selesai" : current ? "Dalam Proses" : "Belum Dimulai"}
          </span>
        </div>
        {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
        {date && (
          <p className="text-[11px] text-muted-foreground tabular-nums">
            {new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
      </div>
    </div>
  );
}
