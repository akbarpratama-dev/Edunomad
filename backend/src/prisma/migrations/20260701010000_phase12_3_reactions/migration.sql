-- Phase 12.3 (Reactions) — emoji reactions on discussion messages.
-- discussion_id is denormalised so realtime delivery + RLS can reuse
-- is_discussion_member(discussion_id) (same gate as discussion_messages).
CREATE TABLE "message_reactions" (
  "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
  "message_id"    UUID NOT NULL,
  "discussion_id" UUID NOT NULL,
  "user_id"       UUID NOT NULL,
  "emoji"         VARCHAR(16) NOT NULL,
  "created_at"    TIMESTAMP(6) NOT NULL DEFAULT now(),
  CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "message_reactions_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "discussion_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "message_reactions_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "message_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "message_reactions_message_id_user_id_emoji_key" ON "message_reactions"("message_id", "user_id", "emoji");
CREATE INDEX "message_reactions_message_id_idx" ON "message_reactions"("message_id");

-- RLS: members of the discussion may read reactions (writes go through Express).
ALTER TABLE "message_reactions" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS message_reactions_select_members ON public.message_reactions;
CREATE POLICY message_reactions_select_members ON public.message_reactions
  FOR SELECT TO authenticated
  USING (public.is_discussion_member(discussion_id));

-- Realtime: stream reaction insert/delete to subscribers.
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;
