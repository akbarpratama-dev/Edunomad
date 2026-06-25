"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <AppShell breadcrumbs={[{ label: "Admin" }, { label: "Audit Logs" }]}>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Logs</h1>

        <div className="flex flex-wrap items-end gap-2">
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
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-2">Waktu</th>
                    <th className="p-2">Aktor</th>
                    <th className="p-2">Action</th>
                    <th className="p-2">Entity</th>
                    <th className="p-2">Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((log) => (
                    <tr key={log.id} className="border-t border-border">
                      <td className="p-2 text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("id-ID")}
                      </td>
                      <td className="p-2 text-foreground">{log.user?.name ?? "—"}</td>
                      <td className="p-2 font-medium text-foreground">{log.action}</td>
                      <td className="p-2 text-muted-foreground">{log.entityType}</td>
                      <td className="p-2 text-muted-foreground">
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
