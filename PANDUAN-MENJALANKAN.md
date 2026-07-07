# Panduan Menjalankan Aplikasi EduNomad

Petunjuk teknis menjalankan EduNomad di lokal (backend Express + frontend Next.js + Supabase).

---

## 1. Prasyarat

- **Node.js ≥ 20** (disarankan 22) — cek: `node -v`
- **npm ≥ 9**
- Akun **Supabase** dengan satu project (gratis) — untuk Database, Auth, Storage, Realtime.
- (Opsional) API key **Groq** atau **Gemini** bila ingin mengaktifkan fitur AI.

> Aplikasi butuh backend Supabase yang aktif. Minta detail koneksi project ke pemilik repo, atau buat project Supabase sendiri.

## 2. Clone & Install

```bash
git clone https://github.com/akbarpratama-dev/Edunomad.git
cd Edunomad

# Install SEMUA workspace (frontend + backend) sekaligus dari root
npm install
```

## 3. Konfigurasi Environment

Buat dua file environment (JANGAN di-commit — sudah masuk `.gitignore`).

### a. Backend — buat `backend/.env` (contoh: `backend/.env.example`)

```env
# Server
PORT=3001
NODE_ENV=development

# Supabase (Dashboard → Project Settings → API)
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

### b. Frontend — buat `frontend/.env.local`

```env
# URL backend (default sudah benar untuk lokal)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Supabase publik (Dashboard → Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable/anon key — aman untuk publik>
```

> **Penting:** `SUPABASE_SERVICE_ROLE_KEY` adalah kunci rahasia (akses penuh, bypass RLS). Jangan pernah menaruhnya di frontend atau meng-commit-nya. Yang boleh di frontend hanya *publishable/anon key*.

## 4. Siapkan Database (Prisma)

Dijalankan dari folder `backend/`:

```bash
cd backend

# Generate Prisma Client
npx prisma generate --schema=src/prisma/schema.prisma

# Terapkan skema/migrasi ke database
npx prisma migrate deploy --schema=src/prisma/schema.prisma
```

> Jika membuat project Supabase baru dan belum ada migrasi yang cocok, gunakan `npx prisma db push --schema=src/prisma/schema.prisma` untuk mendorong skema langsung.

## 5. Seed Data Awal

Masih dari folder `backend/`:

```bash
# Data dasar: admin, kategori proyek, master skill
npx tsx src/prisma/seed.ts

# (Opsional) Skenario demo lengkap "Kasir UMKM" (UMKM, mentor, 2 junior, milestone, review)
npx tsx src/prisma/seed-kasir.ts
```

## 6. Jalankan (Development)

Dari **root** repo — buka dua terminal:

```bash
# Terminal 1 — Backend (http://localhost:3001)
npm run dev:backend

# Terminal 2 — Frontend (http://localhost:3000)
npm run dev:frontend
```

Buka **http://localhost:3000**.

---

## Akun Demo (setelah `seed-kasir`)

Password semua akun demo: `TestPass123!` (kecuali admin default).

| Role | Email | Password |
|---|---|---|
| Admin | admin@edunomad.com | EduNomadAdmin123! |
| UMKM | tokomajubersama@edunomad.com | TestPass123! |
| Senior (Mentor) | aldo.firmansyah@edunomad.com | TestPass123! |
| Beginner (Frontend) | akbar.pratama@edunomad.com | TestPass123! |
| Beginner (Backend) | dimas.prasetyo@edunomad.com | TestPass123! |

---

## Script yang Tersedia (dari root)

| Perintah | Fungsi |
|---|---|
| `npm run dev:backend` | Jalankan API (nodemon, hot reload) |
| `npm run dev:frontend` | Jalankan Next.js dev |
| `npm run build:backend` | Compile backend TypeScript → `backend/dist` |
| `npm run build:frontend` | Build produksi Next.js |

Produksi backend: `npm run build:backend` lalu `node backend/dist/index.js`.
Produksi frontend: `npm run build:frontend` lalu `npm run start --workspace=frontend`.

---

## Troubleshooting

- **`Missing required environment variable: SUPABASE_URL`** → `backend/.env` belum lengkap. Ulangi langkah 3a lalu restart backend.
- **"Failed to fetch" di browser** → backend belum jalan (cek terminal 1) atau tak ada koneksi internet ke Supabase (Auth/Realtime butuh internet).
- **Login gagal / user tak ada** → jalankan `npx tsx src/prisma/seed.ts` (dan `seed-kasir.ts` untuk akun demo).
- **Error migrasi Prisma** → pastikan `DIRECT_URL` benar (port 5432), lalu ulangi `npx prisma migrate deploy`.
- **Fitur AI menampilkan "AI tidak tersedia"** → normal jika `GROQ_API_KEY`/`GEMINI_API_KEY` kosong; alur inti tetap berjalan.
