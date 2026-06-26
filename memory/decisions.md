# Decisions

Date:
2026-06-26 (Senior & UMKM dashboards + shared kit)

Decision (D-BEG-3):
Dashboard Senior & UMKM dibuat mengikuti bahasa desain Beginner (welcome + stat + bento), via shared `components/dashboard/dashboardKit.tsx` (primitives + placeholder cards + ProjectMiniRow + AgendaCard). BeginnerDashboard di-refactor pakai kit (DRY). ROLE_DASHBOARD map di dashboard/page.tsx (BEGINNER/SENIOR/UMKM); ADMIN tetap redirect /admin/dashboard. Data nyata: Senior pakai endpoint BARU `GET /me/mentored-projects` (projects where seniorId=caller) + mySeniorApplications; UMKM pakai /my-projects yang sudah ada. Stat tanpa backend (Review Tertunda, Lamaran Senior) + Aktivitas/Notifikasi = placeholder "Contoh".
Reason:
User: "lanjut dashboard Senior/UMKM" (mereka bilang sebelumnya "role lain mirip"). Kit menghindari triplikasi Panel/StatCard/Avatar. Senior butuh sumber proyek dari membership-style endpoint (sama alasannya seperti /me/projects beginner — assignment bisa via seed tanpa application), jadi /me/mentored-projects ditambah; UMKM sudah punya /my-projects.
Impact:
3 dashboard konsisten & premium dgn data nyata + placeholder jelas. Sidebar navy tetap (D-BEG-2). Edge: ganti-akun di tab yang sama memicu 403 sesaat ke endpoint role lama (appUser ke-cache sebelum /auth/me re-resolve) — harmless, hanya muncul saat switch akun, bukan utk user single-role (reload bersih = 0 err). Saat Phase 8/9, widget Sertifikat/Notifikasi/Aktivitas/Review-Tertunda bisa di-wire nyata.

Date:
2026-06-26 (Beginner /dashboard premium redesign)

Decision (D-BEG-2):
`/dashboard` BEGINNER diganti jadi homepage premium (ref: screenshot user di design-refs/dashboard-beginner.png + prompt Clay/Linear-style). User memilih cakupan "KONTEN DASHBOARD SAJA" → sidebar navy + topbar EXISTING (AppShell) TIDAK diubah; hanya area konten yang dibangun ulang. SENIOR/UMKM tetap dashboard generik lama (role-branch di page). Widget tanpa backend (Tugas, Aktivitas feed, Notifikasi[Phase 9]) = placeholder badge "Contoh"; sisanya REAL: Proyek Aktif (count membership ACTIVE), Proyek Saya list (dari /me/projects, += description + active members), Agenda Mendatang (derive deadline proyek), Artifact stat = 0 real (Phase 8). Banner verifikasi hanya tampil bila status≠VERIFIED.
Reason:
User minta tampilan persis screenshot (premium, project-based, bukan analytics). Pilih "konten saja" agar tidak mengubah sidebar global (DESIGN.md = navy, dipakai semua halaman) — menghindari regresi app-wide. docs/08 + roadmap Phase 10 (Beginner Dashboard) memang merencanakan dashboard ini, jadi in-scope. Placeholder dipilih user untuk fitur yang belum ada backend.
Impact:
Beginner punya dashboard homepage fungsional & premium dengan data nyata. Sidebar navy konsisten dgn halaman lain. "Role lain (Senior/UMKM) mirip" = follow-up belum dikerjakan (user bilang nanti). Saat Phase 8/9 jadi, widget Artifact/Notifikasi/Aktivitas bisa di-wire nyata. /me/projects include diperkaya (description + active members) — reusable.

Date:
2026-06-26 (Beginner "Proyek Saya" bento + /me/projects + Button fix)

Decision (D-BEG-1):
Halaman `/my-projects` dibuat ROLE-AWARE: BEGINNER → bento dashboard proyek-aktif (Figma node 262:2, tampilan Mahasiswa), UMKM → daftar proyek lama (tak diubah). Dibuat komponen `BeginnerProjectBoard` + nav "Proyek Saya" utk BEGINNER. Karena beginner member di-seed langsung sebagai project_member TANPA baris application (terverifikasi di DB: p4-beginner punya 0 application, tapi membership ACTIVE), sumber data proyek-aktif = MEMBERSHIP, bukan application → ditambah endpoint backend baru `GET /me/projects` (layered: projectMember.repo.listByUserWithProject → service.listMyProjects → controller.myProjects → route authMiddleware) yang mengembalikan membership caller + project info. Widget Figma yg belum ada backend-nya (sistem Tugas/Task, Activity feed, ukuran file, % milestone) DITAMPILKAN sebagai placeholder berbadge "Contoh" (pilihan user); sisanya pakai data nyata (detail/members/deliverables/contributions/reviews).
Reason:
User minta tampilan bento sesuai Figma; dikonfirmasi memang scope (docs/08 "My Projects - Beginner" + roadmap Phase 10 Beginner Dashboard). User memilih "tampilkan semua widget + placeholder". Application-based lookup gagal utk member seeded → butuh endpoint membership. CLAUDE.md membolehkan memperbaiki implementasi UI selama workflow/role/rules tak berubah; tidak ada entity Task di skema jadi Tugas tetap placeholder (bukan mengarang fitur backend).
Impact:
Beginner punya dashboard proyek aktif fungsional dgn data nyata + placeholder jelas. Endpoint /me/projects reusable utk Phase 10 (Beginner Dashboard). Browser-verified p4-beginner. Catatan: jika Phase 10 nanti bikin /dashboard beginner, bisa reuse myMemberships(). Tugas/Aktivitas/file-size baru jadi nyata kalau fitur Task/activity/upload dibangun (di luar MVP saat ini).

Decision (D-UI-9, Button nativeButton):
`ui/button.tsx` kini set `nativeButton={false}` otomatis saat prop `render` dipakai (Button dirender jadi <a>/Link). Menghilangkan console error base-ui yang dulu (memory lama) ditandai "harmless, ignore". Override eksplisit tetap dihormati.
Reason:
Error berulang & user melaporkannya; fix di komponen pusat membereskan semua call-site sekaligus, lebih benar secara a11y daripada di-ignore.
Impact:
Console bersih di /my-projects (Errors:0) dan semua halaman yang pakai Button render Link.

Date:
2026-06-25 (Nav — UMKM tanpa Telusuri Proyek)

Decision (D-NAV-1, user directive):
"Telusuri Proyek" (/projects browse) DIHAPUS dari sidebar UMKM. Dipindah dari COMMON_ITEMS (dulu tampil untuk semua role) menjadi item `BROWSE_PROJECTS` yang hanya di-append ke ROLE_ITEMS untuk BEGINNER, SENIOR, dan ADMIN. UMKM sekarang hanya: Dashboard, Buat Proyek, Proyek Saya (+ Sertifikat/Notifications trailing). Route /projects tetap ada (tidak dihapus) — cuma tidak ada entri nav untuk UMKM.
Reason:
User: UMKM itu yang membuat & mengelola proyek sendiri, bukan mencari proyek untuk dilamar (itu peran Beginner/Senior). docs/08 pun hanya mendokumentasikan halaman "Browse Projects" untuk Beginner (line 779) dan "Browse Mentoring Projects" untuk Senior (line 895) — tidak ada versi UMKM. Jadi menghapusnya untuk UMKM justru lebih sesuai dokumentasi; sidebar generic di docs/08 §Navigation Patterns hanya template ilustratif. RBAC tak berubah (UMKM memang tak bisa melamar).
Impact:
Sidebar UMKM bersih dari aksi yang tak relevan. Browser-verified (p4-umkm): nav = Dashboard, Buat Proyek, Proyek Saya, Sertifikat, Notifications. Beginner/Senior/Admin tetap punya Telusuri Proyek. tsc 0 error. Admin sengaja dipertahankan punya Telusuri (perilaku tak diubah; user hanya menyebut UMKM).

Date:
2026-06-25 (Phase 7.2 Reviews frontend)

