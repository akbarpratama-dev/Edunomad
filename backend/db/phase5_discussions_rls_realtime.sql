-- Phase 5.1.4 — Discussions/DM RLS (SELECT-only) + Supabase Realtime.
-- APPLIED to project sfzzkwckrfwzgcujykff via Supabase MCP migration
-- `phase5_discussions_rls_realtime` (2026-06-24). Kept here for repo traceability;
-- RLS is NOT managed by Prisma (Prisma's postgres role bypasses RLS, so the Express
-- backend keeps full read/write — only browser/PostgREST/Realtime clients are gated).
--
-- Design (decision D-P5-2): writes go through Express (validated + RBAC), browser
-- clients get read-only live access scoped to discussions they belong to.
-- auth.uid() == public.users.id (verified 7/7).

-- SECURITY DEFINER membership check — bypasses RLS inside, avoids policy recursion.
create or replace function public.is_discussion_member(p_discussion_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.discussion_members m
    where m.discussion_id = p_discussion_id and m.user_id = auth.uid()
  );
$$;

alter table public.discussions          enable row level security;
alter table public.discussion_members   enable row level security;
alter table public.discussion_messages  enable row level security;

-- SELECT-only policies (no INSERT/UPDATE/DELETE policy => clients cannot write).
drop policy if exists discussions_select_members on public.discussions;
create policy discussions_select_members on public.discussions
  for select to authenticated
  using (public.is_discussion_member(id));

drop policy if exists discussion_members_select_members on public.discussion_members;
create policy discussion_members_select_members on public.discussion_members
  for select to authenticated
  using (public.is_discussion_member(discussion_id));

drop policy if exists discussion_messages_select_members on public.discussion_messages;
create policy discussion_messages_select_members on public.discussion_messages
  for select to authenticated
  using (public.is_discussion_member(discussion_id));

-- Realtime: stream message inserts (+ discussion recency bumps) to subscribers.
alter publication supabase_realtime add table public.discussion_messages;
alter publication supabase_realtime add table public.discussions;
alter table public.discussion_messages replica identity full;
