# Development Log

2026-07-11 (Vacancy UX + UMKM keluar diskusi + tab underline + rename Hasil Kerja + fix sidebar — main merge 246b277, DEPLOYED)
6 perubahan (D-VACANCY-1, D-DISKUSI-2, D-UI-TABS-1, D-UI-BADGE-1, D-UI-LABEL-1, D-BUG-SIDEBAR-1). Detail di current-status.md + decisions.md. Vacancy: UMKM/mentor ProfileLink + tombol "Lihat Profil UMKM" + "Kamu sudah apply" (PENDING). UMKM dikeluarkan dari diskusi (backend 403 + frontend guard/hidden, docs 06/07). PillTabs default→underline. Badge tab refresh on focus (semantik dipertahankan). Deliverable→Hasil Kerja (display-only). Sidebar diskusi highlight fix. VERIFIED Playwright lokal 3 role (UMKM/senior/beginner) + DEPLOYED: Vercel 246b277 READY (smoke 200), Fly backend redeploy /health 200. Sisa: 1 lamaran uji p4-senior di c18fe438 (delete diblokir). backend/frontend build 0.

2026-07-10c (Deploy produksi komplet — Vercel 500 fix + AI aktif — D-DEPLOY-3, branch main, pushed)
Diagnosa via Vercel MCP (get_runtime_logs): route dinamis `ƒ` (mis. /my-projects/:id/workspace/diskusi) 500 dgn `Cannot find module 'next/dist/compiled/source-map'` — bukan bug re-export (itu D-DEPLOY-2), tapi `outputFileTracingRoot` salah root. Monorepo npm-workspaces hoist dep ke ROOT, tapi config pin ke `frontend/` → tracer lewatkan `../node_modules` → file lazy source-map drop dari bundle serverless. Fix `frontend/next.config.ts`: `path.join(__dirname, "..")`. Context7 /vercel/next.js (output monorepo caveats). Verified: build 0; page+next-server .nft.json trace `../../node_modules` + source-map=true. Commit 0f1296b → merge e448763 → push main → Vercel redeploy dpl_29UY7weo READY; curl diskusi (my-projects+projects) = 200 di produksi. + backend/fly.toml app name → edunomad-sedulur-papat (commit 8d08ff2). + AI Gemini aktif produksi: user set Fly secret GEMINI_API_KEY (rolling restart 2 mesin sukses) → /profile AI card jalan (user konfirmasi). Diskusi/chat antar-role juga dikonfirmasi berfungsi. Sisa opsional: kunci CORS + seed demo expo ke Supabase produksi.

2026-07-09/10 (Code review fixes + Diskusi UX + Deploy Fly.io/Vercel — D-CR-1..3, D-DISKUSI-1, D-DEPLOY-1, branch main, belum commit)
Sesi 3 bagian. (1) /code-review high-effort (8 finder agent + verifier, diff HEAD~1 38 file) → 10 findings; diperbaiki 3 teratas: PillTabs default "pill", ConfirmDialog async+busy, workspaceSummary ForbiddenError non-member. 7 sisa ditunda. (2) Diskusi UX: hapus MessageButton (Header→dihapus komponennya) + button "Buka Diskusi" workspace; tambah Sidebar "Diskusi Proyek" (resolve proyek live, di bawah Proyek Saya via Fragment). Root-cause "user tak lihat perubahan" = dev server Next.js basi → kill+rm .next+restart; Playwright-verified p4-beginner (header bersih, sidebar order benar, klik→diskusi, 0 err). (3) Deploy: Dockerfile+fly.toml (always-on)+.dockerignore+tsconfig.build.json (exclude seed), build script + listen 0.0.0.0 + CORS env, README section. Terbukti node dist/index.js → /health 200. tsc 0 (build config). Context7: Fly.io /superfly/docs.

2026-07-06d (AI Features — Google Gemini — D-AI-1, branch feature/ai-matching)
Tugas dosen "Penggunaan AI". Plan mode → disetujui. 3 fitur LLM (Gemini gemini-2.0-flash, structured JSON, Explainable, cache DB, gracefully-degrading). Context7 Gemini REST dulu (v1beta generateContent, header x-goog-api-key, responseMimeType application/json).
- BACKEND: `config/env.ts` +geminiApiKey/geminiModel/aiEnabled (SOFT). `services/gemini.service.ts` (fetch + AbortController 12s + AiUnavailableError utk semua kegagalan). `services/aiInsight.service.ts` (recommendPortfolio/rankApplicants/summarizeProfile + `cachedInsight`: sha256 inputs → findFresh → generateJson → zod validate/clamp → upsert; batch prompt utk ranking; truncation input). `repositories/aiInsight.repository.ts` (findFirst + find-then-update/create — Prisma compound-unique tolak null projectId). `constants/aiInsightKind.ts`. `modules/ai/ai.controller.ts` (4 handler, envelope AiResult selalu 200). `validators/ai.validator.ts` (regenerate). Routes: project.routes (+/:id/applicants/ranking SENIOR, +/:id/portfolio-recommendation BEGINNER) + user.routes (+/me/ai-summary, +/:id/ai-summary). schema.prisma +model AiInsight (+back-relation User/Project). Migration `20260706160000_ai_insights` (tabel + CHECK + UNIQUE NULLS NOT DISTINCT) apply via Supabase MCP + _prisma_migrations synced (checksum b8832b5a…) + prisma generate.
- FRONTEND: `services/aiApi.ts` (AiResult<T> + 3 method). `components/ai/{AiUnavailable,MatchScoreBadge,AiSummaryCard,PortfolioRecPanel}.tsx`. Wiring: `projects/[id]/applicants/page.tsx` (fetch ranking terpisah/paralel — tak blokir daftar; toggle "Urutkan berdasarkan kecocokan AI"; per kartu PENDING MatchScoreBadge + blok "Analisis AI" matched/missing/reason; tombol "Perbarui peringkat"; fallback banner). `projects/[id]/page.tsx` apply dialog += PortfolioRecPanel (enabled saat dialog buka). `ProfileView.tsx` += AiSummaryCard (non-UMKM).
- VERIFY: tsc 0 backend+frontend. curl (no key): portfolio-rec + ai-summary → available:false; ranking senior → available:true rankings:[] (proyek …0005 belum ada pelamar PENDING). RBAC beginner→ranking 403, senior→portfolio-rec 403. Playwright /profile → "Ringkasan AI" card fallback "Fitur AI belum aktif" + Coba lagi, profil utuh. HAPPY PATH menunggu GEMINI_API_KEY (+ butuh pelamar PENDING utk demo ranking).
- DOCS: CLAUDE.md OUT OF SCOPE "AI Features" → APPROVED + NOTE D-AI-1. decisions.md D-AI-1. Portofolio D-P13 di-commit ece0e95 sebelum branch AI.

2026-07-06c (Catatan Mentor + Kontribusi di portofolio — D-P13-3, branch sama)
User minta ulasan mentor (apakah junior berhasil) + kontribusi ("membangun apa") tampil di portofolio biar publik lihat.
- BACKEND: `portfolio.service.buildPortfolioArtifacts` += `seniorReview {reviewerName,rating,comment}` via reviewRepository.listByProject (filter SENIOR_TO_BEGINNER, reviewee=user). `PortfolioArtifact` type += seniorReview.
- FRONTEND: `PortfolioPreview` += contributionSummary + seniorReview; mapper previewFromPipelineDetail (pakai d.contributionSummary + d.seniorReview) & previewFromPortfolioArtifact. Modal 2 blok baru: "Kontribusi Saya di Proyek Ini" (contributionSummary) + "Catatan Mentor" (UserAvatar + StarRating + komentar). ProfileView kartu Sertifikat += cuplikan Catatan Mentor (MessageSquare + ★rating + comment line-clamp-2).
- VERIFY: tsc 0 backend+frontend. Playwright p4-beginner /profile → kartu snippet "Catatan Mentor ★4.0 revisi" + modal blok "Kontribusi Saya (Built landing + nav)" & "Catatan Mentor (Test Senior ★4 revisi)". NO migration. decisions.md D-P13-3.

2026-07-06b (Portfolio dilipat ke Profil — D-P13-2, REVISI D-P13-1, branch sama)
User (prompt lanjutan): "hapus route /portfolio/:id, portofolio tampil di page profile aja kyk sub profile — klo gini kyk bikin profile baru khusus porto." → standalone public page + endpoint DIHAPUS; portofolio = tab Sertifikat di profil.
- HAPUS: frontend `app/portfolio/[id]/page.tsx`, `components/portfolio/PublicPortfolioView.tsx`; backend `modules/portfolio/`, `routes/portfolio.routes.ts`, `validators/portfolio.validator.ts`; `portfolioApi.getPublic`+`PublicPortfolio`; unmount `/portfolio` di routes/index.ts. (curl endpoint lama → 404; browser /portfolio/:id → not-found.) Bersihkan stale `.next/types/app/portfolio` biar tsc bersih.
- PINDAH: `portfolio.service.ts` export `buildPortfolioArtifacts(userId)` (bukan getPublicPortfolio). `user.service.getProfileOverview` pakai builder utk `artifacts` (dulu listVerifiedArtifacts tipis) → tab Sertifikat dapat data kaya. `artifactRepository.listPortfolioArtifacts` tetap.
- FRONTEND: `profileApi.ProfileArtifact` = alias `PortfolioArtifact`; `ProfileOverview.artifacts: PortfolioArtifact[]`. `ProfileView.PortfolioTab` → kartu kaya (roleName + tech chips) + tombol Preview → `PortfolioPreviewDialog` (mapper previewFromPortfolioArtifact), primary "Verifikasi Sertifikat"→/verify/:code. `portfolioApi.ts` tinggal types + durationWeeks. Tombol /artifacts (Bagikan) & /artifacts/:projectId (Lihat di Portofolio) → "Lihat di Profil"→/profile; modal /artifacts primary → /verify/:code. Subtitle modal diperbaiki. Buang unused userId+useAuthStore di artifacts/page.
- VERIFY: backend tsc 0, frontend tsc 0. Playwright login p4-beginner → /profile tab Sertifikat kartu kaya (Frontend·EDN-2026-000001·JavaScript) → Preview → modal penuh (Peran Frontend/Kontribusi 100%/Status Selesai/Durasi 4 Minggu/Teknologi/Tim Mentor+UMKM+Tim ProfileLinks→/users/:id/QR→/verify). /portfolio/:id lama → "Halaman tidak ditemukan". Console clean.
- DOCS: CLAUDE.md note dikoreksi (standalone Public Portfolio TETAP out of scope; portofolio in-profil). decisions.md D-P13-2.

2026-07-06 (Portfolio & Profile Connectivity — branch feature/portfolio-profile-connectivity, D-P13-1)
User audit "cek apa yg kurang, semua saling nyambung (portfolio/sertifikat/proyek) dgn semua role?". Investigasi: 2 putus — /users/:id ORPHANED (0 inbound link) + /portfolio/:id DEAD LINK (tombol ada, halaman+backend belum). User pilih (AskUserQuestion) bangun KEDUANYA + halaman publik /portfolio/:id (membalik D-P8-5).
- BACKEND: `artifact.repository.listPortfolioArtifacts(beginnerId)` (rich select: project desc/image/dates/category/umkm + active-completed members). `services/portfolio.service.ts` getPublicPortfolio (compose technologies dari contributionRepository per project, roleName dari member, senior=artifact verifier; user publik TANPA email/phone; stats verifiedArtifacts+completedProjects). `modules/portfolio/portfolio.controller.ts`, `routes/portfolio.routes.ts` (PUBLIC no-auth pola /verify), `validators/portfolio.validator.ts` (userId uuid). Mount `/portfolio` di routes/index.ts. NO migration. Verified curl live DB: 200 (Test Beginner, 1 artifact rich) / 404 not-found / 400 invalid-uuid.
- FRONTEND: `common/ProfileLink.tsx` (+profileHref) reusable → /users/:id fallback plain span. Wired: ProjectMembersPanel (member name), projects/[id]/applicants (avatar+name wrap; my-projects/applicants re-export ikut), projects/[id]/manage (senior applicant), reviews page (reviewer), ProfileView reviews tab (reviewer), DiscussionFeed (sender), artifacts/[projectId] Team. `services/portfolioApi.ts` (+durationWeeks). `components/portfolio/PortfolioPreviewDialog.tsx` — modal dari gambar user (project image+tech, MetaRows Peran/Kontribusi/Status/Tanggal Selesai/Durasi, Teknologi chips, Tim Proyek cards [Mentor/UMKM/Tim, ProfileLink+verified check], blok verifikasi 3-check + QR `qrcode.react`@4.2.0 QRCodeSVG → verificationUrl, footer Tutup/primary). Mappers previewFromPipelineDetail + previewFromPortfolioArtifact. `components/portfolio/PublicPortfolioView.tsx` + `app/portfolio/[id]/page.tsx` PUBLIC (no AuthGuard, top-bar wordmark+Masuk, hero+stats, grid sertifikat CertCard→modal, primary=Verifikasi Sertifikat→/verify/:code). /artifacts: kartu += "Preview di Portofolio" (item.artifact only, fetch pipelineDetail on-open), tombol Bagikan/Lihat-di-Portofolio dead → live /portfolio/:userId.
- DEP: +qrcode.react@^4.2.0 (frontend), Context7-checked (QRCodeSVG value/size/level/marginSize).
- VERIFY: backend tsc 0, frontend tsc 0. Playwright public /portfolio/18318fbf-… → hero (Test Beginner, 1 Sertifikat/2 Proyek Selesai), CertCard, klik Preview → modal semua field benar (Peran Frontend, Kontribusi 100%, Status Selesai, Durasi 4 Minggu, Tim Mentor/UMKM/Tim ProfileLinks → /users/:id, QR → /verify/EDN-2026-000001). Console 0 err.
- DOCS: CLAUDE.md OUT OF SCOPE "Public Portfolio Pages" → NOW IN SCOPE + NOTE amend D-P8-5→D-P13-1. decisions.md D-P13-1.
- NEXT: commit + merge → main; Phase 11 QA/RLS (endpoint publik baca via Express, catat di review RLS).

2026-07-05 (Diskusi dipisah jadi page + sidebar proyek) — committed main (c1c20fe)
User minta pisah Diskusi dari workspace jadi route sendiri + sidebar khusus (mockup).
- ROUTE: `frontend/src/app/projects/[id]/workspace/diskusi/page.tsx` (load project → render DiscussionTab) + re-export `my-projects/[id]/workspace/diskusi/page.tsx`. AppShell backHref = `${base}/${id}/workspace`.
- WORKSPACE: hapus tab "discussion" dari TABS + render + import DiscussionTab. Tambah tombol "Buka Diskusi" (MessageSquare) di header workspace → `${wsBase}/${id}/workspace/diskusi` (wsBase dari usePathname). Deep-link ?tab effect tetap (harmless).
- DiscussionTab RAIL diganti (dulu Milestone+Anggota list) → 3 card: (1) Informasi Proyek: ProjectThumb(image/gradient) + judul + PROJECT_STATUS_META badge + "Bersama {umkm.name}" + tumpukan avatar tim (-space-x-2, +N) + tombol "Lihat Detail Proyek" → `${base}/${id}/workspace` (base dari usePathname); (2) Aktivitas Terbaru: derived dari discussions sort updatedAt (author + judul + timeAgo); (3) Milestone Berikutnya. Hapus dead ROLE_BADGE + GraduationCap import.
- LIST CARD tampilkan AUTHOR: backend `discussion.repository.listGroupForUser` include messages{where parentId:null, take 1, orderBy asc, select sender} → discussionApi Discussion += `messages?:[{sender}]` + createdAt. Card leading avatar = UserAvatar(author) fallback icon; meta row "{author.name} · {timeAgo}".
- BeginnerProjectBoard "Lihat Diskusi" → `${workspace}/diskusi`.
- VERIFIED Playwright (beginner, project 0005): diskusi page 3-kolom + Diskusi Proyek/Informasi Proyek/Aktivitas Terbaru/Milestone Berikutnya + Lihat Detail Proyek→workspace + Bersama + list author "Test Senior"; workspace TANPA tab Diskusi + tombol Buka Diskusi→diskusi. backend build 0, frontend tsc 0.

2026-07-04 (PHASE 9 — Notifications & Real-time) — SELESAI & MERGED → main (01fcbe7)
Tabel `notifications` sudah ada (0.2.11) → NO migration.
- BACKEND (build 0): constants/notificationType (14 tipe). notification.repository (create, findManyByUser paginated+filter isRead, countUnread, markRead[ownership via where id+userId], markAllRead). notification.service (notify = best-effort/never-throw utk trigger; list; markAsRead; markAllAsRead). controller (list → {data,meta,unreadCount}). routes GET /notifications, POST /:id/read, POST /read-all wired.
- TRIGGERS (10 service, fire-and-forget setelah aksi commit): projectApplication accept/reject→beginner; seniorApplication accept/reject→senior; deliverable submit→senior lead / approve+revision→submitter; contribution approve→beginner; review→reviewee; verification approve/reject→user; project approve/reject→umkm; lifecycle requestCompletion→umkm; artifact generate→beginner; member confirmRemoval→member.
- REALTIME: RLS SELECT-only `notifications_select_own` (auth.uid()=user_id) + publication + replica identity full (backend/db/phase9_notifications_rls_realtime.sql). Writes via Express (Prisma bypass). CATATAN: notifications.updated_at NOT NULL tanpa default → Prisma @updatedAt isi otomatis (raw SQL insert wajib set updated_at).
- FRONTEND (tsc 0): notificationApi. NotificationProvider (layout, dlm AuthProvider): bootstrap list + subscribe INSERT filter user_id=eq.me → addNotification+toast; clear saat logout. NotificationBell (dropdown header ganti bell statik). /notifications page (filter Semua/Belum Dibaca + mark-all + pagination). base-ui DropdownMenuTrigger TANPA asChild.
- VERIFIED E2E: GET 200; SQL insert → badge live "1" (realtime OK); dropdown+page render; mark-all→badge 0; TRIGGER NYATA UMKM review Beginner Two→REVIEW_RECEIVED row benar. build 0, tsc 0.
- NEXT = PHASE 10 (profil + portofolio publik + static/error pages + forgot-password + admin monitoring). Note: UMKM_TO_BEGINNER review Beginner Two kini ADA (dari test trigger).

