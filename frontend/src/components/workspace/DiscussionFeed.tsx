"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { discussionApi, type DiscussionMessage } from "@/services/discussionApi";

// Role → display badge (Figma uses "Mentor" green, "Mahasiswa" blue, etc.).
const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  SENIOR: { label: "Mentor", className: "bg-accent text-accent-foreground" },
  BEGINNER: { label: "Mahasiswa", className: "bg-sky-100 text-sky-700" },
  UMKM: { label: "UMKM", className: "bg-amber-100 text-amber-700" },
  ADMIN: { label: "Admin", className: "bg-zinc-200 text-zinc-700" },
};

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

// Group-discussion feed: messages rendered as Figma-style cards (avatar + name +
// role badge + body + time) with a composer. Live via Supabase Realtime.
export function DiscussionFeed({ channelId }: { channelId: string }) {
  const myId = useAuthStore((s) => s.user?.id);
  const [messages, setMessages] = useState<DiscussionMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await discussionApi.listMessages(channelId, 1, 50);
      setMessages([...r.data].reverse()); // newest-first API → oldest-first feed
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal memuat pesan");
      setMessages([]);
    }
  }, [channelId]);

  useEffect(() => {
    setMessages(null);
    load();
  }, [load]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) supabase.realtime.setAuth(token);
      const channel = supabase
        .channel(`feed-${channelId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "discussion_messages",
            filter: `discussion_id=eq.${channelId}`,
          },
          () => active && load()
        )
        .subscribe();
      cleanupRef.current = () => supabase.removeChannel(channel);
    })();
    return () => {
      active = false;
      cleanupRef.current?.();
    };
  }, [channelId, load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await discussionApi.sendMessage(channelId, text);
      setDraft("");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tulis pesan ke tim…"
          maxLength={5000}
          disabled={sending}
        />
        <Button type="submit" disabled={sending || !draft.trim()}>
          <Send className="size-4" /> Kirim
        </Button>
      </form>

      {messages === null ? (
        <p className="text-sm text-muted-foreground">Memuat pesan…</p>
      ) : messages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Belum ada pesan. Mulai percakapan dengan tim.
        </p>
      ) : (
        messages.map((m) => {
          const badge = ROLE_BADGE[m.sender.role];
          const mine = m.sender.id === myId;
          return (
            <article
              key={m.id}
              className={cn(
                "rounded-2xl border bg-card p-5",
                mine ? "border-ring/40" : "border-border"
              )}
            >
              <header className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-bold",
                    toneFor(m.sender.id)
                  )}
                >
                  {m.sender.name.charAt(0).toUpperCase()}
                </span>
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground">{m.sender.name}</span>
                  {badge && (
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", badge.className)}>
                      {badge.label}
                    </span>
                  )}
                </div>
                <time className="text-xs text-muted-foreground">
                  {new Date(m.createdAt).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </header>
              <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground/90">
                {m.message}
              </p>
            </article>
          );
        })
      )}
    </div>
  );
}
