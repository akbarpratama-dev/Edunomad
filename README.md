# EduNomad

Project collaboration platform connecting **Beginners**, **Seniors**, and **UMKM** through real-world projects — real project experience, mentorship, and verified portfolio artifacts.

This is **not** a freelance marketplace, job board, social network, LMS, or e-learning platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| Backend | Express.js, TypeScript |
| ORM | Prisma |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (JWT) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| AI/LLM | Groq (`llama-3.3-70b-versatile`) atau Google Gemini (`gemini-2.5-flash`) |
| Architecture | Modular Monolith (Route → Controller → Service → Repository → Prisma) |

## Struktur Repo

```
edunomad/
├── frontend/       # Next.js app (port 3000)
├── backend/        # Express.js API (port 3001)
├── docs/           # Spesifikasi (PRD, ERD, DB Schema, API Spec, RBAC, UI Spec)
├── memory/         # Catatan sesi pengembangan
├── package.json    # npm workspaces (frontend + backend)
└── task-breakdown.md
```

---

## Menjalankan Aplikasi (Petunjuk Teknis)

### 1. Prasyarat

- **Node.js ≥ 20** (disarankan 22) — cek: `node -v`
- **npm ≥ 9**
- Akun **Supabase** dengan satu project (gratis) — untuk Database, Auth, Storage, Realtime.
- (Opsional) API key **Groq** atau **Gemini** bila ingin mengaktifkan fitur AI.

> Aplikasi ini butuh backend Supabase yang aktif. Minta detail koneksi project ke pemilik repo, atau buat project Supabase sendiri (langkah 3).

### 2. Clone & Install

```bash
git clone https://github.com/akbarpratama-dev/Edunomad.git
cd Edunomad

# Install SEMUA workspace (frontend + backend) sekaligus dari root
npm install
```

### 3. Konfigurasi Environment

Buat dua file environment (JANGAN di-commit — sudah masuk `.gitignore`).

**a. Backend — buat `backend/.env`** (contoh: `backend/.env.example`):

```env
# Server
PORT=3001
NODE_ENV=development

# Supabase (ambil dari Dashboard → Project Settings → API)
SUPABASE_URL=https://<PROJECT_REF>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key — RAHASIA, jangan dibagikan/di-commit>

# Database (Dashboard → Project Settings → Database → Connection string)
# DATABASE_URL = koneksi pooled (dipakai runtime)
# DIRECT_URL   = koneksi langsung (dipakai migrasi & seed)
DATABASE_URL=postgresql://postgres.<PROJECT_REF>:<PASSWORD>@<HOST>:6543/postgres
DIRECT_URL=postgresql://postgres.<PROJECT_REF>:<PASSWORD>@<HOST>:5432/postgres

# AI / LLM (OPSIONAL — isi salah satu. Kosong = fitur AI mati, alur inti tetap jalan)
# Groq diprioritaskan bila ada; kalau tidak, pakai Gemini.
GROQ_API_KEY=
GEMINI_API_KEY=
# GEMINI_MODEL=gemini-2.5-flash   # opsional, ini default

# Seed admin (opsional — default admin@edunomad.com / EduNomadAdmin123!)
# SEED_ADMIN_EMAIL=admin@edunomad.com
# SEED_ADMIN_PASSWORD=EduNomadAdmin123!
```

**b. Frontend — buat `frontend/.env.local`:**

```env
# URL backend (default sudah benar untuk lokal)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Supabase publik (Dashboard → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable/anon key — aman untuk publik>
```

> **Penting:** `SUPABASE_SERVICE_ROLE_KEY` adalah kunci rahasia (akses penuh, bypass RLS). Jangan pernah menaruhnya di frontend atau meng-commit-nya. Yang boleh di frontend hanya *publishable/anon key*.

### 4. Siapkan Database (Prisma)

Dijalankan dari folder `backend/`:

```bash
cd backend

# Generate Prisma Client
npx prisma generate --schema=src/prisma/schema.prisma

# Terapkan skema/migrasi ke database
npx prisma migrate deploy --schema=src/prisma/schema.prisma
```

> Jika membuat project Supabase baru dan belum ada migrasi yang cocok, gunakan `npx prisma db push --schema=src/prisma/schema.prisma` untuk mendorong skema langsung.

### 5. Seed Data Awal

Masih dari folder `backend/`:

```bash
# Data dasar: admin, kategori proyek, master skill
npx tsx src/prisma/seed.ts

# (Opsional) Skenario demo lengkap "Kasir UMKM" (UMKM, mentor, 2 junior, milestone, review)
npx tsx src/prisma/seed-kasir.ts
```

