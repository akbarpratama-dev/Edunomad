"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Award, Download, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { projectApi, type ProjectDetail, type ProjectMember } from "@/services/projectApi";
import { artifactApi, type Artifact } from "@/services/artifactApi";

// Workspace "Sertifikat" tab (Workflow 13/14). Senior lead generates/regenerates
// per active beginner; everyone sees the issued certificates for this project.
export function ArtifactTab({ project }: { project: ProjectDetail }) {
  const appUser = useAuthStore((s) => s.appUser);
  const isLeadSenior = appUser?.role === "SENIOR" && project.senior?.id === appUser.id;

  const [artifacts, setArtifacts] = useState<Artifact[] | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [list, mem] = await Promise.all([
        artifactApi.listForProject(project.id),
        projectApi.members(project.id),
      ]);
      setArtifacts(list);
      setMembers(mem);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal memuat sertifikat");
      setArtifacts([]);
    }
  }, [project.id]);

  useEffect(() => {
    load();
  }, [load]);

  const byBeginner = useMemo(() => {
    const map = new Map<string, Artifact>();
    (artifacts ?? []).forEach((a) => map.set(a.beginnerId, a));
    return map;
  }, [artifacts]);

  const activeBeginners = members.filter((m) => m.status === "ACTIVE");

  const generate = async (beginnerId: string) => {
    setBusy(beginnerId);
    try {
      await artifactApi.generate(project.id, [beginnerId]);
      toast.success("Sertifikat diterbitkan");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal membuat sertifikat");
    } finally {
      setBusy(null);
    }
  };

  const regenerate = async (a: Artifact) => {
    setBusy(a.id);
    try {
      await artifactApi.regenerate(a.id);
      toast.success("Sertifikat diterbitkan ulang (versi baru)");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menerbitkan ulang");
    } finally {
      setBusy(null);
    }
  };

  const download = async (a: Artifact) => {
    setBusy(a.id + ":dl");
    try {
      await artifactApi.download(a.id, `${a.artifactCode}.pdf`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengunduh");
    } finally {
      setBusy(null);
    }
  };

  if (artifacts === null) {
    return <p className="text-sm text-muted-foreground">Memuat…</p>;
  }

  // Senior lead → per-beginner management. Otherwise → read-only issued list.
  if (isLeadSenior) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Terbitkan sertifikat per beginner. Prasyarat: kontribusi disetujui &amp; review mentor sudah ada.
        </p>
        {activeBeginners.length === 0 ? (
          <EmptyState
            icon={Award}
            heading="Belum Ada Anggota Aktif"
            message="Sertifikat diterbitkan untuk beginner yang tergabung aktif di proyek."
          />
        ) : (
          activeBeginners.map((m, i) => {
            const a = byBeginner.get(m.user.id);
            return (
              <article
                key={m.id}
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                className="app-reveal flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-border bg-card p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef7d6] text-[#5f8c00]" aria-hidden="true">
                    <Award className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold tracking-tight text-foreground">{m.user.name}</p>
                    {a ? (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-mono text-[#5f8c00]">{a.artifactCode}</span>
                        {a.currentVersion > 1 && ` · v${a.currentVersion}`}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">Belum ada sertifikat</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {a ? (
                    <>
                      <Button size="sm" variant="outline" disabled={busy === a.id + ":dl"} onClick={() => download(a)}>
                        <Download className="size-4" /> Unduh
                      </Button>
                      <Button size="sm" variant="outline" disabled={busy === a.id} onClick={() => regenerate(a)}>
                        <RefreshCw className="size-4" /> Terbitkan Ulang
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" disabled={busy === m.user.id} onClick={() => generate(m.user.id)}>
                      <Sparkles className="size-4" /> Terbitkan Sertifikat
                    </Button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    );
  }

  // Read-only view (UMKM / beginner / non-lead).
  if (artifacts.length === 0) {
    return (
      <EmptyState
        icon={Award}
        heading="Belum Ada Sertifikat"
        message="Sertifikat kontribusi akan tampil di sini setelah diterbitkan oleh mentor."
      />
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {artifacts.map((a, i) => (
        <article
          key={a.id}
          style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
          className="app-reveal flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-border bg-card p-4"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef7d6] text-[#5f8c00]" aria-hidden="true">
              <Award className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold tracking-tight text-foreground">{a.beginner.name}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono text-[#5f8c00]">{a.artifactCode}</span>
                {a.currentVersion > 1 && ` · v${a.currentVersion}`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" disabled={busy === a.id + ":dl"} onClick={() => download(a)}>
              <Download className="size-4" /> Unduh
            </Button>
            <Button size="sm" variant="outline" render={<Link href={`/verify/${a.artifactCode}`} target="_blank" rel="noopener noreferrer" />}>
              <ShieldCheck className="size-4" /> Verifikasi
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
