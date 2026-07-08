# Panduan QA — Flow Bisnis EduNomad (Data Real, Urut Langkah)

Skrip pengujian manual end-to-end. Ikuti **berurutan dari atas ke bawah**. Setiap langkah sudah menyertakan **data input persis** yang harus diisi, jadi tidak perlu bingung.

Skenario yang diuji: **UMKM "Kedai Kopi Senja" membuka lowongan Website Company Profile, merekrut 1 mentor + 2 mahasiswa, tim mengerjakan, lalu terbit sertifikat.**

---

## Prasyarat

1. Aplikasi jalan: backend `npm run dev:backend`, frontend `npm run dev:frontend`. Buka **http://localhost:3000**.
2. **Konfirmasi email Supabase**: agar registrasi via aplikasi bisa langsung login tanpa cek email, matikan *Confirm email* di Supabase → Authentication → Providers → Email (atau gunakan email asli yang bisa kamu buka). Jika tidak, akun baru harus konfirmasi lewat email dulu.
3. **Akun Admin** sudah ada (dipakai untuk verifikasi & approve): `admin@edunomad.com` / `EduNomadAdmin123!`.
4. Password semua akun QA baru: **`Qatest123!`** (biar seragam & mudah).

> Tips: buka beberapa browser/profil (atau mode incognito) supaya bisa login sebagai peran berbeda sekaligus tanpa logout-login terus.

---

## Pemeran & Data Akun

| Peran | Nama | Email | Password |
|---|---|---|---|
| Admin | (sudah ada) | admin@edunomad.com | EduNomadAdmin123! |
| UMKM | Kedai Kopi Senja | qa.kopisenja@mail.com | Qatest123! |
| Senior (Mentor) | Bagas Prakoso | qa.bagas@mail.com | Qatest123! |
| Mahasiswa 1 (Frontend) | Muhammad Rizki | qa.rizki@mail.com | Qatest123! |
| Mahasiswa 2 (Backend) | Siti Nurhaliza | qa.siti@mail.com | Qatest123! |

---

## FASE 1 — UMKM: Daftar, Isi Form, Verifikasi

### Langkah 1.1 — Registrasi UMKM
Buka **/auth/register** → **Buat Akun**:
- Email: `qa.kopisenja@mail.com`
- Password: `Qatest123!`

Lalu ikuti wizard:
- **Pilih Peran:** UMKM
- **Data Diri:**
  - Nama: `Kedai Kopi Senja`
  - Headline: `Kedai kopi lokal di Yogyakarta`
  - Bidang usaha / Bio: `Kedai kopi yang ingin punya website company profile untuk memperluas jangkauan pelanggan.`
- **Portofolio:** (opsional) kosongkan atau isi `https://instagram.com/kopisenja`
- **Skill:** UMKM tidak perlu skill → lanjut/selesai.

✅ Diharapkan: masuk ke **Dashboard UMKM**, status **belum terverifikasi**.

### Langkah 1.2 — Ajukan Verifikasi
Buka menu **Profil** / halaman verifikasi → **Ajukan Verifikasi** (isi catatan singkat bila diminta, mis. `Verifikasi akun UMKM Kedai Kopi Senja`).

### Langkah 1.3 — Admin Menyetujui UMKM
Login **Admin** → **Dashboard Admin** → antrian **Verifikasi** → temukan *Kedai Kopi Senja* → **Setujui**.

✅ Diharapkan: status UMKM menjadi **Terverifikasi**.

---

## FASE 2 — UMKM: Buka Lowongan (Buat Proyek)

Login sebagai **UMKM**. **Proyek Saya** → **Buat Proyek**.

### Langkah 2.1 — Informasi Proyek
- Judul: `Website Company Profile — Kedai Kopi Senja`
- Kategori: `Web Development`
- Deskripsi: `Membangun website company profile untuk Kedai Kopi Senja: halaman utama, menu produk, galeri, cerita brand, dan kontak. Website harus responsif dan mudah diakses dari HP.`
- Hasil yang Diharapkan (deliverables): `1) Website responsif (Home, Menu, Tentang, Kontak). 2) API konten menu & form kontak. 3) Dokumentasi cara update konten.`
- Tanggal Mulai: `hari ini`
- Deadline: `+2 bulan dari hari ini`
- Gambar sampul: (opsional) upload gambar apa saja.

