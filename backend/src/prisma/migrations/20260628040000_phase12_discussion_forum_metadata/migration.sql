-- Phase 12 (Discussion Forum Upgrade) 12.1 — forum metadata on discussions.
-- title/category are null for DIRECT chats; category values validated at Zod
-- (ANNOUNCEMENT|QUESTION|IDEA|BLOCKER|MENTOR_REVIEW|UPDATE).
ALTER TABLE "discussions"
  ADD COLUMN "title" VARCHAR(255),
  ADD COLUMN "category" VARCHAR(30),
  ADD COLUMN "is_pinned" BOOLEAN NOT NULL DEFAULT false;
