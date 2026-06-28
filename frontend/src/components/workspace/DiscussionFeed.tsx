"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Send, Paperclip, ImageIcon, Smile, MessagesSquare } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { discussionApi, type DiscussionMessage } from "@/services/discussionApi";

// Role → display badge (DESIGN.md: Mentor green accent-tint, Mahasiswa sky, UMKM amber).
const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  SENIOR: { label: "Mentor", className: "bg-[#eef7d6] text-[#5f8c00]" },
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

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

// Disabled composer affordance — kept honest (no upload/emoji backend yet).
function ToolButton({ icon: Icon, label }: { icon: typeof Paperclip; label: string }) {
  return (
    <button
      type="button"
      disabled
      title="Segera hadir"
      aria-label={label}
      className="grid size-9 cursor-not-allowed place-items-center rounded-xl text-muted-foreground/70 transition-colors hover:bg-muted disabled:opacity-60"
    >
      <Icon className="size-[18px]" />
    </button>
  );
}

// Group-discussion thread: premium comment cards (avatar + name + role badge +
// body + time) with a composer. Mentor (SENIOR) messages get the green accent.
// Live via Supabase Realtime (re-pull on INSERT; server resolves sender + RLS).
export function DiscussionFeed({ channelId, count }: { channelId: string; count?: number }) {
  const myId = useAuthStore((s) => s.user?.id);
  const myName = useAuthStore((s) => s.appUser?.name ?? "");
  const [messages, setMessages] = useState<DiscussionMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
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
      // Unique channel name per mount — avoids "callbacks after subscribe()" when
      // React StrictMode double-invokes the effect (reused channel name collides).
      const channel = supabase
        .channel(`feed-${channelId}-${Math.random().toString(36).slice(2)}`)
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit(e as unknown as React.FormEvent);
    }
  };

  return (
    <section className="flex min-h-[60vh] flex-col overflow-hidden rounded-[24px] border border-border bg-card">
      {/* Thread header */}
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-[#eef7d6] text-[#5f8c00]" aria-hidden="true">
            <MessagesSquare className="size-5" />
          </span>
          <div>
            <h3 className="font-semibold tracking-tight text-foreground">Diskusi Tim</h3>
            <p className="text-xs text-muted-foreground tabular-nums">
              {typeof count === "number" ? `${count} pesan` : "Percakapan tim"}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-[#67c957]" /> Langsung
        </span>
      </header>

      {/* Thread body */}
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages === null ? (
          <p className="text-sm text-muted-foreground">Memuat pesan…</p>
        ) : messages.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            Belum ada pesan. Mulai percakapan dengan tim.
          </p>
        ) : (
          messages.map((m, i) => {
            const badge = ROLE_BADGE[m.sender.role];
            const isMentor = m.sender.role === "SENIOR";
            const mine = m.sender.id === myId;
            return (
              <article
                key={m.id}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                className={cn(
                  "app-reveal flex gap-3 rounded-2xl p-4 transition-colors",
                  isMentor
                    ? "border-l-2 border-[#a3ce00] bg-[#f6fae9]"
                    : mine
                      ? "bg-muted/40"
                      : "bg-card"
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-bold",
                    toneFor(m.sender.id)
                  )}
                  aria-hidden="true"
                >
                  {initials(m.sender.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{m.sender.name}</span>
                    {badge && (
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", badge.className)}>
                        {badge.label}
                      </span>
                    )}
                    {mine && <span className="text-[11px] text-muted-foreground">· Anda</span>}
                    <time className="ml-auto text-xs text-muted-foreground">
                      {new Date(m.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground/90">
                    {m.message}
                  </p>
                </div>
              </article>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="border-t border-border p-4">
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-secondary/60 p-2 focus-within:border-[#a3ce00]">
          <div className="flex items-start gap-2.5">
            <span
              className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-[#d8f277] text-[12px] font-bold text-[#0b0b0b]"
              aria-hidden="true"
            >
              {initials(myName) || "?"}
            </span>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              maxLength={5000}
              disabled={sending}
              placeholder="Tulis komentar Anda…"
              className="min-h-10 flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center justify-between pl-1">
            <div className="flex items-center gap-0.5">
              <ToolButton icon={Paperclip} label="Lampirkan file" />
              <ToolButton icon={ImageIcon} label="Sisipkan gambar" />
              <ToolButton icon={Smile} label="Emoji" />
            </div>
            <Button type="submit" size="sm" disabled={sending || !draft.trim()}>
              <Send className="size-4" /> Kirim Komentar
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
