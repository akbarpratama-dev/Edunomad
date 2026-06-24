"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { MessagesSquare, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { discussionApi, type Discussion } from "@/services/discussionApi";
import { projectApi, type ProjectDetail } from "@/services/projectApi";
import { ChatPanel } from "./ChatPanel";

export function DiscussionTab({ project }: { project: ProjectDetail }) {
  const appUser = useAuthStore((s) => s.appUser);
  const [discussions, setDiscussions] = useState<Discussion[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const canCreate =
    (appUser?.role === "SENIOR" && project.senior?.id === appUser.id) ||
    (appUser?.role === "UMKM" && project.umkm.id === appUser.id);

  const load = useCallback(async () => {
    try {
      const list = await discussionApi.listProjectDiscussions(project.id);
      setDiscussions(list);
      setActiveId((cur) => cur ?? list[0]?.id ?? null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal memuat diskusi");
      setDiscussions([]);
    }
  }, [project.id]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    setCreating(true);
    try {
      // Seed the group with all current active members (senior is auto-included).
      const members = await projectApi.members(project.id);
      const activeIds = members.filter((m) => m.status === "ACTIVE").map((m) => m.user.id);
      const created = await discussionApi.createGroupDiscussion(project.id, activeIds);
      toast.success("Diskusi dibuat");
      setActiveId(created.id);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal membuat diskusi");
    } finally {
      setCreating(false);
    }
  };

  if (discussions === null) {
    return <p className="text-sm text-muted-foreground">Memuat diskusi…</p>;
  }

  if (discussions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
        <MessagesSquare className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Belum ada diskusi grup.</p>
        {canCreate ? (
          <Button onClick={create} disabled={creating}>
            <Plus className="mr-1.5 size-4" /> Buat Diskusi Grup
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Senior atau pemilik UMKM dapat membuat diskusi.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <aside className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Diskusi</h3>
          {canCreate && (
            <Button size="sm" variant="outline" onClick={create} disabled={creating} aria-label="Buat diskusi">
              <Plus className="size-4" />
            </Button>
          )}
        </div>
        {discussions.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setActiveId(d.id)}
            className={cn(
              "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
              d.id === activeId
                ? "border-ring bg-accent text-accent-foreground"
                : "border-border hover:bg-muted"
            )}
          >
            <p className="font-medium">Diskusi Grup {i + 1}</p>
            <p className="text-xs text-muted-foreground">
              {d.members.length} anggota
              {d._count ? ` · ${d._count.messages} pesan` : ""}
            </p>
          </button>
        ))}
      </aside>

      <div>
        {activeId && (
          <ChatPanel
            channelId={activeId}
            fetchMessages={() => discussionApi.listMessages(activeId).then((r) => r.data)}
            sendMessage={(text) => discussionApi.sendMessage(activeId, text)}
            emptyHint="Belum ada pesan di diskusi ini. Sapa timmu!"
          />
        )}
      </div>
    </div>
  );
}
