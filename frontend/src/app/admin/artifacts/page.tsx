"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Award } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/apiClient";
import { artifactApi, type Artifact } from "@/services/artifactApi";

function Content() {
  const [items, setItems] = useState<Artifact[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    artifactApi
      .listAll()
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
      toast.error(err instanceof ApiError ? err.message : "Gagal mengunduh");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Sertifikat"
          subtitle="Pantau seluruh sertifikat yang diterbitkan beserta riwayat versinya."
        />

        {error ? (
          <EmptyState icon={Award} heading="Gagal Memuat" message={error} />
        ) : items === null ? (
          <TableSkeleton rows={6} columns={6} />
        ) : items.length === 0 ? (
          <EmptyState icon={Award} heading="Belum Ada Sertifikat" message="Belum ada sertifikat yang diterbitkan." />
        ) : (
          <div className="app-reveal overflow-x-auto rounded-[20px] border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Kode</th>
                  <th className="px-4 py-3 font-semibold">Penerima</th>
                  <th className="px-4 py-3 font-semibold">Proyek</th>
                  <th className="px-4 py-3 font-semibold">Mentor</th>
                  <th className="px-4 py-3 font-semibold">Versi</th>
                  <th className="px-4 py-3 font-semibold">Diterbitkan</th>
                  <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className="border-t border-border transition-colors hover:bg-muted/40">
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/verify/${a.artifactCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs font-semibold text-[#5f8c00] hover:underline"
                      >
                        {a.artifactCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-foreground">{a.beginner.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.project.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.senior.name}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">v{a.currentVersion}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground tabular-nums">
                      {new Date(a.issuedAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" disabled={busy === a.id} onClick={() => download(a)}>
                        Unduh
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function AdminArtifactsPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <Content />
    </AuthGuard>
  );
}
