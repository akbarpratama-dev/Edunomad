"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, FolderSearch } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
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
import { EmptyState } from "@/components/common/EmptyState";
import { ProjectStatusBadge } from "@/components/project/ProjectDetailView";
import {
  projectApi,
  type Category,
  type ProjectListItem,
  type ProjectStatus,
} from "@/services/projectApi";

const ALL = "ALL";
const PUBLIC_STATUSES: { key: ProjectStatus; label: string }[] = [
  { key: "RECRUITING", label: "Rekrutmen" },
  { key: "ACTIVE", label: "Aktif" },
  { key: "COMPLETED", label: "Selesai" },
];
const PAGE_SIZE = 9;

function Content() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<ProjectListItem[]>([]);

  // value→label maps so the Select trigger shows the label (base-ui `items` prop).
  const categoryItems: Record<string, string> = {
    [ALL]: "Semua Kategori",
    ...Object.fromEntries(categories.map((c) => [c.id, c.name])),
  };
  const statusItems: Record<string, string> = {
    [ALL]: "Semua Status",
    ...Object.fromEntries(PUBLIC_STATUSES.map((s) => [s.key, s.label])),
  };

  const [meta, setMeta] = useState({ total: 0, lastPage: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectApi.categories().then(setCategories).catch(() => {});
  }, []);

  // Debounce the search input.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 350);
    return () => clearTimeout(t);
  }, [q]);

  // Reset to page 1 when filters change.
  useEffect(() => setPage(1), [debouncedQ, category, status]);

  const load = useCallback(() => {
    setLoading(true);
    projectApi
      .list({
        q: debouncedQ || undefined,
        category: category === ALL ? undefined : category,
        status: status === ALL ? undefined : (status as ProjectStatus),
        page,
        limit: PAGE_SIZE,
      })
      .then((r) => {
        setItems(r.data);
        setMeta({ total: r.meta.total, lastPage: r.meta.lastPage });
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [debouncedQ, category, status, page]);
  useEffect(load, [load]);

  return (
    <AppShell breadcrumbs={[{ label: "Telusuri Proyek" }]}>
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-h1 text-neutral-dark">Telusuri Proyek</h1>
          <p className="text-body text-neutral-gray">
            Temukan proyek nyata untuk berkolaborasi dan membangun portofolio.
          </p>
        </div>

        {/* Filters */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2 lg:col-span-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-gray" />
            <Input
              className="pl-9"
              placeholder="Cari proyek..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select
            items={categoryItems}
            value={category}
            onValueChange={(v) => setCategory(v ?? ALL)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua Kategori</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={statusItems}
            value={status}
            onValueChange={(v) => setStatus(v ?? ALL)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua Status</SelectItem>
              {PUBLIC_STATUSES.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <ListSkeleton rows={6} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FolderSearch}
            heading="Tidak Ada Proyek"
            message="Tidak ada proyek yang cocok dengan filter Anda. Coba ubah pencarian."
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="group">
                  <Card className="h-full transition-colors group-hover:border-primary">
                    <CardContent className="flex h-full flex-col gap-3 pt-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary">{p.category.name}</Badge>
                        <ProjectStatusBadge status={p.status} />
                      </div>
                      <h3 className="text-h3 text-neutral-dark line-clamp-2">{p.title}</h3>
                      <p className="text-body-sm text-neutral-gray line-clamp-2">
                        {p.description}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="text-body-sm text-neutral-gray">{p.umkm.name}</span>
                        <span className="text-body-sm font-medium text-primary">
                          Lihat Detail →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {meta.lastPage > 1 && (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Sebelumnya
                </Button>
                <span className="text-body-sm text-neutral-gray">
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
    </AppShell>
  );
}

export default function BrowseProjectsPage() {
  return (
    <AuthGuard>
      <Content />
    </AuthGuard>
  );
}
