# Contributing to EduNomad

Panduan singkat agar kontribusi konsisten dan repo tetap scalable untuk banyak developer.

## Branching model (GitHub Flow)

- **`main`** — selalu stabil & bisa dijalankan. Jangan commit langsung ke `main`; lewat Pull Request.
- **Branch fitur/eksperimen** — selalu dibuat dari `main`:
  - `feat/<area>-<ringkas>` — fitur baru (mis. `feat/phase5-workspace`)
  - `fix/<ringkas>` — perbaikan bug
  - `chore/<ringkas>` — tooling, config, refactor non-fitur
  - `redesign/<ringkas>` — eksperimen desain yang mungkin dibuang (mis. `redesign/landing`)
- Alur: branch → commit → push → **Pull Request** → review → **merge ke `main`** → hapus branch.

### Checkpoint & undo
- Tiap commit & tiap merge = checkpoint.
- **Tag** untuk versi penting: `git tag -a landing-v1 -m "..."` (mis. titik simpan landing).
- Undo eksperimen: cukup **buang branch**-nya — `main` tidak tersentuh.
- Undo sesuatu yang sudah masuk `main`: `git revert <commit>` (aman, tidak menghapus histori).

## Commit message (Conventional Commits)

Format: `type: ringkasan` — `type` ∈ `feat | fix | chore | docs | refactor | test | style`.

Contoh: `feat: project workspace group discussion (Phase 5)`

Commit per **fase/fitur yang selesai**, bukan satu commit raksasa.

## Setup lokal

```bash
# Backend (port 3001)
cd backend && npm install && npm run dev

# Frontend (port 3000)
cd frontend && npm install && npm run dev
```

Butuh file env (tidak di-commit, minta ke maintainer):
- `backend/.env` (Supabase DB URL, dll — lihat `backend/.env.example`)
- `frontend/.env.local` (URL API + Supabase anon key)

## Sebelum membuka PR

- `cd backend && npm run build` → 0 error
- `cd frontend && npx tsc --noEmit` → bersih
- Ikuti arsitektur & aturan di **`CLAUDE.MD`** dan dokumen di `docs/` (PRD, RBAC, Workflow, Schema, API). Dokumentasi menang atas kode bila berbeda.
