# MEMORY-CLAUDE.md â EduNomad Session Handoff

> Read this + CLAUDE.MD + all `memory/*.md` before doing anything. Never assume state from code alone.
> Last updated: 2026-07-01 (main = b821b5c. Phase 0-7 + UNIFY-UI sweep + Diskusi tab premium redesign merged. Branch `feature/phase-10-discussion-forum` = PHASE 12 (12.1 done) PLUS a UX-hardening batch this session — see "⚡ UX batch" below. 12.2 threaded replies + 12.3 reactions also DONE (2026-07-01, D-P12-4/D-P12-5). Remaining 12.4-12.5 + Phase 8 Artifact still pending.)

## ⚡ UX batch (2026-06-30→07-01, branch feature/phase-10-discussion-forum) — committed
Bug fixes + flow upgrades on top of Phase 12 work. All tsc 0 + Playwright-verified (p4-senior).
- **Auth redirect race fix (D-AUTH-1)** — false bounce to /auth/login right after sign-in (SIGNED_IN event lagging the nav). AuthGuard now re-checks `supabase.auth.getSession()` before redirecting; AuthProvider holds `isLoading` true through the app-user fetch on a fresh session; useRequireSession same recheck. Context7-grounded (signInWithPassword resolves & dispatches SIGNED_IN separately).
- **Back-to-landing** — `AuthCard` shows "← Kembali ke beranda" (→ `/`, prop `backHref` default "/") on login + every register step.
- **Dev perf** — `reactStrictMode:false` in `next.config.ts`: kills dev-only double-fetch (StrictMode double-invoke). Production unchanged. (Latency profiling: first-visit ~3.8s = Next dev compile [gone in prod]; clean 3-parallel API ~686ms; remote DB ap-south-1.)
- **Senior "Proyek Mentoring" (D-P12-2)** — new SENIOR sidebar item → `/my-projects` (SeniorView via `projectApi.mentoredProjects()`); guard now allows SENIOR. Gives mentor a sidebar path to the per-project workspace Diskusi tab (same board as students — discussion stays a workspace tab per docs/08).
- **Stay-in-namespace flow (D-P12-3)** — from /my-projects, opening a project keeps you under `/my-projects/:id*`. Detail + workspace + manage + applicants pages are base-aware via `usePathname` (`base = startsWith("/my-projects") ? "/my-projects" : "/projects"`) for backHref + internal links. New nested routes are thin re-exports of the same components: `app/my-projects/[id]/{page,workspace/page,manage/page,applicants/page}.tsx`. Workspace deep-links a tab via `?tab=discussion` (reads `window.location.search`, register `?role=` pattern, avoids Suspense). my-projects cards + senior/beginner dashboards + BeginnerProjectBoard now link `/my-projects/...`. Jelajahi Proyek stays `/projects/:id` (discovery/apply). NOTE: same workspace now reachable at both `/projects/:id/workspace` and `/my-projects/:id/workspace` — same component, not a new screen.
- Still uncommitted/untouched: `frontend/src/app/page.tsx` (landing, stale M from earlier session — intentionally left).

## â­ Landing page (marketing `/`) â ADDED 2026-06-23, verified
Built from user's Figma ("Premium SaaS Landing Page", file `nMFbzuPNcRcKgFVvMEFfaj`, node 5:2) via Figma MCP (source of truth) + skills impeccable/emil-design-eng/ui-ux-pro-max. 11 sections in `frontend/src/components/landing/` (motion.tsx, primitives.tsx, header.tsx, footer.tsx, sections/{hero,problem,how-it-works,feature-grid,project-showcase,portfolio,impact,testimonials,faq,cta}.tsx); composed in `app/page.tsx` (replaced the old `/`âlogin redirect). Stack: `motion` ^12.40.0 (NEW frontend dep, frontend/ only), animation library; landing palette scoped as `ln-*` Tailwind tokens in globals.css `@theme` (in-app docs/08 design system untouched); Manrope (via --font-sans, Black weight). [font InterâManrope across whole app, 2026-06-24] Motion = hero floating-card cluster + glow + entrance, scroll reveal/stagger (SSR-safe mounted-gate so never ships blank), CountUp stats, FAQ accordion, hover lifts â all `prefers-reduced-motion` aware. Header auth-aware (Masuk/Gabung vs Buka Dashboard). Verified: tsc clean, `npm run build` 0 errors (`/` prerendered STATIC), every section browser-screenshotted faithful to Figma. Decisions D-LP-1..4.
**Polish pass (2026-06-23, D-LP-5):** applied web-design-guidelines + emil-design-eng + ui-ux-pro-max â focus-visible rings (scoped [data-landing]; `.ln-dark` class on project-showcase/footer for lime ring on dark), mobile hamburger menu (header.tsx), scroll-spy active nav, smooth-scroll + `scroll-margin-top` on section[id], skip-link, active:scale press feedback, transition-allâexplicit, AA contrast bumps on dark text, tabular-nums CountUp, aria-hidden/aria-labels, FAQ aria-controls, Testimonials now a real touch carousel (was fake arrows/dots). Browser-verified (mobile menu, focus ring, scroll-spy, anchor offset). Follow-ups (low-pri): full mobile/tablet QA of every section; placeholder stats/projects/testimonials â real API data later; Figma photo assets are gradient placeholders (asset URLs expire) â download to /public if real photos wanted.

