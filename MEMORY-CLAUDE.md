# MEMORY-CLAUDE.md — EduNomad Session Handoff

> Read this + CLAUDE.MD + all `memory/*.md` before doing anything. Never assume state from code alone.
> Last updated: 2026-06-24 (PHASE 5 DONE — 5.1 backend + 5.2 frontend, branch feature/phase-5-workspace, browser+realtime verified. NEXT = Phase 6 Deliverables & Contributions).

## ⭐ Landing page (marketing `/`) — ADDED 2026-06-23, verified
Built from user's Figma ("Premium SaaS Landing Page", file `nMFbzuPNcRcKgFVvMEFfaj`, node 5:2) via Figma MCP (source of truth) + skills impeccable/emil-design-eng/ui-ux-pro-max. 11 sections in `frontend/src/components/landing/` (motion.tsx, primitives.tsx, header.tsx, footer.tsx, sections/{hero,problem,how-it-works,feature-grid,project-showcase,portfolio,impact,testimonials,faq,cta}.tsx); composed in `app/page.tsx` (replaced the old `/`→login redirect). Stack: `motion` ^12.40.0 (NEW frontend dep, frontend/ only), animation library; landing palette scoped as `ln-*` Tailwind tokens in globals.css `@theme` (in-app docs/08 design system untouched); Manrope (via --font-sans, Black weight). [font Inter→Manrope across whole app, 2026-06-24] Motion = hero floating-card cluster + glow + entrance, scroll reveal/stagger (SSR-safe mounted-gate so never ships blank), CountUp stats, FAQ accordion, hover lifts — all `prefers-reduced-motion` aware. Header auth-aware (Masuk/Gabung vs Buka Dashboard). Verified: tsc clean, `npm run build` 0 errors (`/` prerendered STATIC), every section browser-screenshotted faithful to Figma. Decisions D-LP-1..4.
**Polish pass (2026-06-23, D-LP-5):** applied web-design-guidelines + emil-design-eng + ui-ux-pro-max — focus-visible rings (scoped [data-landing]; `.ln-dark` class on project-showcase/footer for lime ring on dark), mobile hamburger menu (header.tsx), scroll-spy active nav, smooth-scroll + `scroll-margin-top` on section[id], skip-link, active:scale press feedback, transition-all→explicit, AA contrast bumps on dark text, tabular-nums CountUp, aria-hidden/aria-labels, FAQ aria-controls, Testimonials now a real touch carousel (was fake arrows/dots). Browser-verified (mobile menu, focus ring, scroll-spy, anchor offset). Follow-ups (low-pri): full mobile/tablet QA of every section; placeholder stats/projects/testimonials → real API data later; Figma photo assets are gradient placeholders (asset URLs expire) — download to /public if real photos wanted.

## Project
EduNomad — project-collaboration platform (Beginners ↔ Seniors ↔ UMKM via real projects). Modular monolith. Backend: Express 5 + TS 6 + Prisma 7 + Supabase (Postgres). Frontend: Next.js 15.5.19 + React 19 + Tailwind v4 + shadcn/ui (base-ui) + Zustand + RHF + Zod. Supabase ref `sfzzkwckrfwzgcujykff` (ap-south-1).

## Status: PHASE 0–3 ✅. PHASE 4 ✅. UI Figma-redesign ✅ (merged to main 84127ce). **PHASE 5 ✅ DONE & verified — 5.1 backend + 5.2 frontend** (discussions + DM + RLS/Realtime + workspace UI, branch `feature/phase-5-workspace`, browser+realtime verified). NEXT = **PHASE 6 Deliverables & Contributions** (task-breakdown §6). Notifications = Phase 9 (NOT now).

### Phase 5.2 frontend done this session (2026-06-24, branch feature/phase-5-workspace)
discussionApi service; ChatPanel (shared group+DM: Supabase Realtime subscribe postgres_changes INSERT on discussion_messages filter discussion_id → re-pull list [D-P5-4], writes via Express, realtime.setAuth for RLS); DiscussionTab (list/create/select group, create=senior-lead/UMKM-owner seeded w/ active members); DirectMessageDialog (find-or-get 1:1); app/projects/[id]/workspace/page.tsx (tabs Ringkasan|Milestone|Diskusi|Anggota; Overview+Milestones inline; Members reuses ProjectMembersPanel + DM launchers); "Buka Workspace" entry on detail page (ACTIVE/AWAITING). Deliverables/Reviews/Artifacts tabs = later phases. DM conversation-list deferred (no GET /direct-chats in 5.1). Verified browser (p4-senior, project a1a1a1a1-…0005): render, Express send, REALTIME live delivery (beginner API msg → senior tab no refresh), DM find-or-get+history; tsc 0. Decision D-P5-4.

