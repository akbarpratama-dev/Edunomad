"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  MessagesSquare,
  Plus,
  CheckCircle2,
  Circle,
  GraduationCap,
  Pin,
  PinOff,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
  discussionApi,
  DISCUSSION_CATEGORY_META,
  type Discussion,
  type DiscussionCategory,
} from "@/services/discussionApi";
import {
  projectApi,
  type ProjectDetail,
  type ProjectMember,
} from "@/services/projectApi";
import { DiscussionFeed } from "./DiscussionFeed";

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  SENIOR: { label: "Mentor", className: "bg-[#eef7d6] text-[#5f8c00]" },
  BEGINNER: { label: "Mahasiswa", className: "bg-sky-100 text-sky-700" },
  UMKM: { label: "UMKM", className: "bg-amber-100 text-amber-700" },
  ADMIN: { label: "Admin", className: "bg-zinc-200 text-zinc-700" },
};

const CATEGORY_ORDER: DiscussionCategory[] = [
  "ANNOUNCEMENT",
  "QUESTION",
  "IDEA",
  "BLOCKER",
  "MENTOR_REVIEW",
  "UPDATE",
];

const AVATAR_TONES = [
  "bg-[#201f31] text-white",
  "bg-sky-500 text-white",
  "bg-rose-500 text-white",
  "bg-violet-500 text-white",
  "bg-emerald-500 text-white",
];
function toneFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % AVATAR_TONES.length;
  return AVATAR_TONES[h];
}
function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.round(h / 24);
  if (d === 1) return "kemarin";
  return `${d} hari lalu`;
}