### Langkah 2.2 — Milestone
Tambah 4 milestone:
1. `Setup Proyek & Desain UI` — tenggat +2 minggu
2. `Halaman Utama & Menu Produk` — tenggat +4 minggu
3. `API Konten & Form Kontak` — tenggat +6 minggu
4. `Uji Coba & Peluncuran` — tenggat +8 minggu

### Langkah 2.3 — Peran + Skill
Tambah 2 peran:
- **Frontend Developer** — kapasitas `1` — skill: `React`, `JavaScript`, `TypeScript` — requirement: `Membangun UI website responsif dengan React.`
- **Backend Developer** — kapasitas `1` — skill: `Node.js`, `Express.js`, `PostgreSQL` — requirement: `Membuat API konten menu & form kontak.`

### Langkah 2.4 — Ajukan Proyek
Klik **Ajukan Proyek**. ✅ Status berubah menjadi **Menunggu Tinjauan**.

### Langkah 2.5 — Admin Menyetujui Proyek
Login **Admin** → **Pantau Proyek** / antrian proyek → temukan proyek → **Setujui**.

✅ Diharapkan: status proyek menjadi **Rekrutmen** (muncul di *Jelajahi Proyek*).

---

## FASE 3 — Senior (Mentor): Daftar, Verifikasi, Lamar Mentor

### Langkah 3.1 — Registrasi Senior
**/auth/register** → **Buat Akun**:
- Email: `qa.bagas@mail.com` · Password: `Qatest123!`
- **Pilih Peran:** Mentor (Senior)
- **Data Diri:**
  - Nama: `Bagas Prakoso`
  - Headline: `Fullstack Engineer & Mentor`
  - Pengalaman/Bio: `Fullstack engineer 6 tahun. Berpengalaman React, Node.js, dan PostgreSQL. Senang membimbing mahasiswa.`
- **Portofolio:** `https://github.com/bagasprakoso`
- **Skill:** pilih `React`, `Node.js`, `TypeScript`, `PostgreSQL`.

### Langkah 3.2 — Ajukan Verifikasi → Admin Setujui
- Senior: **Ajukan Verifikasi** (catatan: `Mentor fullstack, 6 tahun pengalaman`).
- Admin: **Verifikasi** → **Setujui Bagas Prakoso**.

✅ Senior menjadi **Terverifikasi**.

### Langkah 3.3 — Senior Melamar sebagai Mentor
Login **Senior** → **Jelajahi Proyek** → buka `Website Company Profile — Kedai Kopi Senja` → **Lamar sebagai Mentor**:
- Pesan: `Saya tertarik membimbing proyek ini. Berpengalaman membangun website company profile dengan React & Node.js.`

✅ Lamaran mentor berstatus **Menunggu** (di sisi UMKM).

### Langkah 3.4 — UMKM Menerima Mentor
Login **UMKM** → buka proyek → **Kelola Lamaran Senior** → **Terima** Bagas Prakoso.

✅ Proyek kini punya mentor **Bagas Prakoso**.

---

## FASE 4 — Mahasiswa: Daftar, Verifikasi, Lamar Peran

### Langkah 4.1 — Registrasi Mahasiswa 1 (Frontend)
**/auth/register** → **Buat Akun**:
- Email: `qa.rizki@mail.com` · Password: `Qatest123!`
- **Pilih Peran:** Mahasiswa
- **Data Diri:**
  - Nama: `Muhammad Rizki`
  - Headline: `Frontend Developer (React)`
  - Bio: `Mahasiswa Informatika yang fokus di frontend React & TypeScript.`
- **Portofolio:** `https://github.com/muhammadrizki`
- **Skill:** pilih `React`, `JavaScript`, `TypeScript`. Minat belajar: `Next.js`.

### Langkah 4.2 — Registrasi Mahasiswa 2 (Backend)
**/auth/register** → **Buat Akun**:
- Email: `qa.siti@mail.com` · Password: `Qatest123!`
- **Pilih Peran:** Mahasiswa
- **Data Diri:**
  - Nama: `Siti Nurhaliza`
  - Headline: `Backend Developer (Node.js)`
  - Bio: `Mahasiswa yang senang merancang API dan database.`