## Project
EduNomad â project-collaboration platform (Beginners â Seniors â UMKM via real projects). Modular monolith. Backend: Express 5 + TS 6 + Prisma 7 + Supabase (Postgres). Frontend: Next.js 15.5.19 + React 19 + Tailwind v4 + shadcn/ui (base-ui) + Zustand + RHF + Zod. Supabase ref `sfzzkwckrfwzgcujykff` (ap-south-1).

## Status: PHASE 0-7 ✅ (all merged to main) + **UNIFY-UI SWEEP ✅ COMPLETE** (2026-06-28, main = ee0f045, D-UI-11). Every authed page shares one premium design language via shared primitives: `ui/card.tsx` (rounded-[20px] flat), `common/PageHeader.tsx` (h1 28px), NEW `common/PillTabs.tsx` (navy-fill active chip + counts), `common/EmptyState.tsx` (premium dashed). 6 batches merged: applications/mentor/reviews · projects/[id]+workspace · manage/applicants/create · admin review/verification/audit · my-projects UMKM. Auth /auth/* untouched. **NEXT = resume PHASE 8 Artifact System** (UI label "Sertifikat", D-UI-7; WIP feature/phase-8-artifacts 1e6a4a3) + fill completion-gate (D-P4.3-3). Notifications = Phase 9 (NOT now).

### Phase 6.3 frontend done this session (2026-06-25, branch feature/phase-6-deliverables)
deliverableApi + contributionApi service objects. DeliverablesTab (beginner create/edit DRAFT, submit/resubmit LINK evidence dynamic inputs, revision-feedback callout; senior lead review INLINE Setujui/Minta Revisi+feedback â D-P6-3, NOT a separate /deliverables/:id/review route). ContributionTab (beginner own report summary + skill-chip multiselect one-per-project edit-while-PENDING; senior list+approve). Workspace page += "Deliverables"+"Kontribusi" tabs. File-upload evidence (Supabase Storage) DEFERRED â LINK first (FILE type backend-ready). Browser-verified full loop (createâsubmitârequest-revisionâfeedback shown; contribution+skills) as beginner & senior; tsc 0. Decision D-P6-3.

