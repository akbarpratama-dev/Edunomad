============================================================
⚡ ACTIVE HANDOFF (2026-07-10 #17) — DEPLOY PRODUKSI KOMPLET (Vercel 500 fix + AI aktif) — branch main, pushed
============================================================
Deploy produksi SUDAH LIVE & terverifikasi end-to-end: backend Fly (edunomad-sedulur-papat.fly.dev) ✓, frontend Vercel (edunomad-woad.vercel.app) ✓, diskusi/chat antar-role ✓, AI Gemini ✓.
Sesi ini (D-DEPLOY-3): perbaiki Vercel 500 SEMUA route dinamis — `outputFileTracingRoot` di `frontend/next.config.ts` di-root-kan ke monorepo base (`path.join(__dirname, "..")`) supaya dep hoisted (next/dist/compiled/source-map) ikut ke-bundle. Commit 0f1296b→merge e448763→push→redeploy READY, diskusi 200. + fly.toml app name commit 8d08ff2. + user set Fly secret GEMINI_API_KEY → AI aktif di /profile.

➡️ QUICK ACTION (sisa OPSIONAL, tidak memblokir demo):
1. **(Opsional) Kunci CORS** produksi: `fly secrets set CORS_ORIGIN=https://edunomad-woad.vercel.app -a edunomad-sedulur-papat` (sekarang CORS masih terbuka — aman untuk demo, kunci bila mau production-grade).
2. **Seed data demo expo** ke Supabase PRODUKSI (expo ~13 Jul): pastikan akun demo (password TestPass123!) ada agar responden bisa login. Cek apakah seed sudah dijalankan ke DB produksi.
3. **(Keamanan) Rotate GEMINI_API_KEY** — key sempat ke-paste plaintext di chat sesi ini; ganti di Google AI Studio lalu `fly secrets set` ulang bila transkrip dibagikan.
4. Verifikasi fitur AI lain di produksi bila mau: ranking pelamar (Applicants, butuh pelamar PENDING), rekomendasi portofolio (apply dialog Beginner).

--- (handoff sebelumnya) ---
============================================================
⚡ ACTIVE HANDOFF (2026-07-10 #16) — CODE-REVIEW FIXES + DISKUSI UX + DEPLOY CONFIG FLY.IO/VERCEL (branch main, BELUM commit)
============================================================
Sesi ini di branch `main` (tak buat branch baru — perubahan langsung di working tree, BELUM commit). Semua tsc 0 + Playwright-verified.

✅ SELESAI sesi ini (D-CR-1..3, D-DISKUSI-1, D-DEPLOY-1):
1. /code-review high-effort → 10 findings; diperbaiki 3: PillTabs default "pill" (regresi), ConfirmDialog async+busy, workspaceSummary ForbiddenError non-member.
2. Diskusi UX: MessageButton (Header pojok kanan atas) DIHAPUS + file komponennya dihapus + button "Buka Diskusi" workspace dihapus; Sidebar +"Diskusi Proyek" (resolve proyek live, di bawah "Proyek Saya", non-ADMIN). Playwright-verified.
3. Deploy config Fly.io+Vercel: backend/{Dockerfile, fly.toml always-on, .dockerignore, tsconfig.build.json} + build script + listen 0.0.0.0 + CORS env CORS_ORIGIN + README "Deploy Gratis" section. Terbukti node dist/index.js → /health 200.

➡️ QUICK ACTION (urut):
1. ✅ SUDAH MERGED → main (2026-07-10, PR #1, main = e233405, branch fix/review-diskusi-deploy dihapus). Semua perubahan sesi ini sudah di main + pushed origin.
2. **Deploy** (user — belum dijalankan): backend `cd backend && fly auth login && fly apps create <nama> && fly secrets set DATABASE_URL=.. SUPABASE_URL=.. SUPABASE_SERVICE_ROLE_KEY=.. && fly deploy`; frontend Vercel root=frontend + 3 NEXT_PUBLIC_* (NEXT_PUBLIC_API_URL=https://<app>.fly.dev/api/v1). Lalu `fly secrets set CORS_ORIGIN=https://<vercel>`.
3. **(Opsional) Perbaiki 7 sisa finding review** (prioritas bila mau production-grade):
   - HIGH: partial-cert mid-loop tanpa txn di `artifact.service.generateForCompletion` (pre-validate SEMUA beginner sebelum _issueArtifact, atau bungkus txn).
   - HIGH-UX: withdraw application HILANG — Beginner+Senior dashboard cuma badge read-only; page /applications, /applications/mentor, /reviews DIHAPUS di commit workflow-ux (82b7510). Tambah tombol "Tarik Lamaran" (applicationApi.withdraw / seniorApplication withdraw belum ada di projectApi → cek backend endpoint).
   - MED: completionBlockers requireArtifact default false → legacy requestCompletion (line 179) skip artifact gate; DEMO_COMPLETE_BYPASS di core service (env leak risk).
   - EFISIENSI: N+1 artifact query di workspaceSummary + generateForCompletion (batch findByProject); re-fetch summary tiap ganti tab (fetch on mount + refreshKey).
⚠️ Kalau edit tak terlihat di browser: dev server Next.js basi → kill port 3000 + `rm -rf frontend/.next` + restart. File di disk selalu benar (cek dgn grep/tsc).
⚠️ Dev server frontend jalan di background (log /tmp/edunomad-frontend-dev.log). Test users p4-beginner/senior/umkm + p43-admin @test.edunomad.com pw TestPass123!; project ACTIVE a1a1a1a1-…0005.

--- arsip handoff #15 ---
============================================================
⚡ ACTIVE HANDOFF (2026-07-06 #15) — AI FEATURES (D-AI-1) ✅ SELESAI & HAPPY-PATH VERIFIED. NEXT = commit + merge
============================================================
✅ HAPPY-PATH VERIFIED (Gemini gemini-2.5-flash): ketiga fitur output nyata. Provider MULTI (`services/llm.service.ts`: Groq preferred bila GROQ_API_KEY else Gemini). Default model gemini-2.5-flash (2.0-flash kuota free 0; 2.5 thinking dimatikan + tokens 2048 + strip fence). Ranking demo: proyek …0005 kini punya 2 pelamar PENDING (Beginner Two 85% / Three 30%) + role Frontend …051 dikasih required skills JS/React/TS (data demo — cleanup bila mau DB bersih). NEXT = commit branch feature/ai-matching + merge. ⚠️ user pakai GEMINI_API_KEY (auth-key format AQ.*), key ada di backend/.env.
--- detail build di bawah ---
Branch `feature/ai-matching` (dari commit portofolio ece0e95). Tugas dosen "Penggunaan AI". Plan disetujui (plan mode): /Users/muhammadakbarpratama/.claude/plans/encapsulated-juggling-dijkstra.md.

✅ DIBANGUN & fallback-verified (tsc 0 backend+frontend): 3 fitur Gemini gemini-2.0-flash (LLM structured-JSON Explainable, cache tabel `ai_insights`, gracefully-degrading, NO embeddings/pgvector/queue/bg-job):
- Candidate Ranking `GET /projects/:id/applicants/ranking` (SENIOR lead) — skor+matched/missing+alasan pelamar PENDING, batch. UI applicants page: toggle "Urutkan berdasarkan kecocokan AI" + MatchScoreBadge + blok "Analisis AI" + Perbarui peringkat + fallback.
- Portfolio Recommendation `GET /projects/:id/portfolio-recommendation` (BEGINNER own) — UI apply dialog PortfolioRecPanel.
- Professional Summary `GET /users/{me,:id}/ai-summary` — UI ProfileView AiSummaryCard (non-UMKM).
Backend: config/env (SOFT key) + gemini.service (fetch+AiUnavailableError) + aiInsight.service (cachedInsight+zod) + aiInsight.repository + constants/aiInsightKind + modules/ai/ai.controller + validators/ai.validator + routes project/user + schema AiInsight + migration `20260706160000_ai_insights` LIVE + _prisma_migrations synced + prisma generate. Frontend: aiApi + components/ai/{AiUnavailable,MatchScoreBadge,AiSummaryCard,PortfolioRecPanel}.
Verified: curl no-key → available:false reason jelas; RBAC beginner→ranking 403, senior→portfolio-rec 403; Playwright /profile AiSummaryCard fallback mulus, profil utuh.

➡️ QUICK ACTION (urut):
1. **User isi `GEMINI_API_KEY=...` di `backend/.env`** (gratis: aistudio.google.com/apikey). Restart backend. Cek GET /users/me/ai-summary (beginner) → available:true.
2. **Buat 1 pelamar PENDING** di proyek …0005 (skrg 0, sudah di-accept) utk demo ranking: login p43-b2/p43-b3 → apply role, atau via API/DB.
3. **Happy-path** curl+Playwright 3 fitur; cek cache (2x → cached:true; ?regenerate=true → cached:false; row ai_insights).
4. Commit (Conventional + Co-Authored-By Claude Opus 4.8). Pertimbangkan merge portofolio(ece0e95)+AI → main.
⚠️ AI additive: key salah/AI down → HTTP 200 available:false (bukan 5xx), inti rekrutmen utuh. Context7 sebelum ubah kode Gemini. Test users p4-* + p43-* @test.edunomad.com pw TestPass123!.

--- arsip handoff #14 (Portofolio, SUDAH di-commit ece0e95) ---
============================================================
⚡ ACTIVE HANDOFF (2026-07-06 #14) — PORTFOLIO (fold ke PROFIL) + PROFILE CONNECTIVITY SELESAI (commit ece0e95). NEXT = commit + merge → main, lalu PHASE 11 QA/RLS
============================================================
Branch `feature/portfolio-profile-connectivity` (dari main df2b5e8). D-P13-1 lalu DIREVISI D-P13-2 (user minta portofolio jadi sub-section profil, BUKAN halaman terpisah). BELUM di-commit — working tree.

⚠️ REVISI FINAL (D-P13-2): TIDAK ada halaman/endpoint `/portfolio/:id` publik (dibangun lalu dihapus hari yg sama). Portofolio = tab "Sertifikat" DI DALAM profil (`/profile`, `/users/:id`), kartu kaya + modal Preview. Data via `GET /users/:id/profile-overview` (artifacts diperkaya lewat `portfolio.service.buildPortfolioArtifacts`). File final yg ADA: backend {services/portfolio.service.ts [buildPortfolioArtifacts], services/user.service.ts [pakai builder], repositories/artifact.repository.ts [+listPortfolioArtifacts]}; frontend {components/common/ProfileLink.tsx, components/portfolio/PortfolioPreviewDialog.tsx, services/portfolioApi.ts [types+durationWeeks saja], +wiring}. File yg DIHAPUS: app/portfolio/*, components/portfolio/PublicPortfolioView.tsx, backend modules/portfolio + routes/portfolio.routes + validators/portfolio.validator.

✅ SELESAI & verified: Menutup gap konektivitas lintas-role (audit user). 
- **Profile connectivity (#1):** `frontend/src/components/common/ProfileLink.tsx` (+`profileHref`) → nama/avatar klik ke `/users/:id`. Wired: ProjectMembersPanel, projects/[id]/applicants (my-projects/applicants = re-export, ikut), projects/[id]/manage (senior applicant), reviews page, ProfileView reviews tab, DiscussionFeed author, artifacts/[projectId] Team.
- **Public portfolio (#2, membalik D-P8-5):** backend module `portfolio` — `GET /portfolio/:userId` PUBLIC (services/portfolio.service.ts, modules/portfolio/portfolio.controller.ts, routes/portfolio.routes.ts, validators/portfolio.validator.ts, +artifact.repository.listPortfolioArtifacts). Mount di routes/index.ts. NO migration. Return user publik(no email/phone)+stats+artifacts[rich]. Verified curl 200/404/400.
- **Frontend portfolio:** `components/portfolio/PortfolioPreviewDialog.tsx` (modal "Preview di Portofolio" dari gambar user + `qrcode.react`@4.2.0 QR), `components/portfolio/PublicPortfolioView.tsx`, `app/portfolio/[id]/page.tsx` (PUBLIC no AuthGuard), `services/portfolioApi.ts`. Kartu /artifacts += "Preview di Portofolio" + tombol dead lama kini live.
- tsc 0 (backend+frontend). Playwright: public page /portfolio/:id + modal render benar (Test Beginner, EDN-2026-000001), team → /users/:id, QR → /verify. Console 0 err.
- CLAUDE.md OUT OF SCOPE diamandemen (Public Portfolio Pages NOW IN SCOPE, D-P8-5→D-P13-1). CV PDF tetap out.

➡️ QUICK ACTION berikutnya (urut):
1. `git add -A && git commit` (Conventional Commit, Co-Authored-By Claude) di branch feature/portfolio-profile-connectivity.
2. Merge → main (--no-ff) + push origin/main (repo private). Pertimbangkan buka PR.
3. Lanjut **PHASE 11 — QA menyeluruh + review RLS pra-produksi** (RLS masih off ~semua tabel kecuali discussion+notifications; endpoint /portfolio publik baca via Express — aman tapi catat di review RLS).
Test fixtures: p4-beginner/senior/umkm + p43-admin @test.edunomad.com pw TestPass123!; siap-tes portofolio-in-profil: login p4-beginner → `/profile` tab "Sertifikat" → kartu → "Preview" (artifact EDN-2026-000001, user 18318fbf-9e1a-497b-9ed7-9cd9e2a5a2e6); project a1a1a1a1-…0005. (URL lama /portfolio/:id sekarang 404 — memang dihapus.)
⚠️ Servers dev backend(3001)+frontend(3000) MASIH NYALA di akhir sesi (background). Matikan bila perlu.

--- arsip handoff #13 ---
============================================================
⚡ ACTIVE HANDOFF (2026-07-04 #13) — PHASE 9 MERGED → main. NEXT = PHASE 10 Profiles & Polish
============================================================
main = **01fcbe7** (Phase 0–9 + PHASE 12, semua MERGED --no-ff & PUSHED origin/main). Branch feature/phase-9-notifications sudah masuk main (WIP lokal, tak pernah di-remote).

✅ PHASE 9 Notifications SELESAI & verified: notification module (repo/service/controller/routes GET /notifications, POST /:id/read, POST /read-all) + 10 trigger site (application/deliverable/contribution/review/verification/project/lifecycle/artifact/member, fire-and-forget) + Realtime (RLS SELECT-only own + publication `notifications`, backend/db/phase9_notifications_rls_realtime.sql) + frontend NotificationBell (dropdown header) + NotificationProvider (layout: bootstrap+subscribe+toast) + /notifications page. NO migration. E2E: realtime badge live, mark-all, trigger REVIEW_RECEIVED nyata. CATATAN: notifications.updated_at NOT NULL tanpa default → raw SQL insert wajib set updated_at (Prisma isi otomatis).

➡️ NEXT = **PHASE 10 — Dashboards, Profiles & Polish** (task-breakdown §10). SISA:
(1) Profil: /profile, /profile/edit (PUT /users/me SUDAH ADA), /users/:id (GET /users/:id + /users/:id/portfolio SUDAH ADA).
(2) Portofolio publik /portfolio/:id (D-P8-5, tombol placeholder sudah nempel) — perlu GET /portfolio/:userId PUBLIC (belum) + halaman + hapus "Public Portfolio Pages" dari CLAUDE.md OUT OF SCOPE saat dibangun.
(3) Static/error: /help /privacy /terms + not-found.tsx + error.tsx + /auth/forgot-password (quick-win 404).
(4) Admin: /admin/projects/monitoring + senior replacement.
Lalu Phase 11 QA + review RLS pra-prod (RLS off ~semua tabel kecuali discussion+notifications).

--- arsip handoff #12 ---
============================================================
⚡ ACTIVE HANDOFF (2026-07-02 #12) — PHASE 8 MERGED → main. NEXT = PHASE 9 Notifications
============================================================
main = **d9a50e4** (Phase 0–8 + PHASE 12 + auth-fix + routing, semua MERGED --no-ff & PUSHED origin/main). Branch `feature/phase-8-artifacts-v2` + `fix/auth-register-bounce-routing` sudah masuk main → boleh `git branch -d`.

✅ PHASE 8 Artifact System SELESAI & merged: generate/regenerate(version history)/verify-public/download-stream + bucket privat `artifacts` + completion gate WF15 (D-P4.3-3 tutup). Redesign /artifacts (pipeline derived VERIFIED/READY/IN_PROGRESS) + detail /artifacts/[projectId] + workspace tab Sertifikat + /admin/artifacts. Project image (`projects.image_url` + bucket publik `project-images` + upload wizard). Auth register-bounce fix + routing reverse-back Mahasiswa. D-AUTH-2, D-ROUTE-1, D-P8-1..5.
⚠️ Portofolio publik DITUNDA (D-P8-5): tombol placeholder `<Link /portfolio/:id>` saja, halaman+backend belum dibuat; "Public Portfolio Pages" tetap OUT OF SCOPE (dibangun di Phase 10/phase tersendiri).

➡️ NEXT = **PHASE 9 — Notifications & Real-time** (task-breakdown §9). SISA: (1) backend Notification module — notification.service (create + list + mark-read), controller, routes (GET /notifications, POST /notifications/:id/read, POST /notifications/read-all), + integrate TRIGGERS di flow existing (lamaran diterima/ditolak, member removed, deliverable review, contribution approved, review diterima, project completed, artifact terbit). Tabel `notifications` sudah ada (schema 0.2.11). (2) frontend: Header bell + dropdown (unread badge sudah ada di Header/notificationStore), halaman /notifications (nav item sudah ada, page 404). (3) Supabase Realtime subscribe notifications INSERT (pola sama Phase 5 discussion RLS/Realtime). Baca schema Notification + WF (notif points di tiap workflow) + RBAC (user lihat notif sendiri). Test: p4-beginner/senior/umkm + p43-admin pw TestPass123!; project ACTIVE a1a1a1a1-…0005.

--- arsip handoff #10 (Phase 12, SELESAI & merged) ---
============================================================
⚡ ACTIVE HANDOFF (2026-06-28 #10) — PHASE 12 Discussion Forum Upgrade (12.1–12.5 SELESAI, merged 2026-07-01)
============================================================
main saat kerja = b821b5c. Branch `feature/phase-10-discussion-forum` (merged → main 578be6a 2026-07-01). D-P12-1: user otorisasi FULL forum upgrade (override locked "no attachments MVP").

✅ 12.1 (title+category+pin) SELESAI & verified E2E. Migration `phase12_discussion_forum_metadata` di LIVE DB (discussions += title/category/is_pinned) + prisma history sync. Backend: constants/discussionCategory; create wajib title+category (senior lead/UMKM owner); list pinned-first; POST /discussions/:id/pin. Frontend Diskusi tab: dialog create, filter chips kategori real, badge+judul, toggle pin. Docs 03/04/06/07 + task-breakdown amended. backend build 0, tsc 0, console 0, DB persist confirmed.

➡️ LANJUTKAN sub-phase berikut (urut), tiap irisan: migration via Supabase MCP apply_migration + record di _prisma_migrations (checksum sha256) + prisma generate; backend layered; frontend wiring; verify E2E + tsc/build 0; commit. Cek task-breakdown §PHASE 12.
- ✅ **12.2 Threaded Replies DONE & verified** (2026-07-01, D-P12-4): parent_id self FK (migration phase12_2_threaded_replies LIVE+_prisma_migrations); backend (validator/repo/service one-level/controller); DiscussionFeed Bubble+nested+inline Balas; discussionApi sendMessage(+parentId). E2E browser OK, build/tsc/console 0.
- ✅ **12.3 Reactions DONE & verified** (2026-07-01, D-P12-5): message_reactions (+discussion_id denormal, RLS, publication); toggle endpoint POST /discussions/messages/:messageId/reactions; feed chips+picker+realtime. E2E OK, build/tsc/console 0.
- ✅ **12.4 Attachments DONE & verified** (2026-07-01, D-P12-6): bucket privat discussion-attachments + tabel discussion_attachments; signed upload/download; composer file/image fungsional; render IMAGE/FILE/LINK. E2E upload OK, build/tsc/console 0. (LINK type backend-ready; UI tautan khusus defer.)
- ✅ **12.5 Views DONE & verified** (2026-07-01, D-P12-7): discussion_views unique; recordView idempotent; POST /discussions/:id/view; header "X dilihat". E2E OK.
- ✅✅ **PHASE 12 SELESAI (12.1–12.5).** ➡️ NEXT = **MERGE feature/phase-10-discussion-forum → main** (cek page.tsx landing M sejak lama: ikut/skip). Lalu Phase 8 Artifact (WIP feature/phase-8-artifacts).
- **12.3 Reactions**: tabel baru `message_reactions` (message_id, user_id, emoji; unique). Toggle endpoint + count di feed + realtime.
- **12.4 Attachments**: tabel `discussion_attachments` (message_id, type FILE|IMAGE|LINK, url, file_path, file_name, file_size) + Supabase Storage bucket + signed upload + RLS; simpan URL/path saja (FILE STORAGE rule). Override "no attachments MVP" (sudah di-amandemen di docs). Frontend composer toolbar attach/image kini fungsional (ganti placeholder "Segera hadir").
- **12.5 Views**: tabel `discussion_views` (discussion_id, user_id; unique). POST /discussions/:id/view; tampilkan unique view count.
Setelah semua: merge feature/phase-10-discussion-forum → main. Test: p4-senior/umkm/beginner + p43-admin pw TestPass123!; project ACTIVE a1a1a1a1-…0005 (sudah ada diskusi "Review Landing Page Minggu Ini"/MENTOR_REVIEW pinned).
⚠️ tsc TS2882 CSS-ambient = transient saat .next/types regen → settle ~2s, re-run.

--- arsip handoff #9 ---
============================================================
⚡ ACTIVE HANDOFF (2026-06-28 #9) — RESUME PHASE 8 ARTIFACT (unify-UI sweep SELESAI)
============================================================
main = ee0f045 (Phase 0–7 + unify-UI sweep penuh: semua halaman authed satu bahasa desain premium). Tidak ada branch unify aktif lagi — `redesign/unify-ui` sudah merged habis ke main (batch 1–6).

✅ UNIFY-UI SWEEP SELESAI & merged ke main (D-UI-11). Primitive bersama: `ui/card.tsx`, `common/PageHeader.tsx`, NEW `common/PillTabs.tsx` (navy-fill active chip + counts), `common/EmptyState.tsx` premium. Halaman yang dipremium-kan: batch2 applications/mentor/reviews (e4b4a57); batch3 projects/[id] 2-col + ProjectDetailView + workspace PillTabs (994276e); batch4 manage/applicants/create wizard (02be61c); batch5 admin review/verification/audit (9924ab0); batch6 my-projects UMKM (ee0f045). Auth /auth/* tak disentuh. Tiap batch tsc 0 + browser-verified + console 0 err.
   ⚠️ Catatan tooling: tsc kadang transiently lempar TS2882 (CSS ambient: globals.css / lenis.css) saat dev server lagi regen `.next/types`. Bukan error nyata — tunggu ~2s, re-run `npx tsc -p frontend/tsconfig.json --noEmit` → EXIT 0.

➡️ NEXT = RESUME **PHASE 8 — Artifact System**. WIP ada di branch `feature/phase-8-artifacts` commit 1e6a4a3 (sudah: pdfkit/qrcode deps + `artifactPdf.service` + `artifact.repository`). Cabang itu dibuat dari main LAMA — pertimbangkan rebase ke main ee0f045 dulu (atau cherry-pick). SISA pekerjaan:
   1. Backend: artifact.service + controller + routes (endpoints: POST /projects/:id/generate-artifacts, POST /artifacts/:id/regenerate, GET /artifacts/:id, GET /artifacts/:id/download, GET /verify/:code). Wire ke routes/index.ts.
   2. Completion gate (carry-over D-P4.3-3): isi `projectLifecycle.service.requestCompletion` — semua deliverables APPROVED + contributions APPROVED + reviews ada + artifacts generated sebelum ACTIVE→AWAITING_COMPLETION (Workflow 15). Reviews/deliverables/contributions sudah ada; tinggal artifacts.
   3. Frontend: 4 page (label user-facing "Sertifikat" D-UI-7; nav item /artifacts sudah ada tapi page belum dibuat) — pakai pola premium baru (PageHeader/PillTabs/Card/EmptyState/app-reveal).
   Baca task-breakdown §8 + schema Artifact/ArtifactVersion (immutable, sudah ada → kemungkinan NO migration) + API Artifacts + RBAC (siapa generate) + Workflow 13/14/18 (artifact per-beginner saat/setelah completion + verifikasi publik via /verify/:code).
   Test fixtures: p4-beginner/senior/umkm + p43-admin @test.edunomad.com pw TestPass123!; project ACTIVE a1a1a1a1-0000-4000-8000-000000000005.

--- arsip handoff #7 (Phase 7) ---
============================================================
⚡ ACTIVE HANDOFF (2026-06-25 #7) — PHASE 7 SELESAI (7.1 backend + 7.2 frontend), branch `feature/phase-7-reviews`
============================================================
main = 1fc2b7e (Phase 0–6 + UI redesign + perf-fix + label Sertifikat). Tag restore `ui-restore-2026-06-25`. Branch feature/phase-7-reviews = Phase 7 lengkap.

✅ DONE & VERIFIED — **PHASE 7.2 FRONTEND** (Reviews & Ratings, Workflow 12):
- `services/reviewApi.ts` (service object): listForProject (GET /projects/:id/reviews), listForUser (GET /users/:id/reviews), reviewBeginner (POST /projects/:id/reviews/beginner), reviewSenior (POST /projects/:id/reviews/senior), update (PUT /reviews/:id). Types ProjectReview + UserReview.
- `components/review/StarRating.tsx`: reusable 1–5 star (onChange = interactive radiogroup; none = read-only).
- `components/workspace/ReviewTab.tsx`: role-adaptive Review Center. SENIOR lead → review tiap ACTIVE beginner member; UMKM owner → review beginners + senior (target ekstra); BEGINNER/reviewee → read-only review diterima (filter project reviews by revieweeId==me). Submit gated ke project ACTIVE. Existing review → display+Edit; none → star picker + Kirim Review.
- `app/reviews/page.tsx`: My Reviews (BEGINNER-only AuthGuard), GET /users/me/reviews lintas-proyek + kartu rata-rata + link proyek.
- Wired "Review" tab di workspace + nav "Review Saya"→/reviews (BEGINNER).
- VERIFIED browser (project a1a1a1a1-…0005): senior (Test Beginner sudah-dinilai 4/5 + submit baru Beginner Two 5/5), UMKM (senior-target render + sudah-dinilai 5/5), beginner (/reviews avg 4.0 + tab read-only). tsc 0 err. D-P7-2.

➡️ NEXT = **PHASE 8 — Artifact System** (task-breakdown §8). UI label user-facing = "Sertifikat" (D-UI-7, nav item "Sertifikat"→/artifacts sudah ada tapi /artifacts page BELUM dibuat). Baca task-breakdown §8 + schema Artifact/ArtifactVersion (immutable, no updatedAt) + API Artifacts + RBAC (siapa generate artifact — senior/sistem) + Workflow (artifact per-beginner saat/ setelah completion). Cek schema.prisma model Artifact/ArtifactVersion (sudah ada migration init_contributions_artifacts_reviews_domain → kemungkinan NO migration). Cabang `feature/phase-8-artifacts` dari main SETELAH merge feature/phase-7-reviews→main.
**Carry-over D-P4.3-3 (sekarang waktunya):** isi completion-readiness gate di `projectLifecycle.service.requestCompletion` — all deliverables APPROVED + all contributions APPROVED + reviews ada + artifacts generated, sebelum izinkan ACTIVE→AWAITING_COMPLETION (Workflow 15). Sekarang reviews+deliverables+contributions semua ADA, tinggal artifacts (Phase 8) → gate bisa dibangun lengkap di Phase 8.
⚠️ Sebelum Phase 8: MERGE feature/phase-7-reviews→main (PR / merge --no-ff), lalu cabang feature/phase-8-artifacts. Konfirmasi ke user kalau ragu. Notifications = Phase 9.
⚠️ Test project a1a1a1a1-…0005 ACTIVE: skrg ada 4 review (senior→2 beginner, umkm→beginner, umkm→senior). pw TestPass123!.

--- arsip handoff #6 (Phase 7.1 backend) ---
============================================================
⚡ ACTIVE HANDOFF (2026-06-25 #6) — PHASE 7.1 backend SELESAI, branch `feature/phase-7-reviews`
============================================================
main = 1fc2b7e (Phase 0–6 + UI redesign + perf-fix [single /auth/me + local JWKS verify] + label Artifact→Sertifikat, semua merged). Tag restore `ui-restore-2026-06-25`.

✅ DONE & VERIFIED — **PHASE 7.1 BACKEND** (Reviews & Ratings WF12), pushed:
- Endpoints: POST /projects/:id/reviews/beginner (SENIOR|UMKM), POST /projects/:id/reviews/senior (UMKM), PUT /reviews/:id, GET /projects/:id/reviews, GET /users/:id/reviews.
- Pairs SENIOR→BEGINNER/UMKM→BEGINNER/UMKM→SENIOR, rating 1-5, anti-dup (one per project,reviewer,reviewee), editable selama project≠COMPLETED (isEdited/editedAt), reviewee=ACTIVE member, project ACTIVE. Type diturunkan dari reviewer (senior lead vs umkm owner). No migration. E2E /tmp/p7-e2e.sh 11/11. D-P7-1.

➡️ BELUM — **PHASE 7.2 FRONTEND** (sesi berikut): 7.2.1 Review Center (senior & umkm): list anggota tim utk di-review + form star-rating(1-5)+komentar + lihat/edit review submitted. 7.2.2 My Reviews (beginner): lihat review diterima (rating bintang, nama reviewer, komentar, project). Bikin reviewApi (pola service object). Bisa jadi tab "Review" di workspace ATAU page /reviews — ikut UI spec/pola workspace. Ikut DESIGN.md (PageHeader/Card/token semantic/app-reveal/contrast-law hijau #5f8c00). Notifications=Phase 9.
Carry-over D-P4.3-3: completion gate (deliverables+contributions+reviews APPROVED/ada) bisa diisi di projectLifecycle.service.requestCompletion. NEXT phase = Phase 8 Artifact System (label UI = "Sertifikat", D-UI-7).
⚠️ Branch feature/phase-7-reviews sudah push. Test project a1a1a1a1-…0005 ACTIVE sudah ada 3 review (senior→beginner, umkm→beginner, umkm→senior) dari E2E. pw TestPass123!.

--- arsip handoff #5 (Phase 6) ---
main = db743b8 (Phase 0–5 + UI redesign merged). Tag restore `ui-restore-2026-06-25`.

✅ DONE & VERIFIED — **PHASE 6.3 FRONTEND** (ca8ee8d): deliverableApi + contributionApi; DeliverablesTab (beginner create/edit DRAFT, submit/resubmit evidence LINK dynamic inputs, feedback callout; senior lead review INLINE Setujui/Minta Revisi+feedback — D-P6-3, bukan page terpisah); ContributionTab (beginner own report summary+skill chips one-per-project; senior list+approve); tab "Deliverables"+"Kontribusi" di /projects/[id]/workspace. File-upload evidence (Supabase Storage) DITUNDA — LINK dulu (FILE backend ready). tsc 0; browser full loop verified (create→submit→request-revision→feedback tampil; contribution+skills).

➡️ NEXT = **PHASE 7 Reviews & Ratings** (task-breakdown §7). Cabang `feature/phase-7-reviews` SETELAH merge feature/phase-6-deliverables→main. Baca task-breakdown §7 + schema reviews + API + RBAC + Workflow. Carry-over (D-P4.3-3): completion-readiness gate (all deliverables+contributions+reviews+artifacts APPROVED) bisa diisi di projectLifecycle.service.requestCompletion saat Phase 7/8. Sisa polish UI (create wizard/admin) opsional.
⚠️ Branch feature/phase-6-deliverables sudah push (6.1+6.2+6.3). Pertimbangkan merge→main + buka PR.

--- arsip handoff #4 (Phase 6 backend) ---

✅ DONE & VERIFIED — **PHASE 6.1+6.2 BACKEND** (Deliverables & Contributions, WF8/9), pushed:
- Endpoints LIVE: GET/POST /projects/:id/deliverables; PUT /deliverables/:id; POST /deliverables/:id/{submit,approve,request-revision}; GET/POST /projects/:id/contributions; PUT /contributions/:id; POST /contributions/:id/approve.
- Deliverable WF8: create=BEGINNER active member+project ACTIVE→DRAFT; submit (DRAFT|REVISION_REQUESTED→SUBMITTED, evidences LINK url/FILE file_path, replace tiap submit); senior lead approve/request-revision (hanya dari SUBMITTED). Feedback revisi → audit log (no schema column, D-P6-1) + di-surface sbg `revisionFeedback` di GET list.
- Contribution WF9: submit=BEGINNER active member+ACTIVE, ONE per beginner→PENDING+skills; senior lead approve→APPROVED+reviewedBy.
- Files: constants/deliverableStatus, validators/{deliverable,contribution}.validator, repositories/{deliverable,contribution}.repository, services/{...}.service, modules/{...}/controller, routes/{deliverable,contribution}.routes. auditActions += 3 action + 2 entity. projectMember.repo += isActiveMember.
- VERIFIED: build 0 err; E2E /tmp/p6-e2e.sh **24/24** (lifecycle penuh + gate 403/422/400 + feedback + evidences/skills). No migration (model udah ada).

➡️ BELUM — **PHASE 6.3 FRONTEND** (sesi berikut): tab Deliverables di workspace (beginner: create/submit+evidence link, lihat feedback, resubmit), Deliverable Review page senior (/projects/:id/deliverables/:did/review approve/request-revision), Contribution report page (beginner) + review (senior). Reuse AppShell/AuthGuard/apiClient + service object → bikin deliverableApi + contributionApi. Tambah tab "Deliverables" + "Kontribusi" di workspace (/projects/[id]/workspace) yg tadi di-skip. File upload evidence (Supabase Storage) bisa ditunda — mulai dgn evidence LINK dulu. Ikut DESIGN.md (PageHeader, card, semantic token, app-reveal, contrast-law: chartreuse fill only, link hijau #5f8c00).
Catatan: completion-readiness gate (D-P4.3-3) masih TODO — bisa diisi (all deliverables+contributions APPROVED) di projectLifecycle.service.requestCompletion. NEXT phase setelah 6.3 = Phase 7 Reviews & Ratings.
⚠️ Test project a1a1a1a1-…0005 ACTIVE (beginner p4-beginner+p43-b2 members, b3 nonmember, senior p4-senior, umkm p4-umkm), pw TestPass123!. Sudah ada 1 deliverable APPROVED + 1 contribution APPROVED dari E2E.

--- arsip handoff #3 (Phase 5, DONE & merged) ---
redesign/app-ui merged ke main (84127ce). Branch feature/phase-5-workspace = Phase 5 lengkap & VERIFIED.

✅ DONE & VERIFIED — **Phase 5.2 FRONTEND** (commit terbaru):
- services/discussionApi.ts; components/workspace/{ChatPanel,DiscussionTab,DirectMessageDialog}.tsx; app/projects/[id]/workspace/page.tsx (tabs Ringkasan|Milestone|Diskusi|Anggota); "Buka Workspace" entry di detail page (ACTIVE/AWAITING).
- ChatPanel: Supabase Realtime subscribe (postgres_changes INSERT, filter discussion_id) → re-pull list (D-P5-4); kirim via Express; realtime.setAuth utk RLS. Dipakai group + DM.
- DM via Members tab launcher (find-or-get); conversation-list ditunda (belum ada GET /direct-chats di 5.1).
- Deliverables/Reviews/Artifacts tab TIDAK dibangun (Phase 6/7/8). Notifications TIDAK (Phase 9).
- VERIFIED browser (login p4-senior, project a1a1a1a1-…0005): workspace render, kirim via Express jalan, REALTIME live (pesan beginner via API muncul di tab senior tanpa refresh), DM dialog find-or-get + history. tsc 0 err.

➡️ NEXT = **PHASE 6 — Deliverables & Contributions** (task-breakdown §6). Cabang baru `feature/phase-6-*` dari main SETELAH feature/phase-5-workspace di-merge ke main (atau lanjut sesuai preferensi). Catatan carry-over Phase 4.3: completion-readiness gates (deliverables/contributions/reviews/artifacts, Workflow 15) nyusul di phase pemiliknya — Phase 6 mulai isi gate deliverables/contributions di projectLifecycle.service.requestCompletion (D-P4.3-3).
⚠️ Branch feature/phase-5-workspace SUDAH di-push (5.1). Push lagi commit 5.2 + memory. Pertimbangkan merge → main + buka PR.

--- arsip: Phase 5.1 backend (DONE & VERIFIED) ---
- 5.1.1/5.1.2 services: discussion.service (group) + directMessage.service (DM). 5.1.3 controllers+routes. 5.1.4 RLS+Realtime.
- 5.1.1/5.1.2 services: discussion.service (group) + directMessage.service (DM). 5.1.3 controllers+routes. 5.1.4 RLS+Realtime.
- Endpoints LIVE (semua auth): GET/POST /projects/:id/discussions; GET/POST /discussions/:id/messages; POST /users/:id/direct-chat; GET/POST /direct-chat/:id/messages.
- Files baru: constants/discussionType.ts, validators/discussion.validator.ts, repositories/discussion.repository.ts, services/discussion.service.ts, services/directMessage.service.ts, modules/discussion/discussion.controller.ts, modules/directMessage/directMessage.controller.ts, routes/discussion.routes.ts, routes/directChat.routes.ts; wired ke routes/index.ts + project.routes.ts (+/:id/discussions) + user.routes.ts (+/:id/direct-chat). RLS SQL di backend/db/phase5_discussions_rls_realtime.sql.
- Aturan: group create = senior lead / UMKM owner saja (beginner "join"), senior auto-include; akses discussion = baris discussion_members; DM = hanya antar user yg share project context (D-P5-3); title TIDAK dipersist (D-P5-1, schema menang).
- RLS (D-P5-2, RLS PERTAMA di project): writes lewat Express (Prisma bypass RLS), client baca live read-only via Realtime, policy SELECT-only via SECURITY DEFINER is_discussion_member(). auth.uid()==users.id.
- VERIFIED: backend build 0 err; E2E /tmp/p5-e2e.sh = **14/14 PASS** (group+DM, semua gate 403/422, pagination) — tetap 14/14 SETELAH RLS aktif (bukti Prisma bypass). RLS client path: member lihat 4 baris, outsider 0, anon []. Test fixtures: project ACTIVE `a1a1a1a1-0000-4000-8000-000000000005` (umkm=p4-umkm, senior=p4-senior, members=p4-beginner+p43-b2; p43-b3=outsider).

(Phase 5.2 frontend SUDAH selesai — lihat blok #3 di atas.)

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