- **Portofolio:** `https://github.com/sitinurhaliza`
- **Skill:** pilih `Node.js`, `Express.js`, `PostgreSQL`.

### Langkah 4.3 — Verifikasi Kedua Mahasiswa (Admin)
Login **Admin** → **Verifikasi** → **Setujui** `Muhammad Rizki` dan `Siti Nurhaliza`.

✅ Kedua mahasiswa **Terverifikasi**.

### Langkah 4.4 — Mahasiswa 1 Melamar (Frontend)
Login **Muhammad Rizki** → **Jelajahi Proyek** → buka proyek → pilih peran **Frontend Developer** → (lihat **Rekomendasi Portofolio AI** bila muncul) →
- Motivasi: `Saya ingin membangun UI website Kedai Kopi Senja dengan React. Saya terbiasa membuat komponen responsif dan rapi.`
- **Kirim Lamaran**.

### Langkah 4.5 — Mahasiswa 2 Melamar (Backend)
Login **Siti Nurhaliza** → buka proyek → pilih peran **Backend Developer** →
- Motivasi: `Saya tertarik merancang API menu dan form kontak memakai Node.js, Express, dan PostgreSQL.`
- **Kirim Lamaran**.

✅ Kedua lamaran berstatus **Menunggu** (di sisi Senior).

---

## FASE 5 — Senior: Seleksi Anggota & Mulai Proyek

### Langkah 5.1 — Seleksi Pelamar (dengan AI)
Login **Senior** → buka proyek → **daftar pelamar** → aktifkan **"Urutkan berdasarkan kecocokan AI"** (lihat skor + skill cocok/kurang + alasan) →
- **Terima** `Muhammad Rizki` (Frontend)
- **Terima** `Siti Nurhaliza` (Backend)

✅ Keduanya menjadi anggota **Aktif**.

### Langkah 5.2 — Mulai Proyek
Login **Senior** → **Buka Workspace** → **Mulai Proyek**.

✅ Status proyek menjadi **Aktif**.

---

## FASE 6 — Kolaborasi (Deliverable, Kontribusi, Diskusi)

### Langkah 6.1 — Mahasiswa Kirim Deliverable
Login **Muhammad Rizki** → Workspace → tab **Deliverables** → **Buat Deliverable**:
- Judul: `Halaman Utama (Homepage) — React`
- Deskripsi: `Homepage responsif dengan hero, daftar menu unggulan, dan tombol kontak.`
- Bukti (LINK): `https://github.com/muhammadrizki/kopisenja-web`
- **Submit**.

Login **Siti Nurhaliza** → **Buat Deliverable**:
- Judul: `API Menu & Form Kontak`
- Bukti (LINK): `https://github.com/sitinurhaliza/kopisenja-api`
- **Submit**.

### Langkah 6.2 — Senior Menyetujui Deliverable
Login **Senior** → tab **Deliverables** → tiap kiriman → **Setujui** (atau coba **Minta Revisi** dulu untuk menguji, lalu mahasiswa submit ulang, lalu Setujui).

✅ Semua deliverable berstatus **Disetujui**.

### Langkah 6.3 — Mahasiswa Buat Laporan Kontribusi
Login **Muhammad Rizki** → tab **Kontribusi** → **Buat Laporan**:
- Ringkasan: `Membangun seluruh UI frontend (homepage, menu, kontak) dengan React & TypeScript, memastikan tampilan responsif.`
- Skill: `React`, `TypeScript`.

Login **Siti Nurhaliza** → **Buat Laporan**:
- Ringkasan: `Merancang API menu & form kontak dan skema database dengan Node.js, Express, PostgreSQL.`
- Skill: `Node.js`, `Express.js`, `PostgreSQL`.

### Langkah 6.4 — Senior Menyetujui Kontribusi
Login **Senior** → tab **Kontribusi** → **Setujui** kedua laporan.

### Langkah 6.5 — Uji Diskusi (opsional tapi disarankan)
Login **Muhammad Rizki** → Workspace → **Diskusi** → **Buat Diskusi Baru**:
- Judul: `Update Progress Homepage`
- Kategori: `Pembaruan`

Coba balas dari akun Senior/mahasiswa lain untuk menguji diskusi real-time.

---

## FASE 7 — Review & Rating

