Issue:
Workspace memory structure was missing operational files.

Severity:
Medium

Status:
Open

---

Issue:
Latensi navigasi dashboard → page lain terasa lama (dilaporkan user 2026-06-30).

Diagnosis (diukur via Playwright resource-timing, login p4-senior, dev server):
- Navigasi pertama ke /projects ≈ 3.8 detik HANYA untuk Next.js DEV-MODE route compilation (RSC fetch baru mulai di ~3797ms; tidak ada API sebelum itu). Ini per-route, hanya kunjungan pertama, HILANG di production build (next build && next start).
- DOUBLE-FETCH: tiap endpoint (categories, skills, projects) ke-fire 2× → 6 request paralel. Penyebab = React StrictMode (reactStrictMode default true di App Router dev). DEV-ONLY, tidak terjadi di production.
- API per call saat burst 6-way contended = ~2-3 detik; tapi saat BERSIH (3 request paralel, x1) total cuma ~686ms. Sequential warm: authMe 633ms, categories 443ms, skills 104ms, projects 1323ms (query terberat).
- Akar latensi production yang tersisa: DB Supabase remote (ap-south-1) + authMiddleware findById per-request (1 hop remote ekstra tiap request). Wajar ~700ms utk halaman projects di prod.

Kesimpulan: latensi yang dirasakan user DIDOMINASI overhead DEV (compile + StrictMode double-fetch) — BUKAN bug, BUKAN efek fix redirect (D-AUTH-1). Di production ~700ms.

Opsi optimisasi (belum diterapkan, tunggu keputusan user):
1. Verifikasi dgn production build (next build && next start) utk lihat angka nyata.
2. Cache reference data (categories/skills) di client (jarang berubah) → kurangi call per halaman.
3. Backend: cache role/status di authMiddleware (TTL pendek) → hapus 1 hop remote/request (perlu approval, ada trade-off staleness).
4. Loading skeleton utk perceived performance.

Severity:
Low (dev-only overhead; production acceptable)

Status:
PARTIAL FIX (2026-06-30): user pilih matikan StrictMode → `reactStrictMode: false` di frontend/next.config.ts. Double-fetch dev HILANG (diverifikasi Playwright: /projects sekarang categories/skills/projects masing-masing 1× call, total 4 vs sebelumnya ~7). Trade-off diterima: kehilangan deteksi bug effect StrictMode di dev. Sisa latensi dev = Next compile first-visit (normal) + remote DB ap-south-1 (opsi cache reference-data / authMiddleware cache BELUM diterapkan, masih tersedia bila perlu).
