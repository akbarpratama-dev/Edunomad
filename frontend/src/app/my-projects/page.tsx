"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FolderKanban,
  Plus,
  Search,
  Users,
  Clock,
  FolderCheck,
  UserPlus,
  ClipboardList,
  GraduationCap,
  Lightbulb,
  MessageSquare,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { PillTabs } from "@/components/common/PillTabs";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { BeginnerProjectBoard } from "@/components/project/BeginnerProjectBoard";
import {
  DashboardLayout,
  RichProjectCard,
  StatGrid,
  SidebarCard,
  ActiveProjectsList,
  TipsCard,
  type StatItem,
} from "@/components/project/ProjectDashboardShell";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import {
  projectApi,
  type ProjectListItem,
  type ProjectStatus,
} from "@/services/projectApi";

type TabKey = ProjectStatus | "ALL";

const ACTIVE_STATUSES: ProjectStatus[] = ["ACTIVE", "AWAITING_COMPLETION"];

// Distinct beginners across a set of projects (real, from projectMembers).
function distinctStudents(items: ProjectListItem[]): number {
  const ids = new Set<string>();
  items.forEach((p) => (p.projectMembers ?? []).forEach((m) => ids.add(m.user.id)));
  return ids.size;
}

// Shared search + tab toolbar.
function Toolbar({
  tabs,
  tab,
  onTab,
  search,
  onSearch,
}: {
  tabs: { key: TabKey; label: string }[];
  tab: TabKey;
  onTab: (t: TabKey) => void;
  search: string;
  onSearch: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <PillTabs tabs={tabs} value={tab} onChange={(v) => onTab(v as TabKey)} ariaLabel="Filter status proyek" />
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Cari proyek atau mahasiswa…"
          className="h-11 w-full rounded-[12px] border border-input bg-secondary pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

function useFilter(items: ProjectListItem[], tab: TabKey, search: string) {
  return useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((p) => {
      if (tab !== "ALL" && p.status !== tab) return false;
      if (!q) return true;
      const hay = `${p.title} ${p.description} ${(p.projectMembers ?? [])
        .map((m) => m.user.name)
        .join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, tab, search]);
}

// ---------------------------------------------------------------------------
// SENIOR — "Proyek Mentoring"
// ---------------------------------------------------------------------------
function SeniorView() {
  const [items, setItems] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    projectApi
      .mentoredProjects()
      .then((p) => active && setItems(p))
      .catch(() => active && toast.error("Gagal memuat proyek"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "ALL", label: "Semua" },
    { key: "ACTIVE", label: "Aktif" },
    { key: "AWAITING_COMPLETION", label: "Menunggu Review" },
    { key: "COMPLETED", label: "Selesai" },
  ];
  const visible = useFilter(items, tab, search);
  const activeProjects = items.filter((p) => ACTIVE_STATUSES.includes(p.status));

  const stats: StatItem[] = [
    { icon: FolderCheck, label: "Proyek Aktif", value: items.filter((p) => p.status === "ACTIVE").length, tone: "bg-emerald-50 text-emerald-700" },
    { icon: Clock, label: "Menunggu Review", value: items.filter((p) => p.status === "AWAITING_COMPLETION").length, tone: "bg-amber-50 text-amber-700" },
    { icon: Users, label: "Mahasiswa Dibimbing", value: distinctStudents(items), tone: "bg-sky-50 text-sky-700" },
    { icon: GraduationCap, label: "Proyek Selesai", value: items.filter((p) => p.status === "COMPLETED").length, tone: "bg-violet-50 text-violet-700" },
  ];

  return (
    <AppShell>
      <DashboardLayout
        header={
          <PageHeader
            title="Proyek Saya"
            subtitle="Kelola dan pantau proyek yang kamu bimbing sebagai mentor."
          />
        }
        toolbar={<Toolbar tabs={tabs} tab={tab} onTab={setTab} search={search} onSearch={setSearch} />}
        main={
          loading ? (
            <ListSkeleton rows={3} />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              heading="Belum Ada Proyek Saya"
              message="Lamar sebagai mentor pada proyek yang membutuhkan untuk mulai membimbing tim."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {visible.map((item, i) => (
                <RichProjectCard
                  key={item.id}
                  item={item}
                  i={i}
                  actions={
                    <>
                      {(item.status === "ACTIVE" || item.status === "AWAITING_COMPLETION") && (
                        <>
                          <Button size="sm" render={<Link href={`/my-projects/${item.id}/workspace`} />}>
                            {item.status === "AWAITING_COMPLETION" ? "Review Proyek" : "Buka Workspace"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            render={<Link href={`/my-projects/${item.id}/workspace/diskusi`} />}
                          >
                            <MessageSquare className="size-4" /> Diskusi
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" render={<Link href={`/my-projects/${item.id}`} />}>
                        Lihat Detail
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )
        }
        sidebar={
          <>
            <SidebarCard title="Ringkasan Mentoring">
              <StatGrid items={stats} />
            </SidebarCard>
            <SidebarCard title="Proyek Aktif">
              <ActiveProjectsList items={activeProjects} base="/my-projects" />
            </SidebarCard>
            <TipsCard
              icon={Lightbulb}
              title="Tips Mentoring Efektif"
              tips={[
                "Berikan feedback yang spesifik dan konstruktif",
                "Ajukan pertanyaan yang mendorong berpikir kritis",
                "Pantau progress secara berkala",
                "Rayakan setiap pencapaian mereka",
              ]}
            />
          </>
        }
      />
    </AppShell>
  );
}

// ---------------------------------------------------------------------------
// UMKM — "Proyek Saya"
// ---------------------------------------------------------------------------
function UmkmView() {
  const [items, setItems] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("ALL");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<ProjectListItem | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    projectApi
      .myProjects({ limit: 100 })
      .then((r) => setItems(r.data))
      .catch(() => toast.error("Gagal memuat proyek"))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const submit = async (item: ProjectListItem) => {
    setBusy(true);
    try {
      await projectApi.submit(item.id);
      toast.success("Proyek dikirim untuk ditinjau");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengirim proyek");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await projectApi.remove(deleting.id);
      toast.success("Proyek dihapus");
      setDeleting(null);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menghapus proyek");
    } finally {
      setBusy(false);
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "ALL", label: "Semua" },
    { key: "DRAFT", label: "Draf" },
    { key: "PENDING_REVIEW", label: "Menunggu Tinjauan" },
    { key: "RECRUITING", label: "Rekrutmen" },
    { key: "ACTIVE", label: "Aktif" },
    { key: "COMPLETED", label: "Selesai" },
  ];
  const visible = useFilter(items, tab, search);
  const activeProjects = items.filter((p) => ACTIVE_STATUSES.includes(p.status));

  const stats: StatItem[] = [
    { icon: FolderCheck, label: "Proyek Aktif", value: items.filter((p) => p.status === "ACTIVE").length, tone: "bg-emerald-50 text-emerald-700" },
    { icon: UserPlus, label: "Dalam Rekrutmen", value: items.filter((p) => p.status === "RECRUITING").length, tone: "bg-sky-50 text-sky-700" },
    { icon: ClipboardList, label: "Menunggu Tinjauan", value: items.filter((p) => p.status === "PENDING_REVIEW").length, tone: "bg-amber-50 text-amber-700" },
    { icon: FolderKanban, label: "Total Proyek", value: items.length, tone: "bg-violet-50 text-violet-700" },
  ];

  return (
    <AppShell>
      <DashboardLayout
        header={
          <PageHeader
            title="Proyek Saya"
            subtitle="Kelola proyek yang kamu publikasikan, pantau progres, dan rekrutmen timnya."
            action={
              <Button render={<Link href="/projects/create" />}>
                <Plus className="size-4" /> Buat Proyek
              </Button>
            }
          />
        }
        toolbar={<Toolbar tabs={tabs} tab={tab} onTab={setTab} search={search} onSearch={setSearch} />}
        main={
          loading ? (
            <ListSkeleton rows={3} />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              heading="Belum Ada Proyek"
              message="Buat proyek pertama Anda untuk mulai berkolaborasi dengan talenta."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {visible.map((item, i) => (
                <RichProjectCard
                  key={item.id}
                  item={item}
                  i={i}
                  actions={
                    <>
                      {item.status === "DRAFT" ? (
                        <>
                          <Button size="sm" disabled={busy} onClick={() => submit(item)}>
                            Kirim untuk Ditinjau
                          </Button>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" render={<Link href={`/my-projects/${item.id}`} />}>
                              Detail
                            </Button>
                            <Button variant="outline" size="sm" disabled={busy} onClick={() => setDeleting(item)}>
                              Hapus
                            </Button>
                          </div>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" render={<Link href={`/my-projects/${item.id}`} />}>
                          Lihat Detail
                        </Button>
                      )}
                    </>
                  }
                />
              ))}
            </div>
          )
        }
        sidebar={
          <>
            <SidebarCard title="Ringkasan Proyek">
              <StatGrid items={stats} />
            </SidebarCard>
            <SidebarCard title="Proyek Aktif">
              <ActiveProjectsList items={activeProjects} base="/my-projects" />
            </SidebarCard>
            <TipsCard
              icon={Lightbulb}
              title="Tips Proyek Sukses"
              tips={[
                "Tulis deskripsi & hasil kerja yang jelas",
                "Pecah pekerjaan menjadi milestone terukur",
                "Beri feedback cepat pada setiap submission",
                "Jaga komunikasi rutin dengan mentor & tim",
              ]}
              cta={{ label: "Buat Proyek Baru", href: "/projects/create" }}
            />
          </>
        }
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Hapus Proyek"
        description={`Yakin ingin menghapus "${deleting?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        destructive
        onConfirm={confirmDelete}
      />
    </AppShell>
  );
}

// ---------------------------------------------------------------------------
// BEGINNER — bento board (unchanged)
// ---------------------------------------------------------------------------
function BeginnerView() {
  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Proyek Saya"
          subtitle="Pantau progres, tugas, milestone, dan kontribusi Anda dalam proyek yang sedang berjalan."
        />
        <BeginnerProjectBoard />
      </div>
    </AppShell>
  );
}

function RoleRouter() {
  const role = useAuthStore((s) => s.appUser?.role);
  if (role === "BEGINNER") return <BeginnerView />;
  if (role === "SENIOR") return <SeniorView />;
  return <UmkmView />;
}

export default function MyProjectsPage() {
  return (
    <AuthGuard allowedRoles={["UMKM", "BEGINNER", "SENIOR"]}>
      <RoleRouter />
    </AuthGuard>
  );
}
