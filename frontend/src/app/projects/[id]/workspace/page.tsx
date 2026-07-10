"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  CalendarDays,
  Building2,
  GraduationCap,
  CalendarClock,
  Users,
  ArrowRight,
  MessageSquare,
  TrendingUp,
  ClipboardList,
  FileText,
  Star,
  ShieldCheck,
  CheckCircle2,
  Flag,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { PillTabs } from "@/components/common/PillTabs";
import { ProjectMembersPanel } from "@/components/project/ProjectMembersPanel";
import { ProjectThumb } from "@/components/artifact/shared";
import { ProgressBar } from "@/components/project/ProjectDashboardShell";
import { deliverableApi, type Deliverable } from "@/services/deliverableApi";
import { DeliverablesTab } from "@/components/workspace/DeliverablesTab";
import { ContributionTab } from "@/components/workspace/ContributionTab";
import { ReviewTab } from "@/components/workspace/ReviewTab";
import { ArtifactTab } from "@/components/workspace/ArtifactTab";
import { DirectMessageDialog } from "@/components/workspace/DirectMessageDialog";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { toast } from "sonner";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  projectApi,
  PROJECT_STATUS_META,
  type ProjectDetail,
  type ProjectMember,
  type Milestone,
  type MilestoneStatus,
  type WorkspaceSummary,
} from "@/services/projectApi";

type TabKey =
  | "overview"
  | "milestones"
  | "deliverables"
  | "contributions"
  | "reviews"
  | "artifacts"
  | "members";
// Diskusi is now its own page (/workspace/diskusi), not a tab.
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Ringkasan" },
  { key: "milestones", label: "Milestone" },
  { key: "deliverables", label: "Hasil Kerja" },
  { key: "contributions", label: "Kontribusi" },
  { key: "reviews", label: "Review" },
  { key: "artifacts", label: "Sertifikat" },
  { key: "members", label: "Anggota" },
];