### Phase 5.1 done this session (2026-06-24, branch feature/phase-5-workspace — branch NOT yet pushed)
Backend Project Workspace chat (Workflow 6/7), layered + $txn. Endpoints LIVE (auth): GET/POST /projects/:id/discussions, GET/POST /discussions/:id/messages, POST /users/:id/direct-chat, GET/POST /direct-chat/:id/messages. Group create = senior lead/UMKM owner only (senior auto-included); access = discussion_members rows; DM only between users sharing a project context (D-P5-3); `title` NOT persisted (schema has no column, D-P5-1). **RLS (D-P5-2 — FIRST RLS on project):** writes via Express (Prisma role BYPASSES RLS), browser clients read-only live via Realtime; SELECT-only policies via SECURITY DEFINER `public.is_discussion_member()`; auth.uid()==users.id; publication += discussion_messages + discussions. SQL mirror: `backend/db/phase5_discussions_rls_realtime.sql`. New files: constants/discussionType, validators/discussion.validator, repositories/discussion.repository, services/{discussion,directMessage}.service, modules/{discussion,directMessage}/*.controller, routes/{discussion,directChat}.routes. **Verified:** build 0 err; E2E /tmp/p5-e2e.sh 14/14 (stayed 14/14 after RLS = Prisma-bypass proof); RLS client path member 4 / outsider 0 / anon []. Test project ACTIVE `a1a1a1a1-0000-4000-8000-000000000005` (umkm=p4-umkm, senior=p4-senior, members=p4-beginner+p43-b2; p43-b3 outsider). Decisions D-P5-1..3.

### Done this session (Phase 4.3 — Workflow 5/11/15/16/17)
- **Constants:** `MemberStatus` += `REMOVAL_REQUESTED` (Workflow 17 intermediate); `ProjectStatus` += `AWAITING_COMPLETION` (Workflow 11/15, ACTIVE→AWAITING_COMPLETION→COMPLETED) + into `PUBLIC_PROJECT_STATUSES`. Both VARCHAR (no DB enum) → **no migration**.
- **Backend 4.3.1 Members:** `projectMember.repository` += findById(w/ project), updateStatus, requestRemoval (txn: REMOVAL_REQUESTED + audit MEMBER_REMOVED stage REQUESTED w/ reason), confirmRemoval (txn: REMOVED + audit stage CONFIRMED), countActiveByProject. New `projectMember.service` + `projectMember.controller` + `validators/projectMember.validator` + `routes/member.routes`. Endpoints LIVE:
  - GET /projects/:id/members (auth)
  - POST /members/:id/remove (SENIOR lead → REMOVAL_REQUESTED + audit, needs admin confirm; body {reason} required)
  - POST /members/:id/withdraw (member self → WITHDRAWN, frees BR-001 active slot)
  - POST /admin/members/:id/remove (ADMIN → REMOVED + audit)
- **Backend 4.3.2/4.3.3 Lifecycle:** `project.repository` += countActiveAssignedBySenior (ACTIVE-only gate), completeWithAudit (txn: COMPLETED + completedAt + ACTIVE members→COMPLETED + audit PROJECT_COMPLETED). New `projectLifecycle.service` + `projectLifecycle.controller`. Endpoints LIVE:
  - POST /projects/:id/start (SENIOR lead; RECRUITING→ACTIVE; require senior assigned [caller] + ≥1 ACTIVE member; senior & UMKM max-5-ACTIVE gates)
  - POST /projects/:id/complete (SENIOR lead; ACTIVE→AWAITING_COMPLETION)
  - POST /projects/:id/confirm-completion (UMKM owner; AWAITING_COMPLETION→COMPLETED read-only + members→COMPLETED + audit)
- **Frontend:** `services/projectApi.ts` += MemberStatus/ProjectMember types, AWAITING_COMPLETION status+meta, MEMBER_STATUS_META, members()/requestRemoveMember()/withdrawMember()/start()/requestCompletion()/confirmCompletion()/confirmMemberRemoval(). New `components/project/ProjectMembersPanel.tsx` (team list + status badges; lead-senior "Keluarkan" reason dialog; member self "Keluar dari Proyek" confirm). `app/projects/[id]/page.tsx` += `LifecycleAction` (ConfirmDialog wrapper) + lifecycle buttons (lead senior: "Mulai Proyek"@RECRUITING / "Ajukan Penyelesaian"@ACTIVE; owner: "Konfirmasi Penyelesaian"@AWAITING_COMPLETION) + renders ProjectMembersPanel (`key={status}` to refresh on transition).
- **Verified:** backend `npm run build` 0 errors; frontend `npx tsc --noEmit` clean. Backend E2E vs live DB (script /tmp/p43-e2e.sh) — full happy path + negatives (403 wrong-role on start/complete/confirm/admin-route, 422 re-request/no-pending/start-on-completed, 400 no-reason) all correct; DB confirmed member REMOVED/WITHDRAWN/COMPLETED + project COMPLETED+completedAt + 3 audit rows. **Browser-verified** (Playwright) full lifecycle on "Phase43 Lifecycle Browser Test": senior Mulai Proyek→Aktif→panel switches; Keluarkan reason dialog→"Diajukan Keluar"; Ajukan Penyelesaian→"Menunggu Konfirmasi"; UMKM Konfirmasi Penyelesaian→"Selesai" read-only. Decisions D-P4.3-1..6.

### Decisions this session (decisions.md 2026-06-22)
- **D-P4.3-1** Added `ProjectStatus.AWAITING_COMPLETION` (Workflow 11/15 two-step completion). VARCHAR, no migration; kept publicly visible.
- **D-P4.3-2** Added `MemberStatus.REMOVAL_REQUESTED` (Workflow 17 two-step removal). VARCHAR, no migration.
- **D-P4.3-3** Completion-readiness gates (deliverables/contributions/reviews/artifacts, Workflow 15) **deferred to their owning later phases** — only the transition + ownership/state checks + audit built now (TODO in projectLifecycle.service.requestCompletion).
- **D-P4.3-4** `/start` requires ≥1 ACTIVE member; the senior's explicit start = "senior approval" for partially-filled slots.
- **D-P4.3-5** MEMBER_REMOVED audit written at BOTH stages (REQUESTED by senior w/ reason; CONFIRMED by admin), disambiguated by metadata.stage. No removal_reason column → reason lives in audit metadata.
- **D-P4.3-6** No admin UI for confirm-member-removal yet (backend + projectApi.confirmMemberRemoval ready) — deferred until an admin project-management page exists.

### Backend tooling (unchanged, still good)
`backend/tsconfig.json` = `"ignoreDeprecations":"6.0"` + `"ts-node":{"files":true}`; ROOT `package.json` `overrides @types/express-serve-static-core → 5.0.7`. `npm run dev` boots with full type-check; `npm run build` 0 errors. ⚠️ If node_modules rebuilt and deps look incomplete/pin ignored → `npm cache clean --force && rm -rf node_modules package-lock.json && npm install` (a prior session needed the cache clean to fully resolve next's deps). styled-jsx is an explicit frontend dep (D-P4-4 defensive pin).

### Project status lifecycle (UPDATED this session)
DRAFT → PENDING_REVIEW → RECRUITING (approve) / REJECTED → ACTIVE (senior start) → **AWAITING_COMPLETION** (senior requests) → COMPLETED (umkm confirms, read-only). Public-visible = {RECRUITING, ACTIVE, AWAITING_COMPLETION, COMPLETED}. Application status = PENDING/ACCEPTED/REJECTED/WITHDRAWN. Member status = ACTIVE/**REMOVAL_REQUESTED**/REMOVED/WITHDRAWN/COMPLETED. (Zod/service enums, no DB enums.)

