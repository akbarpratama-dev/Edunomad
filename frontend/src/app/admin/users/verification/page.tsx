"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
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
import { PageHeader } from "@/components/common/PageHeader";
import { PillTabs } from "@/components/common/PillTabs";
import { ListSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { initials } from "@/components/dashboard/dashboardKit";
import { Inbox } from "lucide-react";
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
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Verifikasi Pengguna"
          subtitle="Tinjau dan verifikasi permintaan akun mentor, UMKM, dan beginner."
        />

        <PillTabs tabs={TABS} value={tab} onChange={setTab} ariaLabel="Filter status verifikasi" />

        {loading ? (
          <ListSkeleton rows={4} />
        ) : items.length === 0 ? (
          <EmptyState icon={Inbox} heading="Belum Ada Permintaan" message={`Tidak ada permintaan ${tab.toLowerCase()}.`} />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, i) => (
              <article
                key={item.id}
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                className="app-reveal flex flex-col gap-3 rounded-[20px] border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-full bg-violet-200 text-sm font-bold text-violet-900"
                      aria-hidden="true"
                    >
                      {initials(item.user.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
                        {item.user.name}
                        <Badge variant="secondary">{item.user.role}</Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">{item.user.email}</p>
                      {item.user.profile?.headline && (
                        <p className="text-sm text-foreground/80">{item.user.profile.headline}</p>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
                {item.notes && (
                  <pre className="whitespace-pre-wrap rounded-xl bg-muted/50 px-3.5 py-2.5 font-sans text-sm text-foreground/80">
                    {item.notes}
                  </pre>
                )}
                {tab === "PENDING" && (
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy} onClick={() => approve(item)}>
                      Setujui
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
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
              </article>
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
