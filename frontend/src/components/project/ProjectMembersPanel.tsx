"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ProfileLink } from "@/components/common/ProfileLink";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import {
  projectApi,
  MEMBER_STATUS_META,
  type ProjectDetail,
  type ProjectMember,
} from "@/services/projectApi";

// Removal-reason dialog (SENIOR lead → Workflow 17 request).
function RemoveMemberDialog({
  member,
  onDone,
}: {
  member: ProjectMember;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!reason.trim()) {
      toast.error("Alasan wajib diisi");
      return;
    }
    setBusy(true);
    try {
      await projectApi.requestRemoveMember(member.id, reason.trim());
      toast.success("Permintaan pengeluaran dikirim ke admin");
      setOpen(false);
      setReason("");
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengirim permintaan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Keluarkan
      </Button>
      <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keluarkan {member.user.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Permintaan ini perlu dikonfirmasi admin sebelum anggota benar-benar dikeluarkan.
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="remove-reason">Alasan</Label>
            <Textarea
              id="remove-reason"
              rows={3}
              placeholder="Jelaskan alasan pengeluaran anggota ini"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
              Batal
            </Button>
            <Button variant="destructive" onClick={submit} disabled={busy}>
              Ajukan Pengeluaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ProjectMembersPanel({ project }: { project: ProjectDetail }) {
  const appUser = useAuthStore((s) => s.appUser)!;
  const [members, setMembers] = useState<ProjectMember[] | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const isLeadSenior = appUser.role === "SENIOR" && project.senior?.id === appUser.id;
  const isOwner = appUser.role === "UMKM" && project.umkm.id === appUser.id;
  const readonly = project.status === "COMPLETED";

  const load = useCallback(() => {
    projectApi
      .members(project.id)
      .then(setMembers)
      .catch(() => setMembers([]));
  }, [project.id]);
  useEffect(load, [load]);

  const withdraw = async (memberId: string) => {
    try {
      await projectApi.withdrawMember(memberId);
      toast.success("Anda telah keluar dari proyek");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal keluar dari proyek");
    }
  };

  // Hide entirely for non-stakeholders with no team yet.
  if (members && members.length === 0 && !isOwner && !isLeadSenior) return null;

  const myMembership = members?.find(
    (m) => m.user.id === appUser.id && m.status === "ACTIVE"
  );

  return (
    <Card className="app-reveal">
      <CardHeader>
        <CardTitle>Anggota Tim</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {members === null ? (
          <p className="text-sm text-muted-foreground">Memuat anggota…</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada anggota tim.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {members.map((m) => {
              const meta = MEMBER_STATUS_META[m.status];
              const isSelf = m.user.id === appUser.id;
              return (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      <ProfileLink userId={m.user.id}>{m.user.name}</ProfileLink>
                      {isSelf && <span className="text-muted-foreground"> (Anda)</span>}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {m.projectRole.roleName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={meta.variant} className={meta.className}>
                      {meta.label}
                    </Badge>
                    {isLeadSenior && !isSelf && m.status === "ACTIVE" && !readonly && (
                      <RemoveMemberDialog member={m} onDone={load} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {myMembership && !readonly && (
          <div className="pt-1">
            <Button variant="outline" size="sm" onClick={() => setWithdrawOpen(true)}>
              Keluar dari Proyek
            </Button>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        title="Keluar dari proyek ini?"
        description="Anda akan keluar dari proyek dan slot proyek aktif Anda akan dibebaskan. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        destructive
        onConfirm={() => myMembership && withdraw(myMembership.id)}
      />
    </Card>
  );
}