2026-07-02 (PHASE 8b — Artifact page REDESIGN + Public Portfolio + project image) — branch feature/phase-8-artifacts-v2
User kasih 2 mockup (list "Artifact Saya" + detail). Via AskUserQuestion putusan: status DERIVED (no migration), portfolio publik IN-SCOPE, field image proyek.
- MIGRATION `20260702134407_project_image_url` (projects += image_url VARCHAR(1000), Supabase MCP + _prisma_migrations sync + prisma generate). Bucket PUBLIK `project-images` (3MB, png/jpg/webp). Bucket privat `artifacts` sudah ada.
- BACKEND (build 0): project create/update terima image_url (validator+service+toData); `POST /projects/image-upload-url` (UMKM, signed upload → publicUrl) di storage.service. artifact.service += beginnerPipeline (derived per-proyek: VERIFIED/READY/IN_PROGRESS + stages + tech + team + artifact) & beginnerProjectDetail (komposit: project dates/image, achievements[split summary], deliverables[filter submittedBy], senior/umkm review, timeline+tanggal+aktor, team+role) — pakai projectMember.findByUserAndProject (baru) + listByUserWithProject (+imageUrl). Endpoint `GET /me/artifact-pipeline[/:projectId]`, `GET /projects/:id/artifacts`. portfolio.service + controller + routes → `GET /portfolio/:userId` PUBLIC (profil+skills+exp+links+artifact terbit). Wired index. (Fix build: import deliverableRepository yang kelupaan → cascade any; + anotasi tipe Deliverable/Member.)
- FRONTEND (tsc 0): artifactApi += pipeline/pipelineDetail/portfolio + tipe. projectApi += uploadImage + image_url. components/artifact/shared.tsx (STATUS_META, ProjectThumb[image/gradient+inisial], ArtifactInfoDialog, StageRow). REDESIGN `/artifacts` (4 stat card, 5 tab status, kartu proyek cover+tech+tim+diverifikasi-oleh, sidebar Progres Menuju Artifact Berikutnya + Apa itu Artifact, tombol Bagikan[copy /portfolio/:id] + Cara Mendapatkan[dialog]). NEW `/artifacts/[projectId]` (header+cover, tab Detail/Proses Verifikasi/Feedback Mentor/Riwayat, meta cards, achievements checklist, deliverables, sidebar Progres Verifikasi + Lihat di Portofolio + Informasi Proyek, Tim Proyek). NEW `/portfolio/[id]` publik (hero navy + artifact terverifikasi + keahlian/pengalaman/tautan). Wizard create Step 1 += upload gambar sampul (3MB).
- VERIFIED E2E: backend script (pipeline 200: 3 proyek VERIFIED+2 IN_PROGRESS; detail 200: role/timeline/deliverables 3/team 2; portfolio 200 publik; img-upload 403 beginner). Playwright (p4-beginner): /artifacts stat 1/1/2/0 + 5 tab + 3 kartu + panel; detail 4 tab + semua section + Peran Saya; portfolio publik nama+artifact+verify link. backend build 0, frontend tsc 0, console 0.
- DOCS diamandemen: CLAUDE.md (hapus "Public Portfolio Pages" dari OUT OF SCOPE + note), docs 03 (image_url), 04 (endpoint pipeline/portfolio/image-upload), 06 (status derived + portfolio publik), 08 (3 page baru), task-breakdown (amandemen Phase 8). D-P8-4, D-P8-5.
- NEXT: commit + push. Lalu merge → main / Phase 9.

2026-07-02 (PHASE 8 — Artifact System / "Sertifikat") — branch feature/phase-8-artifacts-v2
Inti value EduNomad. Branch dari fix/auth-register-bounce-routing (biar ada auth fix utk testing) + cherry-pick WIP 1e6a4a3 (pdfkit/qrcode + artifactPdf.service + artifact.repository). `npm install` (deps ga keinstall di branch v2) + prisma generate. Bucket Storage privat `artifacts` (5MB, application/pdf only) via MCP.
- BACKEND (build 0): artifactStorage.service (upload `${code}/v${n}.pdf` + download buffer, service role, bucket privat — stream via endpoint, bukan public URL). artifact.validator (generate {beginner_ids[],verification_url}, regenerate {verification_url}, id/code params). artifact.service: generateArtifacts (senior lead, project ACTIVE/AWAITING; per beginner: active member + kontribusi APPROVED + review SENIOR_TO_BEGINNER; skip kalau sudah ada → suruh regenerate; code EDN-{year}-{seq6}; verificationUrl = base+code; PDF→upload→create+audit ARTIFACT_GENERATED), regenerateArtifact (WF14 versi++ history kept, audit ARTIFACT_REGENERATED), getArtifactDetail, listMine, listForProject, listAll, downloadPdf (current version bytes+filename), verify (PUBLIC, valid+detail aman / valid:false). artifact.controller + repo listByProject + detailInclude project.umkm name. Routes: POST /projects/:id/generate-artifacts (SENIOR+verified) & GET /projects/:id/artifacts (auth) di project.routes; artifact.routes (/artifacts GET listMine, /:id, /:id/download, POST /:id/regenerate); verify.routes (/verify/:code PUBLIC); admin.routes GET /admin/artifacts. Wired index.
- COMPLETION GATE (carry-over D-P4.3-3 SELESAI): projectLifecycle.requestCompletion kini panggil completionBlockers() WF15 — semua deliverable APPROVED + tiap beginner aktif (kontribusi APPROVED + review SENIOR_TO_BEGINNER + UMKM_TO_BEGINNER + artifact ada) + UMKM_TO_SENIOR ada; kalau ada blocker → 422 daftar detail (Indonesian).
- FRONTEND (tsc 0): artifactApi service (listMine/listAll/listForProject/detail/generate/regenerate/verify/download-blob + verificationBase=origin+/verify). Pages: `/artifacts` (Sertifikat Saya, beginner card + Unduh PDF + Verifikasi); `/verify` + `/verify/[code]` PUBLIC (VerifyView, no auth/shell, valid card / not-found); workspace tab "Sertifikat" (ArtifactTab — senior lead per-beginner Terbitkan/Terbitkan Ulang/Unduh, non-lead read-only issued list); `/admin/artifacts` (tabel monitoring). nav ADMIN += "Sertifikat"→/admin/artifacts.
- VERIFIED E2E (script /tmp/p8-e2e*.sh + Playwright): generate 201 (EDN-2026-000001) / 422 kontribusi-belum-approve / 422 sudah-ada; verify public valid+detail; download PDF nyata (4090 bytes, 1 page); regenerate → currentVersion 3, 3 versi kept; completion gate 422 daftar blocker; admin list 1. Browser: beginner /artifacts card v3, public /verify valid, senior workspace tab (Test Beginner→Unduh/Ulang, Beginner Two→Terbitkan), admin tabel. Auth fix pegang (beginner login→/dashboard). backend build 0, frontend tsc 0.
- CATATAN: frontend dev server sempat crash global (semua route 500, TERMASUK /) saat kompilasi banyak route baru sekaligus — BUKAN bug kode (tsc 0). Fix = restart `npm run dev`. Test artifact EDN-2026-000001 (Test Beginner, 3 versi) tertinggal di DB proyek a1a1a1a1-…0005 (berguna utk test lanjutan). Decisions D-P8-1..3.
- NEXT: merge feature/phase-8-artifacts-v2 → main (butuh auth-fix branch dulu / atau bareng). Lalu Phase 9 Notifications.

2026-07-01 (FIX auth register-bounce + routing reverse-back Mahasiswa) — UNCOMMITTED
Task: user lapor login Mahasiswa "auto routing ke register trus" + minta flow /my-projects→workspace→detail dgn back reverse.
- DIAGNOSA (Playwright, p4-beginner): login → dilempar /auth/register/role. Cek langsung `/auth/me` = **429** (rate limit backend 100/15min ketembus; board beginner nembak ~6 req paralel + navigasi). `fetchMe()` LAMA `catch{return null}` telan 429 jadi null → AuthGuard lihat authenticated-tanpa-appUser → bounce register. (Ini BEDA dari D-AUTH-1 yg soal race SIGNED_IN.)
- FIX FRONTEND: `services/authApi.ts` fetchMe return null HANYA saat ApiError.status===404, selain itu rethrow. `components/auth/AuthProvider.tsx` loadAppUser jadi loop: sukses→setAppUser; 401→signOut+clear; transient (429/5xx/net)→retry backoff [400,800,1600,3200,5000]ms tanpa setLoading(false) (guard tetap "Memuat…", tak bounce). import ApiError.
- FIX BACKEND: `middleware/setupMiddleware.ts` rate limit 100→1000/15min + `skip:()=>env.nodeEnv==='development'` (Context7 express-rate-limit: skip = disable resmi; limit:0 malah block sejak v7). Backend nodemon auto-reload.
- FIX ROUTING: `app/projects/[id]/page.tsx` backHref role-aware — BEGINNER+base /my-projects → back ke `${base}/${id}/workspace` (reverse board-first flow); else base. `app/projects/[id]/workspace/page.tsx` backHref beginner+/my-projects → /my-projects (turn sebelumnya). `app/my-projects/page.tsx` list cards (UMKM/SENIOR) tombol "Lihat Detail" ganti shortcut Diskusi/workspace.
- VERIFIED (Playwright): login p4-beginner → /dashboard (TAK bounce). /auth/me hammer 8x → semua 401 (bukan 429, dev skip aktif). Chain: /my-projects(board)→[Lihat Diskusi]→workspace(back=/my-projects, "Lihat Detail Proyek"=/my-projects/:id)→detail(back[aria=Kembali]=/my-projects/:id/workspace). Reverse-back OK. tsc 0 backend+frontend, console 0. Decisions D-AUTH-2, D-ROUTE-1.
- NEXT: commit (branch dari main; ini fix di atas main 6adfeda). Lalu Phase 8 Artifact tetap pending.

2026-07-01 (PHASE 12.5 — Views; PHASE 12 SELESAI)
Task: unique view count per topik diskusi (sub-phase terakhir Phase 12).
- MIGRATION `20260701030000_phase12_5_views` (Supabase MCP → LIVE DB; _prisma_migrations 4f223735…): tabel discussion_views (id, discussion_id FK CASCADE, user_id FK CASCADE, created_at) + unique(discussion_id,user_id). Tanpa RLS/publication (count dibaca via Express). prisma generate.
- schema.prisma: model DiscussionView (relasi discussion saja) + Discussion.views[].
- BACKEND (build 0): repo recordView (upsert compound discussionId_userId, idempotent) + _count.views ditambah di semua list discussion (listGroupForUser/createGroup/updatePin). service.recordView (assertMember). controller.recordView. route POST /discussions/:id/view (authMiddleware, tanpa requireVerified — view = read-side).
- FRONTEND (tsc 0): discussionApi Discussion._count.views? + recordView(discussionId) (best-effort). DiscussionTab: effect recordView(activeId) → load() (refresh count) saat topik dibuka; pass views ke DiscussionFeed. DiscussionFeed header: "{count} pesan · {views} dilihat".
- VERIFIED E2E browser (p4-senior): buka topik → header "1 pesan · 1 dilihat" (view tercatat unik). console 0. Decision D-P12-7.
- **PHASE 12 SELESAI (12.1–12.5).** NEXT: merge feature/phase-10-discussion-forum → main (+ tetap ada page.tsx landing M sejak lama; Phase 8 Artifact masih pending). UNCOMMITTED→commit.

2026-07-01 (PHASE 12.4 — Attachments, Supabase Storage)
Task: lampiran file/gambar/link di message diskusi (override locked "no attachments MVP", docs sudah diamandemen).
- STORAGE: bucket privat `discussion-attachments` (10MB limit) via execute_sql insert storage.buckets. Akses HANYA via signed URL (admin service role) → tak perlu storage.objects RLS.
- MIGRATION `20260701020000_phase12_4_attachments` (Supabase MCP → LIVE DB; _prisma_migrations 9b08f56c…): tabel discussion_attachments (id, message_id FK CASCADE, type VARCHAR(10) FILE|IMAGE|LINK, url TEXT, file_path TEXT, file_name, file_size INT, created_at) + index message_id. TIDAK perlu RLS/publication (dibaca via Express API, bukan PostgREST; realtime message INSERT existing sudah men-trigger re-pull). prisma generate.
- schema.prisma: model DiscussionAttachment (relasi message saja) + DiscussionMessage.attachments[].
- CONTEXT7: konfirmasi supabase-js storage createSignedUploadUrl/uploadToSignedUrl/createSignedUrl.
- BACKEND (build 0): constants/attachmentType. services/storage.service (createUploadUrl path=`${discId}/${uuid}-${safeName}`; signDownload TTL 1h; supabaseAdmin). validator: uploadUrlSchema (fileName+fileSize≤10MB), attachmentInputSchema (LINK→url / FILE|IMAGE→filePath refine), sendMessageSchema diubah (message optional default "" + attachments[] + refine "pesan ATAU lampiran"). repo: include attachments di message+replies; createMessage(+attachments nested create); hapus messageSenderSelect (unused). service: signAttachments (filePath→signed url) di getMessages+sendMessage echo; getUploadUrl; sendMessage(+attachments). controller: createUploadUrl + sendMessage attachments. route POST /discussions/:id/attachments/upload-url (authVerified).
- FRONTEND (tsc 0): discussionApi AttachmentType/DiscussionAttachment + DiscussionMessage.attachments + getUploadUrl + uploadAttachment(file→signed→{type IMAGE if image else FILE,filePath,fileName,fileSize}) + sendMessage(+attachments). DiscussionFeed: Bubble render attachments (IMAGE=<img>, FILE/LINK=chip link signed url); composer Paperclip/ImageIcon jadi fungsional (hidden file input multiple, accept image utk gambar) → upload stage pending chip (X hapus) → send sertakan attachments; message boleh kosong kalau ada lampiran; "Mengunggah…" indicator; Smile tetap disabled.
- VERIFIED E2E browser (p4-senior): upload .txt → chip "📄 edunomad-attach-test.txt 1 KB" muncul di pesan (attachment-only, signed download link); upload sukses ke Storage; console 0. Decision D-P12-6.
- NEXT 12.5 views. UNCOMMITTED→commit.

2026-07-01 (PHASE 12.3 — Reactions)
Task: lanjut 12.3 (emoji reactions di message diskusi).
- MIGRATION `20260701010000_phase12_3_reactions` (Supabase MCP apply → LIVE DB; _prisma_migrations checksum e6705186…): tabel message_reactions (id, message_id FK, discussion_id FK [denormal utk realtime/RLS], user_id FK, emoji VARCHAR(16), created_at) + unique(message_id,user_id,emoji) + index. RLS: enable + policy select is_discussion_member(discussion_id). Publication += message_reactions, replica identity full. prisma generate.
- schema.prisma: model MessageReaction (relasi `message` saja; userId/discussionId scalar utk hindari lebarkan User/Discussion) + DiscussionMessage.reactions[]. D-P12-5 (denormal discussion_id).
- BACKEND (build 0): constants/reactionEmoji (👍❤️🎉✅👀🙌). validator toggleReactionSchema (enum) + messageIdParamSchema. repo: include reactions {emoji,userId} di message+replies; toggleReaction (findUnique compound → delete/create). service.toggleReaction (findMessageById → assertMember). controller + route POST /discussions/messages/:messageId/reactions (authVerified).
- FRONTEND (tsc 0): discussionApi REACTION_EMOJIS + MessageReaction + DiscussionMessage.reactions + toggleReaction(messageId,emoji). DiscussionFeed: groupReactions (emoji→count,mine); Bubble reaction chips (mine highlight, klik toggle) + picker SmilePlus; react() → toggle+load; realtime listener message_reactions filter discussion_id (event *). Reaksi di parent + reply.
- VERIFIED E2E browser (p4-senior): react 🎉 → chip "🎉 1" highlight (mine), persist via server (RLS read OK); toggle off → chip hilang. console 0.
- NEXT 12.4 attachments. UNCOMMITTED→commit.

2026-07-01 (PHASE 12.2 — Threaded Replies)
Task: lanjut sub-phase 12.2 (balasan satu tingkat di group discussion).
- MIGRATION `20260701000000_phase12_2_threaded_replies` via Supabase MCP apply_migration ke LIVE DB: discussion_messages += parent_id UUID null + FK self (ON DELETE CASCADE) + index. Recorded di _prisma_migrations (checksum sha256 file = 8e1cd910…, konfirmasi algoritma = plain sha256 file via cek 12.1=3317534…). prisma generate OK. schema.prisma DiscussionMessage += parentId + relation self "MessageReplies" (parent/replies) + @@index.
- BACKEND (build 0): validator sendMessageSchema += parentId uuid optional (shared group+DM; DM abaikan). repo: messageWithRepliesInclude (replies+sender, orderBy asc); listMessages where parentId null + include replies; countMessages where parentId null (top-level); findMessageById (validasi parent); createMessage(+parentId). service.sendMessage(+parentId): validasi parent ada+same discussion+top-level (one level), else NotFound/BusinessRule. controller pass req.body.parentId.
- FRONTEND (tsc 0): discussionApi DiscussionMessage += parentId?/replies?; sendMessage(+parentId). DiscussionFeed: komponen Bubble (reuse top-level+compact reply, mentor green/own tint); render replies nested (indent ml-6/11 + border-l); tombol "Balas" → composer inline (textarea+Batal+Balas) → sendMessage(parentId) → load(). Realtime existing (INSERT discussion_id) cover replies.
- VERIFIED E2E browser (p4-senior, "Diskusi Tim"): Balas → balasan muncul nested 1 tingkat (indent+border), persist server, header "1 pesan" tetap (count top-level). console 0 err. Decision D-P12-4.
- NEXT 12.3 reactions (message_reactions). UNCOMMITTED→akan commit.

