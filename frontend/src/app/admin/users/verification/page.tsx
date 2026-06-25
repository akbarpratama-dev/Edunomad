"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ListSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminApi, type VerificationRequestItem } from "@/services/adminApi";

const TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

function Content() {
  const [tab, setTab] = useState("PENDING");
  const [items, setItems] = useState<VerificationRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState<VerificationRequestItem | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .listVerifications(tab, 1, 50)
      .then((r) => setItems(r.data))
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [tab]);
  useEffect(load, [load]);

  const approve = async (item: VerificationRequestItem) => {
    setBusy(true);
    try {
      await adminApi.approveVerification(item.id);
      toast.success(`${item.user.name} terverifikasi`);
      load();
    } catch {
      toast.error("Gagal menyetujui");
    } finally {
      setBusy(false);
    }
  };

  const submitReject = async () => {
    if (!rejecting || !reason.trim()) {
      toast.error("Alasan wajib diisi");
      return;
    }
    setBusy(true);
    try {
      await adminApi.rejectVerification(rejecting.id, reason.trim());
      toast.success("Verifikasi ditolak");
      setRejecting(null);
      setReason("");
      load();
    } catch {
      toast.error("Gagal menolak");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell breadcrumbs={[{ label: "Admin" }, { label: "Verifikasi Pengguna" }]}>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Verifikasi Pengguna</h1>

        <div className="flex gap-2 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-4 py-2 text-sm font-medium",
                tab === t.key
                  ? "border-b-2 border-[#a3ce00] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <ListSkeleton rows={4} />
        ) : items.length === 0 ? (
          <EmptyState icon={Inbox} heading="Belum Ada Permintaan" message={`Tidak ada permintaan ${tab.toLowerCase()}.`} />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex flex-col gap-2 pt-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.user.name}{" "}
                        <Badge variant="secondary" className="ml-1">
                          {item.user.role}
                        </Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">{item.user.email}</p>
                      {item.user.profile?.headline && (
                        <p className="text-sm text-foreground">{item.user.profile.headline}</p>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  {item.notes && (
                    <pre className="whitespace-pre-wrap rounded-md bg-muted p-2 text-sm text-foreground">
                      {item.notes}
                    </pre>
                  )}
                  {tab === "PENDING" && (
                    <div className="flex gap-2">
                      <Button disabled={busy} onClick={() => approve(item)}>
                        Setujui
                      </Button>
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={() => {
                          setRejecting(item);
                          setReason("");
                        }}
                      >
                        Tolak
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!rejecting} onOpenChange={(o) => !o && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Verifikasi — {rejecting?.user.name}</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={3}
            placeholder="Alasan penolakan"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Batal
            </Button>
            <Button variant="destructive" disabled={busy} onClick={submitReject}>
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export default function VerificationPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <Content />
    </AuthGuard>
  );
}
