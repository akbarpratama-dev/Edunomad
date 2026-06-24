"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { discussionApi } from "@/services/discussionApi";
import { ChatPanel } from "./ChatPanel";

// Opens (or finds) the 1:1 DIRECT chat with a user and shows the chat in a dialog.
// Eligibility (shared project context) is enforced by the backend.
export function DirectMessageDialog({
  targetUserId,
  targetName,
}: {
  targetUserId: string;
  targetName: string;
}) {
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setOpen(true);
    if (chatId) return;
    setLoading(true);
    try {
      const chat = await discussionApi.createOrGetDirectChat(targetUserId);
      setChatId(chat.id);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Tidak bisa memulai chat");
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={start}>
        <MessageCircle className="mr-1.5 size-4" /> Pesan
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pesan dengan {targetName}</DialogTitle>
          </DialogHeader>
          {loading || !chatId ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Memuat percakapan…</p>
          ) : (
            <ChatPanel
              channelId={chatId}
              fetchMessages={() => discussionApi.listDirectMessages(chatId).then((r) => r.data)}
              sendMessage={(text) => discussionApi.sendDirectMessage(chatId, text)}
              emptyHint={`Belum ada pesan dengan ${targetName}.`}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
