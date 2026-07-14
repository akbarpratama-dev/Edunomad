"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  FolderSearch,
  RotateCcw,
  Flame,
  Clock,
  Users,
  GraduationCap,
  Building2,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListSkeleton } from "@/components/common/LoadingState";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/common/UserAvatar";
import { projectApi, type Category, type ProjectListItem, type ProjectStatus } from "@/services/projectApi";
import { fetchSkills, type Skill } from "@/services/skillApi";
import { useAuthStore } from "@/stores/authStore";

const ALL = "ALL";
const PAGE_SIZE = 9;
const TIPS = [
  { t: "Lengkapi profilmu", d: "Pastikan profil, bio, dan skill terisi lengkap." },
  { t: "Unggah portofolio terbaik", d: "Tunjukkan karya terbaik dan relevan." },
  { t: "Baca deskripsi proyek", d: "Pahami kebutuhan dan ekspektasi proyek." },
  { t: "Sesuaikan skill & pengalaman", d: "Tunjukkan relevansi dengan proyek." },
];
const THUMB_TONES = [
  "from-violet-500/30 to-violet-700/40",
  "from-[#201f31] to-[#3a3850]",
  "from-emerald-500/30 to-emerald-700/40",
  "from-sky-500/30 to-sky-700/40",
  "from-amber-500/30 to-amber-700/40",
  "from-rose-500/30 to-rose-700/40",
];

// ── helpers ──────────────────────────────────────────────────────────────────
// The flagship demo scenario project is titled "[DEMO] …" — always pin it as the
// featured "Proyek Pilihan" card so a live demo/test starts there without hunting.
function isFeaturedDemo(p: ProjectListItem) {
  return p.title.trim().startsWith("[DEMO]");
}
function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
function weeksOf(p: ProjectListItem) {
  const start = new Date(p.startDate || p.createdAt).getTime();
  const end = new Date(p.deadline).getTime();
  return Math.max(1, Math.round((end - start) / (7 * 86_400_000)));
}
function daysLeft(p: ProjectListItem) {
  return Math.ceil((new Date(p.deadline).getTime() - Date.now()) / 86_400_000);
}
function slotsOf(p: ProjectListItem) {
  return (p.projectRoles ?? []).reduce((s, r) => s + (r.capacity || 0), 0);
}
function techOf(p: ProjectListItem) {
  const names = new Set<string>();
  (p.projectRoles ?? []).forEach((r) => r.roleSkills.forEach((rs) => names.add(rs.skill.name)));
  return [...names];
}
// Noticeable solid markers (shared ring/shadow). ACTIVE has no status marker —
// its "Sedang Dikerjakan" membership badge covers it instead.
const MARK = "border-transparent text-white shadow-md ring-2 ring-white/70";
function statusMeta(p: ProjectListItem): { label: string; className: string } | null {
  if (p.status === "RECRUITING") {
    return daysLeft(p) <= 10
      ? { label: "Segera Ditutup", className: `bg-amber-500 ${MARK}` }
      : { label: "Membuka Pendaftaran", className: `bg-[#5f8c00] ${MARK}` };
  }
  if (p.status === "COMPLETED") return { label: "Proyek Sudah Selesai", className: `bg-emerald-600 ${MARK}` };
  return null;
}

