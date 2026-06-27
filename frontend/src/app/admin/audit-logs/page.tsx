"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ScrollText } from "lucide-react";
import { adminApi, type AuditLogItem } from "@/services/adminApi";

function Content() {
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .auditLogs({
        action: action || undefined,
        entity_type: entityType || undefined,
        page,
        limit: 20,
      })
      .then((r) => {
        setItems(r.data);
        setLastPage(r.meta.lastPage);
      })
      .catch(() => toast.error("Gagal memuat audit logs"))
      .finally(() => setLoading(false));
  }, [action, entityType, page]);
  useEffect(load, [load]);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Audit Logs"
          subtitle="Jejak aktivitas administratif dan perubahan penting di platform."
        />

        <div className="app-reveal flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Action</label>
            <Input
              placeholder="cth. VERIFICATION_APPROVED"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-64"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-muted-foreground">Entity Type</label>
            <Input
              placeholder="cth. verification_request"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-56"
            />
          </div>
          <Button
            onClick={() => {
              setPage(1);
              load();
            }}
          >
            Filter
          </Button>
        </div>

        {loading ? (
          <TableSkeleton rows={6} columns={4} />
        ) : items.length === 0 ? (
          <EmptyState icon={ScrollText} heading="Belum Ada Log" message="Tidak ada audit log yang cocok." />
        ) : (
          <>
            <div className="app-reveal overflow-x-auto rounded-[20px] border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Waktu</th>
                    <th className="px-4 py-3 font-semibold">Aktor</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                    <th className="px-4 py-3 font-semibold">Entity</th>
                    <th className="px-4 py-3 font-semibold">Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t border-border transition-colors hover:bg-muted/40"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground tabular-nums">
                        {new Date(log.createdAt).toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-foreground">{log.user?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-[#eef7d6] px-2 py-0.5 text-xs font-semibold text-[#5f8c00]">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{log.entityType}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {log.metadata ? JSON.stringify(log.metadata) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground">
                Hal {page} / {lastPage}
              </span>
              <Button
                variant="outline"
                disabled={page >= lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

export default function AuditLogsPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <Content />
    </AuthGuard>
  );
}
