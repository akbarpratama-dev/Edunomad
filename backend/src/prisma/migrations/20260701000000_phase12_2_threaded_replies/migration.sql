-- Phase 12.2 (Threaded Replies) — one-level replies on group discussion messages
-- via a self FK on discussion_messages. parent_id is null for top-level messages;
-- a reply points at its parent. ON DELETE CASCADE removes replies with their parent.
ALTER TABLE "discussion_messages" ADD COLUMN "parent_id" UUID;

ALTER TABLE "discussion_messages"
  ADD CONSTRAINT "discussion_messages_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "discussion_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "discussion_messages_parent_id_idx" ON "discussion_messages"("parent_id");
