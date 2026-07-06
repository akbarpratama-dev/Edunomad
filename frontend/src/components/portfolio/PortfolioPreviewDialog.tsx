"use client";

import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import {
  UserCog,
  CheckCircle2,
  CalendarDays,
  Clock,
  GraduationCap,
  Building2,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectThumb } from "@/components/artifact/shared";
import { ProfileLink } from "@/components/common/ProfileLink";
import { UserAvatar } from "@/components/common/UserAvatar";
import { StarRating } from "@/components/review/StarRating";
import { durationWeeks, type PortfolioArtifact } from "@/services/portfolioApi";
import type { PipelineDetail } from "@/services/artifactApi";

export type PreviewStatus = "VERIFIED" | "READY" | "IN_PROGRESS";

// Normalised shape the modal renders. Both the beginner's own pipeline detail
// and the public portfolio artifact map into this (see mappers below).
export interface PortfolioPreview {
  projectTitle: string;
  projectDescription: string;
  projectImageUrl: string | null;
  roleName: string | null;
  contributionApproved: boolean;
  contributionSummary: string | null;
  status: PreviewStatus;
  startDate: string | null;
  completedDate: string | null;
  technologies: string[];
  team: { id: string; name: string; roleName?: string | null }[];
  senior: { id?: string | null; name: string } | null;
  umkm: { id?: string | null; name: string } | null;
  seniorReview: { reviewerName: string; rating: number; comment: string | null } | null;
  verificationUrl: string | null;
  artifactCode: string | null;
}

const STATUS_META: Record<PreviewStatus, { label: string; className: string }> = {
  VERIFIED: { label: "Selesai", className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  READY: { label: "Siap Diterbitkan", className: "border-amber-300 bg-amber-50 text-amber-700" },
  IN_PROGRESS: { label: "Dalam Proses", className: "border-sky-300 bg-sky-50 text-sky-700" },
};

function fmt(d: string | null) {
  return d
    ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "—";
}

// --- Mappers ---------------------------------------------------------------

export function previewFromPipelineDetail(d: PipelineDetail): PortfolioPreview {
  return {
    projectTitle: d.project.title,
    projectDescription: d.project.description,
    projectImageUrl: d.project.imageUrl,
    roleName: d.roleName,
    contributionApproved: d.contributionApproved,
    contributionSummary: d.contributionSummary,
    status: d.status,
    startDate: d.project.startDate,
    completedDate: d.project.completedAt ?? d.project.deadline,
    technologies: d.technologies,
    team: d.team,
    senior: d.senior,
    umkm: d.umkm,
    seniorReview: d.seniorReview
      ? {
          reviewerName: d.seniorReview.reviewerName,
          rating: d.seniorReview.rating,
          comment: d.seniorReview.comment,
        }
      : null,
    verificationUrl: d.artifact
      ? `${window.location.origin}/verify/${d.artifact.artifactCode}`
      : null,
    artifactCode: d.artifact?.artifactCode ?? null,
  };
}

export function previewFromPortfolioArtifact(a: PortfolioArtifact): PortfolioPreview {
  return {
    projectTitle: a.project.title,
    projectDescription: a.project.description,
    projectImageUrl: a.project.imageUrl,
    roleName: a.roleName,
    contributionApproved: a.contributionApproved,
    contributionSummary: a.contributionSummary,
    status: "VERIFIED",
    startDate: a.project.startDate,
    completedDate: a.project.completedAt ?? a.project.deadline,
    technologies: a.technologies,
    team: a.team,
    senior: a.senior,
    umkm: a.umkm,
    seniorReview: a.seniorReview,
    verificationUrl: a.verificationUrl,
    artifactCode: a.artifactCode,
  };
}

// --- Small building blocks -------------------------------------------------

function MetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Clock;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}

function TeamChip({
  icon: Icon,
  label,
  name,
  userId,
  verified,
}: {
  icon: typeof Users;
  label: string;
  name: string;
  userId?: string | null;
  verified?: boolean;
}) {
  const inner = (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
      </div>
      {verified && <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />}
    </div>
  );
  return userId ? (
    <ProfileLink userId={userId} className="hover:no-underline">
      {inner}
    </ProfileLink>
  ) : (
    inner
  );
}

// --- Dialog ----------------------------------------------------------------

