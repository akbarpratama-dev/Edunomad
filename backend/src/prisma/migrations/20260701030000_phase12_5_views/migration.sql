-- Phase 12.5 (Views) — unique view tracking per discussion topic. One row per
-- (discussion, user); the topic's view count is the distinct number of viewers.
-- Read via Express (count exposed on the discussion list), so no RLS/publication.
CREATE TABLE "discussion_views" (
  "id"            UUID NOT NULL DEFAULT gen_random_uuid(),
  "discussion_id" UUID NOT NULL,
  "user_id"       UUID NOT NULL,
  "created_at"    TIMESTAMP(6) NOT NULL DEFAULT now(),
  CONSTRAINT "discussion_views_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "discussion_views_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "discussion_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "discussion_views_discussion_id_user_id_key" ON "discussion_views"("discussion_id", "user_id");