### Langkah 7.1 — Senior Menilai Mahasiswa
Login **Senior** → tab **Review** →
- `Muhammad Rizki`: **5 bintang** — `Kerja frontend rapi dan cepat, komponen reusable.`
- `Siti Nurhaliza`: **4 bintang** — `API solid, tinggal tambah pengujian kasus stok bersamaan.`

### Langkah 7.2 — UMKM Menilai Mahasiswa & Mentor
Login **UMKM** → tab **Review** →
- `Muhammad Rizki`: **5 bintang** — `Tampilan website sesuai keinginan.`
- `Siti Nurhaliza`: **4 bintang** — `Fitur menu & kontak berjalan baik.`
- `Bagas Prakoso` (Mentor): **5 bintang** — `Bimbingan jelas, komunikasi rutin.`

✅ Semua review tercatat (syarat penyelesaian).

---

## FASE 8 — Penerbitan Sertifikat & Penyelesaian

> Syarat sebelum "Ajukan Penyelesaian" (otomatis dicek sistem): **semua deliverable disetujui**, tiap mahasiswa punya **kontribusi disetujui + sertifikat + review dari Senior & UMKM**, dan ada **review UMKM → Mentor**. Bila ada yang kurang, sistem akan memberi tahu bagian mana.

### Langkah 8.1 — Senior Menerbitkan Sertifikat
Login **Senior** → Workspace → tab **Sertifikat** → **Terbitkan Sertifikat** (generate untuk tiap mahasiswa: Rizki & Siti).

✅ Sertifikat per mahasiswa dibuat.

### Langkah 8.2 — Senior Ajukan Penyelesaian
Login **Senior** → Workspace → **Ajukan Penyelesaian**.

✅ Status proyek menjadi **Menunggu Konfirmasi**. (Jika ditolak, baca pesan blocker dan lengkapi langkah yang kurang di Fase 6/7/8.1.)

### Langkah 8.3 — UMKM Konfirmasi Penyelesaian
Login **UMKM** → buka proyek → **Konfirmasi Penyelesaian**.

✅ Status proyek menjadi **Selesai**.

### Langkah 8.4 — Cek Sertifikat & Verifikasi Publik
- Login **Muhammad Rizki** → **Profil** → tab **Sertifikat** → sertifikat tampil (dengan ringkasan kontribusi).
- Buka **QR / tombol verifikasi** pada sertifikat → halaman **verifikasi publik** (`/verify/<kode>`) terbuka tanpa login dan menampilkan data asli sertifikat.
- Ulangi untuk **Siti Nurhaliza**.

🎉 **Flow selesai** — dari registrasi sampai sertifikat terverifikasi.

---

## Checklist Ringkas (centang saat lulus)

- [ ] UMKM daftar → diverifikasi Admin
- [ ] UMKM buat proyek → disetujui Admin (status Rekrutmen)
- [ ] Senior daftar → diverifikasi → lamar mentor → diterima UMKM
- [ ] 2 Mahasiswa daftar → diverifikasi → lamar peran
- [ ] Senior seleksi (skor AI) → terima 2 mahasiswa → Mulai Proyek (Aktif)
- [ ] Deliverable dikirim → disetujui Senior
- [ ] Kontribusi dibuat → disetujui Senior
- [ ] Diskusi jalan (real-time)
- [ ] Review Senior→mahasiswa & UMKM→mahasiswa+mentor
- [ ] Sertifikat diterbitkan Senior
- [ ] Senior ajukan penyelesaian → UMKM konfirmasi (Selesai)
- [ ] Sertifikat tampil di profil + verifikasi publik jalan

## Catatan Pengujian

- **Fitur AI** (skor pelamar, rekomendasi portofolio, ringkasan profil) hanya aktif bila `GROQ_API_KEY`/`GEMINI_API_KEY` diisi. Bila kosong → muncul fallback "AI tidak tersedia", dan itu **normal** (alur inti tetap lulus).
- **Uji akses negatif** (opsional): coba buka aksi milik peran lain (mis. Mahasiswa membuka endpoint seleksi) → harus **ditolak** (403), bukan error.
- Bila ingin mengulang QA dari awal dengan data bersih, pakai email berbeda (mis. `qa2.kopisenja@mail.com`, dst).
