# MEMORY-CLAUDE.md — EduNomad Session Handoff

> Read this + CLAUDE.MD + all `memory/*.md` before doing anything. Never assume state from code alone.
> Last updated: 2026-06-23 (Landing page `/` built from Figma — verified. Backend roadmap NEXT = Phase 5 Project Workspace, unchanged).

## ⭐ Landing page (marketing `/`) — ADDED 2026-06-23, verified
Built from user's Figma ("Premium SaaS Landing Page", file `nMFbzuPNcRcKgFVvMEFfaj`, node 5:2) via Figma MCP (source of truth) + skills impeccable/emil-design-eng/ui-ux-pro-max. 11 sections in `frontend/src/components/landing/` (motion.tsx, primitives.tsx, header.tsx, footer.tsx, sections/{hero,problem,how-it-works,feature-grid,project-showcase,portfolio,impact,testimonials,faq,cta}.tsx); composed in `app/page.tsx` (replaced the old `/`→login redirect). Stack: `motion` ^12.40.0 (NEW frontend dep, frontend/ only), animation library; landing palette scoped as `ln-*` Tailwind tokens in globals.css `@theme` (in-app docs/08 design system untouched); Manrope (via --font-sans, Black weight). [font Inter→Manrope across whole app, 2026-06-24] Motion = hero floating-card cluster + glow + entrance, scroll reveal/stagger (SSR-safe mounted-gate so never ships blank), CountUp stats, FAQ accordion, hover lifts — all `prefers-reduced-motion` aware. Header auth-aware (Masuk/Gabung vs Buka Dashboard). Verified: tsc clean, `npm run build` 0 errors (`/` prerendered STATIC), every section browser-screenshotted faithful to Figma. Decisions D-LP-1..4.
**Polish pass (2026-06-23, D-LP-5):** applied web-design-guidelines + emil-design-eng + ui-ux-pro-max — focus-visible rings (scoped [data-landing]; `.ln-dark` class on project-showcase/footer for lime ring on dark), mobile hamburger menu (header.tsx), scroll-spy active nav, smooth-scroll + `scroll-margin-top` on section[id], skip-link, active:scale press feedback, transition-all→explicit, AA contrast bumps on dark text, tabular-nums CountUp, aria-hidden/aria-labels, FAQ aria-controls, Testimonials now a real touch carousel (was fake arrows/dots). Browser-verified (mobile menu, focus ring, scroll-spy, anchor offset). Follow-ups (low-pri): full mobile/tablet QA of every section; placeholder stats/projects/testimonials → real API data later; Figma photo assets are gradient placeholders (asset URLs expire) — download to /public if real photos wanted.

## Project
EduNomad — project-collaboration platform (Beginners ↔ Seniors ↔ UMKM via real projects). Modular monolith. Backend: Express 5 + TS 6 + Prisma 7 + Supabase (Postgres). Frontend: Next.js 15.5.19 + React 19 + Tailwind v4 + shadcn/ui (base-ui) + Zustand + RHF + Zod. Supabase ref `sfzzkwckrfwzgcujykff` (ap-south-1).

## Status: PHASE 0–3 ✅. PHASE 4 ✅ FULLY COMPLETE & verified — recruitment (4.1 senior apps + 4.2 beginner apps backend + 4.4 frontend) AND 4.3 (Project Members & Lifecycle). NEXT = PHASE 5 (Project Workspace — discussions/DM/notifications/realtime, task-breakdown §5).

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
Lanjutkan EduNomad ke PHASE 5 — Project Workspace (Workflow 6/7: discussions group, direct messages
beginner↔senior, notifications, Supabase Realtime).
Phase 0–3 + Phase 4 (recruitment 4.1/4.2/4.4 + members & lifecycle 4.3) SUDAH selesai & terverifikasi
(backend E2E + browser) — jangan bangun ulang. Baca dulu CLAUDE.MD + MEMORY-CLAUDE.md + semua memory/*.md.

Backend tooling beres: `npm run dev` jalan type-check penuh, `npm run build` 0 error. Kalau node_modules
rebuilt & deps tampak tidak lengkap / pin terabaikan: `npm cache clean --force && rm -rf node_modules
package-lock.json && npm install`.

Baca task-breakdown.md §5 + API Discussions/Messages Endpoints + WF Workflow 6 (Active Project) & 7
(Discussion) + schema Discussion/DiscussionMember/DiscussionMessage + RBAC (discussions: project members
only; DM: members ↔ senior). Lalu bangun (layered + $transaction utk aksi multi-step, verifikasi tiap
milestone, update memory tiap selesai):
- Discussions: GET /projects/:id/discussions (members), POST /projects/:id/discussions (group), GET
  /discussions/:id/messages, POST /discussions/:id/messages, plus DM (type DIRECT, project_id null).
- Realtime: Supabase Realtime utk group chat + DM + notifications (CLAUDE.md: Socket.io dilarang).
  Notifications module juga (sebelumnya deferred ke "Phase 9" tapi triggers menyusul — konfirmasi scope
  dengan task-breakdown §5 vs §9 sebelum bangun).
- Frontend: workspace page (chat group + DM) di /projects/[id]/workspace atau sesuai UI spec; reuse
  AppShell/AuthGuard/apiClient + pola service object (projectApi/applicationApi).

Reuse: pola repository/service/controller + $transaction, projectMember.repository (countActive*,
listByProject, findById), AuthGuard/AppShell/ConfirmDialog. Server: backend & frontend `npm run dev`.
⚠️ Test project Phase-4 sudah COMPLETED — buat project RECRUITING/ACTIVE + members baru untuk testing
(p4-* + p43-* users masih ada di DB, pw TestPass123!). Cek dulu task-breakdown §5 utk urutan subtask exact.
```