### 6. Jalankan (Development)

Dari **root** repo — buka dua terminal:

```bash
# Terminal 1 — Backend (http://localhost:3001)
npm run dev:backend

# Terminal 2 — Frontend (http://localhost:3000)
npm run dev:frontend
```

Buka **http://localhost:3000**.

---

## Akun Demo (setelah seed-kasir)

Password semua akun demo: `TestPass123!` (kecuali admin default).

| Role | Email | Password |
|---|---|---|
| Admin | admin@edunomad.com | EduNomadAdmin123! |
| UMKM | tokomajubersama@edunomad.com | TestPass123! |
| Senior (Mentor) | aldo.firmansyah@edunomad.com | TestPass123! |
| Beginner (Frontend) | akbar.pratama@edunomad.com | TestPass123! |
| Beginner (Backend) | dimas.prasetyo@edunomad.com | TestPass123! |

---

## Script yang Tersedia

Dari root:

| Perintah | Fungsi |
|---|---|
| `npm run dev:backend` | Jalankan API (nodemon, hot reload) |
| `npm run dev:frontend` | Jalankan Next.js dev |
| `npm run build:backend` | Compile backend TypeScript → `backend/dist` |
| `npm run build:frontend` | Build produksi Next.js |

Produksi backend: `npm run build:backend` lalu `node backend/dist/index.js`.
Produksi frontend: `npm run build:frontend` lalu `npm run start --workspace=frontend`.

---

## Alur Kerja Kelompok (Git)

Repo memakai GitHub Flow (lihat `CONTRIBUTING.md`). Kerjakan tiap fitur di branch, lalu buka Pull Request ke `main`.

```bash
git checkout main && git pull            # ambil versi terbaru
git checkout -b feature/nama-fitur       # branch fitur
# ... coding, lalu:
git add -A
git commit -m "feat: deskripsi singkat"  # Conventional Commits
git push origin feature/nama-fitur       # lalu buka PR di GitHub
```

---

## Troubleshooting

- **`Missing required environment variable: SUPABASE_URL`** → `backend/.env` belum lengkap. Ulangi langkah 3a lalu restart backend.
- **"Failed to fetch" di browser** → backend belum jalan (cek terminal 1) atau tak ada koneksi internet ke Supabase (Auth/Realtime butuh internet).
- **Login gagal / user tak ada** → jalankan `npx tsx src/prisma/seed.ts` (dan `seed-kasir.ts` untuk akun demo).
- **Error migrasi Prisma** → pastikan `DIRECT_URL` benar (port 5432), lalu ulangi `npx prisma migrate deploy`.
- **Fitur AI menampilkan "AI tidak tersedia"** → normal jika `GROQ_API_KEY`/`GEMINI_API_KEY` kosong; alur inti tetap berjalan.
- **Gap/latensi terasa lama** → koneksi ke DB Supabase (region ap-south-1) berpengaruh; koneksi dijaga tetap warm oleh pool.

---

## Deploy Gratis (Fly.io + Vercel)

Untuk demo online yang bisa diakses responden lewat 1 link, tanpa biaya. Arsitektur hosting:

| Bagian | Host | Catatan |
| --- | --- | --- |
| Database + Auth + Storage | **Supabase** (sudah ada) | Free tier, tidak perlu setup ulang |
| Backend (Express API) | **Fly.io** | Always-on (tanpa cold start), region Singapura |
| Frontend (Next.js) | **Vercel** | Auto-deploy dari GitHub, URL publik |

### A. Backend → Fly.io

File deploy sudah disiapkan di `backend/`: `Dockerfile`, `fly.toml`, `.dockerignore`.

```bash
# 1. Install CLI & login (sekali saja)
brew install flyctl        # atau: curl -L https://fly.io/install.sh | sh
fly auth login             # butuh verifikasi kartu (tetap gratis dalam batas free allowance)

cd backend

# 2. Buat app (pakai nama unik; edit juga field `app` di fly.toml agar sama)
fly apps create edunomad-api

# 3. Set SECRET (env sensitif — JANGAN taruh di fly.toml). Ambil nilainya dari backend/.env
fly secrets set \
  DATABASE_URL="postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true" \
  SUPABASE_URL="https://xxxx.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="eyJ..." \
  --app edunomad-api

# 4. (Opsional) fitur AI + kunci CORS ke domain Vercel
fly secrets set GROQ_API_KEY="gsk_..." CORS_ORIGIN="https://edunomad.vercel.app" --app edunomad-api

# 5. Deploy
fly deploy

# URL backend jadi: https://edunomad-api.fly.dev  → API base: https://edunomad-api.fly.dev/api/v1
```