### Phase 6.1+6.2 done this session (2026-06-25, branch feature/phase-6-deliverables)
Backend Deliverables (WF8) + Contributions (WF9), layered + $txn, no migration (models exist). Endpoints: GET/POST /projects/:id/deliverables, PUT /deliverables/:id, POST /deliverables/:id/{submit,approve,request-revision}; GET/POST /projects/:id/contributions, PUT /contributions/:id, POST /contributions/:id/approve. Deliverable DRAFTâSUBMITTED(evidences LINK url/FILE file_path, replaced per submit)âAPPROVED / REVISION_REQUESTED loop; create=BEGINNER active member+project ACTIVE; approve/request-revision=senior lead, only from SUBMITTED. **Revision feedback has NO schema column â stored in audit log (DELIVERABLE_REVISION_REQUESTED metadata), surfaced as `revisionFeedback` on GET list (D-P6-1).** Contribution: one per beginner per project, PENDINGâAPPROVED(+reviewedBy). New files: constants/deliverableStatus, validators/{deliverable,contribution}.validator, repositories/{deliverable,contribution}.repository, services/{deliverable,contribution}.service, modules/{deliverable,contribution}/*.controller, routes/{deliverable,contribution}.routes. auditActions += DELIVERABLE_APPROVED/REVISION_REQUESTED/CONTRIBUTION_APPROVED + EntityType DELIVERABLE/CONTRIBUTION_REPORT; projectMember.repo += isActiveMember. Verified: build 0 err, E2E /tmp/p6-e2e.sh 24/24. Decisions D-P6-1, D-P6-2.

### Phase 5.2 frontend done this session (2026-06-24, branch feature/phase-5-workspace)
discussionApi service; ChatPanel (shared group+DM: Supabase Realtime subscribe postgres_changes INSERT on discussion_messages filter discussion_id â re-pull list [D-P5-4], writes via Express, realtime.setAuth for RLS); DiscussionTab (list/create/select group, create=senior-lead/UMKM-owner seeded w/ active members); DirectMessageDialog (find-or-get 1:1); app/projects/[id]/workspace/page.tsx (tabs Ringkasan|Milestone|Diskusi|Anggota; Overview+Milestones inline; Members reuses ProjectMembersPanel + DM launchers); "Buka Workspace" entry on detail page (ACTIVE/AWAITING). Deliverables/Reviews/Artifacts tabs = later phases. DM conversation-list deferred (no GET /direct-chats in 5.1). Verified browser (p4-senior, project a1a1a1a1-â¦0005): render, Express send, REALTIME live delivery (beginner API msg â senior tab no refresh), DM find-or-get+history; tsc 0. Decision D-P5-4.

### Phase 5.1 done this session (2026-06-24, branch feature/phase-5-workspace â branch NOT yet pushed)
Backend Project Workspace chat (Workflow 6/7), layered + $txn. Endpoints LIVE (auth): GET/POST /projects/:id/discussions, GET/POST /discussions/:id/messages, POST /users/:id/direct-chat, GET/POST /direct-chat/:id/messages. Group create = senior lead/UMKM owner only (senior auto-included); access = discussion_members rows; DM only between users sharing a project context (D-P5-3); `title` NOT persisted (schema has no column, D-P5-1). **RLS (D-P5-2 â FIRST RLS on project):** writes via Express (Prisma role BYPASSES RLS), browser clients read-only live via Realtime; SELECT-only policies via SECURITY DEFINER `public.is_discussion_member()`; auth.uid()==users.id; publication += discussion_messages + discussions. SQL mirror: `backend/db/phase5_discussions_rls_realtime.sql`. New files: constants/discussionType, validators/discussion.validator, repositories/discussion.repository, services/{discussion,directMessage}.service, modules/{discussion,directMessage}/*.controller, routes/{discussion,directChat}.routes. **Verified:** build 0 err; E2E /tmp/p5-e2e.sh 14/14 (stayed 14/14 after RLS = Prisma-bypass proof); RLS client path member 4 / outsider 0 / anon []. Test project ACTIVE `a1a1a1a1-0000-4000-8000-000000000005` (umkm=p4-umkm, senior=p4-senior, members=p4-beginner+p43-b2; p43-b3 outsider). Decisions D-P5-1..3.

### Done this session (Phase 4.3 â Workflow 5/11/15/16/17)
- **Constants:** `MemberStatus` += `REMOVAL_REQUESTED` (Workflow 17 intermediate); `ProjectStatus` += `AWAITING_COMPLETION` (Workflow 11/15, ACTIVEâAWAITING_COMPLETIONâCOMPLETED) + into `PUBLIC_PROJECT_STATUSES`. Both VARCHAR (no DB enum) â **no migration**.
- **Backend 4.3.1 Members:** `projectMember.repository` += findById(w/ project), updateStatus, requestRemoval (txn: REMOVAL_REQUESTED + audit MEMBER_REMOVED stage REQUESTED w/ reason), confirmRemoval (txn: REMOVED + audit stage CONFIRMED), countActiveByProject. New `projectMember.service` + `projectMember.controller` + `validators/projectMember.validator` + `routes/member.routes`. Endpoints LIVE:
  - GET /projects/:id/members (auth)
  - POST /members/:id/remove (SENIOR lead â REMOVAL_REQUESTED + audit, needs admin confirm; body {reason} required)
  - POST /members/:id/withdraw (member self â WITHDRAWN, frees BR-001 active slot)
  - POST /admin/members/:id/remove (ADMIN â REMOVED + audit)
- **Backend 4.3.2/4.3.3 Lifecycle:** `project.repository` += countActiveAssignedBySenior (ACTIVE-only gate), completeWithAudit (txn: COMPLETED + completedAt + ACTIVE membersâCOMPLETED + audit PROJECT_COMPLETED). New `projectLifecycle.service` + `projectLifecycle.controller`. Endpoints LIVE:
  - POST /projects/:id/start (SENIOR lead; RECRUITINGâACTIVE; require senior assigned [caller] + â¥1 ACTIVE member; senior & UMKM max-5-ACTIVE gates)
  - POST /projects/:id/complete (SENIOR lead; ACTIVEâAWAITING_COMPLETION)
  - POST /projects/:id/confirm-completion (UMKM owner; AWAITING_COMPLETIONâCOMPLETED read-only + membersâCOMPLETED + audit)
- **Frontend:** `services/projectApi.ts` += MemberStatus/ProjectMember types, AWAITING_COMPLETION status+meta, MEMBER_STATUS_META, members()/requestRemoveMember()/withdrawMember()/start()/requestCompletion()/confirmCompletion()/confirmMemberRemoval(). New `components/project/ProjectMembersPanel.tsx` (team list + status badges; lead-senior "Keluarkan" reason dialog; member self "Keluar dari Proyek" confirm). `app/projects/[id]/page.tsx` += `LifecycleAction` (ConfirmDialog wrapper) + lifecycle buttons (lead senior: "Mulai Proyek"@RECRUITING / "Ajukan Penyelesaian"@ACTIVE; owner: "Konfirmasi Penyelesaian"@AWAITING_COMPLETION) + renders ProjectMembersPanel (`key={status}` to refresh on transition).
- **Verified:** backend `npm run build` 0 errors; frontend `npx tsc --noEmit` clean. Backend E2E vs live DB (script /tmp/p43-e2e.sh) â full happy path + negatives (403 wrong-role on start/complete/confirm/admin-route, 422 re-request/no-pending/start-on-completed, 400 no-reason) all correct; DB confirmed member REMOVED/WITHDRAWN/COMPLETED + project COMPLETED+completedAt + 3 audit rows. **Browser-verified** (Playwright) full lifecycle on "Phase43 Lifecycle Browser Test": senior Mulai ProyekâAktifâpanel switches; Keluarkan reason dialogâ"Diajukan Keluar"; Ajukan Penyelesaianâ"Menunggu Konfirmasi"; UMKM Konfirmasi Penyelesaianâ"Selesai" read-only. Decisions D-P4.3-1..6.

### Decisions this session (decisions.md 2026-06-22)
- **D-P4.3-1** Added `ProjectStatus.AWAITING_COMPLETION` (Workflow 11/15 two-step completion). VARCHAR, no migration; kept publicly visible.
- **D-P4.3-2** Added `MemberStatus.REMOVAL_REQUESTED` (Workflow 17 two-step removal). VARCHAR, no migration.
- **D-P4.3-3** Completion-readiness gates (deliverables/contributions/reviews/artifacts, Workflow 15) **deferred to their owning later phases** â only the transition + ownership/state checks + audit built now (TODO in projectLifecycle.service.requestCompletion).
- **D-P4.3-4** `/start` requires â¥1 ACTIVE member; the senior's explicit start = "senior approval" for partially-filled slots.
- **D-P4.3-5** MEMBER_REMOVED audit written at BOTH stages (REQUESTED by senior w/ reason; CONFIRMED by admin), disambiguated by metadata.stage. No removal_reason column â reason lives in audit metadata.
- **D-P4.3-6** No admin UI for confirm-member-removal yet (backend + projectApi.confirmMemberRemoval ready) â deferred until an admin project-management page exists.

### Backend tooling (unchanged, still good)
`backend/tsconfig.json` = `"ignoreDeprecations":"6.0"` + `"ts-node":{"files":true}`; ROOT `package.json` `overrides @types/express-serve-static-core â 5.0.7`. `npm run dev` boots with full type-check; `npm run build` 0 errors. â ï¸ If node_modules rebuilt and deps look incomplete/pin ignored â `npm cache clean --force && rm -rf node_modules package-lock.json && npm install` (a prior session needed the cache clean to fully resolve next's deps). styled-jsx is an explicit frontend dep (D-P4-4 defensive pin).

### Project status lifecycle (UPDATED this session)
DRAFT â PENDING_REVIEW â RECRUITING (approve) / REJECTED â ACTIVE (senior start) â **AWAITING_COMPLETION** (senior requests) â COMPLETED (umkm confirms, read-only). Public-visible = {RECRUITING, ACTIVE, AWAITING_COMPLETION, COMPLETED}. Application status = PENDING/ACCEPTED/REJECTED/WITHDRAWN. Member status = ACTIVE/**REMOVAL_REQUESTED**/REMOVED/WITHDRAWN/COMPLETED. (Zod/service enums, no DB enums.)