function WorkspaceInner() {
  const params = useParams();
  const id = params.id as string;
  const wsPathname = usePathname();
  const wsBase = wsPathname.startsWith("/my-projects") ? "/my-projects" : "/projects";
  const appUser = useAuthStore((s) => s.appUser);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");
  const [completeOpen, setCompleteOpen] = useState(false);

  // Deep-link a tab via ?tab=discussion (e.g. "Diskusi" shortcut from Proyek
  // Mentoring / Proyek Saya). Read client-side to skip a Suspense boundary,
  // matching the register page's ?role= pattern.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t && TABS.some((tab) => tab.key === t)) setTab(t as TabKey);
  }, []);

  useEffect(() => {
    let active = true;
    projectApi
      .detail(id)
      .then((p) => active && setProject(p))
      .catch((err) =>
        active && setError(err instanceof ApiError ? err.message : "Gagal memuat proyek")
      );
    return () => {
      active = false;
    };
  }, [id]);

  // Tab badge counts ("needs attention" per role): the number of pending items
  // per tab (deliverables to review, milestones still open, etc.). A badge only
  // clears once the underlying work is actually done — not merely by opening the
  // tab. To keep it from going stale after an action, the summary is re-fetched
  // (a) whenever the active tab changes, and (b) whenever the window/tab regains
  // focus (e.g. after completing work elsewhere and returning).
  const loadSummary = useCallback(() => {
    projectApi
      .workspaceSummary(id)
      .then(setSummary)
      .catch(() => {
        /* badges are best-effort — never block the workspace */
      });
  }, [id]);
  useEffect(() => {
    loadSummary();
  }, [loadSummary, tab]);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") loadSummary();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadSummary]);

  if (error) return <ErrorState message={error} />;
  if (!project) return <ListSkeleton />;

  const statusMeta = PROJECT_STATUS_META[project.status];
  const isLeadSenior = appUser?.role === "SENIOR" && project.senior?.id === appUser.id;

  const completeProject = async () => {
    try {
      const updated = await projectApi.complete(id);
      setProject(updated);
      toast.success("Proyek selesai. Sertifikat mahasiswa telah diterbitkan.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyelesaikan proyek");
    }
  };

  // Attach the "needs attention" count to each tab (0 hides the badge).
  const badgeFor: Record<TabKey, number> = {
    overview: 0,
    milestones: summary?.milestones ?? 0,
    deliverables: summary?.deliverables ?? 0,
    contributions: summary?.contributions ?? 0,
    reviews: summary?.reviews ?? 0,
    artifacts: summary?.artifacts ?? 0,
    members: 0,
  };
  const tabsWithBadges = TABS.map((t) => ({
    ...t,
    count: badgeFor[t.key],
    tone: "alert" as const,
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="app-reveal flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-4">
          {project.imageUrl && (
            <ProjectThumb
              title={project.title}
              imageUrl={project.imageUrl}
              className="hidden h-16 w-24 shrink-0 rounded-xl sm:block"
            />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-h1 tracking-tight text-balance">
                {project.title}
              </h1>
              <Badge variant={statusMeta.variant} className={statusMeta.className}>
                {statusMeta.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Workspace proyek — kolaborasi tim & progres.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" render={<Link href={`${wsBase}/${id}`} />}>
            <ClipboardList className="size-4" /> Detail Proyek
          </Button>
          {isLeadSenior && project.status === "ACTIVE" && (
            <Button onClick={() => setCompleteOpen(true)}>
              <CheckCircle2 className="size-4" /> Selesaikan Proyek
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        title="Selesaikan proyek ini?"
        description="Proyek langsung ditandai SELESAI dan sertifikat setiap mahasiswa aktif otomatis diterbitkan. Pastikan hasil kerja, kontribusi, dan review sudah beres."
        confirmLabel="Ya, Selesaikan"
        cancelLabel="Batal"
        onConfirm={completeProject}
      />

      <PillTabs tabs={tabsWithBadges} value={tab} onChange={setTab} ariaLabel="Navigasi workspace" variant="underline" />

      {tab === "overview" && <OverviewTab project={project} onTab={setTab} base={wsBase} />}
      {tab === "milestones" && <MilestonesTab project={project} />}
      {tab === "deliverables" && <DeliverablesTab project={project} />}
      {tab === "contributions" && <ContributionTab project={project} />}
      {tab === "reviews" && <ReviewTab project={project} />}
      {tab === "artifacts" && <ArtifactTab project={project} />}
      {tab === "members" && <MembersTab project={project} />}
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground" aria-hidden="true">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

// Small metric tile for the overview stat grid.
function StatTile({
  icon: Icon,
  tone,
  value,
  label,
  sub,
}: {
  icon: typeof Users;
  tone: string;
  value: string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="app-reveal rounded-[18px] border border-border bg-card p-4">
      <span className={`grid size-9 place-items-center rounded-xl ${tone}`} aria-hidden="true">
        <Icon className="size-4" />
      </span>
      <p className="mt-2.5 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground/80">{sub}</p>}
    </div>
  );
}

// Quick-access card that either switches a workspace tab or links out (Diskusi).
function QuickCard({
  icon: Icon,
  label,
  desc,
  tone,
  onClick,
  href,
}: {
  icon: typeof Users;
  label: string;
  desc: string;
  tone: string;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <>
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`} aria-hidden="true">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold tracking-tight text-foreground">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </>
  );
  const cls =
    "group app-reveal flex items-center gap-3 rounded-[18px] border border-border bg-card p-4 text-left transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(32,31,49,0.08)]";
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

function OverviewTab({
  project,
  onTab,
  base,
}: {
  project: ProjectDetail;
  onTab: (t: TabKey) => void;
  base: string;
}) {
  const role = useAuthStore((s) => s.appUser?.role);
  const [members, setMembers] = useState<ProjectMember[] | null>(null);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  useEffect(() => {
    let active = true;
    projectApi.members(project.id).then((m) => active && setMembers(m)).catch(() => {});
    deliverableApi.listForProject(project.id).then((d) => active && setDeliverables(d)).catch(() => {});
    return () => {
      active = false;
    };
  }, [project.id]);

  const team = (members ?? []).filter((m) => m.status === "ACTIVE");
  const ms = project.milestones;
  const doneM = ms.filter((m) => m.status === "COMPLETED").length;
  const pct = ms.length > 0 ? Math.round((doneM / ms.length) * 100) : 0;
  const approvedD = deliverables.filter((d) => d.status === "APPROVED").length;
  const daysLeft = Math.max(0, Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86_400_000));
  const diskusiHref = `${base}/${project.id}/workspace/diskusi`;

  return (
    <div className="flex flex-col gap-4">
      {/* Stat grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={TrendingUp} tone="bg-[#eef7d6] text-[#5f8c00]" value={`${pct}%`} label="Progres Proyek" sub={`${doneM}/${ms.length} milestone`} />
        <StatTile icon={ClipboardList} tone="bg-sky-100 text-sky-700" value={String(deliverables.length)} label="Hasil Kerja" sub={`${approvedD} disetujui`} />
        <StatTile icon={Users} tone="bg-violet-100 text-violet-700" value={String(team.length)} label="Anggota Tim" sub="Aktif" />
        <StatTile icon={CalendarDays} tone="bg-rose-100 text-rose-700" value={String(daysLeft)} label="Hari Tersisa" sub="Sebelum deadline" />
      </div>

      {/* Progress bar */}
      <Card className="app-reveal">
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Progres Keseluruhan</span>
            <span className="font-bold tabular-nums text-[#5f8c00]">{pct}%</span>
          </div>
          <ProgressBar pct={pct} />
          <p className="text-xs text-muted-foreground">
            {ms.length > 0 ? `${doneM} dari ${ms.length} milestone selesai` : "Belum ada milestone"}
          </p>
        </CardContent>
      </Card>

      {/* Akses cepat ke fitur workspace */}
      <div>
        <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Akses Cepat</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <QuickCard icon={Flag} label="Milestone" desc="Pantau tahapan proyek" tone="bg-[#eef7d6] text-[#5f8c00]" onClick={() => onTab("milestones")} />
          <QuickCard icon={FileText} label="Hasil Kerja" desc="Kiriman & bukti kerja" tone="bg-sky-100 text-sky-700" onClick={() => onTab("deliverables")} />
          <QuickCard icon={CheckCircle2} label="Kontribusi" desc="Laporan kontribusi tim" tone="bg-emerald-100 text-emerald-700" onClick={() => onTab("contributions")} />
          {/* Diskusi = mentor + mahasiswa only; hidden for UMKM (rule D-DISKUSI-2). */}
          {role !== "UMKM" && (
            <QuickCard icon={MessageSquare} label="Diskusi" desc="Ruang diskusi & tanya jawab" tone="bg-violet-100 text-violet-700" href={diskusiHref} />
          )}
          <QuickCard icon={Star} label="Review" desc="Penilaian & feedback" tone="bg-amber-100 text-amber-700" onClick={() => onTab("reviews")} />
          <QuickCard icon={ShieldCheck} label="Sertifikat" desc="Artefak terverifikasi" tone="bg-teal-100 text-teal-700" onClick={() => onTab("artifacts")} />
        </div>
      </div>

      {/* Deskripsi + info + tim */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="app-reveal md:col-span-2">
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Deskripsi</h2>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">{project.description}</p>
            </div>
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ekspektasi Hasil Kerja</h2>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-foreground/90">{project.expectedDeliverables}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="app-reveal">
            <CardContent className="space-y-3">
              <MetaRow icon={Building2} label="UMKM" value={project.umkm.name} />
              <MetaRow icon={GraduationCap} label="Mentor" value={project.senior?.name ?? "Belum ada"} />
              <MetaRow
                icon={CalendarDays}
                label="Deadline"
                value={new Date(project.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              />
            </CardContent>
          </Card>

          <Card className="app-reveal">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-tight">Tim Proyek</h2>
                <button type="button" onClick={() => onTab("members")} className="text-xs font-semibold text-[#5f8c00] hover:underline">
                  Lihat semua
                </button>
              </div>
              {team.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada anggota aktif.</p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {team.slice(0, 5).map((m) => (
                    <li key={m.user.id} className="flex items-center gap-2.5">
                      <UserAvatar name={m.user.name} className="size-8 shrink-0 text-[11px] font-bold bg-[#d8f277] text-[#0b0b0b]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{m.user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{m.projectRole.roleName}</p>
                      </div>
                    </li>
                  ))}
                  {team.length > 5 && (
                    <li className="text-xs text-muted-foreground">+{team.length - 5} anggota lainnya</li>
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Milestone timeline */}
      <Card className="app-reveal">
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight">Timeline Milestone</h2>
            <button type="button" onClick={() => onTab("milestones")} className="text-xs font-semibold text-[#5f8c00] hover:underline">
              Kelola
            </button>
          </div>
          {ms.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada milestone.</p>
          ) : (
            <ol>
              {ms.map((m, i) => {
                const done = m.status === "COMPLETED";
                const current = !done && ms.slice(0, i).every((p) => p.status === "COMPLETED");
                const last = i === ms.length - 1;
                return (
                  <li key={m.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {done ? (
                        <span className="flex size-6 items-center justify-center rounded-full bg-[#d8f277] text-[#0b0b0b]">
                          <CheckCircle2 className="size-4" />
                        </span>
                      ) : current ? (
                        <span className="size-6 rounded-full border-[3px] border-[#0b0b0b] bg-card" />
                      ) : (
                        <span className="size-6 rounded-full border border-border bg-muted" />
                      )}
                      {!last && <span className={`w-0.5 flex-1 ${done ? "bg-[#d8f277]" : "bg-border"}`} style={{ minHeight: 20 }} />}
                    </div>
                    <div className={last ? "pb-0" : "pb-4"}>
                      <p className={`text-sm font-semibold ${done ? "text-muted-foreground line-through" : current ? "text-foreground" : ""}`}>
                        {m.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tenggat {new Date(m.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        {current && <span className="ml-2 font-medium text-[#5f8c00]">· Sedang berjalan</span>}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const MS_STATUS_META: Record<MilestoneStatus, { label: string; className: string }> = {
  PENDING: { label: "Belum Mulai", className: "border-border bg-muted text-muted-foreground" },
  IN_PROGRESS: { label: "Berjalan", className: "border-amber-300 bg-amber-50 text-amber-700" },
  COMPLETED: { label: "Selesai", className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
};
const MS_STATUS_ORDER: MilestoneStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];

// yyyy-mm-dd for <input type="date"> (from an ISO string).
function toDateInput(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function MilestonesTab({ project }: { project: ProjectDetail }) {
  const appId = useAuthStore((s) => s.appUser?.id);
  const isManager = !!appId && (appId === project.senior?.id || appId === project.umkm.id);
  const [items, setItems] = useState<Milestone[]>(project.milestones);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [deleting, setDeleting] = useState<Milestone | null>(null);
  const [busy, setBusy] = useState(false);
  // form fields
  const [fTitle, setFTitle] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fDue, setFDue] = useState("");
  const [fStatus, setFStatus] = useState<MilestoneStatus>("PENDING");

  const openCreate = () => {
    setEditing(null);
    setFTitle("");
    setFDesc("");
    setFDue("");
    setFStatus("PENDING");
    setDialogOpen(true);
  };
  const openEdit = (m: Milestone) => {
    setEditing(m);
    setFTitle(m.title);
    setFDesc(m.description ?? "");
    setFDue(toDateInput(m.dueDate));
    setFStatus((m.status as MilestoneStatus) ?? "PENDING");
    setDialogOpen(true);
  };

  const save = async () => {
    if (!fTitle.trim()) return toast.error("Judul milestone wajib diisi");
    if (!fDue) return toast.error("Tenggat wajib diisi");
    setBusy(true);
    try {
      if (editing) {
        const updated = await projectApi.updateMilestone(editing.id, {
          title: fTitle.trim(),
          description: fDesc.trim() || undefined,
          due_date: fDue,
          status: fStatus,
        });
        setItems((xs) => xs.map((x) => (x.id === updated.id ? updated : x)));
        toast.success("Milestone diperbarui");
      } else {
        const created = await projectApi.addMilestone(project.id, {
          title: fTitle.trim(),
          description: fDesc.trim() || undefined,
          due_date: fDue,
        });
        setItems((xs) => [...xs, created]);
        toast.success("Milestone ditambahkan");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyimpan milestone");
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (m: Milestone, status: MilestoneStatus) => {
    try {
      const updated = await projectApi.updateMilestone(m.id, {
        title: m.title,
        description: m.description ?? undefined,
        due_date: toDateInput(m.dueDate),
        status,
      });
      setItems((xs) => xs.map((x) => (x.id === updated.id ? updated : x)));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengubah status");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await projectApi.deleteMilestone(deleting.id);
      setItems((xs) => xs.filter((x) => x.id !== deleting.id));
      toast.success("Milestone dihapus");
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menghapus milestone");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {isManager && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{items.length} milestone</p>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" /> Tambah Milestone
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        isManager ? (
          <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-border py-14 text-center">
            <CalendarClock className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Belum ada milestone. Tambahkan tahapan pertama.</p>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" /> Tambah Milestone
            </Button>
          </div>
        ) : (
          <EmptyState
            icon={CalendarClock}
            heading="Belum Ada Milestone"
            message="Milestone proyek akan tampil di sini setelah ditetapkan."
          />
        )
      ) : (
        items.map((m, i) => {
          const meta = MS_STATUS_META[(m.status as MilestoneStatus) ?? "PENDING"];
          return (
            <article
              key={m.id}
              style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
              className="app-reveal flex flex-col gap-3 rounded-[20px] border border-border bg-card p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex min-w-0 gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef7d6] text-[#5f8c00]" aria-hidden="true">
                  <CalendarClock className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold tracking-tight">{m.title}</p>
                  {m.description && <p className="mt-0.5 text-sm text-muted-foreground">{m.description}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tenggat {new Date(m.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {isManager ? (
                  <>
                    <Select value={m.status} onValueChange={(v) => v && changeStatus(m, v as MilestoneStatus)}>
                      <SelectTrigger className="h-8 w-[140px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MS_STATUS_ORDER.map((s) => (
                          <SelectItem key={s} value={s}>
                            {MS_STATUS_META[s].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" className="size-8" onClick={() => openEdit(m)} aria-label="Edit milestone">
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="size-8" onClick={() => setDeleting(m)} aria-label="Hapus milestone">
                      <Trash2 className="size-4" />
                    </Button>
                  </>
                ) : (
                  <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
                )}
              </div>
            </article>
          );
        })
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !busy && setDialogOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Milestone" : "Tambah Milestone"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ms-title">Judul</Label>
              <Input id="ms-title" placeholder="cth. Setup Proyek & Desain UI" value={fTitle} maxLength={255} onChange={(e) => setFTitle(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ms-desc">Deskripsi (opsional)</Label>
              <Textarea id="ms-desc" placeholder="Detail tahapan…" value={fDesc} onChange={(e) => setFDesc(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ms-due">Tenggat</Label>
              <Input id="ms-due" type="date" value={fDue} onChange={(e) => setFDue(e.target.value)} />
            </div>
            {editing && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ms-status">Status</Label>
                <Select value={fStatus} onValueChange={(v) => v && setFStatus(v as MilestoneStatus)}>
                  <SelectTrigger id="ms-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MS_STATUS_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>
                        {MS_STATUS_META[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={busy}>Batal</Button>
            <Button onClick={save} disabled={busy}>{busy ? "Menyimpan…" : editing ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Hapus Milestone"
        description={`Yakin ingin menghapus milestone "${deleting?.title}"?`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}

// Members tab = the shared lifecycle panel + DM launchers for other participants.
function MembersTab({ project }: { project: ProjectDetail }) {
  const myId = useAuthStore((s) => s.user?.id);
  const [members, setMembers] = useState<ProjectMember[] | null>(null);

  useEffect(() => {
    let active = true;
    projectApi.members(project.id).then((m) => active && setMembers(m));
    return () => {
      active = false;
    };
  }, [project.id]);

  // DM targets = senior + active members, minus self.
  const dmTargets = useMemo(() => {
    const map = new Map<string, string>();
    if (project.senior) map.set(project.senior.id, project.senior.name);
    members
      ?.filter((m) => m.status === "ACTIVE")
      .forEach((m) => map.set(m.user.id, m.user.name));
    if (myId) map.delete(myId);
    return [...map.entries()].map(([uid, name]) => ({ uid, name }));
  }, [members, project.senior, myId]);

  return (
    <div className="flex flex-col gap-5">
      <ProjectMembersPanel project={project} />

      <Card className="app-reveal">
        <CardContent className="space-y-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Pesan Langsung
          </h3>
          {dmTargets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada anggota lain untuk dihubungi.</p>
          ) : (
            <ul className="divide-y divide-border">
              {dmTargets.map((t) => (
                <li key={t.uid} className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-medium">{t.name}</span>
                  <DirectMessageDialog targetUserId={t.uid} targetName={t.name} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function WorkspacePage() {
  const params = useParams();
  const id = params.id as string;
  const pathname = usePathname();
  const base = pathname.startsWith("/my-projects") ? "/my-projects" : "/projects";
  const role = useAuthStore((s) => s.appUser?.role);
  // Beginner's /my-projects is the board (no per-project detail page in their flow).
  // Back from workspace goes straight to the list, not to the detail.
  const backHref =
    role === "BEGINNER" && base === "/my-projects" ? "/my-projects" : `${base}/${id}`;
  return (
    <AuthGuard>
      <AppShell backHref={backHref}>
        <WorkspaceInner />
      </AppShell>
    </AuthGuard>
  );
}
