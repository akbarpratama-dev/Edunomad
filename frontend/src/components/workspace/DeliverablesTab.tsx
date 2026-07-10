"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { FileText, Plus, Link as LinkIcon, Trash2, X } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  deliverableApi,
  DELIVERABLE_STATUS_META,
  type Deliverable,
} from "@/services/deliverableApi";
import { projectApi, type ProjectDetail } from "@/services/projectApi";

export function DeliverablesTab({ project }: { project: ProjectDetail }) {
  const appUser = useAuthStore((s) => s.appUser);
  const [items, setItems] = useState<Deliverable[] | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const isLeadSenior = appUser?.role === "SENIOR" && project.senior?.id === appUser.id;

  const load = useCallback(async () => {
    try {
      const [list, members] = await Promise.all([
        deliverableApi.listForProject(project.id),
        projectApi.members(project.id),
      ]);
      setItems(list);
      setIsMember(
        appUser?.role === "BEGINNER" &&
          members.some((m) => m.user.id === appUser.id && m.status === "ACTIVE")
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal memuat hasil kerja");
      setItems([]);
    }
  }, [project.id, appUser]);

  useEffect(() => {
    load();
  }, [load]);

  if (items === null) return <p className="text-sm text-muted-foreground">Memuat hasil kerja…</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Hasil Kerja</h2>
          <p className="text-sm text-muted-foreground">
            Kirim hasil kerja, lampirkan bukti, dan dapatkan review mentor.
          </p>
        </div>
        {isMember && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1.5 size-4" /> Buat Hasil Kerja
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
          <FileText className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Belum ada hasil kerja.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((d, i) => (
            <DeliverableCard
              key={d.id}
              deliverable={d}
              isOwner={d.submittedBy === appUser?.id}
              isLeadSenior={!!isLeadSenior}
              onChanged={load}
              index={i}
            />
          ))}
        </div>
      )}

      <DeliverableFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Buat Hasil Kerja"
        onSubmit={async (data) => {
          await deliverableApi.create(project.id, data);
          toast.success("Hasil kerja dibuat");
          load();
        }}
      />
    </div>
  );
}

