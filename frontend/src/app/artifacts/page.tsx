"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Award, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApiError } from "@/lib/apiClient";
import { artifactApi, type Artifact } from "@/services/artifactApi";

function Content() {
  const [items, setItems] = useState<Artifact[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    artifactApi
      .listMine()
      .then((a) => active && setItems(a))
      .catch((err) => active && setError(err instanceof ApiError ? err.message : "Gagal memuat sertifikat"));
    return () => {
      active = false;
    };
  }, []);

  const download = async (a: Artifact) => {
    setBusy(a.id);
    try {
      await artifactApi.download(a.id, `${a.artifactCode}.pdf`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengunduh berkas");
    } finally {
      setBusy(null);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (items === null) return <ListSkeleton rows={4} />;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Sertifikat Saya"
        subtitle="Sertifikat kontribusi proyek yang telah diterbitkan mentor. Bagikan kode untuk verifikasi publik."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Award}
          heading="Belum Ada Sertifikat"
          message="Sertifikat diterbitkan oleh mentor setelah kontribusimu disetujui dan direview. Selesaikan kontribusi proyek untuk mendapatkannya."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((a, i) => (
            <article
              key={a.id}
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
              className="app-reveal flex flex-col gap-4 rounded-[20px] border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#eef7d6] text-[#5f8c00]"
                  aria-hidden="true"
                >
                  <Award className="size-5" />
                </span>
                {a.currentVersion > 1 && (
                  <Badge variant="secondary">Versi {a.currentVersion}</Badge>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold tracking-tight text-[#5f8c00]">
                  {a.artifactCode}
                </p>
                <p className="mt-1 font-semibold tracking-tight text-foreground">{a.project.title}</p>
                <p className="text-sm text-muted-foreground">
                  {a.project.umkm?.name ?? "—"} · Mentor {a.senior.name}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Diterbitkan {new Date(a.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <Button size="sm" disabled={busy === a.id} onClick={() => download(a)}>
                  <Download className="size-4" /> Unduh PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/verify/${a.artifactCode}`} target="_blank" rel="noopener noreferrer" />}
                >
                  <ShieldCheck className="size-4" /> Verifikasi
                  <ExternalLink className="size-3.5" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ArtifactsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <Content />
      </AppShell>
    </AuthGuard>
  );
}
