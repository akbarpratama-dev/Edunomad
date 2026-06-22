High Priority:

- **DIRECTIVE (user, 2026-06-23): the landing page `/` is the SINGLE ENTRY POINT for ALL users — login + registration. It must connect to auth and every other flow.** Status of landing→app wiring:
  - ✅ DONE: header Masuk→`/auth/login`, Gabung→`/auth/register`, authed→`/dashboard` ("Buka Dashboard"); hero/CTA→`/auth/register`; CTA role buttons→`/auth/register?role=BEGINNER|SENIOR|UMKM` which pre-selects the role in `registrationStore` (RegisterStep1 reads `?role` via window.location → setRole; verified persists to sessionStorage `edunomad-registration`). "Lihat semua proyek"→`/projects`. (D-LP-6)
  - ✅ RESOLVED (user decisions, 2026-06-23): (a) authenticated users hitting `/` now **auto-redirect to `/dashboard`** via `components/landing/authed-redirect.tsx` (client; logged-out still see the landing instantly, no loader gate) — verified both paths. (b) post-login → `/dashboard` confirmed (login page L45). (c) footer **trimmed to only working links** — removed all `#` placeholder columns (Perusahaan/Sumber Daya/Legal); kept "Platform" (Cara Kerja/Fitur/Portofolio/FAQ anchors + Papan Proyek→/projects) + new "Mulai" col (Daftar sebagai Mahasiswa/Mentor/UMKM via ?role=, Masuk). Confirmed only `/projects` & `/dashboard` routes exist; `/help` `/privacy` `/terms` `/artifacts` `/notifications` do NOT exist (also still referenced by in-app Sidebar — separate cleanup if wanted). (d) Portfolio "Lihat Contoh Sertifikat" button **removed** — cert example will live on the landing itself (the cert mock already there); revisit later.
  - ⏳ Still open (minor): hero CTA could also carry a role hint if desired (currently only the CTA-section role buttons do). In-app Sidebar still links to non-existent /help /privacy /terms /artifacts /notifications — pre-existing, unrelated to landing.


- ~~LANDING PAGE (marketing `/`) from Figma~~ — ✅ DONE & verified (2026-06-23). 11 sections, `motion` lib, scoped ln-* tokens. See development-log / decisions D-LP-1..4. Follow-ups (low priority): mobile/tablet responsive QA pass on the landing; consider downloading Figma photo assets to /public if real avatars/photos are wanted (currently gradient placeholders since Figma asset URLs expire in 7 days); replace placeholder stats/projects/testimonials with real API data when desired; landing currently uses `motion` only on `/` — fine.


- ~~Phase 0–2~~ — DONE & verified.
- ~~PHASE 3 (3.1 Project Module + 3.2 Admin Approval backend; 3.3 + 3.4 frontend)~~ — ✅ DONE & browser-verified.
- ~~PHASE 4 recruitment — 4.1 Senior Application backend, 4.2 Beginner Application backend, recruitment frontend (task 4.4)~~ — ✅ DONE & verified (backend E2E vs live DB + Playwright browser). See current-status.md / development-log.md / decisions.md (D-P4-*).
  - Endpoints live: POST /projects/:id/senior-apply, DELETE /senior-applications/:id, GET /projects/:id/senior-applications, GET /senior-applications, POST /senior-applications/:id/accept|reject; POST /projects/:id/apply, DELETE /applications/:id, GET /projects/:id/applications, GET /applications, POST /applications/:id/accept|reject.
  - Frontend: /projects/[id] apply dialogs (senior mentor / beginner role), /applications (beginner), /applications/mentor (senior), /projects/[id]/manage (UMKM senior-applicants), /projects/[id]/applicants (senior beginner-applicants); nav items for SENIOR/BEGINNER.

- ~~PHASE 4.3 — Project Members & Lifecycle (task-breakdown §4.3, Workflow 5/11/15/16/17)~~ — ✅ DONE & verified (backend E2E vs live DB + Playwright browser). See current-status.md / development-log.md / decisions.md (D-P4.3-1..6).
  - Endpoints live: GET /projects/:id/members; POST /members/:id/remove (SENIOR→REMOVAL_REQUESTED+audit); POST /members/:id/withdraw (member self→WITHDRAWN); POST /admin/members/:id/remove (ADMIN→REMOVED); POST /projects/:id/start (SENIOR→ACTIVE); POST /projects/:id/complete (SENIOR→AWAITING_COMPLETION); POST /projects/:id/confirm-completion (UMKM→COMPLETED+audit).
  - New statuses: MemberStatus.REMOVAL_REQUESTED, ProjectStatus.AWAITING_COMPLETION (VARCHAR, no migration).
  - Frontend: /projects/[id] lifecycle buttons (Mulai Proyek / Ajukan Penyelesaian / Konfirmasi Penyelesaian) + ProjectMembersPanel (team list, Keluarkan reason dialog, Keluar dari Proyek withdraw).
  - Carry-overs: (a) completion-readiness gates (deliverables/contributions/reviews/artifacts, Workflow 15) deferred to owning phases — add to projectLifecycle.service.requestCompletion when those land (D-P4.3-3). (b) Admin confirm-member-removal has no UI yet — API-only (D-P4.3-6); add when an admin project-management page exists.

- **PHASE 5 (NEXT) — Project Workspace (task-breakdown §5, Workflow 6/7):** discussions (group), direct messages (beginner↔senior), notifications, Supabase Realtime. Members & lifecycle backend from 4.3 is the foundation. Read task-breakdown §5 + API Discussions/Messages + WF 6/7 + schema Discussion/DiscussionMember/DiscussionMessage before starting. A fresh RECRUITING/ACTIVE project + members will be needed for testing (the Phase 4 test projects are now COMPLETED).

- (Manual, sandboxed) Update `backend/.env.example` DIRECT_URL/DATABASE_URL formats to match live `.env`.
- RLS still disabled on all domain tables — deferred; frontend talks only to Express backend (+ Supabase Auth), not Supabase tables directly. Revisit before any direct-table frontend access.
- Pre-existing: frontend build emits ESLint config error (`Cannot find module 'eslint-config-next/core-web-vitals'`) — flagged for whenever lint tooling is addressed.

Medium Priority:

- styled-jsx is now an explicit dep in frontend/package.json (D-P4-4 workaround for npm resolver flakiness). If dependency cleanup is ever done, it can be removed once the cache/resolver is confirmed healthy.
- `--radius-xl/2xl/3xl/4xl` in globals.css still old calc-based scale — fine until used.

Low Priority:

- Capture future decisions in decisions.md.
- Clean up test fixtures (p4-* users + "Phase4 Recruitment Test" project) when a clean DB is wanted.
