"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Send, Paperclip, ImageIcon, Smile, SmilePlus, MessagesSquare, FileText, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
  discussionApi,
  DISCUSSION_CATEGORY_META,
  REACTION_EMOJIS,
  type DiscussionMessage,
  type DiscussionCategory,
  type MessageReaction,
  type DiscussionAttachment,
} from "@/services/discussionApi";

// Group flat reaction rows into { emoji, count, mine } for chip rendering.
function groupReactions(reactions: MessageReaction[] | undefined, myId?: string) {
  const map = new Map<string, { count: number; mine: boolean }>();
  for (const r of reactions ?? []) {
    const g = map.get(r.emoji) ?? { count: 0, mine: false };
    g.count += 1;
    if (r.userId === myId) g.mine = true;
    map.set(r.emoji, g);
  }
  return [...map.entries()].map(([emoji, v]) => ({ emoji, ...v }));
}

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

// One comment card (top-level or a compact reply). Mentor (SENIOR) gets the
// green accent; the viewer's own messages get a subtle tint.
function Bubble({
  m,
  myId,
  onReact,
  compact,
}: {
  m: DiscussionMessage;
  myId?: string;
  onReact: (emoji: string) => void;
  compact?: boolean;
}) {
  const badge = ROLE_BADGE[m.sender.role];
  const isMentor = m.sender.role === "SENIOR";
  const mine = m.sender.id === myId;
  const [pickerOpen, setPickerOpen] = useState(false);
  const groups = groupReactions(m.reactions, myId);
  return (
    <article
      className={cn(
        "flex gap-3 rounded-2xl transition-colors",
        compact ? "p-3" : "p-4",
        isMentor ? "border-l-2 border-[#a3ce00] bg-[#f6fae9]" : mine ? "bg-muted/40" : "bg-card"
      )}
    >
      <UserAvatar
        name={m.sender.name}
        className={cn(
          "shrink-0 font-bold",
          compact ? "size-7 text-[11px]" : "size-9 text-[13px]",
          toneFor(m.sender.id)
        )}
      />
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
        {m.message && (
          <p
            className={cn(
              "mt-1.5 whitespace-pre-wrap break-words leading-relaxed text-foreground/90",
              compact ? "text-sm" : "text-[15px]"
            )}
          >
            {m.message}
          </p>
        )}

        {/* Attachments (Phase 12.4) */}
        {m.attachments && m.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {m.attachments.map((a, idx) =>
              a.type === "IMAGE" && a.url ? (
                <a key={a.id ?? idx} href={a.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={a.url}
                    alt={a.fileName ?? "Gambar"}
                    className="max-h-48 rounded-lg border border-border object-cover"
                  />
                </a>
              ) : (
                <a
                  key={a.id ?? idx}
                  href={a.url ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                >
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{a.fileName ?? a.url}</span>
                  {typeof a.fileSize === "number" && a.fileSize > 0 && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {Math.ceil(a.fileSize / 1024)} KB
                    </span>
                  )}
                </a>
              )
            )}
          </div>
        )}

        {/* Reactions (Phase 12.3) */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {groups.map((g) => (
            <button
              key={g.emoji}
              type="button"
              onClick={() => onReact(g.emoji)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors",
                g.mine
                  ? "border-[#a3ce00] bg-[#f6fae9] text-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted/50"
              )}
            >
              <span>{g.emoji}</span>
              <span className="tabular-nums">{g.count}</span>
            </button>
          ))}
          <div className="relative">
            <button
              type="button"
              aria-label="Tambah reaksi"
              onClick={() => setPickerOpen((o) => !o)}
              className="grid size-6 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted/50"
            >
              <SmilePlus className="size-3.5" />
            </button>
            {pickerOpen && (
              <div className="absolute left-0 z-10 mt-1 flex gap-0.5 rounded-xl border border-border bg-card p-1 shadow-md">
                {REACTION_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => {
                      onReact(e);
                      setPickerOpen(false);
                    }}
                    className="rounded-md px-1.5 py-1 text-base leading-none hover:bg-muted"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// Group-discussion thread: premium comment cards (avatar + name + role badge +
// body + time) with a composer. Mentor (SENIOR) messages get the green accent.
// Live via Supabase Realtime (re-pull on INSERT; server resolves sender + RLS).
export function DiscussionFeed({
  channelId,
  count,
  views,
  title,
  category,
}: {
  channelId: string;
  count?: number;
  views?: number;
  title?: string;
  category?: DiscussionCategory;
}) {
  const myId = useAuthStore((s) => s.user?.id);
  const myName = useAuthStore((s) => s.appUser?.name ?? "");
  const [messages, setMessages] = useState<DiscussionMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [pending, setPending] = useState<DiscussionAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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
        // Phase 12.3: reaction add/remove (denormalised discussion_id lets us filter).
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "message_reactions",
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
    if ((!text && pending.length === 0) || sending || uploading) return;
    setSending(true);
    try {
      await discussionApi.sendMessage(channelId, text, undefined, pending.length ? pending : undefined);
      setDraft("");
      setPending([]);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  // Phase 12.4 — upload picked files to Storage and stage them for the next send.
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const att = await discussionApi.uploadAttachment(channelId, file);
        setPending((p) => [...p, att]);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengunggah lampiran");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const submitReply = async (parentId: string) => {
    const text = replyDraft.trim();
    if (!text || replySending) return;
    setReplySending(true);
    try {
      await discussionApi.sendMessage(channelId, text, parentId);
      setReplyDraft("");
      setReplyTo(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengirim balasan");
    } finally {
      setReplySending(false);
    }
  };

  const react = async (messageId: string, emoji: string) => {
    try {
      await discussionApi.toggleReaction(messageId, emoji);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal memberi reaksi");
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit(e as unknown as React.FormEvent);
    }
  };

  return (
    <section className="flex min-h-[60vh] flex-col overflow-hidden rounded-[20px] border border-border bg-card">
      {/* Thread header */}
      <header className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eef7d6] text-[#5f8c00]" aria-hidden="true">
          <MessagesSquare className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-semibold tracking-tight text-foreground">
            {title ?? "Diskusi Tim"}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  DISCUSSION_CATEGORY_META[category].className
                )}
              >
                {DISCUSSION_CATEGORY_META[category].label}
              </span>
            )}
            <p className="text-xs text-muted-foreground tabular-nums">
              {typeof count === "number" ? `${count} pesan` : "Percakapan tim"}
              {typeof views === "number" && views > 0 ? ` · ${views} dilihat` : ""}
            </p>
          </div>
        </div>
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
          messages.map((m, i) => (
            <div key={m.id} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }} className="app-reveal flex flex-col gap-2">
              <Bubble m={m} myId={myId} onReact={(emoji) => react(m.id, emoji)} />

              {/* One-level replies (Phase 12.2) */}
              {m.replies && m.replies.length > 0 && (
                <div className="ml-6 flex flex-col gap-2 border-l-2 border-border pl-3 sm:ml-11">
                  {m.replies.map((r) => (
                    <Bubble key={r.id} m={r} myId={myId} onReact={(emoji) => react(r.id, emoji)} compact />
                  ))}
                </div>
              )}

              {/* Reply trigger / inline composer */}
              <div className="ml-6 sm:ml-11">
                {replyTo === m.id ? (
                  <div className="flex flex-col gap-2 rounded-2xl border border-border bg-secondary/60 p-2 focus-within:border-[#a3ce00]">
                    <textarea
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      rows={2}
                      maxLength={5000}
                      disabled={replySending}
                      autoFocus
                      placeholder={`Balas ${m.sender.name}…`}
                      className="resize-none bg-transparent px-1.5 py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={replySending}
                        onClick={() => {
                          setReplyTo(null);
                          setReplyDraft("");
                        }}
                      >
                        Batal
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={replySending || !replyDraft.trim()}
                        onClick={() => submitReply(m.id)}
                      >
                        <Send className="size-4" /> Balas
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setReplyTo(m.id);
                      setReplyDraft("");
                    }}
                    className="text-xs font-semibold text-[#5f8c00] transition-colors hover:underline"
                  >
                    Balas
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="border-t border-border px-5 py-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-secondary/60 p-2 focus-within:border-[#a3ce00]">
          {pending.length > 0 && (
            <div className="flex flex-wrap gap-2 px-1">
              {pending.map((a, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1 text-xs"
                >
                  {a.type === "IMAGE" ? <ImageIcon className="size-3.5" /> : <FileText className="size-3.5" />}
                  <span className="max-w-[160px] truncate">{a.fileName}</span>
                  <button
                    type="button"
                    aria-label="Hapus lampiran"
                    onClick={() => setPending((p) => p.filter((_, j) => j !== i))}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-start gap-2.5">
            <UserAvatar
              name={myName || "?"}
              className="mt-1 size-8 shrink-0 bg-[#d8f277] text-[12px] font-bold text-[#0b0b0b]"
            />
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
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || sending}
                title="Lampirkan file"
                aria-label="Lampirkan file"
                className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                <Paperclip className="size-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading || sending}
                title="Sisipkan gambar"
                aria-label="Sisipkan gambar"
                className="grid size-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                <ImageIcon className="size-[18px]" />
              </button>
              <ToolButton icon={Smile} label="Emoji" />
              {uploading && <span className="text-xs text-muted-foreground">Mengunggah…</span>}
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={sending || uploading || (!draft.trim() && pending.length === 0)}
            >
              <Send className="size-4" /> Kirim Komentar
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}