### Conventions (follow)
- Backend layered: routes/<f>.routes.ts, modules/<f>/<f>.controller.ts, services/<f>.service.ts, repositories/<e>.repository.ts, validators/<f>.validator.ts, aggregated in routes/index.ts. Nested project routes (/projects/:id/start) live in project.routes.ts; absolute-action routes (/members/:id/remove) get their own route file. Multi-step state changes = `prisma.$transaction`. Ownership/role checks in the service. Member removal & project completion write `auditLog` (constants/auditActions.ts — MEMBER_REMOVED, PROJECT_COMPLETED already defined); plain SENIOR/UMKM recruitment/lifecycle transitions (start/complete/withdraw) do NOT audit. paginatedResponse {data, meta:{page,limit,total,lastPage}}; envelope {success,message,data}; list endpoints return successResponse(array). App role/status in public.users; token via supabase.auth.getUser. VARCHAR enums validated at Zod/service.
- Frontend: AuthGuard(allowedRoles), AppShell, apiClient (axios+JWT), service objects (projectApi/applicationApi/adminApi/authApi/skillApi). shadcn base-ui — Select onValueChange gives string|null; Button `render={<Link/>}` emits a **harmless** base-ui `nativeButton` console error (ignore). Dialog refs change on re-render → re-snapshot before clicking; in Playwright prefer text-locators (`button:has-text(...)`) and DOM eval for fields. ConfirmDialog props: open/onOpenChange/title/description/confirmLabel/cancelLabel/`destructive`/onConfirm. Tailwind NUMERIC spacing only. Badge variants default/secondary/destructive/outline (NO success/warning — tint via className). Screenshots time out (font) → use Playwright accessibility snapshot + `browser_evaluate` DOM read + Supabase MCP SQL.
- Context7 MCP before lib/framework code. `.env*` sandboxed. RLS still disabled (deferred). Provision test users: backend POST /auth/signup → Supabase `/auth/v1/token?grant_type=password` (apikey=anon key) signin → POST /auth/register {name,role} → SQL UPDATE users SET status='VERIFIED' (and role='ADMIN' for admins; register only allows BEGINNER/SENIOR/UMKM). Anon key + URL via Supabase MCP get_publishable_keys/get_project_url. ⚠️ When provisioning via shell, write the script to a FILE (not `bash -c "..."`) — nested double-quote escaping mangles JSON bodies.