function Content() {
  const role = useAuthStore((s) => s.appUser?.role);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [category, setCategory] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [deadline, setDeadline] = useState(ALL);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [items, setItems] = useState<ProjectListItem[]>([]);
  const [meta, setMeta] = useState({ total: 0, lastPage: 1 });
  const [loading, setLoading] = useState(true);
  // Projects the viewer already works on / finished — for the noticeable
  // "Sedang Dikerjakan" / "Selesai" marker on browse cards.
  const [mine, setMine] = useState<Record<string, "active" | "done">>({});

  useEffect(() => {
    projectApi.categories().then(setCategories).catch(() => {});
    fetchSkills().then(setSkills).catch(() => {});
  }, []);

  const loadMine = useCallback(() => {
    if (role !== "BEGINNER") return;
    projectApi
      .myMemberships()
      .then((ms) => {
        const map: Record<string, "active" | "done"> = {};
        ms.forEach((m) => {
          if (m.project.status === "COMPLETED") map[m.project.id] = "done";
          else if (m.project.status === "ACTIVE") map[m.project.id] = "active";
        });
        setMine(map);
      })
      .catch(() => {});
  }, [role]);
  useEffect(loadMine, [loadMine]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => setPage(1), [debouncedQ, category, status, deadline, sort]);

  const load = useCallback(() => {
    setLoading(true);
    projectApi
      .list({
        q: debouncedQ || undefined,
        category: category === ALL ? undefined : category,
        status: status === ALL ? undefined : (status as ProjectStatus),
        hasSenior: role === "BEGINNER" ? true : role === "SENIOR" ? false : undefined,
        page,
        limit: PAGE_SIZE,
      })
      .then((r) => {
        setItems(r.data);
        setMeta({ total: r.meta.total, lastPage: r.meta.lastPage });
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [debouncedQ, category, status, page, role]);
  useEffect(load, [load]);

  // Re-pull when the tab regains focus — a beginner's membership/application can
  // change on the mentor's screen (accept) with no realtime here, so the browse
  // markers and apply state stay in sync when the beginner comes back.
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState !== "visible") return;
      load();
      loadMine();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [load, loadMine]);

  const filtersActive = debouncedQ || category !== ALL || status !== ALL || deadline !== ALL;
  const resetFilters = () => {
    setQ("");
    setCategory(ALL);
    setStatus(ALL);
    setDeadline(ALL);
    setSort("newest");
  };

  // Client-side refinements on the current page (deadline window + sort).
  const view = useMemo(() => {
    let list = [...items];
    if (deadline !== ALL) {
      const max = Number(deadline);
      list = list.filter((p) => daysLeft(p) <= max && daysLeft(p) >= 0);
    }
    if (sort === "deadline") list.sort((a, b) => daysLeft(a) - daysLeft(b));
    return list;
  }, [items, deadline, sort]);

  // Always surface the flagship demo project ("[DEMO] …") as the featured card so
  // testers land straight on the scenario project; otherwise feature the newest.
  const showFeatured = page === 1 && !filtersActive && view.length > 0;
  const flagshipIdx = view.findIndex(isFeaturedDemo);
  const featured = showFeatured ? view[flagshipIdx >= 0 ? flagshipIdx : 0] : null;
  const gridItems = showFeatured && featured ? view.filter((p) => p.id !== featured.id) : view;

  const categoryItems = { [ALL]: "Semua Kategori", ...Object.fromEntries(categories.map((c) => [c.id, c.name])) };
  const statusItems = { [ALL]: "Semua Status", RECRUITING: "Membuka Pendaftaran", ACTIVE: "Berjalan", COMPLETED: "Selesai" };
  const deadlineItems = { [ALL]: "Semua Deadline", "7": "1 Minggu", "14": "2 Minggu", "30": "1 Bulan" };
  const sortItems = { newest: "Terbaru", deadline: "Deadline Terdekat" };

  return (
    <AppShell breadcrumbs={[{ label: "Cari Proyek" }]}>
      <div className="flex flex-col gap-5">
        {/* Title — full width, aligned with the floating header controls */}
        <div className="app-reveal max-w-3xl pr-2">
          <h1 className="text-h1 tracking-tight text-balance">Cari Proyek</h1>
          <p className="mt-1.5 text-body-lg text-muted-foreground text-pretty">
            Temukan proyek nyata dari berbagai UMKM dan bergabung bersama mentor profesional untuk
            membangun pengalaman yang dapat dibuktikan.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
          {/* MAIN */}
          <div className="flex min-w-0 flex-col gap-5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-12 rounded-2xl pl-11"
              placeholder="Cari proyek…"
              autoComplete="off"
              spellCheck={false}
              aria-label="Cari proyek"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap gap-2">
            <FilterSelect items={categoryItems} value={category} onChange={setCategory} placeholder="Kategori" />
            <FilterSelect items={statusItems} value={status} onChange={setStatus} placeholder="Status" />
            <FilterSelect items={deadlineItems} value={deadline} onChange={setDeadline} placeholder="Deadline" />
            <FilterSelect items={sortItems} value={sort} onChange={setSort} placeholder="Urutkan" />
            <Button variant="outline" className="h-11 rounded-xl" onClick={resetFilters} disabled={!filtersActive && sort === "newest"}>
              <RotateCcw className="size-4" /> Reset Filter
            </Button>
          </div>

          {loading ? (
            <ListSkeleton rows={6} />
          ) : view.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-border py-16 text-center">
              <FolderSearch className="size-10 text-muted-foreground" />
              <div>
                <p className="text-base font-semibold">Belum Ada Proyek</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Belum ada proyek yang sesuai dengan filter yang dipilih.
                </p>
              </div>
              {(filtersActive || sort !== "newest") && (
                <Button variant="outline" onClick={resetFilters}>
                  <RotateCcw className="size-4" /> Reset Filter
                </Button>
              )}
            </div>
          ) : (
            <>
              {featured && <FeaturedCard p={featured} demo={isFeaturedDemo(featured)} />}

              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold tracking-tight">
                  {showFeatured ? "Proyek Lainnya" : "Hasil Pencarian"}
                </h2>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {meta.total} proyek tersedia
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {gridItems.map((p, i) => (
                  <ProjectCard key={p.id} p={p} i={i} relation={mine[p.id]} />
                ))}
              </div>

              {meta.lastPage > 1 && (
                <div className="flex items-center justify-center gap-3 pt-1">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    Sebelumnya
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Halaman {page} dari {meta.lastPage}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= meta.lastPage}
                    onClick={() => setPage((p) => Math.min(meta.lastPage, p + 1))}
                  >
                    Berikutnya
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden flex-col gap-4 xl:flex">
          <RailCard title="Kategori Populer">
            <ul className="flex flex-col gap-1">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-colors hover:bg-muted",
                      category === c.id && "bg-muted"
                    )}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#eef7d6] text-[11px] font-bold text-[#5f8c00]">
                      {initials(c.name)}
                    </span>
                    <span className="flex-1 font-medium">{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </RailCard>

          {skills.length > 0 && (
            <RailCard title="Skill Yang Dicari">
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 10).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setQ(s.name)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-[#a3ce00] hover:bg-[#eef7d6] hover:text-[#5f8c00]"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </RailCard>
          )}

          <RailCard title="Tips Melamar">
            <ul className="flex flex-col gap-3">
              {TIPS.map((tip) => (
                <li key={tip.t} className="flex gap-2.5">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-[#67c957]" />
                  <div>
                    <p className="text-sm font-medium leading-snug">{tip.t}</p>
                    <p className="text-xs text-muted-foreground">{tip.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </RailCard>
        </aside>
        </div>
      </div>
    </AppShell>
  );
}

function FilterSelect({
  items,
  value,
  onChange,
  placeholder,
}: {
  items: Record<string, string>;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <Select items={items} value={value} onValueChange={(v) => onChange(v ?? Object.keys(items)[0])}>
      <SelectTrigger className="!h-11 min-w-[150px] rounded-xl px-3.5">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(items).map(([k, label]) => (
          <SelectItem key={k} value={k}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function RailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="app-reveal rounded-[20px] border border-border bg-card p-5">
      <h3 className="mb-3 text-sm font-bold tracking-tight">{title}</h3>
      {children}
    </section>
  );
}

function Thumb({
  i,
  imageUrl,
  title,
  className,
}: {
  i: number;
  imageUrl?: string | null;
  title?: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image src={imageUrl} alt={title ?? "Cover proyek"} fill className="object-cover" unoptimized />
      </div>
    );
  }
  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-br", THUMB_TONES[i % THUMB_TONES.length], className)}>
      <div className="absolute inset-3 rounded-lg bg-white/10" />
      <div className="absolute left-4 top-4 h-1.5 w-12 rounded-full bg-white/40" />
      <div className="absolute bottom-4 left-4 right-4 h-8 rounded-lg bg-white/15" />
    </div>
  );
}

function FeaturedCard({ p, demo }: { p: ProjectListItem; demo?: boolean }) {
  const tech = techOf(p);
  return (
    <div className="app-reveal grid gap-5 overflow-hidden rounded-[24px] border border-[#d8e8b8] bg-gradient-to-br from-[#f4f9e8] to-[#eef7d6] p-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col">
        <Badge className="w-fit border-transparent bg-white text-[#3f7a2e]">
          <Flame className="mr-1 size-3 text-[#5f8c00]" /> {demo ? "Proyek Pilihan · Mulai di sini" : "Proyek Pilihan"}
        </Badge>
        <h3 className="mt-3 text-xl font-bold tracking-tight">{p.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-foreground/80">{p.description}</p>
        {tech.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tech.slice(0, 3).map((t) => (
              <span key={t} className="rounded-lg border border-[#d8e8b8] bg-white/70 px-2.5 py-1 text-xs font-medium">
                {t}
              </span>
            ))}
            {tech.length > 3 && (
              <span className="rounded-lg border border-[#d8e8b8] bg-white/70 px-2.5 py-1 text-xs font-medium">
                +{tech.length - 3}
              </span>
            )}
          </div>
        )}
        <div className="mt-auto pt-5">
          {(p.projectRoles?.length ?? 0) > 0 && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Role Tersedia</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.projectRoles!.slice(0, 4).map((r) => (
                  <span key={r.id} className="rounded-lg border border-[#d8e8b8] bg-white px-3 py-1.5 text-xs">
                    <span className="font-semibold">{r.roleName}</span>{" "}
                    <span className="text-muted-foreground">({r.capacity})</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Meta icon={Clock} label="Durasi" value={`${weeksOf(p)} Minggu`} />
          <Meta icon={GraduationCap} label="Mentor" value={p.senior?.name ?? "Belum ada"} />
          <Meta icon={Building2} label="UMKM" value={p.umkm.name} />
          <Meta icon={Users} label="Posisi" value={`${slotsOf(p)} slot`} />
        </div>
        <Thumb i={3} imageUrl={p.imageUrl} title={p.title} className="h-28 w-full rounded-2xl" />
        <Button className="self-end bg-[#201f31] text-white hover:bg-[#2c2b42]" render={<Link href={`/projects/${p.id}`} />}>
          Lihat Detail Proyek <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3" /> {label}
      </p>
      <p className="mt-0.5 truncate font-semibold">{value}</p>
    </div>
  );
}

function ProjectCard({ p, i, relation }: { p: ProjectListItem; i: number; relation?: "active" | "done" }) {
  const meta = statusMeta(p);
  const tech = techOf(p);
  return (
    <Link
      href={`/projects/${p.id}`}
      style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
      className="app-reveal group flex flex-col overflow-hidden rounded-[20px] border border-border bg-card transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(32,31,49,0.10)]"
    >
      <div className="relative">
        <Thumb i={i} imageUrl={p.imageUrl} title={p.title} className="h-32 w-full" />
        {meta && <Badge className={cn("absolute left-3 top-3 border", meta.className)}>{meta.label}</Badge>}
        {relation === "active" && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-md ring-2 ring-white/70">
            <Clock className="size-3.5" /> Sedang Dikerjakan
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-semibold tracking-tight">{p.title}</h3>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          {p.umkm.name} <BadgeCheck className="size-3.5 text-[#67c957]" />
        </p>
        <p className="line-clamp-2 text-sm text-foreground/80">{p.description}</p>

        {tech.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {tech.slice(0, 2).map((t) => (
              <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {t}
              </span>
            ))}
            {tech.length > 2 && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{tech.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" /> {weeksOf(p)} Minggu
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" /> {slotsOf(p)} posisi
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <span className="flex items-center gap-2 text-xs">
            {p.senior ? (
              <UserAvatar
                name={p.senior.name}
                className="size-6 text-[10px] font-bold text-[#0b0b0b]"
              />
            ) : (
              <span className="grid size-6 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                —
              </span>
            )}
            <span className="truncate text-muted-foreground">{p.senior?.name ?? "Belum ada mentor"}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#5f8c00]">
            Detail <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function BrowseProjectsPage() {
  return (
    <AuthGuard>
      <Content />
    </AuthGuard>
  );
}
