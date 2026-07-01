-- Phase 12.4 (Attachments) — file/image/link attachments on discussion messages.
-- Overrides the locked "no attachments in MVP" rule (docs/03, docs/06 amended).
-- Binary files live in Supabase Storage (bucket discussion-attachments, private);
-- only the path/url + metadata are stored here (FILE STORAGE rule). Read goes
-- through Express (signed download URLs), so no RLS/publication is needed here.
CREATE TABLE "discussion_attachments" (
  "id"         UUID NOT NULL DEFAULT gen_random_uuid(),
  "message_id" UUID NOT NULL,
  "type"       VARCHAR(10) NOT NULL, -- FILE | IMAGE | LINK
  "url"        TEXT,                 -- LINK: the external url; FILE/IMAGE: null (signed at read)
  "file_path"  TEXT,                 -- FILE/IMAGE: storage object path; LINK: null
  "file_name"  VARCHAR(255),
  "file_size"  INTEGER,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT now(),
  CONSTRAINT "discussion_attachments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "discussion_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "discussion_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "discussion_attachments_message_id_idx" ON "discussion_attachments"("message_id");
