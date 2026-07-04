-- Phase 9 — notifications RLS (SELECT-only, own rows) + Supabase Realtime.
-- APPLIED to project sfzzkwckrfwzgcujykff via Supabase MCP (2026-07-04).
-- Kept here for repo traceability; RLS is NOT managed by Prisma (Prisma's
-- postgres role bypasses RLS, so the Express backend keeps full read/write —
-- only browser/Realtime clients are gated).
--
-- Design: notifications are WRITTEN by the Express backend (service role, via
-- trigger sites in other services). Browser clients get read-only live access
-- to their OWN rows and receive INSERTs via Realtime. auth.uid() == public.users.id.

alter table public.notifications enable row level security;

-- SELECT-only (no INSERT/UPDATE/DELETE policy => clients cannot write).
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select to authenticated
  using (auth.uid() = user_id);

-- Realtime: stream new notifications to the owning user.
alter publication supabase_realtime add table public.notifications;
alter table public.notifications replica identity full;