### Test fixtures in DB
- p4-umkm / p4-senior / p4-beginner @test.edunomad.com (pw TestPass123!, VERIFIED). p43-b2 / p43-b3 (BEGINNER VERIFIED), p43-admin (ADMIN VERIFIED) added this session.
- ⚠️ Both Phase-4 test projects ("Phase4 Recruitment Test", "Phase43 Lifecycle Browser Test") are now **COMPLETED** (consumed by E2E/browser). **A fresh RECRUITING/ACTIVE project + members must be created for Phase 5 testing.**
- Helper scripts left in /tmp: p43-prov.sh (provision), p43-e2e.sh (lifecycle E2E), p43-setup-browser.sh (browser scenario setup).

## 📌 NEXT-SESSION INIT PROMPT

```
Lanjutkan EduNomad ke PHASE 6 — Deliverables & Contributions (task-breakdown §6; Workflow terkait).
Phase 0–5 SEMUA selesai & terverifikasi (Phase 5 = workspace chat backend+frontend+realtime, browser-verified)
— JANGAN bangun ulang. Baca CLAUDE.MD + MEMORY-CLAUDE.md + semua memory/*.md + next-tasks.md blok
"⚡ ACTIVE HANDOFF 2026-06-24 #3".

Branch: Phase 5 ada di `feature/phase-5-workspace` (sudah push). Sebelum Phase 6: MERGE feature/phase-5-workspace
→ main dulu (buka PR / merge --no-ff), lalu cabang `feature/phase-6-deliverables` dari main (GitHub Flow,
CONTRIBUTING.md). Konfirmasi ke user kalau ragu soal merge/PR.

Backend tooling beres: `npm run dev` (:3001) type-check penuh, `npm run build` 0 error. Frontend :3000.
Kalau node_modules rebuilt & deps tak lengkap: `npm cache clean --force && rm -rf node_modules
package-lock.json && npm install`.

Baca dulu (JANGAN nebak): task-breakdown.md §6 (urutan subtask exact) + docs/03 schema Deliverables Domain +
Contributions Domain + docs/04 API Deliverables/Contributions Endpoints + docs/06 RBAC (beginner submit
deliverable/contribution, senior review/approve, request revision) + docs/07 Workflow (deliverable review,
contribution approval, milestone revision WF 10). Lalu bangun layered (route→controller→service→repository→
Prisma, $transaction utk aksi multi-step, audit log kalau perlu, verifikasi tiap milestone, update memory
tiap selesai). Prisma models Deliverable/Contribution dll sudah ada (migrations init_deliverables_domain +
init_contributions_artifacts_reviews_domain) → cek schema.prisma dulu, kemungkinan NO migration.
Carry-over (D-P4.3-3): isi completion-readiness gate deliverables/contributions di
projectLifecycle.service.requestCompletion saat Phase 6 jalan.

Reuse pola: repository/service/controller + $txn, projectMember.repository, AuthGuard/AppShell/apiClient +
service object (projectApi/applicationApi/discussionApi). Untuk frontend, tambah tab "Deliverables" di
workspace (/projects/[id]/workspace) yg tadi di-skip. Notifications = PHASE 9 (BUKAN sekarang).

⚠️ Test data SIAP: project ACTIVE `a1a1a1a1-0000-4000-8000-000000000005` (umkm=p4-umkm, senior=p4-senior,
members=p4-beginner+p43-b2; p43-b3=outsider). Semua user pw TestPass123!. anon key+URL via Supabase MCP.
Sudah ada group discussion + DM + messages dari Phase 5 (boleh diabaikan/dipakai). Backend & frontend dev
server mungkin masih jalan background (:3001 / :3000).
```