### Conventions (follow)
- Backend layered: routes/<f>.routes.ts, modules/<f>/<f>.controller.ts, services/<f>.service.ts, repositories/<e>.repository.ts, validators/<f>.validator.ts, aggregated in routes/index.ts. Nested project routes (/projects/:id/start) live in project.routes.ts; absolute-action routes (/members/:id/remove) get their own route file. Multi-step state changes = `prisma.$transaction`. Ownership/role checks in the service. Member removal & project completion write `auditLog` (constants/auditActions.ts â MEMBER_REMOVED, PROJECT_COMPLETED already defined); plain SENIOR/UMKM recruitment/lifecycle transitions (start/complete/withdraw) do NOT audit. paginatedResponse {data, meta:{page,limit,total,lastPage}}; envelope {success,message,data}; list endpoints return successResponse(array). App role/status in public.users; token via supabase.auth.getUser. VARCHAR enums validated at Zod/service.
- Frontend: AuthGuard(allowedRoles), AppShell, apiClient (axios+JWT), service objects (projectApi/applicationApi/adminApi/authApi/skillApi). shadcn base-ui â Select onValueChange gives string|null; Button `render={<Link/>}` emits a **harmless** base-ui `nativeButton` console error (ignore). Dialog refs change on re-render â re-snapshot before clicking; in Playwright prefer text-locators (`button:has-text(...)`) and DOM eval for fields. ConfirmDialog props: open/onOpenChange/title/description/confirmLabel/cancelLabel/`destructive`/onConfirm. Tailwind NUMERIC spacing only. Badge variants default/secondary/destructive/outline (NO success/warning â tint via className). Screenshots time out (font) â use Playwright accessibility snapshot + `browser_evaluate` DOM read + Supabase MCP SQL.
- Context7 MCP before lib/framework code. `.env*` sandboxed. RLS still disabled (deferred). Provision test users: backend POST /auth/signup â Supabase `/auth/v1/token?grant_type=password` (apikey=anon key) signin â POST /auth/register {name,role} â SQL UPDATE users SET status='VERIFIED' (and role='ADMIN' for admins; register only allows BEGINNER/SENIOR/UMKM). Anon key + URL via Supabase MCP get_publishable_keys/get_project_url. â ï¸ When provisioning via shell, write the script to a FILE (not `bash -c "..."`) â nested double-quote escaping mangles JSON bodies.