function DeliverableCard({
  deliverable: d,
  isOwner,
  isLeadSenior,
  onChanged,
  index,
}: {
  deliverable: Deliverable;
  isOwner: boolean;
  isLeadSenior: boolean;
  onChanged: () => void;
  index: number;
}) {
  const meta = DELIVERABLE_STATUS_META[d.status];
  const [editOpen, setEditOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<unknown>, okMsg: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(okMsg);
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal");
    } finally {
      setBusy(false);
    }
  };

  const canEdit = isOwner && (d.status === "DRAFT" || d.status === "REVISION_REQUESTED");
  const canSubmit = canEdit;
  const canReview = isLeadSenior && d.status === "SUBMITTED";

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      className="app-reveal rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-foreground">{d.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">oleh {d.submitter.name}</p>
        </div>
        <Badge variant={meta.variant} className={meta.className}>
          {meta.label}
        </Badge>
      </div>

      {d.description && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{d.description}</p>
      )}

      {d.evidences.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {d.evidences.map((e) => (
            <li key={e.id} className="flex items-center gap-2 text-sm">
              <LinkIcon className="size-3.5 text-muted-foreground" />
              {e.url ? (
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-[#5f8c00] hover:underline"
                >
                  {e.url}
                </a>
              ) : (
                <span className="truncate text-muted-foreground">{e.filePath}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Revision feedback (owner sees mentor's notes). */}
      {d.status === "REVISION_REQUESTED" && d.revisionFeedback && (
        <div className="mt-3 rounded-xl bg-orange-50 p-3 text-sm">
          <p className="font-semibold text-orange-700">Feedback mentor</p>
          <p className="mt-0.5 whitespace-pre-wrap text-orange-800">{d.revisionFeedback}</p>
        </div>
      )}

      {(canEdit || canSubmit || canReview) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {canSubmit && (
            <Button size="sm" disabled={busy} onClick={() => setSubmitOpen(true)}>
              {d.status === "REVISION_REQUESTED" ? "Kirim Ulang" : "Kirim untuk Review"}
            </Button>
          )}
          {canEdit && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          )}
          {canReview && (
            <>
              <Button
                size="sm"
                disabled={busy}
                onClick={() => run(() => deliverableApi.approve(d.id), "Hasil kerja disetujui")}
              >
                Setujui
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => setRevisionOpen(true)}>
                Minta Revisi
              </Button>
            </>
          )}
        </div>
      )}

      <DeliverableFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Hasil Kerja"
        initial={{ title: d.title, description: d.description ?? "" }}
        onSubmit={async (data) => {
          await deliverableApi.update(d.id, data);
          toast.success("Hasil kerja diperbarui");
          onChanged();
        }}
      />
      <SubmitEvidenceDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        onSubmit={async (urls) => {
          await deliverableApi.submit(
            d.id,
            urls.map((url) => ({ type: "LINK" as const, url }))
          );
          toast.success("Hasil kerja dikirim");
          onChanged();
        }}
      />
      <RevisionDialog
        open={revisionOpen}
        onOpenChange={setRevisionOpen}
        onSubmit={async (feedback) => {
          await deliverableApi.requestRevision(d.id, feedback);
          toast.success("Revisi diminta");
          onChanged();
        }}
      />
    </article>
  );
}

// --- dialogs ---

function DeliverableFormDialog({
  open,
  onOpenChange,
  title,
  initial,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  initial?: { title: string; description: string };
  onSubmit: (data: { title: string; description?: string }) => Promise<void>;
}) {
  const [t, setT] = useState(initial?.title ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setT(initial?.title ?? "");
      setDesc(initial?.description ?? "");
    }
  }, [open, initial?.title, initial?.description]);

  const save = async () => {
    if (!t.trim()) return;
    setBusy(true);
    try {
      await onSubmit({ title: t.trim(), description: desc.trim() || undefined });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="d-title">Judul</Label>
            <Input id="d-title" value={t} onChange={(e) => setT(e.target.value)} maxLength={255} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="d-desc">Deskripsi</Label>
            <Textarea id="d-desc" value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button disabled={busy || !t.trim()} onClick={save}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubmitEvidenceDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (urls: string[]) => Promise<void>;
}) {
  const [urls, setUrls] = useState<string[]>([""]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setUrls([""]);
  }, [open]);

  const submit = async () => {
    const clean = urls.map((u) => u.trim()).filter(Boolean);
    if (clean.length === 0) {
      toast.error("Lampirkan minimal satu link bukti");
      return;
    }
    setBusy(true);
    try {
      await onSubmit(clean);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengirim");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kirim untuk Review</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label>Link Bukti (GitHub, Figma, URL live)</Label>
          {urls.map((u, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={u}
                onChange={(e) => setUrls((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                placeholder="https://…"
                type="url"
              />
              {urls.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Hapus link"
                  onClick={() => setUrls((arr) => arr.filter((_, j) => j !== i))}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => setUrls((arr) => [...arr, ""])}
          >
            <Plus className="mr-1 size-3.5" /> Tambah link
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button disabled={busy} onClick={submit}>
            Kirim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RevisionDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (feedback: string) => Promise<void>;
}) {
  const [fb, setFb] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setFb("");
  }, [open]);

  const submit = async () => {
    if (!fb.trim()) return;
    setBusy(true);
    try {
      await onSubmit(fb.trim());
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Minta Revisi</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rev-fb">Feedback untuk beginner</Label>
          <Textarea
            id="rev-fb"
            value={fb}
            onChange={(e) => setFb(e.target.value)}
            rows={4}
            placeholder="Jelaskan apa yang perlu diperbaiki…"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button disabled={busy || !fb.trim()} onClick={submit}>
            Kirim Revisi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