Decision (D-P7-2):
Phase 7.2 review UI lives in TWO places, both reusing the existing Phase-7.1 endpoints (no new backend): (a) a role-adaptive "Review" tab inside the project workspace (`ReviewTab`) = the Review Center (7.2.1) for senior/UMKM (submit+edit per team member; UMKM also gets a senior target) AND the in-context received view for the reviewee; (b) a standalone `/reviews` page (`MyReviewsPage`, BEGINNER-only) = My Reviews (7.2.2), GET /users/me/reviews across all projects. The beginner's received list in the workspace tab is derived by filtering the project's GET /projects/:id/reviews for revieweeId==me (rather than a separate call). Submit is gated to project status ACTIVE on the client to mirror the backend rule.
Reason:
docs/08 places "Team Reviews" as a Senior Project-Workspace tab and "Reviews/Ratings" on the profile, and Phase 6 already established the workspace-tab pattern (Deliverables/Kontribusi) — so a Review tab is the consistent home for the Review Center; the standalone /reviews page satisfies task 7.2.2's "My Reviews Page (Beginner)" cross-project view with a sidebar entry. Filtering the already-fetched project reviews avoids a redundant per-user request inside the tab.
Impact:
Senior reviews beginners; UMKM reviews beginners + senior; beginner sees received reviews both in-project (tab) and globally (/reviews). Browser-verified all three roles. Carry-over D-P4.3-3 (completion-readiness gate incl. reviews in projectLifecycle.service.requestCompletion) STILL deferred — left for Phase 8 so the gate can include artifacts in one pass rather than a partial gate now (artifacts don't exist yet).

Date:
2026-06-23 (Landing → auth wiring)

Decision (D-LP-6):
Landing `/` is the single entry point for all users (login + registration) — user directive. Wired the role CTAs to deep-link the registration role: `/auth/register?role=BEGINNER|SENIOR|UMKM`. RegisterStep1 reads the param client-side (window.location, no Suspense needed) and calls `registrationStore.setRole`, so step 2 (role) arrives pre-selected. Other CTAs already pointed at `/auth/login` `/auth/register` `/dashboard` `/projects`.
Reason:
The CTA section already had three role buttons all going to a generic register; deep-linking the role removes a redundant step and matches the "connect landing to all flows" directive. Param is validated against VALID_ROLES before use.
Impact:
Role-specific entry works end-to-end (verified: sessionStorage `edunomad-registration` role set). Open items (authed-user redirect policy, post-login destination, footer placeholder links) tracked in next-tasks for follow-up.

Decision (D-LP-7, user decisions 2026-06-23):
(a) Authenticated users hitting `/` auto-redirect to `/dashboard` (new `components/landing/authed-redirect.tsx`, client useEffect on authStore; logged-out paint the landing instantly with no loader gate). (b) Footer trimmed to only links with real destinations — removed Perusahaan/Sumber Daya/Legal placeholder columns + "Verifikasi Sertifikat"; kept Platform (landing anchors + /projects) and added a "Mulai" column (role-specific /auth/register?role=… + /auth/login). (c) Removed the Portfolio "Lihat Contoh Sertifikat" button — the certificate example will live on the landing itself later.
Reason:
User directives. Only `/projects` and `/dashboard` exist as real routes (verified); `/help` `/privacy` `/terms` `/artifacts` `/notifications` don't, so linking them is dead UX.
Impact:
Landing front-door behavior finalized. Verified in browser: logged-in `/`→`/dashboard` (needs backend up so /auth/me resolves the profile; with backend DOWN an authed user instead bounces to /auth/register/role because the app can't confirm the profile — environment artifact, not a bug); logged-out stays on `/` with Masuk/Gabung. Note: in-app Sidebar still references the missing /help /privacy /terms /artifacts /notifications (pre-existing, separate from landing).

Date:
2026-06-23 (Landing Page — polish pass)

Decision (D-LP-5):
Polished the landing using web-design-guidelines (Vercel Web Interface Guidelines) + emil-design-eng + ui-ux-pro-max. Applied: (a) global focus-visible rings scoped to [data-landing] (ink ring on light/lime surfaces, lime ring via `.ln-dark` on dark sections project-showcase/footer); (b) touch-action:manipulation + tap-highlight removal; (c) smooth anchor scroll gated by prefers-reduced-motion + `scroll-margin-top:5rem` on section[id] so the sticky header never covers anchors; (d) skip-link + `<main id>`; (e) mobile hamburger menu (AnimatePresence panel, Esc-to-close, body-scroll-lock) — previously nav vanished < md; (f) header scroll-spy active state via IntersectionObserver + aria-current; (g) replaced `transition: all` with explicit property lists; (h) `active:scale-[0.97]` press feedback on all buttons/CTAs (emil); (i) contrast bumps on dark-section text (white/40–55 → /60–70) for AA; darkened --color-ln-faint; (j) tabular-nums on CountUp; (k) aria-hidden on decorative icons, aria-labels on icon-only/social, FAQ aria-controls/role=region; (l) Testimonials converted from fake (non-functional) arrows+dots to a real touch carousel (snap-scroll on mobile, grid on desktop) with working prev/next buttons.
Reason:
User asked to polish with the named skills and apply UX guidelines. The non-functional carousel controls and missing focus/mobile-nav were the clearest guideline violations; the rest are craft/contrast/a11y refinements.
Impact:
Landing is keyboard-accessible, mobile-navigable, AA-contrast on dark sections, and tactile. tsc clean + `npm run build` 0 errors (`/` still static). Browser-verified: focus rings, mobile menu, scroll-spy, smooth-scroll+offset.

Date:
2026-06-23 (Landing Page)

Decision (D-LP-1):
Built the public landing page at `/` from the user's Figma (source of truth), removing the old `/`→login/dashboard redirect. Authenticated users see the same landing with a "Buka Dashboard" CTA in the header.
Reason:
User confirmed both choices. A public marketing landing at the root is the standard pattern; Figma MCP confirmed a complete 11-section design. CLAUDE.md: Figma is the source of truth for visual implementation.
Impact:
`/` is now a static marketing page (no auth gating); login is reached via header CTA. Old redirect behavior gone.

Decision (D-LP-2):
Added `motion` (^12.40.0) as a frontend dependency for landing animations.
Reason:
User explicitly wanted polished animation/transitions (emil-design-eng craft). `motion` (framer-motion successor) is the standard React tool for scroll-reveal/stagger/spring + AnimatePresence; user approved. Installed in frontend/ only (not the repo root — first npm run accidentally hit root; corrected).
Impact:
New dep in frontend. Only the landing uses it so far. All landing motion respects prefers-reduced-motion.

Decision (D-LP-3):
Landing palette is scoped as separate `ln-*` Tailwind tokens (globals.css @theme), NOT applied to the in-app design system.
Reason:
The Figma landing uses a distinct premium brand (warm #faf8f3 bg, near-black ink, lime #96da55 accent) different from docs/08's in-app green system (#67C957 / #F5F5F5 / #333). Overwriting the app tokens would break every existing app page. Scoped ln-* utilities keep both intact.
Impact:
Landing components use bg-ln-bg/text-ln-ink/text-ln-accent etc.; app pages unchanged.

Decision (D-LP-4):
Scroll-reveal primitives (Reveal/Stagger/StaggerItem) use a client mounted-gate: they render plain, fully-visible content on SSR / first paint / no-JS / reduced-motion, and only apply the motion (initial-hidden → whileInView) after mount.
Reason:
impeccable rule — "reveal animations must enhance an already-visible default; don't gate content visibility on a class/transition (ships blank on headless renderers / hidden tabs / no-JS)." Below-the-fold sections sit beyond the first viewport, so the mount-time switch causes no visible flash.
Impact:
Content is always present for SEO/no-JS; reveals enhance for JS users. CountUp similarly falls back to the final value.

Date:
2026-06-22 (Phase 4.3 — Members & Lifecycle)

Decision (D-P4.3-1):
Added ProjectStatus.AWAITING_COMPLETION (between ACTIVE and COMPLETED) + added it to PUBLIC_PROJECT_STATUSES.
Reason:
Workflow 11 & 15 define a two-step completion: SENIOR requests completion → status AWAITING_COMPLETION → UMKM confirms → COMPLETED. The status was missing from the constant (prior session dropped only PUBLISHED/OVERDUE). projects.status is VARCHAR(30) with no DB enum, so no migration was needed. It's still an ongoing project so it stays publicly visible.
Impact:
Three-state completion flow; project remains listed while awaiting UMKM confirmation.

Decision (D-P4.3-2):
Added MemberStatus.REMOVAL_REQUESTED (intermediate, before REMOVED).
Reason:
Workflow 17 is a two-step removal: SENIOR lead requests → ADMIN confirms. The member needs an intermediate state so the UI/admin can see a pending request. project_members.status is VARCHAR(20), no DB enum → no migration.
Impact:
Member shows "Diajukan Keluar" while awaiting admin confirmation; only REMOVAL_REQUESTED members can be confirmed-removed by admin.

Decision (D-P4.3-3):
Project completion-readiness gates (all deliverables/contributions approved, all reviews done, artifacts generated — Workflow 15) are NOT enforced now. Only the state transition + ownership/role/status checks + audit are built.
Reason:
Those entities belong to later phases (deliverables Phase 6, contributions/reviews/artifacts Phase 7-8) and have no data flow yet; gating on them now would either always pass (zero rows) or be dead code. next-tasks.md explicitly notes these gates are layered on by their owning phases.
Impact:
SENIOR can request completion on any ACTIVE project they lead today; the readiness checklist must be added when those phases land (TODO in projectLifecycle.service.requestCompletion).

Decision (D-P4.3-4):
POST /projects/:id/start requires ≥1 ACTIVE member; the senior's explicit start click counts as the "senior approval" for a partially-filled team.
Reason:
Workflow 5 prerequisites = senior assigned + role slots filled "(or senior approval)". Requiring every slot filled is too rigid (UMKM may accept starting understaffed); requiring zero members lets an empty project go ACTIVE. ≥1 member + the senior being the actor is the pragmatic middle that honours "(or senior approval)".
Impact:
A project with a senior and at least one accepted beginner can be started; full-capacity is encouraged, not enforced.

Decision (D-P4.3-5):
MEMBER_REMOVED audit log is written at BOTH stages: request (stage=REQUESTED, userId=senior, metadata.reason + memberUserId) and admin confirm (stage=CONFIRMED, userId=admin, metadata.memberUserId).
Reason:
Member removal is in the documented audit scope (MEMBER_REMOVED is a defined AuditAction). Recording the request (with the senior's reason for admin review) and the final confirmation gives a complete, traceable trail. The `stage` field disambiguates the two entries. project_members has no removal_reason column, so the reason lives in the audit metadata.
Impact:
Two MEMBER_REMOVED rows per completed removal; admin review has the reason; no schema change needed.

Decision (D-P4.3-6):
No dedicated admin UI for confirming member removals this session (backend POST /admin/members/:id/remove + projectApi.confirmMemberRemoval are ready).
Reason:
There is no admin project-members page in the app yet, and the prompt scoped Phase 4.3 frontend to "minimal members + start/complete actions on the project pages" (workspace is Phase 5). Building an admin members console is out of scope.
Impact:
Removal requests are visible to the lead senior ("Diajukan Keluar"); admin confirmation is API-only for now. Add an admin UI surface when an admin project-management page exists.

Date:
2026-06-21 (Phase 4 recruitment)

Decision (D-P4-1):
Senior 5-project limit counts projects with status in {RECRUITING, ACTIVE} (assigned as senior), not ACTIVE-only.
Reason:
PRD BR-002 explicitly says "Senior maksimal menangani 5 proyek (Recruiting + Active) bersamaan." The RBAC doc's enforcement code sample counts status='ACTIVE' only, but that is illustrative pseudocode; BR-002 is the dedicated, explicit business-rule statement and produces the safer enforcement (a senior assigned to many RECRUITING projects shouldn't bypass the cap). Implemented as `project.repository.countAssignedActiveBySenior`, checked at both apply and accept.
Impact:
Senior cannot apply/be accepted once they hold 5 RECRUITING+ACTIVE projects. Documented RBAC-vs-PRD reconciliation.

Decision (D-P4-2):
Added GET /senior-applications and GET /applications (the authenticated user's own application list).
Reason:
The API spec lists per-project and per-application endpoints but no "my applications" endpoint, yet the documented UI pages (UI spec /applications "My Applications - Beginner" and /applications/mentor "Mentor Applications - Senior") require listing the user's own applications across projects. Additive, role-gated (BEGINNER / SENIOR), no conflict with documented routes.
Impact:
Two extra read endpoints; frontend my-applications pages work.

Decision (D-P4-3):
Notifications NOT created in Phase 4 (deferred to Phase 9).
Reason:
task-breakdown 4.2.1 mentions "Kirim notification" on beginner accept, but Phase 9 (Notifications & Real-time) explicitly owns the notification module and 9.1.3 "Integrate Notification Triggers" hooks creation into existing services. Building it now would be premature/out of MVP slice. Left as a Phase 9 integration point.
Impact:
Accept/reject flows do not write notifications yet; to be added in Phase 9 without changing recruitment logic.

Decision (D-P4-4):
Resolved a broken frontend dev boot; left styled-jsx as an explicit frontend dependency.
Reason:
`next dev` failed with "Cannot find module 'styled-jsx/package.json'", then '@swc/helpers', then '@next/env' — npm had silently omitted several of next's transitive deps (0 lockfile entries for them). Targeted installs were whack-a-mole; root cause was a corrupt npm cache. Fixed with `npm cache clean --force` + `rm -rf node_modules package-lock.json && npm install` (the documented recovery, plus the cache clean). The backend @types/express-serve-static-core 5.0.7 override survived and was re-verified. styled-jsx ^5.1.6 (⊇ next's required 5.1.6) was left in frontend/package.json as a defensive pin.
Impact:
Both servers boot; backend build still 0 errors. Recovery step updated in MEMORY-CLAUDE.md to include the cache clean.

Decision (D-P4-5):
Phase 4.3 (Project Members & Lifecycle: start/complete project, member list/remove/withdraw) NOT built this session.
Reason:
User scoped this session to recruitment applications (4.1, 4.2) + recruitment frontend. Lifecycle/members is a separate, sizable task-breakdown section (§4.3) and is the explicit next step.
Impact:
project_members rows are created (on beginner accept) but there is no members-management or start/complete API yet — next session.

Date:
2026-06-19

Decision:
Use a standard five-file memory structure for project continuity.

Reason:
The workspace only had a project journal, but the operating instructions expect separate status, log, next tasks, issues, and decisions files.

Impact:
Improves continuity and makes future implementation work easier to resume.

Status:
Approved

Date:
2026-06-19

Decision:
Treat the UI pages specification as a reference baseline, not a final visual lock.

Reason:
The design should stay aligned with the source requirements while still allowing refinement using the installed UI design skills.

Impact:
Implementation can improve polish and hierarchy without changing workflows, roles, or business rules.

Status:
Approved

Date:
2026-06-19

Decision:
Treat 08-UI_Pages_Specification_v1.0.md as the UI source of truth.

Reason:
The workspace now contains a formal UI pages specification that should be referenced alongside the other locked documents.

Impact:
Frontend implementation can now follow a concrete page-level spec instead of a placeholder reference.

Status:
Approved

Date:
2026-06-19

Decision:
Normalize document references in CLAUDE.MD to actual workspace filenames.

Reason:
The original references used placeholder or mismatched names that could cause confusion during implementation.

Impact:
Reduces ambiguity and makes the instruction file align with the repo's real document set.

Status:
Approved

Date:
2026-06-19

Decision:
Use npm workspaces (not pnpm/turborepo) for the monorepo, and install latest available major versions of express/typescript/@types/node at setup time (resolved: express ^5, typescript ^6, @types/node ^26) since task-breakdown.md does not pin exact versions.

Reason:
npm workspaces is the simplest tool that satisfies the "npm install from root runs without error" AC without adding extra tooling (ARCH forbids unapproved complexity). No version pins existed in docs, so latest stable was used.

Impact:
Express 5 changes routing internals (path-to-regexp v8) vs Express 4 — watch for this when implementing route patterns in later tasks. Revisit if any documented API/route pattern conflicts with Express 5 behavior.

Status:
Approved

Date:
2026-06-19

Decision:
Pin frontend to Next.js 15 (resolved 15.5.19) + React 19, overriding create-next-app@latest's default of Next.js 16.2.9.

Reason:
task-breakdown.md and CLAUDE.MD LOCKED tech stack explicitly says "Next.js 15, React 19" — Next 16 is an unapproved version bump with breaking changes (the generated frontend/AGENTS.md even warned "This is NOT the Next.js you know"). Docs win over tooling defaults.

Impact:
Removed stale Next-16-targeted frontend/AGENTS.md + frontend/CLAUDE.md after downgrade since their guidance no longer applies. Future `npx create-next-app` or `npx shadcn` runs in this repo should be checked against this pin before accepting defaults.

Status:
Approved

Date:
2026-06-19

Decision:
User granted a standing "version flexibility" exception for the LOCKED tech stack: if a locked library/framework version doesn't run or conflicts with tooling, Claude may upgrade/downgrade the version to whatever makes the program work — condition: must ask the user for approval BEFORE changing the version (every time, not a one-time blanket approval to change freely without asking). After approval, all docs stating the old version must be updated to match.

Reason:
The Next.js 15→16 default-install conflict (see prior decision) showed locked docs can fall out of sync with what's actually installable. User wants the door open to fix that without re-litigating "docs win over tooling defaults" each time, but still wants visibility/control over each version swap.

Impact:
Added a "Version flexibility (tech stack only)" clause to CLAUDE.MD (after ARCHITECTURE section), task-breakdown.md (under Tech Stack table), and docs/01-EduNomad_PRDl.md (under Technology Stack (LOCKED) heading). Clause explicitly scoped to library/framework version numbers only — architecture style, business rules, RBAC, workflows, database schema, API contracts, and out-of-scope features are NOT covered and remain strictly locked with no improvisation.

Status:
Approved

Date:
2026-06-19

Decision:
Move `schema.prisma` from default `backend/prisma/` to `backend/src/prisma/`, and put the datasource connection URL in `prisma.config.ts` (`datasource.url`) instead of inside `schema.prisma`'s datasource block. Use the true direct Supabase host (`db.<ref>.supabase.co:5432`, plain `postgres` user) for `DIRECT_URL`, not the Supavisor pooler hostname.

Reason:
ARCH (05-Architecture Rules.md) requires `prisma/` to live under `backend/src/`, but `npx prisma init` defaults to `backend/prisma/`. Separately, Prisma 7 (installed version) rejects `url`/`directUrl` inside schema.prisma's datasource block (error P1012) — confirmed via Context7 that Prisma 7 moved this to prisma.config.ts. The pooler hostname caused `tenant/user not found` for DIRECT_URL because pooler expects a pooler-style username (`postgres.<ref>`), not plain `postgres`; true direct connections need the non-pooler host.

Impact:
Any future `npx prisma init` re-run in this repo must be followed by moving the schema + reconfiguring prisma.config.ts paths and generator output. DATABASE_URL stays on the pooler (port 6543, for runtime); DIRECT_URL stays on the true direct host (port 5432, for CLI/migrate). This fix is applied but UNVERIFIED as of this entry — next session must confirm via `npx prisma db pull`.

Status:
Approved (verified: `npx prisma db pull` connects successfully — P4001 "database empty" confirms connection works, no tables yet)

Date:
2026-06-20

Decision:
Use `String @db.VarChar(n)` for all enum-like columns (e.g. `users.role`, `users.status`) instead of Prisma's native `enum` type, across the entire schema — not just Users Domain.

Reason:
`docs/03-Database Schema.md` types every enum-like field as VARCHAR(n) consistently across all 13 domains (skills, projects, applications, deliverables, etc.) — never as a native ENUM. This is a deliberate doc-wide convention (likely to avoid Postgres `ALTER TYPE` migration pain when allowed values change), not a one-off. Prisma's `enum` keyword always creates a native Postgres enum type under the `postgresql` provider, which would conflict with this convention. Honored docs over the "obvious" Prisma-idiomatic choice per CLAUDE.MD's "documentation wins" rule.

Impact:
Allowed values (e.g. BEGINNER/SENIOR/UMKM/ADMIN) are documented as comments in schema.prisma but NOT enforced at the DB level — must be validated at the Zod layer (task 0.3.4) and/or service layer for every field that lists allowed values in docs/03-Database Schema.md. Apply this same pattern to all later domains (0.2.4 onward).

Status:
Approved

Date:
2026-06-20

Decision:
`users.id` has no `@default(uuid())` in Prisma schema — it must be assigned by the application at registration time from the corresponding `auth.users.id` (Supabase Auth).

Reason:
docs/03-Database Schema.md + docs/02-erd-production-grade.md explicitly state `users.id = auth.users.id` with "no separate auth_user_id column." Supabase Auth, not Prisma, owns the id generation for this row.

Impact:
The user-registration service (future task) must read the authenticated Supabase user's id (from the verified JWT / `auth.users`) and pass it explicitly as `id` when creating the `users` row — never let Prisma auto-generate it for this model.

Status:
Approved

Date:
2026-06-20

Decision:
Leave Row Level Security (RLS) disabled on `public.users` / `public.user_profiles` for now; defer enabling it until the auth/RBAC implementation phase.

Reason:
Supabase MCP flagged RLS-disabled as a critical advisory after the first migration (tables are fully exposed to `anon`/`authenticated` roles, and `frontend/.env.local` already holds an anon/publishable key). User was asked and chose to wait, since correct RLS policies can't be written before Supabase Auth + RBAC middleware exist — enabling RLS with no policies now would just block all access.

Impact:
This is an open security gap until the auth phase. Must not be forgotten — revisit before production and before writing any frontend code that calls Supabase directly (current ARCH mandates frontend never bypasses the Express backend, which limits but doesn't eliminate the exposure as long as the anon key is reachable from client bundles).

Status:
Approved (deferred, not resolved)

Date:
2026-06-19

Decision:
Mandate Context7 MCP (resolve-library-id → query-docs) before writing or executing any code touching a library/framework/SDK/API/CLI/cloud service, and check installed skills for a match before manual implementation generally (not just UI).

Reason:
The Next.js 15→16 default-install mismatch was exactly the kind of "training data is stale" problem Context7 exists to prevent. User wants this enforced as standing project policy, not an ad-hoc choice per task.

Impact:
Added "Context7 MCP" section to CLAUDE.MD (under MCP USAGE RULES, before Figma MCP) + added Context7 MCP to the Available MCPs list. Added a general skill-check reminder above SKILL PRIORITY SYSTEM. Also created memory/rangkuman.md (prompt + result history, append-only) and added it to the Session Documentation update list and Starting New Session read list in CLAUDE.MD.

Status:
Approved

Date:
2026-06-20

Decision:
Apply the existing VARCHAR-for-enum-like-fields convention (no Prisma `enum`) to the Skills Domain (`skills.status`, `user_skills.level`) — same pattern as Users Domain, no new precedent needed.

Reason:
This is a direct continuation of the 2026-06-20 "Use String @db.VarChar(n) for all enum-like columns" decision earlier in this file, which already covers all 13 domains in docs/03-Database Schema.md, not just Users. No new judgment call was required for 0.2.4.

Impact:
Confirms the pattern holds project-wide. Allowed values (PENDING/APPROVED/REJECTED for status, BEGINNER/INTERMEDIATE/ADVANCED for level) are documented as schema comments only — validation still deferred to the Zod layer (0.3.4).

Status:
Approved

Date:
2026-06-20

Decision:
Implement CHECK constraints (`project_roles.capacity > 0`, `reviews.rating BETWEEN 1 AND 5`) via manual raw-SQL edits to the generated migration.sql (using `prisma migrate dev --create-only` then editing before applying), rather than skipping them or trying to express them in schema.prisma.

Reason:
Confirmed via Context7 that Prisma (including the installed 7.x) has no native `@@check` schema attribute — its DMMF only supports id/normal/unique/fulltext index types. The documented constraints are still real business requirements (docs/03-Database Schema.md explicitly lists both), so they can't be silently dropped.

Impact:
Both constraints verified live in the DB via a direct `pg_constraint` SQL query, not just trusted from the migration file. Any future domain with a documented CHECK-style constraint must use the same `--create-only` + manual SQL edit pattern.

Status:
Approved

Date:
2026-06-20

Decision:
Make `ContributionReport.reviewedBy` and `VerificationRequest.reviewedBy` nullable, even though docs/03-Database Schema.md's column tables for both don't mark them "NULL" (unlike other genuinely-nullable columns in the same doc, e.g. `projects.senior_id UUID FK NULL`, which are always explicitly marked).

Reason:
docs/04-API Specification.md (priority 6, below DB Schema at priority 5 — but this isn't really a cross-doc conflict) shows both resources are created with `status: PENDING` via one endpoint and only reviewed/approved later via a separate admin endpoint. A NOT NULL `reviewed_by` would make the documented creation flow impossible to implement at all (no reviewer can exist yet at creation time). Treated this as an internal gap in the schema doc's nullability annotations, not an invented business rule — the two docs are read together to resolve it, not picking API spec over DB schema in general.

Impact:
Both fields are `String?` in schema.prisma with a comment explaining the reasoning and pointing back to this entry. If a similar "table doesn't mark NULL but workflow clearly requires it" situation appears in a later domain, apply the same cross-check against docs/04-API Specification.md (and docs/07-Workflow_Map) before deciding, rather than guessing from the DB schema table alone.

Status:
Approved

Date:
2026-06-20

Decision:
Seed an admin user as a real Supabase Auth account (via `supabase.auth.admin.createUser()` with the service role key, `email_confirm: true`), then insert a matching `public.users` row with the same id — rather than seeding a placeholder UUID with no real auth.users entry.

Reason:
docs/03-Database Schema.md requires `users.id = auth.users.id` (no separate auth_user_id column). The Auth module itself isn't built until Phase 1.1, so this was a genuine fork affecting whether the seeded admin can actually log in later. Asked the user directly (AskUserQuestion) rather than guessing; user chose the real-Auth-user route, accepting a new dependency (`@supabase/supabase-js`) one phase earlier than originally planned.

Impact:
backend/src/prisma/seed.ts now depends on SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY env vars (already present in backend/.env from 0.2.1) and the `@supabase/supabase-js` package. Seed is idempotent — checks for an existing `public.users` row by email before calling the Admin API, so re-running `prisma db seed` doesn't fail or duplicate. Default seed credentials: `admin@edunomad.com` / `EduNomadAdmin123!` (overridable via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` env vars) — fine for local dev seed data, should not be reused as-is in any deployed environment.

Status:
Approved

Date:
2026-06-20

Decision:
Swap the seed script's TypeScript runner from `ts-node` to `tsx` (new devDependency), while leaving `ts-node` in place for nodemon's dev workflow (`npm run dev`) unchanged.

Reason:
`ts-node@10.9.2` silently mis-handles backend/tsconfig.json under the installed TypeScript 6 (a very recent release) — it failed to type-check backend/src/prisma/seed.ts with false "cannot find process/console" errors, while `tsc` itself compiled the identical file with the identical tsconfig with zero relevant errors, and ts-node worked fine on src/index.ts under the same config. This is a ts-node-vs-TypeScript-6 compatibility gap, not a real code problem. Per the project's Version Flexibility policy, asked the user before swapping rather than guessing; user approved the scoped swap.

Impact:
`prisma.config.ts`'s `migrations.seed` is now `"tsx src/prisma/seed.ts"`. `tsx` (esbuild-based, no TypeScript-compiler-API version coupling) added as a backend devDependency. `npm run dev` / nodemon still use `ts-node` since that path was independently verified working — not changed without a concrete failure to justify it. If `ts-node` causes similar issues elsewhere later, consider replacing it project-wide rather than running two different TS runners long-term.

Status:
Approved

Date:
2026-06-20

Decision:
Use Prisma 7's required PostgreSQL driver adapter (`@prisma/adapter-pg`'s `PrismaPg`, passed to `new PrismaClient({ adapter })`) in the seed script, connecting via `DIRECT_URL` instead of `DATABASE_URL` (the pooled/Supavisor connection) — temporarily.

Reason:
Prisma 7 has no built-in query engine for PostgreSQL anymore; a driver adapter is mandatory for any `PrismaClient` instantiation (confirmed via Context7) — this is a project-wide architectural fact, not specific to seeding. Separately, `DATABASE_URL` (never actually exercised until this seed script, since all prior migrations used `DIRECT_URL`) fails with the same Supavisor "tenant/user not found" error pattern as the earlier DIRECT_URL issue. Asked the user to check the dashboard; the `.env` value was unchanged after their edit, so rather than block all of 0.2 on an unresolved pooler issue, user approved using `DIRECT_URL` as a temporary stand-in for the one-off seed script.

Impact:
`@prisma/adapter-pg` is now a required backend dependency for ALL future PrismaClient usage, not just seeding — must be used the same way in 0.3.5 (Prisma Client Singleton). The `DATABASE_URL` pooler connection remains a confirmed OPEN ISSUE (logged in next-tasks.md and current-status.md) that must be fixed before 0.3.5, since `DIRECT_URL` has a low connection limit unsuitable for concurrent app runtime traffic — it was acceptable only as a one-off script workaround.

Status:
Approved (DATABASE_URL pooler fix still outstanding)

Date:
2026-06-20

Decision:
Fix the `DATABASE_URL` (Supavisor pooled connection) by correcting the pooler shard segment in the hostname from `aws-0-ap-south-1` to the project's actual shard `aws-1-ap-south-1.pooler.supabase.com`, keep port 6543 + `?pgbouncer=true`, and deliberately omit `connection_limit=1`.

Reason:
Supabase MCP has no tool that exposes the Supavisor shard assignment (confirmed by checking every `get_project`/`get_project_url`/`list_projects` tool — all return only the direct DB host, never the pooler host). The shard number is per-project and only visible in the Dashboard's Connect modal; user pasted the dashboard string (`aws-1-ap-south-1`) directly. Verified via Context7 (`/supabase/supabase`) that `pgbouncer=true` is mandatory for Prisma + Supavisor transaction mode regardless of deployment, but `connection_limit=1` is serverless/edge-specific advice — wrong for EduNomad's long-running Express server, so it was excluded.

Impact:
Connection confirmed working via a throwaway `pg` Client test query (`SELECT current_user, now()`) against `DATABASE_URL`, then deleted. `DIRECT_URL` unchanged. This closes the OPEN ISSUE blocking 0.3.5 (Prisma Client Singleton) — that task can now proceed using the pooled connection for runtime app traffic.

Status:
Approved (resolved)

Date:
2026-06-20

Decision:
Implement the Prisma Client singleton (`backend/src/config/database.ts`) using the `globalThis`-cached pattern with `PrismaPg` adapter bound to `DATABASE_URL`, log level split by `NODE_ENV` (`["error","warn"]` dev, `["error"]` prod), and wire graceful shutdown (`SIGINT`/`SIGTERM` → `prisma.$disconnect()` → close HTTP server) into `backend/src/index.ts`.

Reason:
Confirmed via Context7 (`/prisma/prisma/7.6.0`) that this is Prisma's own documented pattern for avoiding duplicate client instances across hot reloads in dev, combined with the mandatory driver-adapter requirement already established in Prisma 7. Used `DATABASE_URL` (not `DIRECT_URL`) since this singleton serves all runtime app traffic — the now-resolved pooled connection is exactly what task-breakdown.md's 0.3.5 AC and the prior OPEN ISSUE both called for.

Impact:
Verified at runtime (not just compiled): booted via `npx tsx src/index.ts`, `GET /health` → 200, then `SIGINT` disconnected and exited cleanly with no hang. Any future code needing Prisma must `import { prisma } from "../config/database"` — never instantiate `PrismaClient` directly elsewhere (repositories in 0.3.x+ should follow this).

Status:
Approved

Date:
2026-06-20

Decision:
For 0.3.3 Response Helpers, follow task-breakdown.md's exact documented function signatures — `successResponse(data, message)`, `errorResponse(message, errors)`, `paginatedResponse(data, meta)` — as pure functions that RETURN a plain response-body object, not functions that take `res` and call `res.json()` themselves. Also: `paginatedResponse` returns `{ data, meta }` only, deliberately WITHOUT `success`/`message` fields, even though that's inconsistent with the success/error envelope shape.

Reason:
The documented signatures literally have no `res` parameter, and docs/04-API Specification.md's "Paginated Response" example is shown as a bare `{ data: [], meta: {...} }` object, distinct from the Success/Error Response examples that include `success`/`message`. Honored the doc literally rather than "fixing" the apparent inconsistency, per CLAUDE.MD's never-guess/docs-win rule.

Impact:
Controllers must call these as `res.status(x).json(successResponse(data, message))` etc., not `successResponse(res, data, message)`. Any future paginated list endpoint must NOT add `success`/`message` to the paginated body — only `{ data, meta }`.

Status:
Approved

Date:
2026-06-20

Decision:
Remove `Object.setPrototypeOf(this, AppError.prototype)` from the `AppError` base class constructor (`backend/src/utils/errors.ts`).

Reason:
Found via runtime testing (not just `tsc`): this line unconditionally reset every error instance's prototype to `AppError.prototype`, even when constructed via a subclass like `ValidationError` calling `super()`. This broke `instanceof ValidationError` checks in the global error handler, silently dropping the `errors` field from every validation error response. The line is a legacy workaround for transpiling `class extends Error` down to ES5 (where native prototype chains break) — unnecessary here since `backend/tsconfig.json` targets ES2022, where native `class extends` already produces the correct chain for every subclass without any manual fixup.

Impact:
Verified via temporary test routes that all custom error types now correctly preserve their specific subclass identity end-to-end (401/422/400-with-errors/500 all returned the right status + body). Any new `AppError` subclass added later must NOT add its own `setPrototypeOf` call either — native ES2022 class semantics already handle it.

Status:
Approved

Date:
2026-06-20

Decision:
In `validateRequest` middleware (`backend/src/middleware/validateRequest.ts`), validate `req.query` against its Zod schema but do NOT reassign `req.query` with the parsed/coerced result — unlike `req.body` and `req.params`, which ARE reassigned.

Reason:
Confirmed via Context7 (`/expressjs/express/v5.2.0`) that Express 5 defines `req.query` as a getter-only property (`defineGetter`, no setter) — direct assignment throws in strict mode. `req.body` and `req.params` remain plain writable properties set by other middleware/the router, so reassigning those with Zod's coerced/transformed values is safe and was kept (e.g. a `z.coerce.number()` query-string-turned-number for body fields).

Impact:
Controllers reading query params after `validateRequest({ query: schema })` get the original raw `req.query` (strings), not the coerced output — schema-level `z.coerce.*` on query fields validates correctly but its transformed value isn't propagated. If a future endpoint needs the coerced query value, read it from a fresh `schema.parse(req.query)` call in the controller/service rather than expecting `validateRequest` to inject it.

Status:
Approved

Date:
2026-06-20

Decision:
For 0.4.1 (Frontend Design System & Theme), map docs/08-UI_Pages_Specification_v1.0.md's "Dark Background #1A1A1A" (documented usage: "Info cards (alerts)") to a new dedicated token `--info-dark`/`--color-info-dark`, NOT into the pre-existing `.dark` CSS class (the shadcn dark-mode-toggle theme block already present in `globals.css` from scaffold).

Reason:
The UI spec's "Dark Background" is a color used for ONE specific component (alert/info cards) on an otherwise light page — it is not a request for a global dark-mode theme. No PRD/UI-spec document mentions a dark/light theme toggle for EduNomad. Conflating the two would have silently invented a dark-mode feature not in scope, and would have made the `.dark` class (which nothing currently activates) misleadingly "complete."

Impact:
The `.dark` class block in `globals.css` is left untouched (still shadcn's generic oklch grayscale boilerplate, unused/unreferenced by any toggle). If a dark mode toggle is ever explicitly requested in a future phase, that work should design its own full dark palette rather than assuming `--info-dark` extends to it.

Status:
Approved

Date:
2026-06-20

Decision:
User explicitly chose: build the 0.4.6 sidebar navigation as ONE generic structure shared by all roles (Dashboard/Projects/Artifacts/Notifications + Footer Help/Privacy/Terms, matching docs/08-UI_Pages_Specification_v1.0.md's Shared Components & Patterns section literally), rather than building a full per-role nav with placeholder routes to pages that don't exist yet.

Reason:
Asked the user directly (AskUserQuestion) because this was a genuine "Never invent navigation" risk: the UI spec only documents one generic sidebar structure, while each role's actual page set (Beginner/Senior/UMKM/Admin "Area" sections) is enumerated elsewhere in the same doc but those pages aren't built yet (still Phase 0 infra). Building per-role links to nonexistent routes would have meant inventing a navigation IA ahead of any approved page implementation.

Impact:
`frontend/src/constants/navigation.ts` exports one `NAV_ITEMS`/`FOOTER_NAV_ITEMS` pair used by `Sidebar.tsx` regardless of the logged-in user's role. The role is still tracked in `authStore` so it's available, just not yet used to branch the menu. Revisit this decision once real per-role pages exist (flagged in next-tasks.md).

Status:
Approved

Date:
2026-06-20

Decision:
Delete the custom `--spacing-xs/sm/md/lg/xl/2xl/3xl` theme tokens added in 0.4.1 entirely, and use Tailwind's stock numeric spacing scale (1/2/3/4/6/8/12) everywhere instead, across every component built in 0.4.1–0.4.7.

Reason:
Discovered a real, sitewide-impacting bug while verifying 0.4.7 in-browser: `max-w-sm` silently resolved to `8px` (the custom `--spacing-sm` token) instead of Tailwind's intended `24rem` container size, because Tailwind's `--spacing-*` namespace feeds MANY utility categories beyond padding/margin/gap — including `max-w-*`/`w-*`/`h-*` — and those utilities also use named t-shirt-size keys (`sm`/`md`/`lg`/`xl`/`2xl`/`3xl`) that collided directly with the custom additions. This silently broke text wrapping (one word per line) anywhere `max-w-sm` or similar was used. Tailwind's existing numeric scale already matches the doc's px values exactly (1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px, 12=48px), so there was no need for named spacing tokens at all — only `--text-*`, `--radius-*`, and `--shadow-*` (which don't have this collision risk, confirmed by checking Tailwind's documented namespace list) were kept as named custom tokens.

Impact:
Updated `button.tsx`, `Sidebar.tsx`, `Header.tsx`, `AppShell.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `LoadingState.tsx` to use numeric utilities (`p-3`, `gap-6`, etc.) instead of the named ones (`p-md`, `gap-xl`, etc.). **Any future frontend code must use Tailwind's numeric spacing scale, never re-add named `--spacing-*` theme tokens** — this is a hard rule now, not just a style preference, since reintroducing them would silently re-break `max-w-*`/`w-*`/`h-*` utilities again.

Status:
Approved

Date:
2026-06-20

Decision:
Change shadcn's `Skeleton` component (`skeleton.tsx`) from `bg-muted` to `bg-neutral-gray-light` (#CCCCCC).

Reason:
After the 0.4.1 color palette change, `--muted` became `#F5F5F5` — identical to the page `--background`, making every skeleton loader (Card/List/Table/Input) completely invisible against the page. Caught via in-browser screenshot verification during 0.4.7, not just by reading the component code.

Impact:
Skeletons are now visibly gray against both the page background and white cards. If `--muted` or `--background` are ever changed again, re-check Skeleton's contrast as part of that change.

Status:
Approved

Date:
2026-06-20

Decision:
Backend folder layout for feature code: honor every ARCH-listed folder — `routes/<feature>.routes.ts` (route defs + middleware wiring), `modules/<feature>/<feature>.controller.ts` (controllers), `services/<feature>.service.ts` (business logic), `repositories/<entity>.repository.ts` (DB access only), `validators/<feature>.validator.ts` (Zod). The route aggregator `routes/index.ts` mounts everything under `/api/v1` in `index.ts`.

Reason:
docs/05-Architecture Rules.md lists both a `modules/` folder ("feature modules") AND separate layer folders (services/repositories/validators/routes) but NO `controllers/` folder, while the mandatory request flow (Route→Controller→Service→Repository→Prisma) requires controllers. The only doc-faithful home for controllers is `modules/<feature>/`. This uses every documented folder for its apparent purpose and keeps the layered flow intact. This is an implementation-detail decision (folder organization), not an architecture-style change — the layered style itself is unchanged.

Impact:
All Phase 1+ backend features follow this layout. A feature spans up to 5 files across these folders. Repositories never contain business logic; controllers never touch Prisma directly.

Status:
Approved

Date:
2026-06-20

Decision:
Verify Supabase JWTs in the Express backend via `supabaseAdmin.auth.getUser(token)` (a service-role client in `config/supabase.ts`), then load app-level role/status from `public.users`. Do NOT decode/verify the JWT locally (no jose/JWKS, no custom JWT logic), and do NOT trust the JWT's `role` claim as the app role.

Reason:
Confirmed via Context7 (Supabase docs) that `getUser(token)` validates against the auth server and works regardless of symmetric vs asymmetric signing keys. The minted admin token is ES256 (asymmetric — new-project default), and its `role` claim is `authenticated` (the Postgres role), NOT the app role (ADMIN/UMKM/…). App role/status live only in `public.users` (users.id = auth.users.id). ARCH forbids custom JWT logic; getUser is the documented, key-agnostic, lowest-risk approach. The per-request network round-trip to the auth server is acceptable for MVP; a future optimization could switch to local JWKS verification (jose) if latency matters.

Impact:
authMiddleware does one auth-server call + one DB lookup per protected request. A valid Supabase token without a `public.users` row (i.e. signed up but registration not completed) is rejected by the strict authMiddleware with 401 "User account not found" — the registration-completion flow (1.3.7) will need its own bootstrap path since the app row doesn't exist yet.

Status:
Approved

Date:
2026-06-20

Decision:
(User-approved via AskUserQuestion during Phase 1.3.) Two registration decisions:
(1) Role-specific registration fields that have no user_profiles column (institution/company/business name/business type/city, and CV upload) are mapped onto the existing schema, NOT given new columns: composed into `headline`/`bio` text, the primary affiliation (institution/company) optionally stored as one `experiences` row, and the CV stored in Supabase Storage with its URL saved as a `portfolio_links` row (type OTHER, title "CV"). No schema changes.
(2) Add a new transactional endpoint `POST /api/v1/auth/register` (not in the original API spec, which only documents /auth/me + /auth/logout) to fulfill the documented Workflow-1 registration: it takes the authenticated Supabase identity + { name, role, profile, skills[], experiences[], portfolioLinks[] } and creates users + user_profiles + user_skills + experiences + portfolio_links + verification_requests (status PENDING_VERIFICATION) in one transaction.

Reason:
docs/03-Database Schema.md (priority 5) outranks docs/08-UI_Pages_Specification (priority 7, and explicitly "a design reference, not final"), and CLAUDE.md forbids creating columns/tables not in the schema. So the UI's richer per-role fields must map onto existing columns. The registration workflow itself (Workflow 1 + task 1.3.7) is fully specified; only the HTTP contract was missing, so defining one endpoint is implementation, not inventing requirements. Asked the user rather than guessing the data semantics, per CLAUDE.md "Never guess / STOP & ask".

Impact:
The register endpoint uses a NEW lenient auth middleware (`requireSupabaseUser`) that validates the JWT but does NOT require a public.users row (the row doesn't exist yet at registration). role is restricted to BEGINNER/SENIOR/UMKM (ADMIN is seed-only). Registration is single-use: it rejects if a public.users row already exists for that id. Frontend registration wizard collects role-specific fields for UX but persists them via the mapping above.

Status:
Approved (user-selected)

Date:
2026-06-20

Decision:
Move Step-1 account creation to a backend endpoint `POST /api/v1/auth/signup` that uses the Supabase Admin API `createUser({ email, password, email_confirm: true })`, then the frontend calls `signInWithPassword` to obtain a session. Do NOT use client-side `supabase.auth.signUp()` for the wizard.

Reason:
Verified empirically that the EduNomad Supabase project has "Confirm email" ON — a plain client `signUp()` returns no session until the email link is clicked, which would make the multi-step wizard (steps 2-5 + CV upload + completion) impossible (no token). I cannot toggle that project Auth setting via the available MCP tools (it's a GoTrue config, not a DB row, and I have no Management API token). Auto-confirming server-side via the admin API is self-contained, keeps the documented "account created at Step 1" flow, and lets the user be authenticated for the rest of the wizard (so CV upload to Storage works under the authenticated RLS policy). createUser surfaces "email already registered" as a clean 422.

Impact:
`POST /auth/signup` is public (rate-limited). The existing `POST /auth/register` stays authenticated (requireSupabaseUser) and is called at wizard completion. No password is ever persisted client-side. If email confirmation is later turned off, this still works unchanged.

Status:
Approved

Date:
2026-06-20

Decision:
Create a PUBLIC Supabase Storage bucket `cvs` (5 MB limit, PDF/DOCX only) with RLS policies: authenticated users may INSERT, public may SELECT. CV files upload here during registration Step 4; the public URL is stored as a `portfolio_links` row (type OTHER, title "CV").

Reason:
The DB schema has no cv_url column (decisions.md mapping), so the CV lives in Storage with its URL as a portfolio link. A public bucket gives a stable URL the admin can open during verification without signed-URL plumbing. Created via Supabase MCP migration `create_cvs_storage_bucket` (tracked in supabase_migrations, separate from Prisma's public-schema migrations, so no conflict). Verified: an authenticated REST upload to the bucket returns 200.

Impact:
PRIVACY TRADEOFF — anyone with the URL can download a CV (public bucket). Acceptable for MVP; revisit with a private bucket + signed URLs if CV confidentiality becomes a requirement. The authenticated-INSERT policy is why Step-1 backend signup + immediate sign-in matters (the uploader must be authenticated).

Status:
Approved (revisit privacy before production)

Date:
2026-06-20

Decision:
(Phase 2) Verification request supporting info (portfolio_url, experience_years, additional_info from the API spec body) is composed into the verification_requests.`notes` text column — no dedicated columns added. Verification approve/reject are transactional in verificationRepository (update request status + update user.status + create audit log in ONE prisma.$transaction). Skill approve/reject use the same transactional-with-audit pattern in skillRepository.setStatusWithAudit. POST /verification-request upserts: if a PENDING request exists (registration creates one), it updates the notes; else creates a new PENDING request.

Reason:
Same map-to-existing-schema rule as registration (verification_requests only has id/userId/status/notes/reviewedBy). Transactional approve/reject guarantees the user-status change and its audit record can't diverge (audit logging is mandatory per docs/05). Upsert-on-submit avoids creating duplicate verification requests since registration already creates the PENDING one.

Impact:
verification_request.status uses APPROVED/REJECTED while user.status uses VERIFIED/REJECTED — they intentionally differ on the approve path (request=APPROVED, user=VERIFIED). Audit logs: actor=admin id, entityType=verification_request|skill, entityId=that row's id, metadata={targetUserId|reason}. Any future admin action that changes domain state must follow the same transactional-with-audit pattern.

Status:
Approved

Date:
2026-06-21

Decision:
(User-confirmed via AskUserQuestion, Phase 3.) Project status lifecycle = DRAFT → PENDING_REVIEW → RECRUITING (on admin approve) / REJECTED (on admin reject) → ACTIVE → COMPLETED. Admin approve sets status to RECRUITING (NOT PUBLISHED). PUBLISHED and OVERDUE (from the schema comment) are dropped. Valid project statuses enforced at the Zod/service layer: DRAFT, PENDING_REVIEW, RECRUITING, REJECTED, ACTIVE, COMPLETED.

Reason:
Cross-doc conflict: Workflow 2 (doc priority #2) + RBAC Project Status Rules (#3) both say admin approve → RECRUITING; API Spec (#6) line ~1363 + the schema comment say PUBLISHED. Per CLAUDE.md "documentation wins" priority order, Workflow 2 + RBAC outrank the API Spec, so RECRUITING is authoritative. RECRUITING is also consistent with Workflows 3/4 (senior/beginner apply while status=RECRUITING). User confirmed both the approve target (RECRUITING) and the canonical status set.

Impact:
3.1.2 createProject → DRAFT; submitForReview → PENDING_REVIEW; 3.2 admin approve → RECRUITING + audit (PROJECT_APPROVED), reject → REJECTED + audit (PROJECT_REJECTED). projects.status is VARCHAR (no DB enum) so a shared status constant + Zod enum guards valid values. Anywhere the API spec says "PUBLISHED" for projects, use RECRUITING instead.

Status:
Approved (user-confirmed)

Date:
2026-06-21

Decision:
(Phase 3 backend.) Three implementation decisions while building the Project module:
(1) Added `POST /api/v1/projects/:id/submit` (UMKM owner, DRAFT→PENDING_REVIEW) — not in the API spec, which has no submit-for-review endpoint, but Workflow 2 requires the "SUBMIT FOR ADMIN REVIEW → PENDING_REVIEW" step. Same gap-filling approach as the registration endpoints.
(2) `GET /projects` (public) only returns projects with status in {RECRUITING, ACTIVE, COMPLETED} (PUBLIC_PROJECT_STATUSES). DRAFT/PENDING_REVIEW/REJECTED are owner-only. A status filter is intersected with this visible set. Per Workflow 2 ("project visible to seniors/beginners once RECRUITING").
(3) Milestone create/update/delete allowed for EITHER the project owner (UMKM) OR the assigned senior (project.seniorId). API spec says SENIOR-only; task-breakdown 3.1.4 says "UMKM at create OR SENIOR when active" — merged both (assertManager checks user is umkmId OR seniorId). GET milestones = any authenticated user.

Reason:
Workflow Map (priority #2) + the documented workflow steps drive (1) and (2); (3) reconciles API spec (#6) with the task plan by allowing both legitimate managers. createProject enforces UMKM max-5-ACTIVE (counts ACTIVE projects, blocks new create at the cap) per the INIT-prompt instruction + RBAC UMKM constraint. updateProject/deleteProject/submit are owner-only + DRAFT-only.

Impact:
Project endpoints live at /api/v1: GET /projects & /projects/:id (public, visible-status-only), POST/PUT/DELETE /projects (UMKM+owner; create also requireVerified), POST /projects/:id/submit, GET /my-projects (UMKM), GET/POST /projects/:id/milestones, PUT/DELETE /milestones/:id, GET/POST /projects/:id/roles, PUT/DELETE /roles/:id, plus admin GET /admin/projects/pending + POST /admin/projects/:id/approve|reject. Status constant + visibility set in constants/projectStatus.ts. Admin approve→RECRUITING, reject→REJECTED, both transactional-with-audit.

Status:
Approved

---

## 2026-06-21 — Phase 3 Frontend decisions

### D-P3F-1: Admin Review "Disetujui/Ditolak" tabs use available endpoints only (no backend rebuild)
Context: UI spec & task 3.3.3 ask for Pending|Approved|Rejected tabs, but Phase 3 backend (locked "done") exposes only GET /admin/projects/pending. RECRUITING projects are public; REJECTED projects are NOT in PUBLIC_PROJECT_STATUSES so no current endpoint lists them.
Decision: Menunggu tab = GET /admin/projects/pending (full approve/reject). Disetujui tab = public GET /projects?status=RECRUITING (read-only). Ditolak tab = explained empty state ("belum tersedia"). No new backend endpoint added.
Why: Respect "don't rebuild Phase 3 backend"; the verified AC (admin approve/reject of pending) is fully delivered. A generic admin all-projects list belongs to the separate /admin/projects/monitoring feature (future).
Follow-up: If rejected-history is needed, add GET /admin/projects?status= (admin list any status) in a later phase.

### D-P3F-2: Role-aware sidebar navigation
Decision: constants/navigation.ts now exports getNavItems(role) instead of a static NAV_ITEMS; Sidebar reads appUser.role. UMKM gets Buat Proyek + Proyek Saya; ADMIN gets Tinjau Proyek; common = Dashboard + Telusuri Proyek; trailing = Artifacts + Notifications. Supersedes the 0.4.6 "generic nav for all roles" note now that per-role pages exist.

### D-P3F-3: base-ui Select label display via `items` prop
Decision: For "All" filter selects on /projects, pass Select.Root `items` (Record<value,label>) so the trigger shows the label ("Semua Kategori"/"Semua Status") without opening the popup. base-ui mounts items lazily, so Select.Value can't resolve a preset value's label otherwise. Confirmed via Context7. (Create-form category select didn't need it — value starts empty→placeholder, label resolves after user opens it.)

### D-P3F-4: Create wizard persists incrementally (DRAFT-first)
Decision: Step 1 immediately POSTs the project (status DRAFT) to obtain an id, because milestone/role endpoints are nested under an existing project. Steps 2–3 add/delete milestones & roles via their APIs as the user goes; Step 4 calls POST /projects/:id/submit. A user who abandons mid-wizard leaves a DRAFT (visible/deletable in My Projects) — acceptable for MVP. Detail-page apply buttons (BEGINNER/SENIOR) are disabled placeholders until Phase 4 recruitment.

### D-P3F-5 (RESOLVED — user-approved & applied 2026-06-21): backend dev-server TS 6.0.3 tooling
Context: With TypeScript 6.0.3 + @types/express-serve-static-core 5.1.1, `npm run dev` (nodemon→ts-node) in backend/ crashed for THREE reasons:
1. tsconfig `moduleResolution:"node"` + `baseUrl` now emit FATAL deprecations TS5101/TS5107.
2. ts-node doesn't load src/types/express.d.ts (req.user/supabaseUser augmentation) without `files:true`.
3. @types/express-serve-static-core 5.1.1 changed `ParamsDictionary` to `[key:string]: string | string[]`, so `req.params.id` is now `string | string[]` → 28 TS2345 errors across ALL 10 controllers (pre-existing in every controller; full type-check blocks startup).
APPLIED FIX (backend/tsconfig.json): added `"ignoreDeprecations": "6.0"` (silences #1) + `"ts-node": { "files": true }` (#2 loads augmentation). #3 fixed at the root via D-P3F-6 (@types pin) so dev keeps FULL type-checking — `transpileOnly` was used only momentarily and then removed once D-P3F-6 made the tree type-clean. VERIFIED: canonical `npm run dev` boots with type-checking ON; GET /projects→200, GET /my-projects no-token→401.

### D-P3F-6 (RESOLVED — user chose option (a), applied 2026-06-21): @types/express params type
`npm run build` (tsc) was failing with 28 `req.params.id` "string | string[]" errors (all 10 controllers) because @types/express-serve-static-core 5.1.1 types ParamsDictionary values as `string | string[]`. FIX: added root `package.json` `"overrides": { "@types/express-serve-static-core": "5.0.7" }` (5.0.7 = `{[key:string]: string}`, satisfies @types/express@5.0.6's `^5.0.0`). Required a clean reinstall (`rm -rf node_modules package-lock.json && npm install`) — npm 10.9.4 wouldn't apply the new override on an incremental install or even a lock-only regen. VERIFIED: @types/express-serve-static-core now 5.0.7; `npm run build` → 0 errors + dist/index.js (dist then cleaned); key versions unchanged (express 5.2.1, prisma 7.8.0, typescript 6.0.3, react 19.2.7); `npm run dev` boots with type-checking; frontend tsc still clean. Net: dev type-checks again AND build passes — `transpileOnly` no longer needed and was removed from tsconfig.
NOTE for future installs: the override lives in the ROOT package.json (workspaces monorepo). If node_modules is ever rebuilt and the pin seems ignored, do a clean `rm -rf node_modules package-lock.json && npm install`.

### D-UI-1 (2026-06-24, branch redesign/app-ui): docs/08 Design System re-aligned to Figma brand
Context: The app + landing were redesigned to the Figma brand (file nMFbzuPNcRcKgFVvMEFfaj — auth nodes 11-3478/11-3463, landing node 5:4), but docs/08-UI_Pages_Specification_v1.0.md still described the OLD palette (Primary Green #67C957, neutral grays #999/#CCC/#333/#F5F5F5, font Inter). Future frontend reading the spec would reproduce the stale design.
Decision: Rewrote docs/08 §Design System to mirror the SHIPPED tokens in frontend/src/app/globals.css and marked it "SOURCE OF TRUTH = Figma". Two scoped palettes documented:
- In-app (:root): --background #faf8f3, --foreground #0b0b0b, --primary #d8f277 (chartreuse) + --primary-foreground #0b0b0b (dark text on lime, NEVER white), --secondary #fafaf8, --muted-foreground #6b6b6b, --border/--input #e7e3d8, --ring #a3ce00; semantic --success #67C957 / --warning #FFA500 / --error #FF4444 / --info-dark #1A1A1A kept.
- Landing (ln-*): bg #faf8f3, ink #201f31 (navy, text+dark-section bg), muted #6b6b6b, accent #d8f277, accent-strong #87c522, accent-ink #5da316, accent-soft #e1fcdc.
- Font Inter→Manrope; radius base 0.75rem(12px), input 10px, card 20px, pill full. Button/Progress/Color-Usage hex refs updated; old #67C957 palette flagged DEPRECATED (kept only as the --success semantic + explicit deprecation notes). Verified exact hex via Figma MCP get_design_context (not guessed); landing palette already applied in code (commit fa3f065).
Why: docs/08 is the locked UI reference per CLAUDE.md priority order; keeping it stale would make every future frontend task re-introduce the old green. Aligning it makes Figma the durable source of truth.
Note: KOREKSI vs an earlier handoff guess — Figma confirms landing accent-strong stays #87c522 (NOT #a3ce00).

### D-P5-1 (2026-06-24, branch feature/phase-5-workspace): discussions `title` not persisted
API spec POST /projects/:id/discussions body has `{title, members}` but the `discussions` table has NO title column (docs/03 schema wins over the API-spec example per CLAUDE.md priority). Decision: validator accepts optional `title` but the service ignores it; only `type`, `project_id`, and discussion_members are stored. Frontend can show a client-side label or first message; revisit if a title column is ever added.

### D-P5-2 (2026-06-24): Realtime = Express writes + RLS SELECT-only client reads (user-approved)
Workflow 6/7 chat. Approach (user picked among 3): WRITES go through Express (validated + RBAC + $txn); browser clients get READ-ONLY live access via Supabase Realtime. Enabled RLS on discussions/discussion_members/discussion_messages with SELECT-only policies for `authenticated`, gated by SECURITY DEFINER `public.is_discussion_member(uuid)` (avoids policy recursion). No INSERT/UPDATE/DELETE policy => clients can't write directly. Prisma's postgres role BYPASSES RLS, so the Express backend keeps full access (re-ran E2E after enabling RLS = still 14/14). auth.uid() == public.users.id (verified 7/7). Realtime publication += discussion_messages + discussions; discussion_messages replica identity full. Applied via Supabase MCP migration `phase5_discussions_rls_realtime`; SQL mirrored at backend/db/phase5_discussions_rls_realtime.sql (RLS not Prisma-managed). This is the FIRST RLS enabled on the project (all other domain tables still RLS-disabled/deferred).

### D-P5-3 (2026-06-24): DM eligibility = shared project context
docs/06 says DM is "between project members" / "member and senior". Implemented precisely: two users may DM only if they share a project context — computed by `discussionRepository.userProjectIds(userId)` (projects where user is senior, UMKM owner, or ACTIVE member) and intersecting the two sets. Self-DM blocked (422). DM discussion is the unique 1:1 DIRECT row (find-or-create, project_id null). Group-discussion create is restricted to the project's senior lead or UMKM owner (beginners "join", per docs/06), senior auto-included in membership.

### D-P5-4 (2026-06-24): frontend realtime = re-pull on INSERT (not raw payload)
ChatPanel subscribes Supabase Realtime postgres_changes INSERT on discussion_messages filtered discussion_id=eq.<id>. On any insert it RE-PULLS the message list via Express (GET) instead of rendering the raw row payload. Why: the realtime row is snake_case + has no sender join (only sender_id) and bypasses our envelope; re-pulling lets the server resolve sender names + apply the same shape, and RLS still gates what the client may read. Trade-off: 1 extra GET per incoming message — fine for MVP chat volume. `supabase.realtime.setAuth(token)` is called before subscribe so RLS sees auth.uid(). One shared ChatPanel powers both group discussions and DMs. DM has no "list conversations" endpoint in 5.1, so the frontend launches DMs from the Members tab (find-or-get by user id); a conversation-list page is deferred until a GET /direct-chats endpoint exists.

### D-UI-2 (2026-06-24, branch redesign/app-shell): app shell + dashboard → Figma navy (node 229-2)
Figma node 229-2 sebenarnya halaman Diskusi, tapi user minta "dashboard" diubah ke look itu. User pilih scope = Shell + Dashboard; branch = merge feature/phase-5-workspace→main (f260ca3) dulu lalu cabang redesign/app-shell dari main. Dibangun: Sidebar dark navy #201f31 (brand "E" chartreuse + role label [BEGINNER→Mahasiswa/SENIOR→Mentor/UMKM→UMKM/ADMIN→Admin], MENU group, nav active = chartreuse pill bg-primary, Notifications badge merah dari notificationStore, secondary links dim, profile mini-card pinned bottom). AppShell bg warm + padding. Header blend (bg-background/80 backdrop-blur). Dashboard page: hero navy greeting + status Alert + role-aware "Aksi Cepat" cards (LINK asli ke /projects /applications /artifacts dll, TANPA angka palsu — Figma gak punya page dashboard, improvisasi on-theme sesuai CLAUDE.md). Sidebar dipakai SEMUA authed page (termasuk workspace Phase 5). tsc 0 err; browser-verified (senior). BELUM: halaman Diskusi workspace di-persis-in ke Figma (right-rail aktivitas/milestone/file/tim online, filter chips, kartu navy) — opsi (c) yg user belum pilih; tawarkan lain kali.

### D-UI-3 (2026-06-24, branch redesign/app-shell): halaman Diskusi → Figma 229-2 (data asli, MVP-jujur)
DiscussionTab di-redesign ke layout Figma node 229-2: header "Diskusi Proyek"+Buat Diskusi, status strip (Proyek/Status/Mentor/Deadline), chips diskusi (navy active, muncul kalau >1 group discussion), DiscussionFeed (komponen baru: messages jadi KARTU ala Figma — avatar tone, nama+role badge [SENIOR→Mentor chartreuse, BEGINNER→Mahasiswa biru, UMKM amber], timestamp, body; composer; live via Realtime re-pull), right rail = Milestone (project.milestones + done state) + Tim (senior+active members + role badge). Sidebar app-shell navy (D-UI-2) jadi kolom kiri.
Omission JUJUR vs Figma (backend MVP gak punya, TIDAK diinvent): kategori tab (Pengumuman/Pertanyaan/Kendala/Ide/Review Mentor/Pembaruan — discussions gak punya taxonomy), File Terbaru (attachments disabled di schema MVP), online/offline presence (gak di-track → Tim pakai role badge bukan dot online), Aktivitas Terbaru (skip, redundan dgn feed). Verified browser (senior, project a1a1a1a1-…0005). Kalau nanti mau kategori/attachment/presence → butuh perubahan schema+backend (bukan UI saja).

### D-UI-4 (2026-06-25, branch redesign/app-shell): design-skill polish pass (a11y + motion)
Terapkan web-design-guidelines + impeccable + emil + frontend-design ke shell/dashboard/Diskusi. globals.css dapat layer baru [data-app] (mirror pola landing [data-landing]): focus-visible ring (lime gelap --ring di surface terang, chartreuse --primary di navy via .app-dark/.app-on-dark), touch-action+tap-highlight, keyframe `app-reveal` fade-up yg HANYA jalan di prefers-reduced-motion:no-preference (reduced user lihat konten instan, gak ada gating blank). a11y: aria-current di nav sidebar + tab workspace, aria-pressed di chip diskusi; kontras teks sidebar dim dinaikkan ke ~AA. Motion: stagger reveal di kartu dashboard + kartu pesan diskusi, transition eksplisit + ease-out-quint, active press. Active state pakai brand primary (underline tab, focus). tsc 0 err; browser: focus ring kelihatan di sidebar navy via keyboard, reveal settle ke visible. AppShell root = data-app; Sidebar = app-dark.

### D-UI-5 (2026-06-25, branch redesign/app-shell): DESIGN.md design-system contract
Bikin /DESIGN.md (format impeccable/Google Stitch: YAML frontmatter token + 6 section Overview/Colors/Typography/Elevation/Components/Do's&Don'ts). Mendokumentasikan sistem visual AUTHED APP yg udah ke-implement (token globals.css :root + layer [data-app]) biar UI konsisten ke depan. North Star "The Warm Workshop": paper #faf8f3 (canvas) + navy #201f31 (focus/dark surface) + chartreuse #d8f277 (action, dark text only). Landing pakai sistem ln-* terpisah — JANGAN dicampur (ditegaskan di doc). DESIGN.md = kontrak visual; docs/08-UI_Pages_Specification tetap spec halaman/workflow. Future frontend: baca DESIGN.md sebelum bikin screen baru.

### D-UI-6 (2026-06-25, branch redesign/app-shell): apply DESIGN.md across app pages
Restore point dibikin dulu: tag `ui-restore-2026-06-25` (undo: git reset --hard ui-restore-2026-06-25). Lalu terapkan DESIGN.md ke projects/applications/auth + admin:
- BATCH 1 (1632fa4): enforce contrast-law — semua text-primary (chartreuse) yg jadi teks/link di terang → #5f8c00 (kartu CTA, link, chip create→accent tint, Button/Badge `link` variant); tab-active border-primary text-primary → underline #a3ce00 + text-foreground. Komponen PageHeader bersama (title+subtitle+action+reveal) dipasang di /projects /applications /applications/mentor /my-projects. Kartu /projects: hover-lift ease-out-quint + reveal stagger + token semantic.
- BATCH 2 (4f28766): normalisasi legacy class remapped → semantic DESIGN.md di 29+ file (exclude landing ln-*): text-neutral-dark→text-foreground, text-neutral-gray→text-muted-foreground, text-body/-sm→text-sm, bg-neutral-light→bg-muted, text-h1/h2/h3→text-2xl/xl/base font-bold|semibold tracking, text-caption→text-xs. Value-preserving (warna sama) tapi codebase match doc. Verified browser: /projects, detail, login on-theme (link hijau kebaca); tsc 0 err.
Sisa (opsional, render udah OK): create wizard (4 step) + ProjectMembersPanel + admin pages belum dapat polish premium (reveal/hover/spacing) — baru ke-normalize token-nya.

### D-P6-1 (2026-06-25, branch feature/phase-6-deliverables): deliverable revision feedback in audit log
docs/03 deliverables table punya NO feedback column, tapi Workflow 8 + frontend butuh nampilin feedback revisi ke beginner. Schema menang (CLAUDE.md priority). Keputusan (pola D-P4.3-5): simpan feedback di auditLog (action DELIVERABLE_REVISION_REQUESTED, metadata.feedback) + di-surface balik sbg `revisionFeedback` di GET /projects/:id/deliverables (deliverableRepository.latestRevisionFeedback batched query, ambil terbaru per deliverable). Audit actions baru: DELIVERABLE_APPROVED, DELIVERABLE_REVISION_REQUESTED, CONTRIBUTION_APPROVED + EntityType DELIVERABLE/CONTRIBUTION_REPORT.

### D-P6-2 (2026-06-25): Phase 6 backend rules & gates
Deliverable (WF8): create=BEGINNER ACTIVE member + project ACTIVE → DRAFT; edit/submit=creator only (submit dari DRAFT|REVISION_REQUESTED, evidences di-replace tiap submit dlm $txn, min 1 evidence, LINK→url/FILE→file_path); approve/request-revision=project senior lead only, hanya dari status SUBMITTED. Approved gak bisa di-edit (422). Contribution (WF9): submit=BEGINNER ACTIVE member + project ACTIVE + ONE per beginner per project (422 kalau dobel) → PENDING + skill tags; edit=creator (bukan approved); approve=senior lead, PENDING→APPROVED + reviewedBy. Role gate di route (roleMiddleware), ownership/lead/status di service. No migration (model deliverables/deliverable_evidences/contribution_reports/contribution_skills udah ada). E2E 24/24. Completion-readiness gate (D-P4.3-3) BELUM diisi — masih TODO di projectLifecycle.service.requestCompletion (bisa dicek all deliverables APPROVED + contributions APPROVED di Phase 6 lanjutan/7).

### D-P6-3 (2026-06-25, branch feature/phase-6-deliverables): Phase 6.3 frontend — inline review
Frontend Deliverables & Contributions di workspace tab. deliverableApi + contributionApi (service object). DeliverablesTab (beginner create/edit DRAFT, submit/resubmit evidence LINK via dynamic link inputs, feedback callout; senior lead review INLINE: Setujui/Minta Revisi+feedback dialog). ContributionTab (beginner own report summary+skill chips one-per-project edit-while-PENDING; senior list+approve). Tambah tab "Deliverables"+"Kontribusi" di /projects/[id]/workspace. KEPUTUSAN: review senior dilakukan INLINE di tab, BUKAN page terpisah /projects/:id/deliverables/:did/review yg di-spec task-breakdown 6.3.2 — workflow sama, UX lebih simpel, 1 tab. File-upload evidence (Supabase Storage) DITUNDA — LINK evidence dulu (FILE type sudah didukung backend, tinggal UI upload nanti). Ikut DESIGN.md. Verified browser full loop (beginner create→submit→ senior request-revision→feedback tampil; contribution report+skills) + tsc 0. Phase 6 SELESAI (6.1+6.2 backend E2E 24/24 + 6.3 frontend). NEXT = Phase 7 Reviews & Ratings.

### D-PERF-1 (2026-06-25, branch feature/phase-6-deliverables): page-load latency fixes (auth)
Diagnosa (terukur browser+curl): delay muat page didominasi AUTH, bukan sekadar "load data dulu". Sebab: (a) authMiddleware + requireSupabaseUser manggil supabaseAdmin.auth.getUser(token) REMOTE tiap request (~0.4s ke Supabase Auth ap-south-1) → rebutan saat banyak request barengan; (b) AuthProvider manggil /auth/me 2× (getSession().then + onAuthStateChange); (c) dev StrictMode gandakan fetch data 2×; (d) data nunggu auth bootstrap. Browser sebelum: /auth/me 6–9s ×2, time-to-data ~9–11s.
FIX #2 (commit aed5c8c): AuthProvider drop blok getSession(), pakai onAuthStateChange aja (INITIAL_SESSION nembak otomatis), defer kerja async via setTimeout(0) (anti-deadlock). → /auth/me 2×→1×.
FIX #1 (commit acc3147): verifikasi JWT LOKAL via JWKS (token ES256 asymmetric, kid match JWKS endpoint) pakai `jose` createRemoteJWKSet+jwtVerify (config/jwt.ts) — pola resmi Supabase (Context7-verified), GANTI getUser remote di kedua middleware. supabaseAdmin sekarang cuma utk admin auth ops. Masih "Supabase JWT verification" (kunci publik mereka), bukan custom signing → sesuai CLAUDE.md auth rules.
Hasil (warm browser): /auth/me 6–9s→1.3s, time-to-data ~9–11s→~3.8s. Regresi: invalid/no token→401, authed mutation→201, E2E auth jalan. Sisa cost = DB findById ke Supabase Postgres region (~0.5–1.5s) + dev StrictMode double (hilang di prod). `jose` ^6.2.3 dep baru di backend. Belum dikejar: prod-build measure, cache appUser per-token, DB region latency.

### D-UI-7 (2026-06-25): user-facing "Artifact"→"Sertifikat"
Label yang dilihat user diganti Artifact/Artefak → "Sertifikat" (lebih gampang dipahami user ID): nav sidebar, kartu Aksi Cepat dashboard (beginner+senior), StatCard admin. KODE TETAP `artifact` (type Artifact, artifactApi, route /artifacts, stats.artifacts, AuditAction.ARTIFACT_*) — biar gak break. Landing sudah pakai "Sertifikat". ⚠️ Saat Phase 8 (Artifact System) bikin halaman /artifacts, pakai label "Sertifikat" juga.

### D-P7-1 (2026-06-25, branch feature/phase-7-reviews): Phase 7.1 backend Reviews & Ratings
Workflow 12, layered, no migration (Review model ada). Pairs (docs/06): SENIOR→BEGINNER, UMKM→BEGINNER, UMKM→SENIOR; rating 1-5; public ke reviewee; editable selama project ≠ COMPLETED (set isEdited/editedAt). reviewBeginner: reviewer=senior lead/umkm owner (TYPE diturunkan dari field mana yg match), reviewee=ACTIVE member, project ACTIVE, ONE per (project,reviewer,reviewee). reviewSenior: umkm→assigned senior. Endpoints: POST /projects/:id/reviews/beginner (SENIOR|UMKM), /reviews/senior (UMKM), PUT /reviews/:id, GET /projects/:id/reviews, GET /users/:id/reviews. KEPUTUSAN: GET endpoints DITAMBAH (task-breakdown 7.1.1 getProjectReviews/getUserReviews + frontend 7.2 butuh; API spec cuma POST/PUT — task-breakdown menang utk build). No audit (bukan admin action). Files: constants/reviewType, validators/review.validator, repositories/review.repository, services/review.service, modules/review/review.controller, routes/review.routes. build 0; E2E /tmp/p7-e2e.sh 11/11. NEXT = 7.2 frontend (Review Center senior/umkm + My Reviews beginner). Carry-over D-P4.3-3: completion gate reviews bisa diisi di projectLifecycle.requestCompletion.