export function DiscussionTab({ project }: { project: ProjectDetail }) {
  const appUser = useAuthStore((s) => s.appUser);
  const [discussions, setDiscussions] = useState<Discussion[] | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<DiscussionCategory | "ALL">("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [pinningId, setPinningId] = useState<string | null>(null);

  const canCreate =
    (appUser?.role === "SENIOR" && project.senior?.id === appUser.id) ||
    (appUser?.role === "UMKM" && project.umkm.id === appUser.id);

  const load = useCallback(async () => {
    try {
      const [list, mem] = await Promise.all([
        discussionApi.listProjectDiscussions(project.id),
        projectApi.members(project.id),
      ]);
      setDiscussions(list);
      setMembers(mem);
      setActiveId((cur) => cur ?? list[0]?.id ?? null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal memuat diskusi");
      setDiscussions([]);
    }
  }, [project.id]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (title: string, category: DiscussionCategory) => {
    const activeIds = members.filter((m) => m.status === "ACTIVE").map((m) => m.user.id);
    const created = await discussionApi.createGroupDiscussion(project.id, {
      title,
      category,
      members: activeIds,
    });
    toast.success("Diskusi dibuat");
    setFilter("ALL");
    await load();
    setActiveId(created.id); // open the new topic (after load, overrides cur ?? …)
  };

  const togglePin = async (d: Discussion) => {
    setPinningId(d.id);
    try {
      await discussionApi.pinDiscussion(d.id, !d.isPinned);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyematkan diskusi");
    } finally {
      setPinningId(null);
    }
  };

  const activeMembers = members.filter((m) => m.status === "ACTIVE");
  const team = [
    ...(project.senior ? [{ id: project.senior.id, name: project.senior.name, role: "SENIOR" }] : []),
    ...activeMembers.map((m) => ({ id: m.user.id, name: m.user.name, role: "BEGINNER" })),
  ].filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);

  // Categories actually present (for the filter row).
  const presentCategories = useMemo(() => {
    const set = new Set<DiscussionCategory>();
    (discussions ?? []).forEach((d) => d.category && set.add(d.category));
    return CATEGORY_ORDER.filter((c) => set.has(c));
  }, [discussions]);

  const visible = useMemo(
    () => (discussions ?? []).filter((d) => filter === "ALL" || d.category === filter),
    [discussions, filter]
  );

  // Keep an in-view discussion selected when the filter changes.
  useEffect(() => {
    if (visible.length && !visible.some((d) => d.id === activeId)) {
      setActiveId(visible[0].id);
    }
  }, [visible, activeId]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Diskusi Proyek</h2>
          <p className="text-sm text-muted-foreground">
            Diskusikan ide, bagikan pembaruan, ajukan pertanyaan, dan dapatkan masukan langsung dari
            mentor serta anggota tim.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Buat Diskusi Baru
          </Button>
        )}
      </div>

      {discussions === null ? (
        <p className="text-sm text-muted-foreground">Memuat diskusi…</p>
      ) : discussions.length === 0 ? (
        <EmptyDiscussions canCreate={canCreate} onCreate={() => setCreateOpen(true)} />
      ) : (
        <>
          {/* Category filter chips (real) */}
          {presentCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <FilterChip label="Semua" active={filter === "ALL"} onClick={() => setFilter("ALL")} />
              {presentCategories.map((c) => (
                <FilterChip
                  key={c}
                  label={DISCUSSION_CATEGORY_META[c].label}
                  active={filter === c}
                  onClick={() => setFilter(c)}
                />
              ))}
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_280px]">
            {/* Discussion list */}
            <div className="flex flex-col gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Daftar Diskusi
              </p>
              {visible.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                  Tidak ada diskusi pada kategori ini.
                </p>
              ) : (
                visible.map((d) => (
                  <DiscussionListCard
                    key={d.id}
                    discussion={d}
                    active={d.id === activeId}
                    canPin={canCreate}
                    pinning={pinningId === d.id}
                    onSelect={() => setActiveId(d.id)}
                    onTogglePin={() => togglePin(d)}
                  />
                ))
              )}
              {canCreate && (
                <button
                  onClick={() => setCreateOpen(true)}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-[#a3ce00] hover:text-foreground"
                >
                  <Plus className="size-4" /> Diskusi Baru
                </button>
              )}
            </div>

            {/* Active thread */}
            {activeId && (
              <DiscussionFeed
                key={activeId}
                channelId={activeId}
                count={discussions.find((d) => d.id === activeId)?._count?.messages}
                title={discussions.find((d) => d.id === activeId)?.title ?? undefined}
                category={discussions.find((d) => d.id === activeId)?.category ?? undefined}
              />
            )}

            {/* Right rail (xl only) */}
            <aside className="hidden flex-col gap-4 xl:flex">
              <RailCard icon={<CheckCircle2 className="size-4" />} title="Milestone Berikutnya">
                {project.milestones.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Belum ada milestone.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {project.milestones.slice(0, 5).map((m) => {
                      const done = m.status === "COMPLETED";
                      return (
                        <li key={m.id} className="flex items-start gap-2.5">
                          {done ? (
                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#5da316]" />
                          ) : (
                            <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "text-sm",
                                done ? "text-muted-foreground line-through" : "font-medium text-foreground"
                              )}
                            >
                              {m.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {new Date(m.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </RailCard>

              <RailCard icon={<GraduationCap className="size-4" />} title="Anggota Tim">
                {team.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Belum ada anggota.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {team.map((t) => {
                      const badge = ROLE_BADGE[t.role];
                      return (
                        <li key={t.id} className="flex items-center gap-2.5">
                          <UserAvatar
                            name={t.name}
                            className={cn("size-8 shrink-0 text-[12px] font-bold", toneFor(t.id))}
                          />
                          <span className="flex-1 truncate text-sm font-medium">{t.name}</span>
                          {badge && (
                            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", badge.className)}>
                              {badge.label}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </RailCard>
            </aside>
          </div>
        </>
      )}

      <CreateDiscussionDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={create} />
    </div>
  );
}

// ── Create discussion dialog ─────────────────────────────────────────────────
function CreateDiscussionDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (title: string, category: DiscussionCategory) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DiscussionCategory | "">("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (title.trim().length < 3) return toast.error("Judul minimal 3 karakter");
    if (!category) return toast.error("Pilih kategori diskusi");
    setBusy(true);
    try {
      await onCreate(title.trim(), category);
      setTitle("");
      setCategory("");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal membuat diskusi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Diskusi Baru</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="disc-title">Judul Diskusi</Label>
            <Input
              id="disc-title"
              placeholder="cth. Review Landing Page Minggu Ini"
              value={title}
              maxLength={255}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="disc-cat">Kategori</Label>
            <Select value={category} onValueChange={(v) => setCategory((v ?? "") as DiscussionCategory)}>
              <SelectTrigger id="disc-cat">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_ORDER.map((c) => (
                  <SelectItem key={c} value={c}>
                    {DISCUSSION_CATEGORY_META[c].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Batal
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? "Membuat…" : "Buat Diskusi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-[#201f31] bg-[#201f31] text-white"
          : "border-border bg-card text-muted-foreground hover:border-[#a3ce00] hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

// ── Discussion list card (real title + category + pin) ───────────────────────
function DiscussionListCard({
  discussion,
  active,
  canPin,
  pinning,
  onSelect,
  onTogglePin,
}: {
  discussion: Discussion;
  active: boolean;
  canPin: boolean;
  pinning: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
}) {
  const msgCount = discussion._count?.messages ?? 0;
  const cat = discussion.category ? DISCUSSION_CATEGORY_META[discussion.category] : null;
  return (
    <div
      className={cn(
        "group/disc relative rounded-2xl border p-3.5 transition-[border-color,background-color,box-shadow] duration-200",
        active
          ? "border-[#a3ce00] bg-[#f6fae9] shadow-[0_8px_24px_rgba(32,31,49,0.06)]"
          : "border-border bg-card hover:border-foreground/15 hover:bg-muted/40"
      )}
    >
      <button onClick={onSelect} aria-pressed={active} className="flex w-full items-start gap-3 text-left">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            active ? "bg-[#d8f277] text-[#0b0b0b]" : "bg-muted text-muted-foreground"
          )}
          aria-hidden="true"
        >
          <MessagesSquare className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
            {discussion.isPinned && <Pin className="size-3 shrink-0 text-[#5f8c00]" />}
            {discussion.title ?? "Diskusi Tim"}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {cat && (
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", cat.className)}>
                {cat.label}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {timeAgo(discussion.updatedAt) || "Aktif"}
            </span>
          </div>
        </div>
        <span className="grid min-w-7 shrink-0 place-items-center rounded-full bg-muted px-1.5 text-xs font-semibold tabular-nums text-muted-foreground">
          {msgCount}
        </span>
      </button>
      {canPin && (
        <button
          onClick={onTogglePin}
          disabled={pinning}
          title={discussion.isPinned ? "Lepas sematan" : "Sematkan"}
          aria-label={discussion.isPinned ? "Lepas sematan" : "Sematkan"}
          className="absolute right-2 top-2 hidden size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground group-hover/disc:grid disabled:opacity-50"
        >
          {discussion.isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
        </button>
      )}
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyDiscussions({ canCreate, onCreate }: { canCreate: boolean; onCreate: () => void }) {
  return (
    <div className="app-reveal flex flex-col items-center gap-3 rounded-[24px] border border-dashed border-border py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-[#eef7d6] text-[#5f8c00]" aria-hidden="true">
        <MessagesSquare className="size-7" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-foreground">Belum Ada Diskusi</h3>
        <p className="mx-auto mt-0.5 max-w-sm text-sm text-muted-foreground">
          Mulai diskusi pertama untuk membantu tim berkolaborasi menyelesaikan proyek.
        </p>
      </div>
      {canCreate ? (
        <Button onClick={onCreate} className="mt-1">
          <Plus className="size-4" /> Buat Diskusi Baru
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">Senior atau pemilik UMKM dapat membuat diskusi.</p>
      )}
    </div>
  );
}

function RailCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-border bg-card p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
        <span className="text-[#5f8c00]">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}
