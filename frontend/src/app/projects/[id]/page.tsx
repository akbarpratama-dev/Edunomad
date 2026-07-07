"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { ProjectDetailView } from "@/components/project/ProjectDetailView";
import { ProjectMembersPanel } from "@/components/project/ProjectMembersPanel";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PortfolioRecPanel } from "@/components/ai/PortfolioRecPanel";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { projectApi, type ProjectDetail } from "@/services/projectApi";
import { applicationApi } from "@/services/applicationApi";

// Confirm-and-run lifecycle action button (Workflow 5/11/15).
function LifecycleAction({
  label,
  title,
  description,
  confirmLabel,
  run,
  onDone,
  destructive,
}: {
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  run: () => Promise<unknown>;
  onDone: () => void;
  destructive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await run();
      toast.success(`${label} berhasil`);
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Gagal: ${label}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        variant={destructive ? "destructive" : "default"}
        disabled={busy}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel="Batal"
        destructive={destructive}
        onConfirm={confirm}
      />
    </>
  );
}

// Senior apply-as-mentor dialog (Workflow 3).
function SeniorApplyDialog({ project }: { project: ProjectDetail }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await applicationApi.applyAsMentor(project.id, message.trim() || undefined);
      toast.success("Lamaran mentor terkirim");
      setOpen(false);
      setMessage("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengirim lamaran");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Apply sebagai Mentor</Button>
      <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply sebagai Mentor</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="senior-message">Pesan untuk UMKM (opsional)</Label>
            <Textarea
              id="senior-message"
              rows={4}
              placeholder="Ceritakan pengalaman relevan Anda untuk proyek ini"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
              Batal
            </Button>
            <Button onClick={submit} disabled={busy}>
              Kirim Lamaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Beginner apply-to-role dialog (Workflow 4).
function BeginnerApplyDialog({ project }: { project: ProjectDetail }) {
  const [open, setOpen] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [motivation, setMotivation] = useState("");
  const [busy, setBusy] = useState(false);
  const hasRoles = project.projectRoles.length > 0;

  const submit = async () => {
    if (!roleId) {
      toast.error("Pilih peran terlebih dahulu");
      return;
    }
    setBusy(true);
    try {
      await applicationApi.applyToRole(project.id, {
        project_role_id: roleId,
        motivation: motivation.trim() || undefined,
      });
      toast.success("Lamaran terkirim");
      setOpen(false);
      setRoleId("");
      setMotivation("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengirim lamaran");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={!hasRoles}>
        Apply ke Peran
      </Button>
      {!hasRoles && (
        <p className="text-sm text-muted-foreground">Proyek ini belum membuka peran.</p>
      )}
      <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply ke Peran</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role">Peran</Label>
            <Select value={roleId} onValueChange={(v) => setRoleId(v ?? "")}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Pilih peran" />
              </SelectTrigger>
              <SelectContent>
                {project.projectRoles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.roleName} · {r.capacity} orang
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="motivation">Motivasi (opsional)</Label>
            <Textarea
              id="motivation"
              rows={4}
              placeholder="Mengapa Anda cocok untuk peran ini?"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
            />
          </div>
          <PortfolioRecPanel projectId={project.id} enabled={open} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
              Batal
            </Button>
            <Button onClick={submit} disabled={busy}>
              Kirim Lamaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Role-appropriate action panel for the project detail page.
function ActionPanel({ project, reload }: { project: ProjectDetail; reload: () => void }) {
  const appUser = useAuthStore((s) => s.appUser)!;
  const isOwner = appUser.role === "UMKM" && project.umkm.id === appUser.id;
  const isLeadSenior = appUser.role === "SENIOR" && project.senior?.id === appUser.id;
  const recruiting = project.status === "RECRUITING";
  const hasSenior = !!project.senior;

  if (isOwner) {
    return (
      <Card className="app-reveal">
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">Anda pemilik proyek ini</p>
          {project.status === "AWAITING_COMPLETION" && (
            <LifecycleAction
              label="Konfirmasi Penyelesaian"
              title="Konfirmasi penyelesaian proyek?"
              description="Proyek akan ditandai SELESAI dan menjadi read-only. Semua anggota aktif akan ditandai selesai."
              confirmLabel="Ya, Selesaikan"
              run={() => projectApi.confirmCompletion(project.id)}
              onDone={reload}
            />
          )}
          <Button render={<Link href={`/my-projects/${project.id}/manage`} />}>
            Kelola Lamaran Senior
          </Button>
          <Button variant="outline" render={<Link href="/my-projects" />}>
            Proyek Saya
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLeadSenior) {
    return (
      <Card className="app-reveal">
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">
            Anda mentor proyek ini
          </p>
          {recruiting && (
            <LifecycleAction
              label="Mulai Proyek"
              title="Mulai proyek ini?"
              description="Status proyek berubah dari Rekrutmen menjadi Aktif. Pastikan tim sudah siap — minimal satu beginner telah bergabung."
              confirmLabel="Ya, Mulai"
              run={() => projectApi.start(project.id)}
              onDone={reload}
            />
          )}
          {project.status === "ACTIVE" && (
            <LifecycleAction
              label="Ajukan Penyelesaian"
              title="Ajukan penyelesaian proyek?"
              description="UMKM akan diminta mengonfirmasi penyelesaian. Status berubah menjadi Menunggu Konfirmasi."
              confirmLabel="Ya, Ajukan"
              run={() => projectApi.requestCompletion(project.id)}
              onDone={reload}
            />
          )}
          <Button render={<Link href={`/my-projects/${project.id}/applicants`} />}>
            Kelola Lamaran Beginner
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (appUser.role === "SENIOR") {
    return (
      <Card className="app-reveal">
        <CardContent className="flex flex-col gap-2">
          {recruiting && !hasSenior ? (
            <SeniorApplyDialog project={project} />
          ) : (
            <>
              <Button disabled>Apply sebagai Mentor</Button>
              <p className="text-sm text-muted-foreground">
                {hasSenior
                  ? "Proyek ini sudah memiliki mentor."
                  : "Proyek ini tidak sedang membuka rekrutmen."}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  if (appUser.role === "BEGINNER") {
    return (
      <Card className="app-reveal">
        <CardContent className="flex flex-col gap-2">
          {recruiting && hasSenior ? (
            <BeginnerApplyDialog project={project} />
          ) : (
            <>
              <Button disabled>Apply ke Peran</Button>
              <p className="text-sm text-muted-foreground">
                {!recruiting
                  ? "Proyek ini tidak sedang membuka rekrutmen."
                  : "Menunggu mentor senior bergabung sebelum rekrutmen beginner dibuka."}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}

function Content() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  // Same page serves /projects/:id (from browse) and /my-projects/:id (from the
  // user's own projects). Keep navigation inside whichever section you came from.
  const pathname = usePathname();
  const base = pathname.startsWith("/my-projects") ? "/my-projects" : "/projects";
  const role = useAuthStore((s) => s.appUser?.role);
  // Beginner flow is board → workspace → detail, so Back from detail returns to
  // the workspace (reverse of how they arrived). UMKM/SENIOR flow is list →
  // detail → workspace, so their Back returns to the list.
  const backHref =
    role === "BEGINNER" && base === "/my-projects" ? `${base}/${id}/workspace` : base;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    projectApi
      .detail(id)
      .then(setProject)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Gagal memuat proyek")
      )
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  return (
    <AppShell backHref={backHref}>
      <div className="mx-auto w-full max-w-5xl">
        {loading ? (
          <ListSkeleton rows={5} />
        ) : error ? (
          <ErrorState message={error} onAction={load} />
        ) : project ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="min-w-0">
              <ProjectDetailView project={project} />
            </div>
            {/* Content already starts below the header (AppShell pt-16), so the
                sticky aside uses top-0: aligned with the left column at rest, and
                pinned to the cleared content top while scrolling. */}
            <aside className="flex flex-col gap-4 lg:sticky lg:top-0 lg:self-start">
              <ActionPanel project={project} reload={load} />
              {(project.status === "ACTIVE" || project.status === "AWAITING_COMPLETION") && (
                <Button
                  className="app-reveal w-full"
                  render={<Link href={`${base}/${project.id}/workspace`} />}
                >
                  Buka Workspace
                </Button>
              )}
              <ProjectMembersPanel key={project.status} project={project} />
            </aside>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}

export default function ProjectDetailPage() {
  return (
    <AuthGuard>
      <Content />
    </AuthGuard>
  );
}