Env non-sensitif (`PORT=8080`, `NODE_ENV=production`) sudah di `fly.toml`. Database sudah dimigrasi di Supabase, jadi container **tidak** menjalankan migrasi (`DIRECT_URL` tak diperlukan di Fly).

### B. Frontend → Vercel

1. Import repo di [vercel.com/new](https://vercel.com/new) → **Root Directory: `frontend`** (Vercel auto-detect Next.js).
2. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://edunomad-api.fly.dev/api/v1`
   - `NEXT_PUBLIC_SUPABASE_URL` = URL Supabase
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = publishable key Supabase
3. Deploy → dapat URL publik (mis. `https://edunomad.vercel.app`).
4. Kembali ke Fly, kunci CORS ke URL itu: `fly secrets set CORS_ORIGIN="https://edunomad.vercel.app" --app edunomad-api`.

### C. Siapkan skenario demo untuk responden

1. Seed data demo (sekali, dari lokal — DB-nya sama, di Supabase):
   ```bash
   cd backend && npx tsx src/prisma/seed.ts && npx tsx src/prisma/seed-kasir.ts
   ```
2. Bagikan ke responden: **1 link Vercel** + daftar akun demo (lihat bagian "Akun Demo") — password `TestPass123!`. Mereka tinggal login dan mencoba, tanpa registrasi.

> Checklist secret backend (Fly): `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (wajib) · `GROQ_API_KEY`/`GEMINI_API_KEY`, `CORS_ORIGIN`, `DEMO_COMPLETE_BYPASS` (opsional).

---

## Panduan Penggunaan Aplikasi (Alur Bisnis)

Bagian ini menjelaskan cara memakai aplikasi **yang sudah dihosting** (cukup buka URL aplikasi di browser), mulai dari mendaftar sampai memperoleh sertifikat, untuk keempat peran.

### 0. Onboarding — Daftar, Pilih Peran & Isi Form

Alur pendaftaran bertahap (sama untuk semua peran, dengan sedikit perbedaan isi form):

1. **Buat Akun** — buka **Daftar** → isi **email & password** → klik *Buat Akun*.
2. **Pilih Peran** — pilih salah satu: **Mahasiswa (Beginner)**, **Mentor (Senior)**, atau **UMKM**.
3. **Data Diri** — lengkapi profil (nama, headline, dan info sesuai peran: Mentor mengisi keahlian/pengalaman, UMKM mengisi info usaha).
4. **Portofolio** — isi bio singkat dan tautan (GitHub/LinkedIn/Behance/website) — opsional tapi disarankan untuk Mahasiswa & Mentor.
5. **Keahlian (Skill)** — pilih skill yang dikuasai dan minat belajar (relevan untuk Mahasiswa & Mentor). Setelah selesai, kamu masuk ke **Dashboard**.
6. **Login** berikutnya cukup lewat halaman **Masuk** (email + password).
7. **Verifikasi Akun** — akun baru berstatus *belum terverifikasi*. Beberapa aksi (melamar, membuat proyek) butuh status **Terverifikasi**. Ajukan verifikasi dari profil; **Admin** meninjau dan menyetujui.

> Elemen tetap di semua halaman: **lonceng Notifikasi** (real-time), menu **Profil**, dan **Dashboard** sesuai peran.

### 1. Alur Bisnis Inti (ringkas)

```
UMKM buat proyek → Admin setujui → Senior melamar & dipilih UMKM
→ Beginner melamar & dipilih Senior → Senior mulai proyek
→ tim kerja (deliverable, kontribusi, diskusi) → Senior & UMKM review
→ Senior ajukan penyelesaian → UMKM konfirmasi → SERTIFIKAT terbit (ber-QR, verifikasi publik)
```

### 2. Panduan UMKM

1. **Buat Proyek** — Dashboard → **Proyek Saya** → **Buat Proyek**. Isi wizard: info dasar (judul, deskripsi, hasil yang diharapkan), **gambar sampul**, **milestone**, dan **peran + skill** yang dibutuhkan.
2. **Ajukan ke Admin** — klik **Ajukan Proyek** (status *Menunggu Tinjauan*), tunggu persetujuan.
3. **Rekrut Mentor** — setelah disetujui (*Rekrutmen*): buka proyek → **Kelola Lamaran Senior** → **Terima** satu mentor.
4. **Pantau** — ikuti progres & ikut **Diskusi**.
5. **Konfirmasi Penyelesaian** — saat mentor mengajukan penyelesaian, **Konfirmasi** + **beri review** anggota & mentor. Proyek *Selesai*, sertifikat terbit.

> Batasan: UMKM maksimal **5 proyek aktif**.

### 3. Panduan Senior (Mentor)

1. **Lamar Mentor** — **Jelajahi Proyek** → pilih proyek *Rekrutmen* → **Lamar sebagai Mentor**. UMKM yang memilih.
2. **Seleksi Anggota (bantuan AI)** — buka daftar pelamar → aktifkan **"Urutkan berdasarkan kecocokan AI"** (skor + skill cocok/kurang + alasan) → **Terima / Tolak**.
3. **Mulai Proyek** — setelah tim lengkap, klik **Mulai Proyek** (status *Aktif*).
4. **Bimbing di Ruang Kerja** — pantau **milestone**; tinjau **deliverable** (*Setujui* / *Minta Revisi* + feedback); setujui **laporan kontribusi**; koordinasi via **Diskusi / DM**.
5. **Beri Review** — nilai tiap anggota (bintang + komentar).
6. **Ajukan Penyelesaian** — bila deliverable & kontribusi disetujui dan review lengkap → **Ajukan Penyelesaian**. Setelah UMKM konfirmasi, **sertifikat per anggota terbit**.

> Batasan: Senior maksimal **5 proyek aktif**; satu proyek = **satu** Senior.

### 4. Panduan Beginner (Mahasiswa)

1. **Cari & Lamar** — **Jelajahi Proyek** → pilih **peran** sesuai keahlian → lihat **Rekomendasi Portofolio AI** → isi **motivasi** → **Kirim Lamaran**.
2. **Bergabung** — jika diterima, kamu jadi anggota *Aktif* dan bisa masuk **Ruang Kerja**.
3. **Berkolaborasi** — kirim **deliverable** (bukti tautan/berkas), buat **laporan kontribusi** (ringkasan + skill), ikut/**buat topik diskusi**.
4. **Terima Review** — lihat penilaian mentor & UMKM di **Review Saya**.
5. **Sertifikat & Portofolio** — setelah proyek selesai, **Sertifikat** muncul di **Profil** (tab Sertifikat) + ringkasan kontribusi. Sertifikat punya **QR** untuk verifikasi publik.
6. **Ringkasan Profesional AI** — kartu ringkasan otomatis di profil.

> Batasan: boleh melamar banyak proyek, tetapi hanya **satu proyek Aktif** pada satu waktu.

### 5. Panduan Admin

1. **Persetujuan Proyek** — Dashboard Admin → antrian proyek *Menunggu Tinjauan* → **Setujui** / **Tolak** (beri alasan).
2. **Verifikasi Akun** — tinjau antrian verifikasi → **Setujui / Tolak**; status pengguna langsung diperbarui.
3. **Monitoring Proyek** — **Pantau Proyek**: seluruh proyek lintas status + mentor + jumlah anggota.
4. **Ganti Mentor** — pada proyek aktif, ganti mentor dengan Senior lain yang memenuhi syarat (terverifikasi, kapasitas < 5); kedua mentor dapat notifikasi.
5. **Kelola Skill** — setujui/tolak skill kustom sebelum jadi master skill.

### 6. Fitur AI, Diskusi & Verifikasi

- **AI** (pembantu, tidak wajib — bila AI mati, aplikasi tetap jalan): pemeringkatan kandidat (Senior), rekomendasi portofolio (Beginner), ringkasan profesional (Beginner & Senior).
- **Diskusi grup**: semua peserta proyek — termasuk **Beginner** — dapat **membuat topik**, membalas, memberi reaksi, melampirkan berkas. **Pin** hanya mentor/UMKM. **Pesan Langsung (DM)** antar peserta proyek.
- **Notifikasi real-time** di lonceng untuk tiap aktivitas penting.
- **Verifikasi sertifikat publik**: setiap sertifikat punya **kode + QR**; siapa pun (mis. perusahaan) bisa mengecek keasliannya lewat halaman verifikasi publik tanpa login.

---

## Dokumentasi

Spesifikasi lengkap ada di folder `/docs` (PRD, ERD, Database Schema, API Specification, RBAC & Business Rules, Workflow Map, UI Spec). Aturan pengembangan ada di `CLAUDE.MD`.