export function PortfolioPreviewDialog({
  open,
  onOpenChange,
  preview,
  loading,
  primaryHref,
  primaryLabel = "Lihat Detail Portofolio",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  preview: PortfolioPreview | null;
  loading?: boolean;
  primaryHref?: string | null;
  primaryLabel?: string;
}) {
  const verified = preview?.status === "VERIFIED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-4xl">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle className="text-xl">Preview di Portofolio</DialogTitle>
          <DialogDescription>
            Ringkasan sertifikat terverifikasi dari kontribusi proyekmu.
          </DialogDescription>
        </DialogHeader>

        {loading || !preview ? (
          <div className="grid gap-5 p-6 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-[20px] bg-muted" />
            <div className="flex flex-col gap-3">
              <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-24 animate-pulse rounded bg-muted" />
              <div className="h-40 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* Left — project visual */}
            <div className="flex flex-col gap-3">
              <ProjectThumb
                title={preview.projectTitle}
                imageUrl={preview.projectImageUrl}
                className="h-72 w-full rounded-[20px]"
              />
              {preview.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {preview.technologies.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right — details */}
            <div className="flex min-w-0 flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-pretty">
                  {preview.projectTitle}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {preview.projectDescription}
                </p>
              </div>

              {preview.contributionSummary && (
                <div className="rounded-[16px] border border-border bg-muted/40 p-3.5">
                  <h3 className="mb-1 text-sm font-semibold">Kontribusi Saya di Proyek Ini</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                    {preview.contributionSummary}
                  </p>
                </div>
              )}

              <div className="divide-y divide-border rounded-[16px] border border-border px-3">
                <MetaRow icon={UserCog} label="Peran">
                  {preview.roleName ?? "—"}
                </MetaRow>
                <MetaRow icon={CheckCircle2} label="Kontribusi">
                  {preview.contributionApproved ? "100%" : "Dalam proses"}
                </MetaRow>
                <MetaRow icon={ShieldCheck} label="Status">
                  <Badge variant="outline" className={STATUS_META[preview.status].className}>
                    {STATUS_META[preview.status].label}
                  </Badge>
                </MetaRow>
                <MetaRow icon={CalendarDays} label="Tanggal Selesai">
                  {fmt(preview.completedDate)}
                </MetaRow>
                <MetaRow icon={Clock} label="Durasi Pengerjaan">
                  {durationWeeks(preview.startDate ?? "", preview.completedDate)}
                </MetaRow>
              </div>

              {preview.technologies.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Teknologi yang Digunakan</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.technologies.map((t) => (
                      <span
                        key={t}
                        className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-sm font-semibold">Tim Proyek</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {preview.senior && (
                    <TeamChip
                      icon={GraduationCap}
                      label="Mentor"
                      name={preview.senior.name}
                      userId={preview.senior.id}
                      verified={verified}
                    />
                  )}
                  {preview.umkm && (
                    <TeamChip
                      icon={Building2}
                      label="UMKM"
                      name={preview.umkm.name}
                      userId={preview.umkm.id}
                      verified={verified}
                    />
                  )}
                  <TeamChip
                    icon={Users}
                    label="Tim"
                    name={`${preview.team.length} Mahasiswa`}
                  />
                </div>
              </div>

              {/* Mentor's endorsement — public proof the junior's work was validated */}
              {preview.seniorReview && (
                <div className="rounded-[16px] border border-[#cfe89a] bg-[#f6fbe8] p-4">
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      name={preview.seniorReview.reviewerName}
                      className="size-8 bg-[#d8f277] text-[#0b0b0b] text-xs font-bold"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {preview.seniorReview.reviewerName}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Catatan Mentor</p>
                    </div>
                    <StarRating value={preview.seniorReview.rating} />
                  </div>
                  {preview.seniorReview.comment && (
                    <p className="mt-2.5 whitespace-pre-wrap text-sm italic leading-relaxed text-foreground/85">
                      “{preview.seniorReview.comment}”
                    </p>
                  )}
                </div>
              )}

              {/* Verification block — only for issued certificates */}
              {verified && preview.verificationUrl && (
                <div className="flex items-center gap-4 rounded-[16px] border border-emerald-200 bg-emerald-50/60 p-4">
                  <ul className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm">
                    <li className="inline-flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="size-4 shrink-0" /> Diverifikasi Mentor
                    </li>
                    <li className="inline-flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="size-4 shrink-0" /> Diverifikasi UMKM
                    </li>
                    <li className="inline-flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="size-4 shrink-0" /> Artifact Resmi EduNomad
                    </li>
                  </ul>
                  <a
                    href={preview.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 flex-col items-center gap-1"
                    title="Pindai untuk verifikasi"
                  >
                    <span className="rounded-lg bg-white p-1.5 ring-1 ring-emerald-200">
                      <QRCodeSVG value={preview.verificationUrl} size={72} level="M" marginSize={0} />
                    </span>
                    <span className="text-[10px] text-emerald-700">Pindai QR Code</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          {primaryHref && (
            <Button render={<Link href={primaryHref} />}>
              {primaryLabel} <ArrowRight className="size-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