### Test fixtures in DB
- p4-umkm / p4-senior / p4-beginner @test.edunomad.com (pw TestPass123!, VERIFIED). p43-b2 / p43-b3 (BEGINNER VERIFIED), p43-admin (ADMIN VERIFIED) added this session.
- â ï¸ Both Phase-4 test projects ("Phase4 Recruitment Test", "Phase43 Lifecycle Browser Test") are now **COMPLETED** (consumed by E2E/browser). **A fresh RECRUITING/ACTIVE project + members must be created for Phase 5 testing.**
- Helper scripts left in /tmp: p43-prov.sh (provision), p43-e2e.sh (lifecycle E2E), p43-setup-browser.sh (browser scenario setup).
## 📌 NEXT-SESSION INIT PROMPT

```
Lanjutkan EduNomad: PHASE 12 — Discussion Forum Upgrade (lanjut sub-phase 12.2+).
Baca CLAUDE.MD + MEMORY-CLAUDE.md + semua memory/*.md + next-tasks.md blok "ACTIVE HANDOFF 2026-06-28 #10"
+ DESIGN.md + task-breakdown §PHASE 12 + decisions D-P12-1.

main = b821b5c. Branch aktif feature/phase-10-discussion-forum (belum merge). 12.1 (title+category+pin) SELESAI
& verified. CATATAN: branch ini juga sudah berisi "⚡ UX batch" (auth redirect fix D-AUTH-1, back-to-landing,
reactStrictMode off, senior "Proyek Mentoring" D-P12-2, flow stay-in-namespace /my-projects/:id* D-P12-3) —
semua committed, tsc 0, Playwright-verified. Lihat blok "⚡ UX batch" di atas + decisions D-AUTH-1/D-P12-2/D-P12-3.
✅ 12.2 threaded replies DONE (D-P12-4: parent_id self FK, one-level). ✅ 12.3 reactions DONE (2026-07-01, D-P12-5: message_reactions +discussion_id denormal +RLS +realtime; chips+picker di parent&reply; E2E add/toggle OK).
LANJUTKAN bertahap: 12.4 attachments
(message_reactions table) → 12.4 attachments (discussion_attachments + Supabase Storage bucket+signed upload+RLS,
override "no attachments MVP") → 12.5 views (discussion_views table). Tiap irisan: migration via Supabase MCP
apply_migration + record _prisma_migrations (sha256 checksum) + prisma generate; backend layered
(validator→repo→service→controller→routes); frontend wiring (DiscussionTab/DiscussionFeed/discussionApi);
verify E2E browser + tsc/build 0 + console 0; commit. Setelah semua → merge ke main.
Test: p4-senior/umkm/beginner + p43-admin pw TestPass123!; project ACTIVE a1a1a1a1-0000-4000-8000-000000000005
(ada diskusi "Review Landing Page Minggu Ini"/MENTOR_REVIEW pinned). tsc TS2882 CSS = transient, settle ~2s re-run.

(Pending lain: PHASE 8 Artifact di feature/phase-8-artifacts 1e6a4a3.)

=== arsip init prompt #9 (Phase 8) ===
Lanjutkan EduNomad: resume PHASE 8 — Artifact System (UI label "Sertifikat", D-UI-7).
Baca CLAUDE.MD + MEMORY-CLAUDE.md + semua memory/*.md + next-tasks.md blok "ACTIVE HANDOFF 2026-06-28 #9"
+ DESIGN.md + task-breakdown §8.

main = ee0f045 (Phase 0-7 + UNIFY-UI sweep SELESAI: semua halaman authed satu bahasa desain premium —
shared Card/PageHeader/PillTabs/EmptyState + app-reveal). WIP Phase 8 di branch feature/phase-8-artifacts
1e6a4a3 (sudah: pdfkit/qrcode + artifactPdf.service + artifact.repository) — cabang dari main LAMA,
pertimbangkan rebase ke ee0f045 dulu.

SISA Phase 8: (1) Backend artifact.service + controller + routes — endpoints POST /projects/:id/generate-artifacts,
POST /artifacts/:id/regenerate, GET /artifacts/:id, GET /artifacts/:id/download, GET /verify/:code; wire ke
routes/index.ts. (2) Completion gate (carry-over D-P4.3-3) di projectLifecycle.service.requestCompletion:
semua deliverables APPROVED + contributions APPROVED + reviews ada + artifacts generated sebelum
ACTIVE→AWAITING_COMPLETION (Workflow 15). (3) Frontend 4 page (label "Sertifikat"; nav /artifacts sudah ada,
page belum) pakai pola premium baru (PageHeader/PillTabs/Card/EmptyState/app-reveal). Baca schema
Artifact/ArtifactVersion (immutable, sudah ada → kemungkinan NO migration) + RBAC (siapa generate) + Workflow 13/14/18.

Dev: backend :3001 (npm run dev full type-check), frontend :3000. tsc TS2882 CSS-ambient = transient saat
.next/types regen → settle ~2s, re-run. Deps tak lengkap → npm cache clean --force && rm -rf node_modules
package-lock.json && npm install. Test users p4-beginner/senior/umkm + p43-admin @test.edunomad.com pw
TestPass123!; project ACTIVE a1a1a1a1-0000-4000-8000-000000000005. Verify per fitur + tsc 0 + console 0 err.
```
