============================================================
⚡ ACTIVE HANDOFF (2026-06-24 #2) — PHASE 5 WORKSPACE, branch `feature/phase-5-workspace` (cabang dari main, BELUM push)
============================================================
redesign/app-ui SUDAH di-merge ke `main` (--no-ff, commit 84127ce, pushed) — UI Figma alignment kelar. Lalu cabang `feature/phase-5-workspace` dari main untuk Phase 5.

✅ DONE & VERIFIED — Phase 5.1 backend (Project Workspace chat, Workflow 6/7), commit 1 sudah ada di branch (REST), + RLS/Realtime DB-side:
- 5.1.1/5.1.2 services: discussion.service (group) + directMessage.service (DM). 5.1.3 controllers+routes. 5.1.4 RLS+Realtime.
- Endpoints LIVE (semua auth): GET/POST /projects/:id/discussions; GET/POST /discussions/:id/messages; POST /users/:id/direct-chat; GET/POST /direct-chat/:id/messages.
- Files baru: constants/discussionType.ts, validators/discussion.validator.ts, repositories/discussion.repository.ts, services/discussion.service.ts, services/directMessage.service.ts, modules/discussion/discussion.controller.ts, modules/directMessage/directMessage.controller.ts, routes/discussion.routes.ts, routes/directChat.routes.ts; wired ke routes/index.ts + project.routes.ts (+/:id/discussions) + user.routes.ts (+/:id/direct-chat). RLS SQL di backend/db/phase5_discussions_rls_realtime.sql.
- Aturan: group create = senior lead / UMKM owner saja (beginner "join"), senior auto-include; akses discussion = baris discussion_members; DM = hanya antar user yg share project context (D-P5-3); title TIDAK dipersist (D-P5-1, schema menang).
- RLS (D-P5-2, RLS PERTAMA di project): writes lewat Express (Prisma bypass RLS), client baca live read-only via Realtime, policy SELECT-only via SECURITY DEFINER is_discussion_member(). auth.uid()==users.id.
- VERIFIED: backend build 0 err; E2E /tmp/p5-e2e.sh = **14/14 PASS** (group+DM, semua gate 403/422, pagination) — tetap 14/14 SETELAH RLS aktif (bukti Prisma bypass). RLS client path: member lihat 4 baris, outsider 0, anon []. Test fixtures: project ACTIVE `a1a1a1a1-0000-4000-8000-000000000005` (umkm=p4-umkm, senior=p4-senior, members=p4-beginner+p43-b2; p43-b3=outsider).

BELUM — Phase 5.2 Frontend (sesi berikut): workspace page `/projects/[id]/workspace` (tabs Overview|Milestones|Discussion|Members; +DM page). 5.2.4 Discussion tab = chat group + Supabase Realtime subscribe (read live, kirim via Express). 5.2.6 DM page. Reuse AppShell/AuthGuard/apiClient + service object. Pakai @supabase/supabase-js client subscribe channel `discussion_messages` filter discussion_id. Note: backend dev server jalan di :3001 (background), frontend :3000.
⚠️ Commit REST sudah ada tapi branch BELUM di-push — push `feature/phase-5-workspace` + memory commit.

--- handoff lama (UI redesign, SUDAH SELESAI & merged) di bawah utk arsip ---

Goal: samakan SELURUH frontend ke desain Figma (file nMFbzuPNcRcKgFVvMEFfaj; node auth 11-3478=card, 11-3463=page).
`main` = landing-v1 + Lenis smooth scroll (commit bd84b7b). Branch `redesign/app-ui` dibuat dari main.

DONE on `redesign/app-ui` (commits d674053, f80af84, 834ecc2, e7cc1d3, ac218a3 — semua pushed):
- Font Inter → **Manrope** semua page (layout.tsx, var --font-sans).
- App tokens (globals.css :root) = palet Figma EKSAK: --primary #d8f277 (chartreuse) + --primary-foreground #0b0b0b (teks gelap); --foreground #0b0b0b; --secondary #fafaf8 (fill input); --border/--input #e7e3d8; --muted-foreground #6b6b6b; --ring #a3ce00; --radius 0.75rem. Legacy --neutral-* di-remap (light #f1eee7, gray #6b6b6b, gray-light #e7e3d8, dark #0b0b0b).
- Button (ui/button.tsx): sudah rounded-full; hover/active diperbaiki dari hijau lama → chartreuse #cdec5a/#c2e84a.
- Input (ui/input.tsx): fill #fafaf8, border #e7e3d8 1.5px, rounded-[10px], h-11.
- AuthCard: bg-background (warm), card putih border #e7e3d8 + radius 20px + soft shadow berlapis, heading **32px** Manrope, wordmark EduNomad DIHAPUS → berlaku ke login/register/role/about/skills/portfolio.
- Auth pages: link `text-primary` (chartreuse pucat tak terbaca) → `text-[#5f8c00]` readable; skills chip terpilih → border-[#a3ce00] bg-[#eef7d6] text-[#5f8c00].
- Landing CTA (sections/cta.tsx): 3 tombol role → 1 tombol "Gabung EduNomad" pill (→/auth/register).

BELUM — kerjakan di sesi baru (urut):
1. ✅ DONE (2026-06-24, commit fa3f065 pushed) — **WARNA LANDING ke palet Figma** node 5:4. Hex diambil EKSAK via Figma MCP get_design_context (bukan tebakan). Hasil di globals.css ln-*: ln-accent #96da55→**#d8f277** (chartreuse, = auth --primary); ln-ink #0f1115→**#201f31** (navy; dipakai teks + bg dark section); ln-muted #6b6860→#6b6b6b; ln-line → rgba(32,31,49,0.08). **KOREKSI tebakan lama**: accent-strong TETAP **#87c522** (Figma pakai itu untuk "UMKM." & label kecil — JANGAN ubah ke #a3ce00); accent-soft TETAP #e1fcdc; accent-ink TETAP #5da316. Glow hardcoded lama (rgba 150,218,85 / 142,240,90) di hero.tsx (ln62 dot, ln92 radial glow, ln217 green-card shadow) + how-it-works.tsx ln44 → diganti rgb(216,242,119). Semua text-ln-accent terverifikasi di atas card DARK (bg-ln-ink) → chartreuse pucat tetap terbaca; accent hanya jadi FILL di bg terang. tsc 0 error; :root token terverifikasi render nilai Figma eksak di browser.
1b. ✅ DONE (2026-06-24) — **docs/08-UI_Pages_Specification §Design System di-align ke Figma** (decision D-UI-1). Tujuan: future frontend baca spec → pakai desain Figma, bukan palet lama. Sekarang docs/08 = "SOURCE OF TRUTH = Figma", dua palet terdokumentasi (in-app :root + landing ln-*), font Inter→Manrope, radius/button/progress/color-usage di-update, palet lama #67C957 ditandai DEPRECATED (tinggal jadi --success + catatan). Nilai mirror globals.css EKSAK. Doc adalah referensi UI terkunci (CLAUDE.md), jadi ini bikin Figma jadi sumber kebenaran durable.
2. (opsional) Tambah tombol **Google + divider "atau"** di /auth/register (Figma 11-3478); login sudah punya tombol Google (disabled).
3. Cek visual page **non-auth** (dashboard/projects/admin/my-projects/applications) dgn token baru; perbaiki sisa warna lama (grep `neutral-`/`text-primary`/`#67C957` di src/app + src/components).
4. Kalau cocok → **merge `redesign/app-ui` → main**.
Catatan: tool screenshot Playwright sering hang di dev server → verifikasi via `browser_evaluate` (computed styles). Backend perlu nyala utk authed-redirect. Commit+push tiap selesai (Conventional Commits + `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`).
============================================================

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
