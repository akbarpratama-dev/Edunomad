"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DiscussionMessage } from "@/services/discussionApi";

interface ChatPanelProps {
  // Discussion / direct-chat id; also the Realtime filter key (discussion_id).
  channelId: string;
  fetchMessages: () => Promise<DiscussionMessage[]>;
  sendMessage: (text: string) => Promise<DiscussionMessage>;
  emptyHint?: string;
}

// Shared chat UI for group discussions and DMs. Writes go through Express
// (sendMessage); live updates arrive via Supabase Realtime (read-only, RLS-gated).
export function ChatPanel({ channelId, fetchMessages, sendMessage, emptyHint }: ChatPanelProps) {
  const myId = useAuthStore((s) => s.user?.id);
  const [messages, setMessages] = useState<DiscussionMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const load = useCallback(async () => {
    try {
      const msgs = await fetchMessages();
      // API returns newest-first; render oldest-first.
      setMessages([...msgs].reverse());
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal memuat pesan");
    }
  }, [fetchMessages]);

  useEffect(() => {
    setMessages(null);
    load();
  }, [load, channelId]);

  // Realtime: re-pull on any INSERT into this discussion (server resolves sender
  // names + respects RLS, so we don't trust the raw row payload for display).
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) supabase.realtime.setAuth(token);
      const channel = supabase
        .channel(`disc-${channelId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "discussion_messages",
            filter: `discussion_id=eq.${channelId}`,
          },
          () => {
            if (active) load();
          }
        )
        .subscribe();
      // Cleanup captured via closure below.
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
      await sendMessage(text);
      setDraft("");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[60vh] flex-col rounded-xl border border-border bg-card">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages === null ? (
          <p className="text-sm text-muted-foreground">Memuat pesan…</p>
        ) : messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {emptyHint ?? "Belum ada pesan. Mulai percakapan."}
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender.id === myId;
            return (
              <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                    mine
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  )}
                >
                  {!mine && (
                    <p className="mb-0.5 text-xs font-semibold text-muted-foreground">
                      {m.sender.name}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{m.message}</p>
                </div>
                <span className="mt-1 text-[11px] text-muted-foreground">
                  {new Date(m.createdAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-border p-3">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tulis pesan…"
          maxLength={5000}
          disabled={sending}
        />
        <Button type="submit" disabled={sending || !draft.trim()} aria-label="Kirim">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