2026-06-30 (Auth redirect race fix — "selalu dilempar ke /auth/login")
Task: user minta cek semua role flow + perbaiki auto-redirect yg bikin tiap akses page lain dilempar ke satu page terus. Via AskUserQuestion user konfirmasi target redirect = /auth/login. CLAUDE.md: baca docs (RBAC/role flow) + Context7 utk perilaku library.
- AUDIT role flow: AuthProvider(root) → onAuthStateChange INITIAL_SESSION → fetchMe (/auth/me) → store appUser. Tiap page protected = <AuthGuard [allowedRoles]>. RBAC allowedRoles per page SUDAH sesuai docs/06 (admin/* ADMIN, applications BEGINNER, applications/mentor SENIOR, my-projects UMKM+BEGINNER, reviews BEGINNER, projects/create+manage UMKM, applicants SENIOR). Nav role-filtered via getNavItems(role) — benar.
- ROOT CAUSE redirect ke /auth/login = transient race (Context7 supabase-js konfirmasi: signInWithPassword resolve + dispatch SIGNED_IN terpisah; pola resmi navigate DI DALAM onAuthStateChange). Login page kita `router.push("/dashboard")` setelah promise resolve → event SIGNED_IN telat → dashboard AuthGuard lihat isLoading=false(boot)+isAuthenticated=false → replace /auth/login. Race kedua: authenticated tapi appUser belum keisi (fetchMe in-flight) di client-nav → lempar /auth/register/role.
- FIX (tsc 0):
  - src/components/auth/AuthGuard.tsx: import supabase; sebelum redirect /auth/login, `supabase.auth.getSession()` — hanya redirect kalau session BENAR-BENAR null (cancel-guarded). Session ada = store telat → biarkan onAuthStateChange catch up → guard re-render ke children.
  - src/components/auth/AuthProvider.tsx: pada session event, kalau belum ada appUser (fresh login/initial) `setLoading(true)` selama fetch app-user → guard nunggu, gak lempar ke register/role. TOKEN_REFRESHED (appUser sudah ada) = refetch silent tanpa flash. setLoading(false) re-guard `!active`.
  - src/hooks/useRequireSession.ts: getSession re-cek sama sebelum redirect (race step registrasi 2-5).
- TEMUAN belum difix (dilaporkan ke user, minta keputusan stub vs hapus dari nav): link 404 di nav/dashboard/login → /artifacts, /notifications, /help, /privacy, /terms, /auth/forgot-password.
- ✅ E2E BROWSER VERIFIED (Playwright, p4-senior, server :3000/:3001 sudah up): (1) login dari /auth/login → mendarat /dashboard + render senior dashboard penuh (proyek mentoring, stats, lamaran) TANPA bounce balik ke login = race #1 fixed; (2) hard-reload langsung ke /applications/mentor (AuthGuard allowedRoles SENIOR) → render tab Menunggu/Diterima 2, profil "Test Senior/Terverifikasi", tidak bounce = path getSession-recheck di initial load OK; (3) NEGATIF: localStorage.removeItem sb-…-auth-token lalu buka /dashboard → redirect benar ke /auth/login (guard sah tidak rusak). Console 0 error nyata (cuma noise base-ui/devtools). tsc 0.
- UNCOMMITTED di branch feature/phase-10-discussion-forum (page.tsx landing juga masih M dari sebelumnya). Siap commit.
- TAMBAHAN (req user): back button "← Kembali ke beranda" → "/" (landing) di SEMUA page auth via shared `AuthCard.tsx` (prop `backHref` default "/", bisa null utk hide). Otomatis muncul di /auth/login + semua step /auth/register/*. Verified browser (login & register tampil + klik → mendarat di /). tsc 0, console 0.
- NAV SENIOR (req user "mentor gak ada akses discussion board di sidebar kyk mahasiswa"): DIAGNOSIS — diskusi = tab di workspace proyek, SAMA utk semua role (TABS workspace tak di-filter role), per docs/08 tak ada page "Diskusi" mandiri (group discussion per-proyek). Asimetri nyata: BEGINNER punya "Proyek Saya" di sidebar → jalur ke proyek/diskusi; SENIOR TAK punya entri sidebar ke proyek mentoring (cuma via kartu dashboard); /my-projects malah di-guard UMKM+BEGINNER saja. Kartu "Diskusi Baru" di dashboard beginner cuma SAMPLE (bikin kesan beda). User pilih (AskUserQuestion) Opsi 1 = tambah sidebar "Proyek Mentoring" utk senior, diskusi tetap di workspace (sesuai docs). FIX (tsc 0): navigation.ts ROLE_ITEMS.SENIOR += "Proyek Mentoring"→/my-projects (icon FolderKanban); my-projects/page.tsx += SeniorView (pakai projectApi.mentoredProjects() yg sudah ada, kartu premium + PillTabs filter status client-side + "Buka Workspace" hanya ACTIVE/AWAITING + "Lihat Detail"), RoleRouter += SENIOR branch, AuthGuard allowedRoles += "SENIOR". VERIFIED browser p4-senior: sidebar "Proyek Mentoring" muncul → list 3 proyek (Aktif punya Buka Workspace) → workspace → tab Diskusi render penuh (board sama dgn mahasiswa: Buat Diskusi, chip kategori, list pinned "Review Landing Page Minggu Ini", thread+composer). Decision D-P12-2.
- SPACING SYNC DISKUSI (req user "margin/padding diskusi banyak tak simetris/sinkron"): samakan skala spasi. Radius card disatukan ke rounded-[20px] (sebelumnya feed rounded-[24px], list rounded-2xl/16, rail 20). Padding list card p-3.5→p-4. Gap kolom kiri gap-3→gap-4 (samakan rail gap-4). Feed composer p-4→px-5 py-4 (sejajar body px-5). Dashed "Diskusi Baru"+empty → rounded-[20px]. Hapus label "Daftar Diskusi" supaya top 3 kolom (list/feed/rail) rata. Files: components/workspace/DiscussionTab.tsx, DiscussionFeed.tsx. tsc 0; browser-verified (screenshot) 3 kolom rata + konsisten. UNCOMMITTED.
- DEDUP TITLE WORKSPACE (req user: card ringkasan proyek di tab Diskusi = dobel judul krn H1 sudah ada; pindah tombol detail + info anggota ke Ringkasan): hapus `ProjectSummaryCard`+`AvatarStack` dari DiscussionTab.tsx (judul/Bersama/Mentor/deadline redundant; rail "Anggota Tim" tetap ada). OverviewTab (Ringkasan) dapat bar atas baru: avatar anggota aktif + "{n} anggota" + tombol "Lihat Detail Proyek" (base-aware → /my-projects atau /projects). OverviewTab fetch projectApi.members. Bersihin import unused DiscussionTab (Link/Badge/ArrowRight/CalendarClock/Users/PROJECT_STATUS_META). Files: components/workspace/DiscussionTab.tsx, app/projects/[id]/workspace/page.tsx. tsc 0; browser-verified p4-senior (Diskusi: card dobel hilang; Ringkasan: bar anggota+detail). UNCOMMITTED.
- FLOW NESTED /my-projects (req user: dari my-projects, klik proyek [detail/diskusi] HARUS tetap di namespace /my-projects, contoh URL /my-projects/:id/workspace?tab=discussion; Jelajahi Proyek cuma cari proyek). Bukan sekadar shortcut — ubah route flow:
  - workspace page baca `?tab=` (window.location.search, pola register ?role= → hindari Suspense) = deep-link tab.
  - detail page (projects/[id]/page.tsx) + workspace page sekarang base-aware via usePathname: `base = pathname.startsWith("/my-projects") ? "/my-projects" : "/projects"`. backHref + link "Buka Workspace" pakai base.
  - route nested baru re-export komponen sama: app/my-projects/[id]/page.tsx (`export {default} from "../../projects/[id]/page"`) + app/my-projects/[id]/workspace/page.tsx. Satu komponen, dua namespace.
  - kartu my-projects (SeniorView + UMKM Content) link → /my-projects/:id (Lihat Detail) & /my-projects/:id/workspace?tab=discussion (Diskusi, ACTIVE/AWAITING) & /my-projects/:id/workspace (Buka Workspace).
  - Jelajahi Proyek tetap /projects/:id (discovery/apply) — pemisahan namespace bersih.
  - Files: app/projects/[id]/page.tsx, app/projects/[id]/workspace/page.tsx, app/my-projects/[id]/page.tsx (baru), app/my-projects/[id]/workspace/page.tsx (baru), app/my-projects/page.tsx. tsc 0; browser-verified p4-senior end-to-end (kartu Diskusi→/my-projects/.../workspace?tab=discussion tab Diskusi selected; detail /my-projects/:id→Buka Workspace tetap /my-projects). Decision D-P12-3.
  - SISA/known: link "Kelola"/"applicants" di detail masih → /projects/:id/manage|applicants (route mgmt belum di-nest; namespace leak kecil). dashboards + BeginnerProjectBoard masih link /projects/:id/workspace (belum dimigrasi). page.tsx landing masih M (sesi lama).
- PERF (req user "latensi dashboard→page lain lama"): diprofil via Playwright resource-timing. Akar: (a) Next dev compile first-visit ~3.8s (hilang di prod), (b) React StrictMode double-fetch dev (categories/skills/projects 2×), (c) remote DB ap-south-1. (a)&(b) DEV-ONLY; API bersih 3-paralel ~686ms = production wajar. FIX dipilih user = matikan StrictMode: `reactStrictMode: false` di frontend/next.config.ts. Verified Playwright: /projects sekarang tiap endpoint 1× (total 4 API vs ~7 sebelumnya). Trade-off (kehilangan StrictMode dev bug-detection) diterima user. Detail + opsi lanjutan di known-issues.md.

2026-06-28 (Discussion forum redesign + PHASE 12 backend upgrade 12.1)
Task: user minta Diskusi tab di-redesign seperti reference forum (Linear/Slack/Notion) LALU "buat phase upgrade backend ini agar works".
- REDESIGN (merged main b821b5c, branch redesign/discussion-board): Diskusi tab → premium master-detail board pakai DATA NYATA. DiscussionTab (project summary card real + master-detail list/thread + Milestone/Anggota rails) + DiscussionFeed (thread premium, pesan Mentor aksen hijau dari role asli, composer toolbar). Fitur reference yang TAK ada backend (kategori/thread/reaksi/lampiran/views) DIHILANGKAN (jujur, bukan kontrol mati). Fix bug realtime channel-name collision (unik per mount). tsc 0, browser verified (kirim pesan + mentor green), console 0.
- BACKEND UPGRADE (branch feature/phase-10-discussion-forum): user pilih "Full forum incl attachments" via AskUserQuestion → otorisasi override locked docs (D-P12-1). Dibangun bertahap sbg **Phase 12** (renumber dari 10 utk hindari clash "Phase 10: Dashboards/Polish").
  - **12.1 (title+category+pin) DONE & verified**: migration `phase12_discussion_forum_metadata` via Supabase MCP apply_migration (discussions += title VARCHAR(255), category VARCHAR(30), is_pinned BOOLEAN) + recorded di _prisma_migrations (prisma history sync) + prisma generate. constants/discussionCategory (6 kategori, Zod). validator create wajib title+category + pinDiscussionSchema. repository createGroup(+meta) + updatePin + list orderBy [isPinned desc, updatedAt desc]. service createGroupDiscussion(meta) + pinDiscussion (senior lead/UMKM owner). controller create(+title/category) + pin. routes POST /discussions/:id/pin. Frontend: discussionApi (Discussion +title/category/isPinned, DISCUSSION_CATEGORY_META, createGroupDiscussion(input), pinDiscussion). DiscussionTab: CreateDiscussionDialog (title+category Select), filter chips kategori REAL, kartu list judul+badge kategori+pin, thread header judul+kategori, toggle pin. DiscussionFeed: terima title+category.
  - VERIFIED E2E (browser p4-senior): buat "Review Landing Page Minggu Ini"/MENTOR_REVIEW → muncul di list+chips, pin → pinned-first+ikon pin, DB confirm title+category=MENTOR_REVIEW+is_pinned=true. backend build 0, tsc 0, console 0.
  - Renumber 10→12: source+docs perl-replace, migration folder rename, checksum recompute (3317534…), _prisma_migrations row UPDATE name+checksum, prisma regenerate, rebuild 0.
  - Docs amended: 03 (discussions +3 cols + categories + "no attachments" superseded by 12.4), 04 (create body title+category + POST /pin + 12.2-12.5 roadmap), 06 (create/pin = senior lead/UMKM owner; attachments superseded), 07 (Workflow 7 forum note), task-breakdown (PHASE 12 section).
  - NEXT: 12.2 threaded replies, 12.3 reactions, 12.4 attachments (Supabase Storage), 12.5 views. Branch belum merge ke main.

2026-06-28 (UNIFY-UI sweep — batches 2–6 COMPLETE, sweep done)
Task: lanjut sapu-bersih UI premium per-halaman dari batch 1 (shared Card/PageHeader). Continued on branch redesign/unify-ui; commit + browser-verify + tsc 0 + merge ke main tiap batch.
- Shared primitive baru: `common/PillTabs.tsx` — pill tabs konsisten (active = navy fill #201f31 + white text, rounded-full, optional count badge, role=tab/aria-selected). Mengganti SEMUA tab underline `border-b-2 border-[#a3ce00]` lama. `common/EmptyState.tsx` di-upgrade ke premium (dashed rounded-[20px] + icon chip) → auto berlaku app-wide.
- BATCH 2 (e4b4a57): /applications + /applications/mentor + /reviews. PillTabs+counts, premium app-reveal article cards w/ glyph (FolderKanban/GraduationCap), premium EmptyState, PageHeader. reviews pakai PageHeader+EmptyState.
- BATCH 3 (994276e): /projects/[id] jadi 2-col premium (max-w-5xl grid 1fr_340px, sticky aside = ActionPanel+Buka Workspace+Members). ProjectDetailView ditulis ulang (eyebrow SectionLabel + MetaRow ikon + milestone/role rows bg-muted/40; tetap reusable utk admin review dialog). /projects/[id]/workspace: tab bar → PillTabs (7 tab), header 28px, OverviewTab eyebrow+MetaRow, MilestonesTab premium cards+EmptyState. ProjectMembersPanel fix divide-neutral-200→divide-border.
- BATCH 4 (02be61c): /manage (premium applicant cards + avatar initials, "mentor assigned" card), /applicants (PillTabs+counts + avatar), /projects/create wizard (PageHeader, stepper chartreuse #d8f277 active / #eef7d6 done, app-reveal+eyebrow labels, normalize text-error→text-destructive, buang pt-2 redundan).
- BATCH 5 (9924ab0): admin /projects/review + /users/verification (PillTabs + premium cards w/ avatar) + /audit-logs (tabel → premium rounded-[20px] panel: eyebrow header, action chips #eef7d6, hover rows, mono metadata).
- BATCH 6 (ee0f045): /my-projects view UMKM (PillTabs status + premium project cards). BeginnerView sudah bento (board) — cuma buang breadcrumbs+gap-5.
Auth /auth/* TIDAK diubah. Semua batch browser-verified (computed styles via browser_evaluate: navy pill rgb(32,31,49) rounded-full, card radius 20px border #e7e3d8, h1 28px, premium empty/cards render) + console 0 err + tsc 0. Catatan: tsc kadang transiently lempar TS2882 (CSS ambient) saat dev server regen .next/types — settle ~2s lalu EXIT 0. Decision D-UI-11. SWEEP SELESAI. NEXT = resume PHASE 8 Artifact (feature/phase-8-artifacts 1e6a4a3).

2026-06-28 (UNIFY-UI sweep — batch 1: primitive bersama premium)
Task: user minta SEMUA halaman pakai UI/card yang sama (banyak halaman masih UI lama). Pilihan user: "sapu bersih bertahap" + "merge dulu baru lanjut". redesign/explore-projects sudah merge ke main (2f1546d). Branch baru `redesign/unify-ui`.
- BATCH 1 (fondasi, leverage tinggi): `ui/card.tsx` Card di-premium-kan — rounded-[20px] + border 1px #e7e3d8 (ganti rounded-lg/shadow-sm/ring), --card-spacing 4→5; CardHeader/Footer rounding 20px; CardTitle font-semibold tracking-tight. `common/PageHeader.tsx` → heading sm:text-[28px] + text-pretty. EFEK: semua halaman pakai Card/PageHeader (applications, reviews, admin, detail, dll) OTOMATIS ikut premium. Verified /reviews: card radius 20px + border #e7e3d8, console 0 err, tsc 0. Commit efdb5e3.
- BELUM (batch berikut): rapikan per-halaman (tabs, list rows, layout) ke pola premium (Panel/app-reveal/badge konsisten): batch2 applications+applications/mentor+reviews; batch3 projects/[id]+workspace; batch4 manage+applicants+create wizard; batch5 admin review/verification/audit; batch6 my-projects view UMKM. Auth /auth/* TIDAK diubah.

2026-06-28 (Web Interface Guidelines pass + konsistensi nav)
Task: user jalankan skill web-design-guidelines — cek UI imbalance, perbaiki. Ambil rules dari vercel-labs/web-interface-guidelines. Fix yang diterapkan:
- Anti-pattern `transition: all` → properti spesifik: ui/button.tsx (transition-[color,background-color,border-color,box-shadow,transform] +duration-200), ui/badge.tsx (transition-colors), ui/progress.tsx (transition-[width]).
- Ellipsis: projects search "Cari proyek..." → "…" + autoComplete=off + spellCheck=false + aria-label.
- color-scheme: globals.css :root `color-scheme: light`; layout.tsx export `viewport` {themeColor #faf8f3, colorScheme light}.
- Decorative icons aria-hidden + text-pretty heading di dashboardKit (StatCard icon+trend, WelcomeHeader) + projects h1/desc.
- KONSISTENSI NAV (imbalance nyata): label sidebar disamakan ke bahasa desain — "Dashboard"→"Beranda", "Telusuri Proyek"→"Jelajahi Proyek" (kini SAMA dgn judul halaman /projects, sebelumnya beda bikin bingung), "Notifications"→"Notifikasi".
- Catatan (sudah dari sebelumnya): [data-app] sudah punya focus-visible global utk a/button/role-button → fokus ter-cover. Sisa minor belum: aria-hidden belum di SEMUA ikon dekoratif app-wide (baru representatif), input search belum punya `name`.
VERIFIED browser /projects: nav Beranda/Jelajahi Proyek/…/Notifikasi konsisten + "Jelajahi Proyek" active = judul halaman; screenshot full-page menilai layout seimbang; console 0 err; tsc 0.

2026-06-27 (Hapus breadcrumb header global — fix judul dobel)
Bug (user): tiap halaman ada breadcrumb bar (mis. "Admin > Tinjau Proyek") yang dobel dengan H1 halaman. Minta header breadcrumb dihilangkan semua halaman (ref screenshot: hanya kontrol kanan-atas).
Fix: `components/layout/Header.tsx` ditulis ulang — buang Breadcrumbs, jadi slim bar: kiri = hamburger mobile saja, kanan = notif + dropdown profil (avatar + nama + ROLE_LABEL + logout). `AppShell.tsx` tak lagi render breadcrumb (prop `breadcrumbs?` dibiarkan opsional & diabaikan agar ~15 halaman tetap kompilasi tanpa diubah); main padding atas dihapus (header kasih ruang). 
PENTING: DropdownMenuTrigger base-ui sudah berupa <button>, jadi child profil HARUS <span> bukan <button> (sempat hydration error button-bersarang → diperbaiki). VERIFIED /admin/dashboard + /projects: tak ada breadcrumb, profil "Phase43 Admin/Admin" tampil, H1 tunggal, console 0 err. tsc 0.

2026-06-27 (Redesign /projects "Jelajahi Proyek" premium — terutama kartu)
Task: user kasih screenshot (design-refs/explore-projects.png) + prompt premium (Clay/Linear). Redesign halaman Telusuri Proyek, fokus kartu. Sidebar tetap (navy AppShell). DONE & browser-verified. Branch redesign/explore-projects (dari main). [Catatan: Phase 8 backend artifact DITUNDA — disimpan WIP di branch feature/phase-8-artifacts commit 1e6a4a3 (pdfkit/qrcode + artifactPdf.service + artifact.repository), lanjut nanti.]
- Backend: `project.repository` += `browseInclude` (umkm+category+senior+projectRoles{roleName,capacity,roleSkills→skill}) + `findManyPaginatedBrowse`; `project.service.getProjects` pakai browse method → payload browse publik kini kaya (mentor, role slots, tech). Frontend `ProjectListItem` += optional `senior` + `projectRoles` (BrowseRole). build 0, tsc 0.
- `app/projects/page.tsx` ditulis ulang: header + search besar + filter bar (Kategori[backend], Status[backend], Deadline[client window], Urutkan[client sort] + Reset) + FeaturedCard (proyek pilihan, bg hijau muda, role/durasi/mentor/umkm/slot/tech + thumbnail dekoratif → tampil hanya page 1 tanpa filter) + grid kartu premium (thumbnail gradient, status badge [Membuka Pendaftaran/Segera Ditutup≤10hari/Aktif/Selesai], judul, UMKM+verified, deskripsi, tech chips, durasi+posisi, mentor avatar, hover lift) + right sidebar (Kategori Populer[clickable→filter], Skill Yang Dicari[clickable→search], Tips Melamar) + empty-state Reset Filter. Layout xl:grid [1fr_300px]. Helpers: weeksOf/daysLeft/slotsOf/techOf/statusMeta. DESIGN.md tokens + app-reveal.
- VERIFIED browser: featured (Phase5: Mentor Test Senior, 4 Minggu, 3 slot, Frontend(3)) + grid (Phase43/Phase4 real roles/slots/mentor) + right sidebar real categories/skills; klik skill "React"→search terisi + featured hilang saat filter + empty-state; console 0 err. Decision D-UI-10.

2026-06-26 (FIX sidebar active highlight, terutama halaman admin)
Bug (user report): item sidebar tak ke-select di halaman admin. Sebab: di /admin/dashboard, nav "Dashboard" href=/dashboard (beda path) → tak match. Halaman /admin/users/verification & /admin/audit-logs bahkan tak punya nav item.
Fix: (1) `constants/navigation.ts` — Dashboard href ROLE-AWARE via `dashboardItem(role)` (ADMIN→/admin/dashboard); ADMIN nav += "Verifikasi Pengguna" (/admin/users/verification) + "Audit Log" (/admin/audit-logs); untuk ADMIN buang TRAILING (Sertifikat/Notifications — irrelevant + 404). (2) `components/layout/Sidebar.tsx` — deteksi active diganti BEST-MATCH (href prefix terpanjang yang cocok dgn pathname menang) via useMemo `activeHref`, ganti `pathname===href||startsWith` per-item → cegah no-highlight & dobel-highlight (mis. /projects vs /projects/create).
VERIFIED browser (p43-admin): /admin/dashboard→Dashboard active; /admin/projects/review→Tinjau Proyek; /admin/users/verification→Verifikasi Pengguna (tepat satu item tiap halaman); console 0 err; tsc 0. Decision D-FIX-1.

2026-06-26 (Admin /dashboard premium — semua role dashboard kini premium)
Task: lanjutan — redesign dashboard Admin ke gaya premium yang sama. DONE & browser-verified (p43-admin). Data 100% NYATA (admin punya endpoint lengkap dari Phase 2).
- `components/dashboard/AdminDashboard.tsx` (BARU, pakai dashboardKit): Welcome + 4 stat (Total Pengguna, Proyek Aktif, Verifikasi Pending, Tinjau Proyek — REAL dari adminApi.dashboard + listVerifications.meta.total), bento 3 kolom: Antrian Verifikasi (REAL listVerifications PENDING → /admin/users/verification), Tinjau Proyek (REAL projectApi.pending → /admin/projects/review), Aktivitas/Audit (REAL stats.recentActivities, action di-humanize → /admin/audit-logs).
- `app/admin/dashboard/page.tsx` ditulis ulang ringkas → render <AdminDashboard/> dalam AuthGuard ADMIN + AppShell (halaman kartu-statistik Phase 2 diganti). Admin tetap via redirect /dashboard→/admin/dashboard (tak masuk ROLE_DASHBOARD map).
- FIX konsistensi: stat "Verifikasi Pending" pakai meta.total antrian (request PENDING), BUKAN users.byStatus.PENDING_VERIFICATION (di test, user di-VERIFIED paksa via SQL tapi request masih PENDING → dua sumber beda; total antrian = konsisten dgn list).
- VERIFIED (p43-admin): Total Pengguna 7, Proyek Aktif 1, Verifikasi Pending 6, Tinjau Proyek 1; antrian verifikasi 5 + tinjau "wejlklj" + audit asli; semua link real; console 0 err. tsc 0. Decision D-BEG-4. **SEMUA 4 role dashboard kini premium.**

2026-06-26 (Senior & UMKM /dashboard premium — samakan dgn Beginner)
Task: lanjutan — bikin dashboard Senior & UMKM mirip Beginner (welcome+stat+bento). DONE & browser-verified 3 role.
- `components/dashboard/dashboardKit.tsx` (BARU, shared): initials/Avatar/SampleTag/Panel/StatCard/WelcomeHeader/CardHead/AgendaCard/ProjectMiniRow/PlaceholderActivityCard/PlaceholderNotifCard. BeginnerDashboard DI-REFACTOR pakai kit (hapus duplikat lokal; perilaku sama, tetap verified 0 err).
- `SeniorDashboard.tsx`: stat Proyek Mentoring (REAL {active}/5), Lamaran Mentor (REAL pending count), Review Tertunda (Contoh), Sertifikat 0. Bento: Proyek Mentoring (REAL dari /me/mentored-projects → row ProjectMiniRow ke workspace) | Aktivitas (Contoh) | Lamaran Mentor Saya (REAL mySeniorApplications → /applications/mentor) + Agenda (REAL deadline).
- `UMKMDashboard.tsx`: stat Proyek Aktif (REAL {active}/5), Sedang Rekrutmen (REAL count RECRUITING), Lamaran Senior (Contoh), Sertifikat 0. Bento: Proyek Saya (REAL dari /my-projects → row ke /projects/:id, footer Buat Proyek) | Aktivitas (Contoh) | Notifikasi (Contoh) + Agenda (REAL).
- Backend: endpoint baru `GET /me/mentored-projects` (SENIOR; project.service.getMentoredProjects → findManyPaginated({seniorId})), controller.mentoredProjects, route roleMiddleware SENIOR. /my-projects (UMKM) dipakai ulang utk UMKM dashboard (tanpa ubah backend). projectApi += mentoredProjects(). build 0, tsc 0.
- `app/dashboard/page.tsx`: ROLE_DASHBOARD map {BEGINNER,SENIOR,UMKM}; ADMIN tetap redirect. Banner verifikasi hanya bila status≠VERIFIED.
- VERIFIED browser: Senior (p4-senior) Proyek Mentoring 1/5 + 3 proyek + Lamaran 2 Diterima + Agenda; UMKM (p4-umkm) Proyek Aktif 1/5 + 4 proyek + Buat proyek; Beginner tetap OK. Clean-load console 0 err (catatan: ganti-akun di tab sama sempat 403 ke endpoint role lama krn appUser ke-cache sesaat — bukan masalah utk user single-role; reload bersih 0 err). Decision D-BEG-3.

2026-06-26 (Beginner /dashboard redesign — premium homepage dari screenshot)
Task: user kasih screenshot (design-refs/dashboard-beginner.png) + prompt UI lengkap (Clay/Linear-style premium), minta redesign dashboard Mahasiswa. DONE & browser-verified. User memilih: "Konten dashboard saja" (sidebar navy TETAP, tak ubah halaman lain) + "Data nyata + placeholder Contoh". "nanti role lain mirip" (belum dikerjakan).
- `/dashboard` (`app/dashboard/page.tsx`) dibuat role-branch: BEGINNER → `<BeginnerDashboard/>` (full-width) + banner verifikasi HANYA jika status≠VERIFIED; SENIOR/UMKM tetap konten generik lama (hero+alert+quick actions). ADMIN tetap redirect /admin/dashboard.
- `components/dashboard/BeginnerDashboard.tsx` (BARU): Welcome ("Selamat datang kembali, {firstName}! 👋"), 4 stat card (Proyek Aktif=REAL count membership ACTIVE, Tugas Berjalan=Contoh, Artifact=0 real "terbit usai selesai", Diskusi Baru=Contoh) ikon-chip warna + trend; bento 3 kolom [Proyek Saya | Aktivitas Terbaru | Notifikasi+Agenda]. Proyek Saya=REAL (thumbnail dekoratif, Aktif badge, judul, Bersama UMKM, deskripsi, avatar anggota, deadline; footer Jelajahi→/projects; empty-state "Cari Proyek"). Aktivitas=Contoh. Notifikasi=Contoh (Phase 9). Agenda Mendatang=REAL (derive dari deadline tiap proyek aktif, kotak tanggal + bulan ID). DESIGN.md tokens (paper/white card rounded-[20px]/app-reveal/link-green; sidebar navy AppShell tak diubah).
- Backend: include `/me/projects` diperkaya → project.description + projectMembers(ACTIVE){user{id,name}} untuk deskripsi+avatar kartu. Frontend MyMembership type += description + projectMembers. build 0, tsc 0.
- VERIFIED browser (p4-beginner): Proyek Aktif 1, Proyek Saya "Phase5 Workspace Test" (Bersama Test UMKM, avatar TB·BT, deadline 24 Jul), Agenda "24 JUL Deadline …", placeholder Tugas/Aktivitas/Notifikasi berbadge Contoh; console Errors:0. Decision D-BEG-2.

2026-06-26 (Beginner "Proyek Saya" bento dashboard — Figma 262:2; + Button nativeButton fix)
Task: user minta halaman "Proyek Saya" jadi bento grid sesuai Figma node 262:2. DONE & browser-verified. Branch `redesign/my-projects` (dari main pasca-merge Phase 7). User memilih: dashboard Beginner (Figma = tampilan Mahasiswa) + "tampilkan semua widget + placeholder" utk fitur yg belum ada. Dikonfirmasi via docs/08 (ada "My Projects - Beginner" L812) + roadmap Phase 10 (Beginner Dashboard) → memang scope.
- **Button fix** (`ui/button.tsx`): kalau prop `render` dipakai (Button jadi <a>/Link) → otomatis `nativeButton={false}`, hilangkan console error base-ui yg dulu ditandai "harmless". Global, semua call-site `render={<Link/>}` beres. Verified /my-projects console Errors:0.
- **Backend endpoint baru `GET /me/projects`** (membership caller): repo `projectMember.listByUserWithProject` (include project: umkm/senior/category/deadline/status + projectRole; status ACTIVE/COMPLETED/REMOVAL_REQUESTED), service `listMyProjects`, controller `myProjects`, route di routes/index.ts (authMiddleware). ALASAN: beginner member di-seed langsung sbg project_member TANPA application (cek DB: p4-beginner 0 application, membership ACTIVE di …0005) → sumber data harus membership, bukan application. build 0 err; route live (401 tanpa token).
- **Frontend** `services/projectApi.ts` += `MyMembership` type + `myMemberships()` (GET /me/projects). `components/project/BeginnerProjectBoard.tsx` (BARU): self-load membership ACTIVE → projectApi.detail/members + deliverable/contribution/review listForProject. Bento: Hero navy (judul, Aktif pill, Tim avatars, UMKM/Mentor/Deadline, Progress% dari milestone done/total, Lihat Diskusi/Deliverable→workspace), 4 stat card (Deliverable/Milestone/Kontribusi-skill/Hari Tersisa — REAL), Tugas Saya (PLACEHOLDER badge "Contoh", no Task entity), Milestone Proyek timeline (REAL status, no fake %), Aktivitas Terbaru (PLACEHOLDER "Contoh"), Tim Proyek (REAL mentor+anggota+role), Deliverable Terbaru (REAL judul/status/link Buka, file-size diabaikan krn LINK), Feedback Mentor (REAL review komentar dari SENIOR), Kontribusi Saya (REAL summary+skills). DESIGN.md tokens (paper/navy/chartreuse, app-reveal, link-green, rounded-[20px]).
- `/my-projects` dibuat **role-aware**: AuthGuard allowedRoles ["UMKM","BEGINNER"]; RoleRouter → BEGINNER=BeginnerView(PageHeader+board), else Content(daftar UMKM lama, tak diubah). Nav BEGINNER += "Proyek Saya"→/my-projects.
- VERIFIED browser (p4-beginner, proyek …0005): bento render data nyata (Deliverable 3/1 disetujui, Tim mentor+2, Deliverable list, Feedback "revisi", Kontribusi "Built landing + nav"+JavaScript); placeholder Tugas/Aktivitas berbadge Contoh; console Errors:0. backend build 0, frontend tsc 0. Decision D-BEG-1.

2026-06-25 (Nav — hapus Telusuri Proyek untuk UMKM)
Task: user minta ubah workflow — UMKM tidak punya fitur "Telusuri Proyek" (UMKM bikin proyek, bukan nyari). DONE & browser-verified.
- `constants/navigation.ts`: "Telusuri Proyek" dikeluarkan dari COMMON_ITEMS → jadi konstanta `BROWSE_PROJECTS`, di-append hanya ke ROLE_ITEMS BEGINNER/SENIOR/ADMIN. UMKM nav = Dashboard, Buat Proyek, Proyek Saya (+ trailing Sertifikat/Notifications). Route /projects tetap ada.
- Selaras docs/08 (Browse Projects hanya untuk Beginner [L779] & Senior [L895], tak ada versi UMKM). RBAC tak berubah. Verified p4-umkm: nav tanpa Telusuri Proyek; tsc 0. Decision D-NAV-1.

2026-06-25 (Phase 7.2 — Reviews & Ratings FRONTEND)
Task: Build the Phase 7.2 frontend on top of the already-done Phase 7.1 backend (Reviews & Ratings, Workflow 12). DONE & browser-verified (senior + UMKM + beginner). Note: the /clear init prompt was STALE (said "build Phase 7 / merge phase-6") — reconciled against memory: Phase 6 already merged to main (1fc2b7e), Phase 7.1 backend already committed on branch feature/phase-7-reviews. So no rebuild/merge — went straight to 7.2 frontend.
- `services/reviewApi.ts` — service object (pola contributionApi). Types ProjectReview (listInclude: reviewer+reviewee {id,name,role}) + UserReview (reviewer+project). Methods: listForProject (GET /projects/:id/reviews), listForUser (GET /users/:id/reviews), reviewBeginner (POST /projects/:id/reviews/beginner {reviewee_id,rating,comment}), reviewSenior (POST /projects/:id/reviews/senior {rating,comment}), update (PUT /reviews/:id). + REVIEW_TYPE_LABEL.
- `components/review/StarRating.tsx` — reusable 1–5 star control. `onChange` present = interactive radiogroup (hover preview, keyboard, focus ring); absent = read-only display (role=img, aria-label). Filled = #ffb800.
- `components/workspace/ReviewTab.tsx` — Review Center (7.2.1) + in-context received view. Role-adaptive: isLeadSenior (SENIOR & project.senior.id==me) → review each ACTIVE beginner member; isOwnerUmkm (UMKM & project.umkm.id==me) → review beginners + the senior (extra target). Each target card: existing review → display stars+comment+"Sudah dinilai" badge+Edit; none → star picker + comment + Kirim Review. Submit disabled unless project ACTIVE (backend gate). Beginner/reviewee → read-only list of reviews received in this project (filtered reviews where revieweeId==me). Reuses projectApi.members for active-member list.
- `app/reviews/page.tsx` — My Reviews (7.2.2), AuthGuard allowedRoles BEGINNER. GET /users/me/reviews across ALL projects → average-rating summary card + per-review cards (stars, reviewer name+role, comment, project title link in link-green #5f8c00, "diedit" flag).
- Wired "Review" tab into `app/projects/[id]/workspace/page.tsx` (between Kontribusi & Anggota). Added BEGINNER nav item "Review Saya"→/reviews (Star icon) in `constants/navigation.ts`.
- DESIGN.md adherence: app-reveal staggered cards, card rounded-[20px] border, tabular-nums on ratings, link-green for links, no chartreuse-as-text, inline forms.
- VERIFIED (Playwright, project a1a1a1a1-…0005 ACTIVE, pre-seeded 3 reviews from 7.1 E2E): SENIOR Review tab → Test Beginner "Sudah dinilai" 4/5 + edit, Beginner Two picker → submitted 5/5 + comment OK (create path). UMKM Review tab → beginners + Test Senior (Mentor) target "Sudah dinilai" 5/5 (umkm→senior branch renders). BEGINNER /reviews → avg 4.0, 2 cards (from Test UMKM "oke" / Test Senior "revisi · diedit") + project links; workspace Review tab → read-only received view. Frontend `npx tsc --noEmit` 0 errors. Decision D-P7-2.

2026-06-23 (Landing → auth/flows wiring + user decisions)
Task: Connect the landing (single entry point for all users) to auth + other flows. DONE & browser-verified.
- Role CTAs deep-link the registration role: CTA section "Saya Mahasiswa/Mentor/UMKM" → `/auth/register?role=BEGINNER|SENIOR|UMKM`; `app/auth/register/page.tsx` reads `?role` (client, window.location → registrationStore.setRole, validated vs VALID_ROLES) so step-2 arrives pre-selected. Verified: sessionStorage `edunomad-registration` role set.
- Authed-user redirect: new `components/landing/authed-redirect.tsx` (client) — on resolved session, `router.replace("/dashboard")`; rendered in `app/page.tsx`. Logged-out paint landing instantly. Verified: logged-in `/`→/dashboard (backend up); logged-out stays `/` w/ Masuk+Gabung.
- Footer trimmed (`footer.tsx`): removed Perusahaan/Sumber Daya/Legal placeholder columns + Verifikasi Sertifikat (no pages exist); kept Platform (anchors + /projects) + new Mulai column (role register links + Masuk). Only `/projects` & `/dashboard` exist as routes.
- Removed Portfolio "Lihat Contoh Sertifikat" button (cert example to live on landing later); dropped unused Link import.
- Verified: `npx tsc --noEmit` clean; browser flows confirmed. Decisions D-LP-6, D-LP-7.

2026-06-23 (Landing Page — UX/a11y polish pass)
Task: Polish the landing using web-design-guidelines + emil-design-eng + ui-ux-pro-max (user request). DONE & browser-verified.

Changes: globals.css (+[data-landing] base layer: focus-visible rings [ink default, lime via .ln-dark], touch-action+tap-highlight, smooth scroll gated by reduced-motion, scroll-margin-top on section[id], ::selection; darkened --color-ln-faint #9a968c→#78746a). page.tsx (+data-landing, skip-link, main id). header.tsx (rewritten: mobile hamburger menu w/ AnimatePresence + Esc + scroll-lock; IntersectionObserver scroll-spy active nav + aria-current; nav aria-labels; active:scale press). motion.tsx (CountUp tabular-nums). All sections: transition-all→explicit props, active:scale on buttons, contrast bumps on dark text (white/40–55→/60–70), aria-hidden decorative icons. faq.tsx (aria-controls + role=region + aria-labelledby). testimonials.tsx (fake arrows/dots → real touch carousel: snap-scroll mobile / grid desktop + working prev/next buttons). footer.tsx (+.ln-dark, social spans→links w/ aria-label, contrast bumps).

Verified: `npx tsc --noEmit` clean; `npm run build` 0 errors (`/` static). Browser (Playwright): mobile (390px) hamburger opens menu panel w/ nav+CTA; desktop focus-visible ring on Tab; click "Portofolio" → smooth-scroll, heading lands below sticky header (scroll-margin OK), nav shows active state (scroll-spy). Decision D-LP-5.

2026-06-23 (Landing Page — marketing `/` built from Figma)
Task: Build the public landing page from the user's matured Figma design ("Premium SaaS Landing Page", file nMFbzuPNcRcKgFVvMEFfaj, node 5:2). Used skills impeccable (lead build) + emil-design-eng (motion) + ui-ux-pro-max; Figma MCP as source of truth. DONE & browser-verified.

Scope decision (asked user): animation via `motion` library (installed in frontend ^12.40.0); landing replaces `/` (old login/dashboard redirect removed) — both user-approved.

Design system: landing uses a DISTINCT premium palette from the in-app design system, so it's scoped as `ln-*` Tailwind tokens in globals.css (@theme): --color-ln-bg #faf8f3, ln-ink #0f1115, ln-muted #6b6860, ln-accent #96da55, ln-accent-strong #87c522, ln-accent-ink #5da316, ln-accent-soft #e1fcdc, ln-card/surface/line; + display type scale (--text-ln-display/h2/lead) + --ease-ln-out. The app's docs/08 green system (#67C957 etc.) is untouched. Font: existing Inter (variable → Black weight available).

Files (new): components/landing/motion.tsx (Reveal, Stagger, StaggerItem, Floaty, CountUp — all reduced-motion aware + SSR-safe mounted-gate so reveals never ship blank); components/landing/primitives.tsx (Container, SectionLabel, SectionHeading); components/landing/header.tsx (sticky, blur-on-scroll, auth-aware CTA); components/landing/footer.tsx; components/landing/sections/{hero,problem,how-it-works,feature-grid,project-showcase,portfolio,impact,testimonials,faq,cta}.tsx. Modified: app/page.tsx (was a redirect → now composes the 11-section landing), app/globals.css (+ln-* tokens), frontend/package.json (+motion).

11 sections, faithful to Figma: Hero (headline + floating card cluster w/ Floaty + ambient glow + animated progress fills; gradient avatars since Figma photo assets are temporary URLs), Problem (3 cards), HowItWorks (dark rounded block, 6-step grid + banner), FeatureGrid (bento, mini-mockups + QR glyph), ProjectShowcase (dark, gradient project cards + filter chips), Portfolio (certificate mock + verified checklist), Impact (dark, 4 CountUp stats), Testimonials (3 cards, middle dark), FAQ (interactive accordion via AnimatePresence height), CTA (lime block), Footer (dark, 4 cols). Anchors: #cara-kerja #fitur #proyek #portofolio #faq.

Verified: frontend `npx tsc --noEmit` clean; `npm run build` 0 errors, `/` prerendered STATIC (54.2 kB / 169 kB first load). Browser (Playwright, 1280px): every section screenshotted & confirmed faithful + motion working (hero float, scroll reveals, count-up to 500+/100+/50+/90+, FAQ open/close, hover lifts). Only console error = backend /auth/me ECONNREFUSED (backend stopped — harmless). Decisions D-LP-1..4.

2026-06-22 (Phase 4.3 — Project Members & Lifecycle, Workflow 5/11/15/16/17)
Task: PHASE 4.3 — Project Members (list/remove/withdraw/admin-confirm) + Project Lifecycle (start/complete/confirm-completion). DONE & verified (backend E2E + Playwright browser).

Files (new, backend): services/projectMember.service.ts; services/projectLifecycle.service.ts; modules/projectMember/projectMember.controller.ts; modules/projectLifecycle/projectLifecycle.controller.ts; validators/projectMember.validator.ts; routes/member.routes.ts. Modified (backend): constants/applicationStatus.ts (MemberStatus +REMOVAL_REQUESTED); constants/projectStatus.ts (+AWAITING_COMPLETION + into PUBLIC_PROJECT_STATUSES); repositories/projectMember.repository.ts (+findById, updateStatus, requestRemoval[txn+audit], confirmRemoval[txn+audit], countActiveByProject; +memberDetailInclude); repositories/project.repository.ts (+countActiveAssignedBySenior, completeWithAudit[txn]; +import MemberStatus); routes/project.routes.ts (+GET /:id/members, POST /:id/start, /:id/complete, /:id/confirm-completion); routes/admin.routes.ts (+POST /members/:id/remove confirm); routes/index.ts (+mount /members). Files (new, frontend): components/project/ProjectMembersPanel.tsx. Modified (frontend): services/projectApi.ts (+MemberStatus/ProjectMember types, AWAITING_COMPLETION status+meta, MEMBER_STATUS_META, members/requestRemoveMember/withdrawMember/start/requestCompletion/confirmCompletion/confirmMemberRemoval); app/projects/[id]/page.tsx (+LifecycleAction component + lifecycle buttons + ProjectMembersPanel). task-breakdown §4.3.1/4.3.2/4.3.3 → done.

API live at /api/v1: GET /projects/:id/members (auth); POST /members/:id/remove (SENIOR lead → REMOVAL_REQUESTED + audit MEMBER_REMOVED stage REQUESTED w/ reason); POST /members/:id/withdraw (member self → WITHDRAWN, frees BR-001 slot); POST /admin/members/:id/remove (ADMIN → REMOVED + audit stage CONFIRMED); POST /projects/:id/start (SENIOR lead → ACTIVE; needs senior assigned + ≥1 ACTIVE member; senior & UMKM max-5-ACTIVE gates); POST /projects/:id/complete (SENIOR lead → AWAITING_COMPLETION); POST /projects/:id/confirm-completion (UMKM owner → COMPLETED + completedAt + ACTIVE members→COMPLETED + audit PROJECT_COMPLETED). All multi-step state changes use prisma.$transaction; member-removal & project-completion write auditLog. Ownership/role checks in services.

New statuses: MemberStatus.REMOVAL_REQUESTED (Workflow 17 intermediate); ProjectStatus.AWAITING_COMPLETION (Workflow 11/15, ACTIVE→AWAITING_COMPLETION→COMPLETED). VARCHAR columns, no DB enum → no migration. Completion-readiness gates (deliverables/contributions/reviews/artifacts per Workflow 15) deferred to their owning later phases (D-P4.3-3) — only transition + ownership/state checks + audit built now.

Verification: backend `npm run build` 0 errors; frontend `npx tsc --noEmit` clean. Backend E2E vs live DB (script /tmp/p43-e2e.sh): reused p4-umkm/senior/beginner + provisioned p43-b2/b3 (BEGINNER) + p43-admin (ADMIN, role+VERIFIED via SQL); on "Phase4 Recruitment Test": role create → UMKM accept senior → 3 beginners apply+accept (ACTIVE) → GET members (3) → senior START (RECRUITING→ACTIVE; UMKM start 403) → b2 WITHDRAW (foreign-withdraw 403) → senior REMOVAL REQUEST on b3 (re-request 422, no-reason 400) → admin CONFIRM removal (no-pending 422; senior-on-admin-route 403) → senior COMPLETE (UMKM-complete 403; →AWAITING_COMPLETION) → UMKM CONFIRM-COMPLETION (senior 403; →COMPLETED+completedAt; member_keep ACTIVE→COMPLETED) → start-on-completed 422. DB confirmed member statuses REMOVED/WITHDRAWN/COMPLETED + audit rows MEMBER_REMOVED(REQUESTED+reason)/MEMBER_REMOVED(CONFIRMED)/PROJECT_COMPLETED. Browser (Playwright) on fresh "Phase43 Lifecycle Browser Test" (RECRUITING + senior + 1 ACTIVE member): senior login → "Mulai Proyek" confirm → status "Aktif" + panel shows "Ajukan Penyelesaian"; "Keluarkan" reason dialog submit → member badge "Diajukan Keluar"; "Ajukan Penyelesaian" → "Menunggu Konfirmasi"; UMKM login → "Konfirmasi Penyelesaian" → status "Selesai" read-only (actions gone). DB+audit re-confirmed. Decisions D-P4.3-1..6.

2026-06-21 (Phase 4 recruitment — 4.1 senior apps + 4.2 beginner apps backend + recruitment frontend)
Task: PHASE 4 Workflow 3/4/5 — Senior Application module, Beginner Application module, recruitment UI. DONE & verified.

Files (new, backend): constants/applicationStatus.ts; repositories/{seniorApplication,projectApplication,projectMember}.repository.ts; services/{seniorApplication,projectApplication}.service.ts; validators/{seniorApplication,projectApplication}.validator.ts; modules/{seniorApplication,projectApplication}/<f>.controller.ts; routes/{seniorApplication,application}.routes.ts. Modified (backend): repositories/project.repository.ts (+countAssignedActiveBySenior [BR-002 RECRUITING+ACTIVE], +setSenior); routes/project.routes.ts (+nested /:id/senior-apply, /:id/senior-applications, /:id/apply, /:id/applications); routes/index.ts (+mount /senior-applications, /applications). Files (new, frontend): services/applicationApi.ts; app/applications/page.tsx; app/applications/mentor/page.tsx; app/projects/[id]/manage/page.tsx; app/projects/[id]/applicants/page.tsx. Modified (frontend): app/projects/[id]/page.tsx (enabled apply dialogs + role-aware links); constants/navigation.ts (+SENIOR/BEGINNER items). task-breakdown §4.1/4.2/4.4 → done.

API live at /api/v1: POST /projects/:id/senior-apply; DELETE /senior-applications/:id; GET /projects/:id/senior-applications; GET /senior-applications (own); POST /senior-applications/:id/accept|reject; POST /projects/:id/apply; DELETE /applications/:id; GET /projects/:id/applications; GET /applications (own); POST /applications/:id/accept|reject. Senior accept = txn (app ACCEPTED + project.senior_id + others REJECTED). Beginner accept = txn (app ACCEPTED + project_member ACTIVE + BR-005 auto-withdraw beginner's other PENDING + capacity/BR-001 re-check).

Business rules enforced: BR-001 (beginner ≤1 ACTIVE membership), BR-002 (senior ≤5 RECRUITING+ACTIVE), BR-004 (beginner apply only after senior assigned), BR-005 (auto-withdraw on accept), BR-006 (1 senior/project), BR-007 (VERIFIED only — requireVerified on apply). RBAC: senior decisions only by UMKM owner; beginner decisions only by project's senior.

Verification: backend `npm run build` 0 errors. Full backend E2E vs live DB — provisioned UMKM/SENIOR/BEGINNER (signup→signin→register→SQL VERIFIED) + RECRUITING project: DRAFT apply→422, beginner-before-senior→422 (BR-004), senior apply→201, dup→422, wrong-role accept→403, UMKM accept→200 (senior_id set), beginner apply→201, senior accept→200; DB confirmed senior assigned + 1 ACTIVE member + both apps ACCEPTED. Frontend tsc clean. Browser (Playwright): senior login → nav "Lamaran Mentor" → /projects/:id enabled "Apply sebagai Mentor" → dialog → submit → DB PENDING row → /applications/mentor renders card w/ message+withdraw. Decisions D-P4-1..5.

Env note: frontend dev wouldn't boot — npm had silently dropped several of next's transitive deps (styled-jsx, @swc/helpers, @next/env: 0 lock entries). Fixed via `npm cache clean --force` + clean reinstall; backend @types pin (5.0.7) survived & re-verified. Left styled-jsx as explicit frontend dep (D-P4-4).

2026-06-21 (Phase 3 backend)
Task: PHASE 3 — Project Module (3.1.1-3.1.5) + Admin Project Approval (3.2.1). Backend done & verified; frontend 3.3/3.4 pending.

Files (new): constants/projectStatus.ts; repositories/{project,milestone,projectRole}.repository.ts; services/{project,milestone,projectRole}.service.ts; validators/{project,milestone,projectRole}.validator.ts; modules/{project,milestone,projectRole}/<f>.controller.ts; routes/{project,milestone,role}.routes.ts. Modified: modules/admin/admin.controller.ts (+pendingProjects/approveProject/rejectProject), routes/admin.routes.ts (+/projects/pending,approve,reject), routes/index.ts (+projects/milestones/roles/my-projects). task-breakdown.md 3.1.1-3.2.1 -> [x].

API live at /api/v1: GET /projects & /projects/:id (public, visible-status-only, q/category/status filters); POST/PUT/DELETE /projects (UMKM owner, create=VERIFIED+max5active, edit/delete=DRAFT-only); POST /projects/:id/submit; GET /my-projects; GET/POST /projects/:id/milestones; PUT/DELETE /milestones/:id; GET/POST /projects/:id/roles; PUT/DELETE /roles/:id; GET /admin/projects/pending; POST /admin/projects/:id/approve(→RECRUITING)|reject(→REJECTED) +audit.

Summary: Read Workflow 2 + API spec Projects/Milestones/Roles + Project/Milestone/ProjectRole/RoleSkill schema. User confirmed project-status decision up front (approve→RECRUITING, 6-status set). Followed layered + transactional-with-audit patterns. 3 doc-gap decisions recorded (submit endpoint, public visibility, milestone dual-manager). Verified E2E with real UMKM+admin JWT vs live DB (11 scenarios all correct: create/edit/role+skills/milestone/draft-hidden/submit/admin-queue/403-non-umkm/approve→RECRUITING/audit/now-visible). DB cleaned, server stopped, tsc clean. Context hit critical → handed off (this entry + MEMORY-CLAUDE.md INIT prompt for 3.3/3.4 frontend).

2026-06-20 16:45
Task:
PHASE 2 — Admin: User Verification & Core Admin (2.1, 2.2, 2.3, 2.4). FULLY COMPLETE.

Files (new unless noted):
- backend: constants/auditActions.ts; repositories/{auditLog,verification,category,adminStats}.repository.ts + skill.repository.ts (MOD: findPendingPaginated, setStatusWithAudit); services/{auditLog,verification,category,adminDashboard}.service.ts + skill.service.ts (MOD: getPendingSkills/approveSkill/rejectSkill); validators/{auditLog,verification,category}.validator.ts; modules/admin/{admin,auditLog}.controller.ts, modules/verification/verification.controller.ts, modules/category/category.controller.ts; routes/{verification,category,admin}.routes.ts + routes/index.ts (MOD: mount /categories,/admin,verification)
- frontend: services/adminApi.ts; app/admin/dashboard/page.tsx, app/admin/users/verification/page.tsx, app/admin/audit-logs/page.tsx; app/dashboard/page.tsx (MOD: ADMIN->/admin/dashboard redirect)
- task-breakdown.md (2.1.1-2.4.3 -> [x])

API Changes (live at /api/v1):
- GET /verification-status, POST /verification-request (auth)
- GET /categories (public)
- GET /admin/dashboard, GET /admin/verifications, POST /admin/verifications/:id/approve, POST /admin/verifications/:id/reject
- GET /admin/skills/pending, POST /admin/skills/:id/approve|reject
- GET /admin/categories, POST /admin/categories, PUT/DELETE /admin/categories/:id
- GET /admin/audit-logs  (all /admin/* are ADMIN-only via roleMiddleware)

Summary:
Read API spec Verification+Admin endpoint contracts + the ProjectCategory/AuditLog/Notification schemas before building. Followed all established patterns (layered, controllers in modules/, transactional repos). Verification approve/reject + skill approve/reject are transactional (status change + audit log in one prisma.$transaction) so mandatory audit logging can't diverge from the state change. Verification request supporting info maps into the notes column (same map-to-existing approach as registration; decisions.md). All /admin routes gated by authMiddleware + roleMiddleware(['ADMIN']) which already existed from Phase 1.

Verified backend E2E with a real admin JWT against the LIVE DB (10 scenarios, throwaway script, deleted after): submit verification (notes composed "Portfolio:.../Pengalaman: N tahun/..."), GET /verification-status, admin dashboard stats (users byStatus), pending-verification queue, 403 when a non-admin hits /admin/verifications (role middleware), approve -> verification_request APPROVED + user VERIFIED, audit-logs filtered by action shows VERIFICATION_APPROVED with metadata, public categories (5 seeded), category create/update/delete, pending skills (0). Cleaned up test data (deleted test auth user + orphaned public.users row + orphaned audit log; admin seed untouched; verified DB: 0 test users, 0 audit logs).

Built 3 frontend admin pages (AuthGuard allowedRoles ADMIN): dashboard (stat cards from real API), user verification (tabs + approve + reject-with-reason dialog), audit logs (table + filters + pagination). /dashboard redirects ADMIN to /admin/dashboard. Verified in browser: admin login -> auto-redirect to /admin/dashboard showing real data (Pengguna 1, Verified 1), verification page (tabs + empty state), audit logs page (filters + empty state). Both tsc clean. Servers stopped at end.

PHASE 2 fully complete & verified. Next: PHASE 3 — Project Creation & Admin Approval (3.1 Project Module, 3.2 Admin Project Approval, 3.3 Frontend Project Pages UMKM). NOTE: Phase 3 introduces the Project domain — projects.status enum is DRAFT|PENDING_REVIEW|PUBLISHED|RECRUITING|ACTIVE|OVERDUE (schema comment) but API spec approve says PENDING_REVIEW->RECRUITING in one place and ->PUBLISHED in another — reconcile before building 3.2 (docs win; check WF Workflow 2 + RBAC Project Status Rules which list DRAFT/PENDING_REVIEW/RECRUITING/ACTIVE/COMPLETED).

2026-06-20 16:00
Task:
PHASE 1.3 — Frontend Auth Pages (1.3.1-1.3.8) + backend POST /auth/signup & POST /auth/register. PHASE 1 NOW FULLY COMPLETE.

Files (new unless noted):
- backend: validators/auth.validator.ts (registerSchema, signupSchema), repositories/registration.repository.ts (transactional createRegistration), services/auth.service.ts (MOD: +signup, +register), modules/auth/auth.controller.ts (MOD: +signup, +register), routes/auth.routes.ts (MOD: +/signup, +/register), middleware/authMiddleware.ts (MOD: +requireSupabaseUser lenient variant), types/express.d.ts (MOD: +req.supabaseUser), repositories/skill.repository.ts (MOD: +findManyByIds)
- frontend: types/user.ts, stores/{authStore(MOD:+appUser),registrationStore}.ts, services/{authApi,skillApi}.ts, components/auth/{AuthProvider,AuthCard,PasswordInput,RegistrationProgress,AuthGuard}.tsx, hooks/useRequireSession.ts, lib/buildRegisterPayload.ts, app/auth/login/page.tsx, app/auth/register/(page+role+about+portfolio+skills), app/dashboard/page.tsx, app/page.tsx (MOD: root redirect), app/layout.tsx (MOD: AuthProvider)
- DB: Supabase MCP migration create_cvs_storage_bucket (public cvs bucket + RLS: authenticated INSERT, public SELECT)
- task-breakdown.md (1.3.1-1.3.8 -> [x])

API Changes:
- POST /api/v1/auth/signup (public — admin createUser email_confirm:true)
- POST /api/v1/auth/register (authenticated lenient — creates users+profile+skills+experiences+portfolio_links+verification_request in one transaction)

Summary:
Before building, read Workflow-1 + the Login/Registration UI specs. Hit TWO genuine doc conflicts and asked the user (AskUserQuestion) rather than guessing, per CLAUDE.md: (1) role-specific registration fields (institution/company/business/city/CV) have NO user_profiles columns — user chose "map to existing fields" (compose into headline/bio, affiliation->experiences row, CV->portfolio_link OTHER); (2) no documented registration endpoint — user approved POST /auth/register. Both recorded in decisions.md.

Then discovered the project has "Confirm email" ON (verified empirically — client signUp returns no session), which would block the multi-step wizard. Solved with a backend POST /auth/signup using admin createUser(email_confirm:true) so the user gets a session immediately and stays authenticated through steps 2-5 (needed for the authenticated CV Storage upload). Created a public `cvs` Storage bucket (5MB, PDF/DOCX) + RLS policies via MCP migration.

Built the whole auth frontend: AuthProvider bootstraps the Supabase session + loads the app user (role/status) from GET /auth/me into authStore; a persisted (sessionStorage) registrationStore accumulates wizard data across the 5 step pages; buildRegisterPayload maps it to the backend contract per the approved field-mapping; completion POSTs /auth/register, re-fetches /auth/me, and lands on a minimal /dashboard with a verification-status banner. AuthGuard + useRequireSession + root redirect handle route protection.

VERIFIED END-TO-END in a real browser (Playwright; screenshots timed out on font-load in this env, so used accessibility snapshots + DOM eval) against the LIVE backend + DB: completed a full BEGINNER registration through all 5 steps -> redirected to dashboard showing "Halo, Wizard Tester / Peran: BEGINNER / Status: PENDING VERIFICATION" + "Menunggu Verifikasi" warning banner. Queried the DB: users(BEGINNER, PENDING_VERIFICATION) + profile(headline="Mahasiswa · Teknik Informatika · Yogyakarta", bio with "Minat belajar: Frontend" appended) + 2 user_skills + 1 experience (affiliation) + 2 portfolio_links + verification_request(PENDING) — exactly per the approved mapping. Logout->login->dashboard verified. Authenticated REST upload to the cvs bucket returned 200 (confirms the Storage RLS policy). Cleaned up all test data (2 throwaway auth users + 1 storage object deleted; seed admin untouched) and all temporary scripts/screenshots. Both backend & frontend tsc clean.

PHASE 1 (1.1 + 1.2 + 1.3) is fully complete and verified. Next: PHASE 2 — Admin: User Verification & Core Admin (2.1 Verification Module, 2.2 Audit Log Module).

2026-06-20 15:30
Task:
PHASE 1 — Backend Auth Module (1.1.1-1.1.5) + Backend User Module (1.2.1-1.2.6). First task under Opus 4.8 (model switched from Sonnet 4.6 by user mid-project; continuity preserved via memory files + same chat).

Files (all new unless noted):
- backend/src/config/supabase.ts (service-role admin client)
- backend/src/config/env.ts (MODIFIED: +supabaseUrl/supabaseServiceRoleKey, required() validator)
- backend/src/utils/errors.ts (MODIFIED: +UnverifiedUserError, +SuspendedUserError, both 403)
- backend/src/types/auth.ts, backend/src/types/express.d.ts (req.user augmentation)
- backend/src/middleware/{authMiddleware,roleMiddleware,verificationMiddleware}.ts
- backend/src/repositories/{user,skill,experience,portfolioLink}.repository.ts
- backend/src/services/{auth,user,skill,experience,portfolioLink}.service.ts
- backend/src/validators/{user,skill,experience,portfolioLink}.validator.ts
- backend/src/modules/{auth,user,skill,experience,portfolioLink}/<feature>.controller.ts
- backend/src/routes/{index,auth,user,skill,userSkill,experience,portfolioLink}.routes.ts
- backend/src/index.ts (MODIFIED: mount apiRoutes at /api/v1)
- task-breakdown.md (1.1.1-1.1.5, 1.2.1-1.2.6 -> [x])

Database Changes: None (schema already complete from Phase 0).

API Changes (now live at /api/v1):
- GET /auth/me, POST /auth/logout
- GET/PUT /users/me, GET /users/:id, GET /users/:id/portfolio
- GET /skills (public, paginated, filter category/status)
- GET/POST/PUT/DELETE /users/me/skills, .../experiences, .../portfolio-links

Summary:
Read RBAC (06), API spec (04) auth+user sections, ARCH (05) backend structure, and the Prisma schema before coding. Two key design decisions (both in decisions.md): (1) backend folder layout honoring all ARCH folders with controllers in modules/; (2) JWT verification via supabase.auth.getUser(token) + role/status lookup from public.users, since the Supabase JWT's role claim is just "authenticated" and the app role lives in the DB. Confirmed via Context7 that getUser is the key-agnostic approach (the real admin token is ES256 / asymmetric). Built verificationMiddleware in two variants — requireVerified (only VERIFIED, for restricted actions) and requireActiveAccount (allows PENDING per RBAC Rule 2, blocks SUSPENDED/REJECTED, for profile/skill/experience writes).

Verified the WHOLE backend (1.1+1.2) end-to-end with a REAL Supabase JWT (minted by signing in as the seeded admin) against the LIVE database — not just tsc. 18 scenarios all passed: 401 on missing/invalid token, 200 on valid; /auth/me returns role ADMIN status VERIFIED; PUT /users/me creates the profile row; skill add (201) / duplicate (422) / invalid level (400) / update / list / delete; experience + portfolio-link CRUD (201s); invalid link type (400); GET /users/:id/portfolio returns skills+experiences+links; logout 200. Throwaway token-mint script deleted after testing. Backend left running on :3001 for the upcoming frontend integration.

OPEN GAP flagged for 1.3.7: no documented API endpoint exists to create the public.users row + profile + skills/experiences/portfolio + verification_request after Supabase signUp (API spec only documents /auth/me + /auth/logout). Will define POST /api/v1/auth/register to fulfill the documented Workflow-1 registration and record it as a decision when building 1.3.7.

2026-06-20 14:55
Task:
PHASE 0 — Tasks 0.4.2 through 0.4.7 (rest of "0.4 — Frontend Infrastructure") — Phase 0 now fully complete

Files:

- frontend/src/components/ui/{input,textarea,select,checkbox,card,dialog,badge,progress,avatar,dropdown-menu,sheet,skeleton,sonner,separator,label,alert}.tsx (new, via shadcn CLI)
- frontend/src/components/ui/button.tsx (customized: Primary/Secondary/Tertiary variants with exact doc hex states, rounded-full, doc-exact padding)
- frontend/src/components/ui/card.tsx (rounded-xl→rounded-lg, added shadow-sm)
- frontend/src/components/ui/badge.tsx (secondary variant → gray, matching doc's "inactive" spec)
- frontend/src/components/ui/alert.tsx (added colored border-l-4 per type: default/destructive/warning/success)
- frontend/src/components/ui/skeleton.tsx (bg-muted → bg-neutral-gray-light, contrast fix)
- frontend/src/app/layout.tsx (Toaster wired in)
- frontend/src/lib/apiClient.ts (new)
- frontend/src/lib/supabase/client.ts (new)
- frontend/src/services/auth.ts (new)
- frontend/src/stores/{authStore,notificationStore,uiStore}.ts (new)
- frontend/src/constants/navigation.ts (new)
- frontend/src/components/layout/{Sidebar,Header,Breadcrumbs,AppShell}.tsx (new)
- frontend/src/components/common/{EmptyState,ErrorState,LoadingState,ConfirmDialog}.tsx (new)
- frontend/src/app/globals.css (removed custom --spacing-* tokens — bug fix, see below)
- frontend/package.json (added @supabase/supabase-js, axios)
- task-breakdown.md (0.4.2–0.4.7 marked [x])

Database Changes:

- None

API Changes:

- None (frontend infra only)

Summary:
Worked through 0.4.2–0.4.7 sequentially, using TaskCreate to track each. Per user's earlier "oke lanjut" continuation pattern, read the relevant docs/08 sections (Component Inventory, Shared Components & Patterns) and docs/05 (State Management) before each task, checked Context7 for shadcn CLI syntax, Zustand v5 create<T>() pattern, axios interceptors, Supabase JS v2 auth methods, and Express 5's req.query getter-only quirk (relevant again for the API client's request interceptor).

0.4.2: Installed 16 shadcn components in one `npx shadcn add` call. Customized button/card/badge/alert to match docs/08's literal Button Styles / Card / Badge/Tag / Alert-Notification specs (exact hex hover/active states, radius-full buttons, colored alert borders) rather than leaving shadcn's generic defaults — verified visually via a temporary probe page + Playwright screenshots before/after each fix.

0.4.3: Built `apiClient.ts` (axios, baseURL defaulting to `http://localhost:3001/api/v1`, request interceptor pulling the Supabase JWT via `getSession()`, response interceptor normalizing the backend's error envelope into `ApiError`). Verified end-to-end against the REAL running backend (booted it, hit a nonexistent route through the client, confirmed the 404 + message flowed through correctly) — not just type-checked.

0.4.4: `lib/supabase/client.ts` + `services/auth.ts` (signIn/signUp/signOut/getSession wrapping `@supabase/supabase-js` v2's `signInWithPassword`/`signUp`/`signOut`/`getSession`). Verified live against the actual EduNomad Supabase project — `getSession()` returned `hasSession:false, error:null`, confirming real connectivity (not mocked).

0.4.5: Three Zustand stores matching the doc's exact listed shape. Verified functionally (not just compiled) by clicking through actions in a temp test page and reading back updated state.

0.4.6: Before building, asked the user (AskUserQuestion) how to handle "role-aware" sidebar nav given the UI spec only documents one generic structure while per-role pages don't exist yet — user chose the generic-nav-for-all-roles option. Built Sidebar/Header/Breadcrumbs/AppShell; mobile hamburger opens a `Sheet` drawer containing the same Sidebar. Verified at both desktop and mobile (390px) viewports via Playwright, including opening the mobile drawer and the user avatar dropdown (shows email/Guest + Logout wired to `signOut()`).

0.4.7: Built EmptyState/ErrorState/LoadingState (Card/List/Table/Input skeleton presets)/ConfirmDialog. Success toast intentionally has no extra wrapper — `toast.success()` from sonner (already wired in 0.4.2) directly satisfies the doc's "icon + message + auto-dismiss 3-5s" requirement (sonner defaults to 4s).

**Two real bugs found and fixed during this task's in-browser verification (not caught by `tsc`):**
1. **Sitewide, critical:** discovered `max-w-sm` was silently resolving to `8px` instead of `24rem`, breaking text wrapping everywhere (one word per line) — root cause: the custom `--spacing-xs/sm/md/lg/xl/2xl/3xl` tokens added in 0.4.1 collide with Tailwind's `max-w-*`/`w-*`/`h-*` utilities, which ALSO read named keys from the `--spacing-*` namespace, not just padding/gap. Fixed by deleting those custom tokens entirely and converting every component (button, Sidebar, Header, AppShell, EmptyState, ErrorState, LoadingState) to Tailwind's stock numeric scale, which already matches the doc's px values exactly. This is now a hard rule (see decisions.md) — never reintroduce named `--spacing-*` tokens.
2. Skeleton component invisible against the page background (`bg-muted` = `#F5F5F5` = same as `--background` after 0.4.1's palette change) — fixed to `bg-neutral-gray-light`.

Also spent considerable effort investigating an apparent "toast never appears" failure (`toast.success()` returned a valid id but `data-sonner-toaster` never appeared in the DOM). Methodically bisected via isolated reproductions: plain button+Toaster (worked) → custom Button (worked) → adding back EmptyState/ErrorState/LoadingState/ConfirmDialog one at a time (all worked) → custom sonner wrapper (worked) → relying on layout.tsx's Toaster instead of a local one (worked) → full original composition after a clean dev-server + `.next` cache restart (worked). Concluded this was a transient Fast Refresh artifact from the rapid edit-and-reload cycle while fixing bug #1, not a real code defect — sonner 2.0.7 + React 19.2.7 + Next 15.5.19 all work correctly together. Documented the investigation in decisions.md/current-status.md in case it resurfaces, since the root cause of the transient state was never fully pinned down, just ruled out as environment/timing rather than code.

Cleaned up all temporary test pages, processes, and `.playwright-mcp/` screenshot directories before finishing. Marked 0.4.2–0.4.7 `[x]` in task-breakdown.md — **all of Phase 0 (0.1 through 0.4) is now complete.** Updated all 5 memory files. Next: Phase 1 — Authentication & User Registration, starting with 1.1 Backend Auth Module.

2026-06-20 07:00
Task:
PHASE 0 — Tasks 0.3.1, 0.3.2, 0.3.3, 0.3.4 (rest of Backend Infrastructure) + 0.4.1 (Frontend Design System & Theme)

Files:

- backend/src/middleware/setupMiddleware.ts (new — helmet, cors, morgan, express.json, express-rate-limit)
- backend/src/utils/errors.ts (new — AppError, ValidationError, UnauthorizedError, ForbiddenError, NotFoundError, BusinessRuleError)
- backend/src/middleware/errorHandler.ts (new — notFoundHandler, errorHandler)
- backend/src/utils/response.ts (new — successResponse, errorResponse, paginatedResponse)
- backend/src/middleware/validateRequest.ts (new — Zod-based body/params/query validation)
- backend/src/index.ts (wired setupMiddleware, notFoundHandler, errorHandler; /health now uses successResponse)
- backend/package.json (added cors, helmet, morgan, express-rate-limit, zod + @types/cors, @types/morgan)
- frontend/src/app/layout.tsx (Geist → Inter font, variable renamed to `--font-sans`, metadata updated to EduNomad)
- frontend/src/app/globals.css (EduNomad color palette, spacing/typography/radius/shadow design tokens)
- task-breakdown.md (0.3.1–0.3.4 and 0.4.1 marked [x])

Database Changes:

- None

API Changes:

- None (no domain routes yet — `/health` is the only existing endpoint, now using the new response helper)

Summary:
Implemented all of 0.3.x backend infra in dependency order (built response.ts before wiring errorHandler.ts to use it, even though task-breakdown numbers error-handler as 0.3.2 and helpers as 0.3.3 — the two are tightly coupled so building helpers first avoided duplicating format logic). Checked docs/05-Architecture Rules.md (Error Handling, Security & Performance, Validation Rules) and docs/04-API Specification.md (Response Format) before implementing each piece. Verified express-rate-limit v8's current config API and Zod v4's error-issue shape via Context7 before writing code, per CLAUDE.MD's mandatory Context7 policy.

Caught and fixed one real bug during runtime verification (not just `tsc --noEmit`, which only ever flagged pre-existing unrelated tsconfig deprecation warnings): `AppError`'s constructor had `Object.setPrototypeOf(this, AppError.prototype)`, a stale ES5-transpilation workaround that unconditionally reset every subclass instance's prototype back to `AppError` — silently breaking `instanceof ValidationError` and dropping the `errors` field from every validation error response. Removed it (target is ES2022, native `class extends` already correct). Verified the fix with temporary throwaway test route files (`src/test-error-route.ts`, `src/test-validate-route.ts`) hitting `UnauthorizedError`/`BusinessRuleError`/`ValidationError`/generic `Error` and body/params/query validation paths via curl, confirming correct status codes + JSON shape, then deleted both test files.

Also confirmed via Context7 (`/expressjs/express/v5.2.0`) that Express 5 made `req.query` a getter-only property (no setter) — `validateRequest` validates `req.query` but does not reassign it (would throw), unlike `req.body`/`req.params` which remain writable and ARE reassigned with Zod's parsed/coerced output. Documented this asymmetry in decisions.md so it isn't mistaken for an oversight later.

For 0.4.1, read docs/08-UI_Pages_Specification_v1.0.md's full Design System section (Color Palette, Typography, Spacing, Border Radius, Shadows) and checked Context7 for Tailwind v4's `@theme`/`@theme inline` namespace conventions (`--color-*`, `--spacing-*`, `--text-*--line-height`/`--font-weight`, `--radius-*`, `--shadow-*`) and Next.js's `next/font/google` Inter setup before touching `globals.css`/`layout.tsx`. Renamed the Inter font's CSS variable to `--font-sans` (not `--font-inter`) specifically to fix a latent bug: the existing `@theme inline { --font-sans: var(--font-sans); }` line was circular/undefined since the actual Geist font variable was named `--font-geist-sans`, meaning the `font-sans` utility never actually applied any custom font before this fix. Mapped every doc-specified value (colors, spacing xs–3xl, typography h1–button with sizes+weights, radius none/sm/md/lg/full, shadows sm/md/lg) as literal overrides, deliberately keeping `--info-dark` (#1A1A1A) as its own token rather than merging it into the pre-existing unused `.dark` shadcn theme-toggle class — the doc means a specific alert-card color, not a request for app-wide dark mode (not in any PRD/UI-spec scope).

Hit a non-bug surprise during verification: querying `--radius-lg`/`--spacing-xl`/`--text-h1`/`--shadow-md` directly via `getComputedStyle(document.documentElement).getPropertyValue(...)` returned empty strings, even though `--radius-md` (also in the same `@theme inline` block) returned correctly. Root cause: Tailwind v4 only emits a theme token's backing CSS variable into compiled output if some utility class actually referencing it is found during content scanning (JIT tree-shaking) — `--radius-md` only "worked" because `button.tsx` happens to use it directly in an arbitrary value. Confirmed this by temporarily adding a probe `<div>` to `page.tsx` using `rounded-lg shadow-md p-xl text-h1 bg-primary text-success`, launched the dev server, navigated via Playwright MCP, and read `getComputedStyle` on the actual element — all five resolved to the exact doc values (12px / exact rgba / 24px / 32px+700 / rgb(103,201,87)). Removed the probe afterward. This is expected v4 behavior, not a config error — flagged in next-tasks.md as something to keep in mind once 0.4.2 starts adding real components.

Ran a full production build (`next build`) — compiled successfully; the only failure was a pre-existing, unrelated ESLint config resolution error (`eslint-config-next/core-web-vitals` module not found), logged in next-tasks.md, not caused by this session's changes. Cleaned up all temporary test files/processes (backend test route files, frontend probe markup, `.playwright-mcp/` screenshot dir, leftover backend/frontend dev server processes) before finishing. Marked 0.3.1–0.3.4 and 0.4.1 `[x]` in `task-breakdown.md`.

2026-06-20 05:45
Task:
PHASE 0 — Task 0.3.5 (Setup Prisma Client Singleton)

Files:

- backend/src/config/database.ts (new)
- backend/src/index.ts (wired prisma import + graceful shutdown on SIGINT/SIGTERM)
- task-breakdown.md (0.3.5 marked [x])

Database Changes:

- None

API Changes:

- None

Summary:
Queried Context7 (`/prisma/prisma/7.6.0`) for the official Prisma Client singleton pattern with a driver adapter — confirmed the `globalThis`-cache pattern (reuse instance across dev hot-reloads, never cache in production) combined with `PrismaPg({ connectionString: process.env.DATABASE_URL })`. Created `backend/src/config/database.ts` using this pattern, log level split by `env.nodeEnv`. Wired it into `backend/src/index.ts`: imported `prisma`, captured the `http.Server` returned by `app.listen`, added a `shutdown` handler on `SIGINT`/`SIGTERM` that calls `prisma.$disconnect()` then closes the server before `process.exit(0)`. Verified at runtime (not just `tsc --noEmit`, which only flagged pre-existing unrelated tsconfig deprecation warnings): ran `npx tsx src/index.ts` in the background, confirmed `GET /health` returned 200 with no Prisma connection errors logged, then sent `SIGINT` and confirmed the process exited cleanly with no hang — proving both the pooled `DATABASE_URL` connection (fixed earlier this session) and the disconnect path work end-to-end. This closes 0.3.5; AC "Prisma client bisa digunakan di seluruh backend" satisfied — any future repository-layer code should import `prisma` from this singleton, never instantiate `PrismaClient` directly.

2026-06-20 05:25
Task:
Resolve OPEN ISSUE — DATABASE_URL (Supavisor pooler) connection fix

Files:

- backend/.env (user-edited manually, sandboxed from Claude — DATABASE_URL host segment corrected)
- backend/test-pooler-connection.mjs (created temporarily for verification, deleted after confirming)
- memory/decisions.md, memory/next-tasks.md, memory/current-status.md (updated)

Database Changes:

- None (connection verification only — `SELECT current_user, inet_server_addr(), now()` against pooled connection)

API Changes:

- None

Summary:
Checked every Supabase MCP tool (`get_project_url`, `get_project`, `list_projects`, `get_logs`) for a way to fetch the Supavisor pooler connection string directly — none exists; MCP only exposes the direct DB host (`db.<ref>.supabase.co`), never the pooler/shard hostname. `get_logs(postgres)` also didn't help since Supavisor-layer "tenant not found" rejections never reach the underlying Postgres instance being logged. Queried Context7 (`/supabase/supabase`) for the official Supavisor transaction-mode connection string format, which confirmed the host pattern is `aws-<shard>-<region>.pooler.supabase.com` — the shard number is project-specific and only visible via the Dashboard's Connect modal. Asked the user to paste the dashboard's exact pooler string; it showed `aws-1-ap-south-1`, while the working hypothesis (and likely what was in `.env`) was the more common default `aws-0-ap-south-1` — confirmed root cause. Also confirmed via Context7 that `pgbouncer=true` is mandatory for Prisma+Supavisor transaction mode but `connection_limit=1` is serverless-specific and wrong for EduNomad's long-running Express server, so left it out of the recommended value. User updated `backend/.env` manually (sandboxed, Claude can't edit `.env*` directly). Verified the fix by writing a throwaway `pg` Client script (`backend/test-pooler-connection.mjs`, using root-hoisted `node_modules/pg` since this is an npm workspaces monorepo) that connected via `DATABASE_URL` and ran a test query successfully, then deleted the script. This closes the OPEN ISSUE — 0.3.5 (Prisma Client Singleton) can now proceed using the pooled connection.

2026-06-20 03:00
Task:
PHASE 0 — Tasks 0.2.5 through 0.2.12 (completing all of "0.2 — Database & ORM Setup")

Files:

- backend/src/prisma/schema.prisma (all remaining domains added: Experiences, Portfolio, Project Categories, Projects, Milestones, Project Roles, Role Skills, Recruitment, Discussions, Deliverables, Contributions, Artifacts, Reviews, Notifications, Verification, Audit)
- backend/src/prisma/migrations/20260619220503_init_experiences_portfolio_domain/
- backend/src/prisma/migrations/20260619220629_init_projects_domain/ (manually edited to add `project_roles_capacity_check` CHECK constraint via raw SQL)
- backend/src/prisma/migrations/20260619220834_init_recruitment_domain/
- backend/src/prisma/migrations/20260619220927_init_discussions_domain/
- backend/src/prisma/migrations/20260619221049_init_deliverables_domain/
- backend/src/prisma/migrations/20260619221223_init_contributions_artifacts_reviews_domain/ (manually edited to add `reviews_rating_check` CHECK constraint via raw SQL)
- backend/src/prisma/migrations/20260619221533_init_notifications_verification_audit_domain/
- backend/src/prisma/seed.ts (new — admin user, project categories, master skills)
- backend/prisma.config.ts (added `migrations.seed`)
- backend/package.json (added `@supabase/supabase-js`, `@prisma/adapter-pg`, `tsx`)
- backend/src/generated/prisma/* (regenerated)
- task-breakdown.md (0.2.5–0.2.12 marked [x])

Database Changes:

- 8 migrations applied across 0.2.5–0.2.11, creating 23 new tables (experiences, portfolio_links, project_categories, projects, milestones, project_roles, role_skills, senior_applications, project_applications, project_members, discussions, discussion_members, discussion_messages, deliverables, deliverable_evidences, contribution_reports, contribution_skills, artifacts, artifact_versions, reviews, notifications, verification_requests, audit_logs). Combined with Users + Skills domains from prior session, full schema is now 27 domain tables + `_prisma_migrations`.
- Two raw-SQL CHECK constraints added (Prisma has no native `@@check` attribute, confirmed via Context7): `project_roles_capacity_check` (`capacity > 0`) and `reviews_rating_check` (`rating BETWEEN 1 AND 5`). Both confirmed live via direct `pg_constraint` query through Supabase MCP, not just trusted from migration files.
- 0.2.12 seed data inserted: 1 admin user (real Supabase Auth account + matching `public.users` row), 5 project categories, 10 system skills (all `is_system: true`, `status: APPROVED`).

API Changes:

- None

Summary:
Read full docs/03-Database Schema.md (all remaining domains) + task-breakdown.md 0.2.5–0.2.12 in one pass, then implemented domain-by-domain, validating + migrating + verifying via Supabase MCP after each one (same discipline as 0.2.3/0.2.4). Key decisions made along the way (full reasoning in decisions.md): (1) omitted indexes not explicitly listed in docs for experiences/portfolio_links, staying strictly literal rather than adding "obvious" performance indexes — avoids inventing schema beyond what's documented; (2) made `ContributionReport.reviewedBy` and `VerificationRequest.reviewedBy` nullable even though the schema doc table doesn't mark them "NULL" (inconsistent with how the same doc marks other nullable FKs) — resolved by cross-checking docs/04-API Specification.md, which confirms both are created with status PENDING and reviewed only later via a separate endpoint, so no reviewer can exist at creation time; (3) `ArtifactVersion` and `AuditLog` have no `updatedAt` field, matching the doc's column list exactly (immutable/append-only records).

Hit three real tooling issues while building the seed script (0.2.12), each escalated to the user per Version Flexibility / "never guess" policy rather than silently worked around:
1. Prisma 7's generated client has no `index.ts` barrel — must import from `../generated/prisma/client`, not the bare directory. Fixed without asking (not a version/business-logic decision, just a wrong import path).
2. ts-node@10.9.2 silently mis-parses the project's tsconfig.json under TypeScript 6 (deprecated `moduleResolution`/`baseUrl` syntax) — fails on seed.ts specifically with false "cannot find process/console" errors, even though `tsc` itself compiles the same file cleanly. Asked the user; approved swapping to `tsx` (esbuild-based, no compiler-API coupling) for the seed script only — nodemon's dev workflow still uses ts-node since that one demonstrably works fine.
3. Prisma 7 requires an explicit driver adapter for PostgreSQL (`@prisma/adapter-pg` + `PrismaPg`) — no more built-in query engine. This is a project-wide architectural fact (not just for seeding) — flagged for 0.3.5 (Prisma Client Singleton) in next-tasks.md.
4. DATABASE_URL (the pooled/Supavisor connection) fails with the same "tenant/user not found" error pattern as the earlier DIRECT_URL issue (Issue 4 in MEMORY-CLAUDE.md), but this is the FIRST time DATABASE_URL was actually exercised (migrations always used DIRECT_URL). Asked user to check the Supabase dashboard's Connection Pooling string; user updated `.env` but the value was unchanged on retry, so the seed script falls back to DIRECT_URL for now (functionally fine for a one-off script) — logged as an OPEN ISSUE that must be resolved before 0.3.5, since DIRECT_URL is not suitable for concurrent app runtime traffic.

Also asked the user one business-logic question before writing the seed script: since `users.id` must equal `auth.users.id` but the Auth module isn't built until Phase 1.1, should the seeded admin be a real Supabase Auth user (via Admin API) or a placeholder UUID? User chose the real-auth-user route — installed `@supabase/supabase-js`, used `supabase.auth.admin.createUser()` with `email_confirm: true`, then inserted the matching `public.users` row with the same id.

2026-06-20 02:30
Task:
PHASE 0 — Task 0.2.4 (Implementasi Prisma Schema — Skills Domain)

Files:

- backend/src/prisma/schema.prisma (models Skill, UserSkill added; User.userSkills inverse relation added)
- backend/src/prisma/migrations/20260619215512_init_skills_domain/migration.sql (new)
- backend/src/generated/prisma/* (Prisma Client, regenerated)
- task-breakdown.md (0.2.4 marked [x])

Database Changes:

- Migration `20260619215512_init_skills_domain` applied to Supabase
- New tables: `skills` (id uuid PK, name varchar(100) unique, slug varchar(150) unique, category varchar(100), status varchar(20), is_system boolean default false, created_at, updated_at, index on status), `user_skills` (id uuid PK, user_id uuid FK→users.id cascade, skill_id uuid FK→skills.id cascade, level varchar(20), created_at, updated_at, unique(user_id, skill_id))

API Changes:

- None

Summary:
Read docs/03-Database Schema.md Skills Domain section. Followed the same VARCHAR-for-enum-like-field pattern established in 0.2.3 (`status` on skills: PENDING/APPROVED/REJECTED; `level` on user_skills: BEGINNER/INTERMEDIATE/ADVANCED) — both as `String @db.VarChar(n)` with a comment listing allowed values, not Prisma `enum`. Added `Skill.status` comment referencing docs/06-RBAC_and_Business_Rules.md's "Custom Skills" rule (non-system skills need Admin approval). Ran `npx prisma validate` (passed) then `npx prisma migrate dev --name init_skills_domain` — applied successfully without needing a fresh Context7 lookup, since the migrate command and schema syntax were already verified working under Prisma 7 in 0.2.2/0.2.3 and nothing new was being touched. Verified tables, columns, and FK constraints via Supabase MCP `list_tables` (verbose) — confirmed `user_skills` FKs point to both `users.id` and `skills.id` correctly. Cross-checked the generated migration.sql directly to confirm all three required UNIQUE constraints exist (`skills_name_key`, `skills_slug_key`, `user_skills_user_id_skill_id_key`). Ran `npx prisma generate` — Prisma Client regenerated. Supabase MCP advisory now lists 5 tables with RLS disabled (added skills, user_skills to the existing 3) — still deferred per standing user decision, not re-litigated.

2026-06-20 02:00
Task:
PHASE 0 — Task 0.2.3 (Implementasi Prisma Schema — Users Domain)

Files:

- backend/src/prisma/schema.prisma (models User, UserProfile added)
- backend/src/prisma/migrations/20260619174640_init_users_domain/migration.sql (new)
- backend/src/generated/prisma/* (Prisma Client, generated)
- task-breakdown.md (0.2.3 marked [x])

Database Changes:

- Migration `20260619174640_init_users_domain` applied to Supabase
- New tables: `users` (id uuid PK, name varchar(255), email varchar(255) unique, role varchar(20), status varchar(30), email_verified_at timestamp null, created_at, updated_at, index on role + status), `user_profiles` (id uuid PK, user_id uuid unique FK→users.id cascade, phone/photo/headline/linkedin_url varchar, bio/verification_notes text, created_at, updated_at)

API Changes:

- None

Summary:
Read docs/03-Database Schema.md + docs/02-erd-production-grade.md Users Domain section. Confirmed via Context7 (Prisma docs) that model/enum/relation schema syntax is unchanged in Prisma 7 (only config architecture changed, already handled in 0.2.2). Key design decision: role/status fields use `String @db.VarChar(n)` instead of Prisma `enum`, because every single enum-like field across the ENTIRE schema doc (skills, projects, applications, etc.) is consistently typed VARCHAR, never native Postgres ENUM — this is a deliberate doc-wide convention, not an isolated case, so honored it instead of defaulting to Prisma enum. Value validation deferred to the Zod layer (0.3.4). `User.id` has no `@default(uuid())` since `users.id` must equal `auth.users.id` (Supabase Auth) per doc's explicit rule — app must assign it at registration time. Ran `npx prisma migrate dev --name init_users_domain` — applied successfully. Verified tables + FK constraint via Supabase MCP `list_tables` (verbose). Ran `npx prisma generate` — Prisma Client generated to `backend/src/generated/prisma`. Supabase MCP flagged a critical advisory: RLS disabled on the new tables (plus `_prisma_migrations`) — surfaced to user per MCP's mandatory-disclosure instruction, did NOT auto-apply remediation SQL. User decided: defer enabling RLS until the auth/RBAC phase, since correct policies can't be written before auth middleware exists.

2026-06-20 01:15
Task:
PHASE 0 — Task 0.2.1 + 0.2.2 verification (Supabase + Prisma connectivity)

Files:

- task-breakdown.md (0.2.1, 0.2.2 marked [x])

Database Changes:

- None (connection verified, schema still empty — confirmed via P4001 "database empty" response, not a connection error)

API Changes:

- None

Summary:
Reran `cd backend && npx prisma db pull` after the previous session's DIRECT_URL fix (true direct host `db.sfzzkwckrfwzgcujykff.supabase.co:5432`, plain `postgres` user). Connection succeeded — Prisma reported `P4001 The introspected database was empty`, which confirms the connection itself works (no more ENOTFOUND/tenant error); the database genuinely has no tables yet, as expected before 0.2.3. Marked 0.2.1 and 0.2.2 as done in task-breakdown.md. Attempted to update `backend/.env.example` to match the corrected DIRECT_URL format but `.env*` files are blocked by sandbox permission settings (even `.example`) — flagged for the user to update manually. Next: 0.2.3 Prisma Schema Users Domain.

2026-06-20 00:40
Task:
PHASE 0 — Task 0.2.1 (Setup Supabase Project) + 0.2.2 (Setup Prisma ORM) — in progress, connectivity unverified

Files:

- backend/.env.example, backend/.env (Supabase URL, anon key, publishable key, service role key, DB password, DATABASE_URL, DIRECT_URL)
- frontend/.env.local (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
- backend/package.json (prisma, @prisma/client added)
- backend/prisma.config.ts (new, Prisma 7 config)
- backend/src/prisma/schema.prisma (new, moved from default backend/prisma/ to ARCH-compliant backend/src/prisma/)
- MEMORY-CLAUDE.md (new, root-level session handoff doc)

Database Changes:

- None yet (schema still default/empty — datasource provider only, no models)

API Changes:

- None

Summary:
Found existing Supabase project "EduNomad" (ref sfzzkwckrfwzgcujykff, region ap-south-1, ACTIVE_HEALTHY) via Supabase MCP `list_projects`. Pulled URL + anon key + publishable key via MCP; service role key and DB password obtained from user directly (MCP cannot expose these by design) and pasted into backend/.env. Installed Prisma, ran `prisma init`, then moved schema.prisma into backend/src/prisma/ to satisfy ARCH folder rules (05-Architecture Rules.md), updating prisma.config.ts paths + generator output accordingly. Hit two errors: (1) Prisma 7 rejects `url`/`directUrl` inside schema.prisma's datasource block (P1012) — fixed by moving the URL into prisma.config.ts's `datasource.url` (confirmed via Context7 against Prisma 7 docs); (2) `npx prisma db pull` failed with `FATAL: (ENOTFOUND) tenant/user postgres.sfzzkwckrfwzgcujykff not found` because DIRECT_URL used the Supavisor pooler hostname (aws-0-ap-south-1.pooler.supabase.com) with a pooler-style username — changed DIRECT_URL to the true direct host (db.sfzzkwckrfwzgcujykff.supabase.co:5432) with plain `postgres` username. This second fix has NOT been re-tested — session paused before rerunning `npx prisma db pull`. Also generated MEMORY-CLAUDE.md at repo root as a full session handoff doc (objective/progress/issues/next-steps) per user request, to be read at the start of the next session.

2026-06-19 23:30
Task:
Mandate Context7 MCP usage + add memory/rangkuman.md

Files:

- CLAUDE.MD (Context7 MCP section, Available MCPs list, general skill-check reminder, Session Documentation + Starting New Session lists)
- memory/rangkuman.md (new)
- memory/decisions.md
- memory/current-status.md

Database Changes:

- None

API Changes:

- None

Summary:
Made Context7 MCP mandatory before writing/executing any code touching a library/framework/SDK/API/CLI/cloud service, codified in CLAUDE.MD so it persists across sessions. Added a general "check installed skills before manual implementation" reminder (not UI-only). Created memory/rangkuman.md as an append-only prompt-history log (date format matches decisions.md) and wired it into the required session-start/session-end memory file lists. Mirrored the policy to global persistent memory.

2026-06-19 23:10
Task:
PHASE 0 — Task 0.1.3 (Setup Frontend Project)

Files:

- frontend/package.json, frontend/next.config.ts, frontend/tsconfig.json
- frontend/src/app/* (create-next-app boilerplate)
- frontend/src/components/ui/button.tsx, frontend/src/lib/utils.ts (shadcn/ui init)
- frontend/components.json
- frontend/src/{features,hooks,services,stores,types,constants,utils}/.gitkeep
- task-breakdown.md (0.1.3 marked [x])

Database Changes:

- None

API Changes:

- None

Summary:
Scaffolded frontend/ with create-next-app (app router, src dir, Tailwind, ESLint). create-next-app@latest defaulted to Next.js 16.2.9 — caught against LOCKED tech stack ("Next.js 15") in task-breakdown.md and CLAUDE.MD, downgraded to next@15 (resolved 15.5.19) + react@19/react-dom@19, removed stale generated frontend/AGENTS.md + frontend/CLAUDE.md (written for Next 16 behavior, inapplicable after downgrade). Removed nested .git that create-next-app auto-initialized inside frontend/ (repo root is not yet a git repo — nested repo would conflict later). Initialized shadcn/ui (Tailwind v4 detected), installed zustand + react-hook-form + zod + @hookform/resolvers. Added remaining ARCH-mandated folders (features, hooks, services, stores, types, constants, utils) with .gitkeep placeholders; app/components/lib already present from scaffold. Fixed a workspace-root misdetection warning (stray lockfile at home dir level) by setting outputFileTracingRoot in next.config.ts. Verified AC: npm run dev from frontend serves Next.js 15.5.19 at localhost:3000, GET / returns 200, no warnings.

2026-06-19 22:58
Task:
PHASE 0 — Task 0.1.1 (Monorepo Setup) & 0.1.2 (Setup Backend Project)

Files:

- package.json (root, npm workspaces: frontend, backend)
- .gitignore
- .editorconfig
- README.md
- backend/package.json
- backend/tsconfig.json
- backend/nodemon.json
- backend/.env.example
- backend/src/index.ts
- backend/src/config/env.ts
- backend/src/{modules,middleware,services,repositories,validators,routes,utils,types,prisma}/.gitkeep
- task-breakdown.md (0.1.1, 0.1.2 marked [x])

Database Changes:

- None

API Changes:

- None (GET /health added as boilerplate check only, not a documented API)

Summary:
Created monorepo root with npm workspaces linking frontend/ and backend/. Initialized backend with Express 5 + TypeScript 6 (strict mode), nodemon for dev reload, and full folder structure per ARCH (05-Architecture Rules.md). Verified AC: `npm install` from root runs clean, `npm run dev` from backend starts Express on port 3001 and /health responds 200. frontend/ folder created but empty — task 0.1.3 not started.

2026-06-19 00:00
Task:
Clarified UI spec as non-final in CLAUDE.MD

Files:

- CLAUDE.MD
- development-log.md

Database Changes:

- None

API Changes:

- None

Summary:
Marked the UI pages specification as a reference baseline and allowed UI skill-based improvements without changing workflows or business rules.

2026-06-19 00:00
Task:
Added UI pages specification to CLAUDE.MD references

Files:

- CLAUDE.MD
- current-status.md
- development-log.md
- next-tasks.md
- decisions.md

Database Changes:

- None

API Changes:

- None

Summary:
Registered 08-UI_Pages_Specification_v1.0.md as a required document and updated project memory.

2026-06-19 00:00
Task:
Normalized CLAUDE.MD document references

Files:

- CLAUDE.MD
- current-status.md
- development-log.md
- next-tasks.md
- decisions.md

Database Changes:

- None

API Changes:

- None

Summary:
Aligned document names in CLAUDE.MD with actual workspace files and refreshed project memory.

---

## 2026-06-21 — PHASE 3 FRONTEND (3.3 + 3.4) COMPLETE

What was done:
- Built frontend Phase 3 entirely. New files: services/projectApi.ts; components/project/ProjectDetailView.tsx; app/projects/create/page.tsx (4-step wizard); app/my-projects/page.tsx; app/admin/projects/review/page.tsx; app/projects/page.tsx (browse); app/projects/[id]/page.tsx (detail). Edited constants/navigation.ts (role-aware getNavItems) + components/layout/Sidebar.tsx (reads appUser.role).
- Reused established patterns: AuthGuard(allowedRoles), AppShell, apiClient envelope, ConfirmDialog/EmptyState/ListSkeleton/ErrorState, base-ui Select/Dialog/Checkbox, RHF+zodResolver, sonner toasts, Button render={<Link/>}.
- Context7 consulted for base-ui Select (confirmed Select.Root `items` Record<string,string> + Select.Value children-fn for label resolution without opening popup) — fixed browse filter triggers showing raw "ALL".

Verification (Playwright browser + live DB, servers run locally):
- Provisioned a VERIFIED UMKM via signup→Supabase signin→register→SQL promote.
- Create wizard Step1 (basic) + Step2 (milestone) driven in-browser → DRAFT + 1 milestone confirmed in DB. Step3 roles UI rendered with APPROVED-skill checkboxes; role added via API (wiring identical to proven milestone path). 
- My Projects: DRAFT card + tabs rendered; clicked "Kirim untuk Ditinjau" → status → Menunggu Tinjauan (PENDING_REVIEW).
- Admin Review: pending list, Lihat Detail dialog (full ProjectDetailView graph), Setujui → pending empties; DB confirms status RECRUITING + 1 PROJECT_APPROVED audit log; Disetujui tab lists it.
- Browse: RECRUITING card in grid; filter Selects show "Semua Kategori"/"Semua Status" after items-prop fix. Detail page renders full view; owner ActionPanel shows "Kelola Proyek".
- Frontend tsc clean throughout. All test data deleted (0 projects/users/audit logs left; admin seed intact). Dev servers stopped.

Issue found (NOT my code): backend `npm run dev` crashes under TS 6.0.3 — tsconfig moduleResolution:node + baseUrl now fatal (TS5101/TS5107) AND ts-node needs --files for express.d.ts augmentation. Ran backend for verification via env overrides only (TS_NODE_TRANSPILE_ONLY + ignoreDeprecations). Permanent fix needs user OK (version-flexibility rule) — see decisions.md.

Files Modified:
- frontend/src/services/projectApi.ts (new)
- frontend/src/components/project/ProjectDetailView.tsx (new)
- frontend/src/app/projects/create/page.tsx (new)
- frontend/src/app/my-projects/page.tsx (new)
- frontend/src/app/admin/projects/review/page.tsx (new)
- frontend/src/app/projects/page.tsx (new)
- frontend/src/app/projects/[id]/page.tsx (new)
- frontend/src/constants/navigation.ts (role-aware)
- frontend/src/components/layout/Sidebar.tsx (role-aware nav)
- task-breakdown.md (3.3.1–3.4.2 → [x])

API Changes:
- None (frontend consumes existing Phase 3 backend endpoints).

Summary:
Phase 3 fully complete (backend + frontend). Project lifecycle DRAFT→PENDING_REVIEW→RECRUITING is end-to-end usable in the UI for UMKM (create/submit), Admin (review/approve/reject), and all roles (browse/detail). Next: Phase 4 recruitment.

## 2026-06-24 — PHASE 5.1 Project Workspace backend (discussions + DM + RLS/Realtime)
Branch: redesign/app-ui merged → main (--no-ff 84127ce, pushed); new branch feature/phase-5-workspace from main.
Built layered (route→controller→service→repository→Prisma), $transaction for multi-step:
- discussion.repository: isActiveProjectMember, listGroupForUser, findById(+members), isMember, createGroup($txn disc+members), findDirectBetween (exactly-2-member 1:1), createDirect($txn), userProjectIds (senior/owner/ACTIVE-member set), countMessages, listMessages (paginated, desc), createMessage ($txn insert + bump discussion.updatedAt).
- discussion.service: participant gate (senior/UMKM/ACTIVE member); create restricted to senior lead OR UMKM owner, validates requested members are participants, senior auto-included; getMessages/sendMessage gated by discussion membership (rejects DIRECT). directMessage.service: assertCanDirectMessage (shared project context), self-block 422, createOrGet 1:1, message gates (rejects GROUP).
- controllers + routes wired: GET/POST /projects/:id/discussions, GET/POST /discussions/:id/messages, POST /users/:id/direct-chat, GET/POST /direct-chat/:id/messages. requireVerified on writes.
- 5.1.4 RLS+Realtime (Supabase MCP migration phase5_discussions_rls_realtime; mirrored backend/db/*.sql): RLS enabled on 3 discussion tables, SELECT-only policies via SECURITY DEFINER public.is_discussion_member(uuid); realtime publication += discussion_messages + discussions; replica identity full. FIRST RLS on the project.
Verified: build 0 err; /tmp/p5-e2e.sh 14/14 PASS (group create/list/msg + DM create/dedupe/msg + 403/422 gates + pagination meta); stayed 14/14 after RLS (Prisma bypass proof); PostgREST RLS: member 4 rows / outsider 0 / anon []. Test project ACTIVE a1a1a1a1-…0005 seeded (p4-umkm/p4-senior/p4-beginner/p43-b2; p43-b3 outsider). Decisions D-P5-1..3.

## 2026-06-24 — PHASE 5.2 Project Workspace FRONTEND (discussions + DM + realtime UI)
Branch feature/phase-5-workspace. New: services/discussionApi.ts (group + DM; paginated message endpoints return {data,meta} unwrapped). components/workspace/ChatPanel.tsx (shared chat: load newest-first→render asc, Supabase Realtime channel `disc-<id>` postgres_changes INSERT filter discussion_id=eq.<id> → re-pull list [D-P5-4]; realtime.setAuth(token) for RLS; writes via Express; autoscroll; mine=primary right / others=secondary left + sender name). DiscussionTab.tsx (list/select group discussions; senior-lead/UMKM-owner create seeded with ACTIVE member ids; empty state). DirectMessageDialog.tsx ("Pesan" button → createOrGetDirectChat → ChatPanel in dialog). app/projects/[id]/workspace/page.tsx (AuthGuard+AppShell; tabs Ringkasan|Milestone|Diskusi|Anggota; Overview + Milestones inline; Members = ProjectMembersPanel + DM launchers for senior+active members minus self). Detail page: "Buka Workspace" button for ACTIVE/AWAITING_COMPLETION.
Scope: Deliverables/Reviews/Artifacts tabs NOT built (Phase 6/7/8). Notifications NOT built (Phase 9).
Verified: tsc 0 errors. Browser (Playwright, login p4-senior, project a1a1a1a1-…0005): workspace renders, Overview correct, Discussion lists existing group discussions + messages, send via Express appends + clears, **REALTIME**: posted a message as p4-beginner via API → appeared live in senior's open tab w/o refresh (sender-resolved, left-aligned). Members tab shows panel + DM launchers; DM dialog find-or-get reused E2E chat + showed history. Console errors = harmless base-ui nativeButton (Button render=Link). Decision D-P5-4.

## 2026-06-25 — PHASE 6.1+6.2 backend (Deliverables & Contributions)
Branch feature/phase-6-deliverables (from main db743b8, after redesign/app-shell merged). Layered + $txn, no migration (models exist). New: constants/deliverableStatus.ts (DeliverableStatus DRAFT/SUBMITTED/REVISION_REQUESTED/APPROVED, EvidenceType LINK/FILE, ContributionStatus PENDING/APPROVED); validators/{deliverable,contribution}.validator.ts (evidence LINK→url/FILE→file_path refine); repositories/{deliverable,contribution}.repository.ts; services/{deliverable,contribution}.service.ts; modules/{deliverable,contribution}/*.controller.ts; routes/{deliverable,contribution}.routes.ts wired to index + project.routes (GET/POST /projects/:id/deliverables + /contributions). auditActions += DELIVERABLE_APPROVED/REVISION_REQUESTED/CONTRIBUTION_APPROVED + EntityType DELIVERABLE/CONTRIBUTION_REPORT. projectMember.repository += isActiveMember(projectId,userId).
Revision feedback: no schema column → stored in audit metadata, surfaced as revisionFeedback on deliverable list (D-P6-1). Verified: build 0 err; E2E /tmp/p6-e2e.sh 24/24 (deliverable DRAFT→SUBMITTED→REVISION→resubmit→APPROVED + feedback surfaced + evidences; contribution PENDING→APPROVED one-per-beginner; all 403/422/400 gates). Test project a1a1a1a1-…0005 ACTIVE (beginner=p4-beginner, b2=p43-b2 members; b3=p43-b3 nonmember; senior=p4-senior). Decisions D-P6-1, D-P6-2.

## 2026-06-25 — PHASE 6.3 frontend (Deliverables & Contributions workspace)
Branch feature/phase-6-deliverables. New: services/{deliverableApi,contributionApi}.ts (+status meta). components/workspace/DeliverablesTab.tsx (beginner: create/edit DRAFT, SubmitEvidenceDialog dynamic LINK inputs, revision-feedback callout, resubmit; senior lead INLINE review: Setujui + RevisionDialog feedback). components/workspace/ContributionTab.tsx (beginner own report: ContributionForm summary + skill-chip multiselect from fetchSkills, one-per-project, edit-while-PENDING; senior lead list+approve). app/projects/[id]/workspace/page.tsx += TabKey deliverables/contributions + 2 tabs. Review done INLINE in tab, not separate /deliverables/:id/review route (D-P6-3). File-upload evidence deferred (LINK first; FILE backend-ready). Follows DESIGN.md.
Verified: tsc 0; browser full loop — beginner create "Komponen Navbar" DRAFT → submit (SUBMITTED + github link) → senior Minta Revisi+feedback → "Perlu Revisi" + "Feedback mentor" callout shows text; ContributionTab shows own APPROVED report + JavaScript skill. Decision D-P6-3.

## 2026-06-25 — PHASE 7.1 backend (Reviews & Ratings, WF12)
Branch feature/phase-7-reviews (from main 1fc2b7e). New: constants/reviewType (SENIOR_TO_BEGINNER/UMKM_TO_BEGINNER/UMKM_TO_SENIOR), validators/review.validator (rating 1-5 coerce), repositories/review.repository (findExisting/create/update[+isEdited,editedAt]/listByProject/listByReviewee), services/review.service (reviewBeginner [type derived from senior/umkm owner], reviewSenior, editReview [block if COMPLETED], getProjectReviews, getUserReviews), modules/review/review.controller, routes/review.routes; wired index+project(POST beginner/senior + GET reviews)+user(GET /:id/reviews). No migration. GET endpoints added (D-P7-1). Verified build 0; E2E /tmp/p7-e2e.sh 11/11 (3 types + dup/role/rating/non-member gates + edit own/other + listings). NEXT = 7.2 frontend.

## 2026-07-11 — DEMO prep: cleanup junior + akun/proyek skenario demo + reset scoped (D-DEMO-2)
Direct-to-main (chore). NO migration.
1. `backend/src/prisma/cleanup-juniors.ts` (baru) — hapus 12 filler junior01–12@edunomad.com (Prisma delete + supabaseAdmin.auth.admin.deleteUser; cascade lamaran PENDING via FK beginner_id ON DELETE CASCADE). Guard sebelum jalan: 0 artifact/contrib/review/owned-project utk semua junior → aman. Dampak: 8 lowongan RECRUITING bermentor balik 0 pelamar.
2. `seed-demo-scenario.ts` (baru) — buat 3 akun demo (umkm.demo/senior.demo/junior.demo, VERIFIED, pw TestPass123!) + proyek flagship `[DEMO] Website Pemesanan & Kasir — Kopi Nusantara` (RECRUITING, seniorId null, 1 role FE kap1, tanpa applicant/member). Idempotent.
3. `reset-demo-scenario.ts` (baru) — CLI reset scoped: ensure 3 akun → deleteMany project umkm.demo (cascade) + hapus notif/aiInsight 3 peserta → buat ulang flagship fresh. Kembar dari endpoint.
4. `services/demo/demoDataset.ts` — tambah DEMO_SCENARIO_{UMKM,SENIOR,JUNIOR}_EMAIL + DEMO_SCENARIO_PROJECT_TITLE; umkm.demo masuk DEMO_UMKMS (paling atas); senior.demo/junior.demo masuk participant emails; flagship masuk DEMO_PROJECTS (no lead/applicants). Single source of truth.
5. `services/demo/demo.service.ts` — refactor: `ensureUmkm`→wrapper atas `ensureUser({role})` generik; `ensureScenarioAccounts()` (senior.demo SENIOR + junior.demo BEGINNER); ekstrak `buildSeedContext()` + `createDemoProject()`; seedDemo panggil ensureScenarioAccounts; baru `resetDemoScenario()` scoped ke umkm.demo.
6. `modules/demo/demo.controller.ts` — ekstrak `guard()` bersama (DEMO_MODE + token) dipakai `reset` & `resetScenario` baru. `routes/demo.routes.ts` +`POST /reset-scenario`.
7. `frontend/src/app/demo-reset/page.tsx` — dua tombol: PRIMARY "Reset Proyek Skenario" (/demo/reset-scenario) + secondary "Reset Semua Data Demo" (/demo/reset). busy per-kind.
8. `backend/tsconfig.build.json` — exclude semua skrip dev prisma (seed-lowongan/seed-showcase/cleanup-test-data + 3 baru) dari dist produksi.
VERIFIED: `tsc -p tsconfig.build.json` 0 + frontend `tsc` 0 (error base-tsconfig cuma di seed-ai-demo/seed-expo lama yg di-exclude, bukan file baru); CLI reset dijalankan → hapus 1 + buat ulang → Supabase confirm RECRUITING/mentor null/0 pelamar/0 member/1 role; 3 akun role UMKM/SENIOR/BEGINNER VERIFIED. Endpoint demo tetap 404 bila !DEMO_MODE, 401 token salah.
