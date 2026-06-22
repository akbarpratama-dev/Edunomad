# EduNomad MVP — Task Breakdown for Vibecoding

> **Tujuan:** Dokumen ini memecah seluruh MVP EduNomad menjadi task-task granular yang bisa dikerjakan satu per satu oleh AI coding assistant. Setiap task berisi konteks lengkap, dependensi, file yang terlibat, acceptance criteria, dan referensi dokumen sumber agar AI tidak perlu membaca ulang seluruh dokumentasi.

---

## Konvensi Dokumen

- `[ ]` — Belum dikerjakan
- `[/]` — Sedang dikerjakan
- `[x]` — Selesai
- **Ref:** Merujuk ke dokumen sumber di `/docs/`
- **Dep:** Dependensi task (task mana yang harus selesai dulu)
- **AC:** Acceptance Criteria

---

## Referensi Dokumen

| Kode | Dokumen | Path |
|------|---------|------|
| PRD | Product Requirements Document | `docs/01-EduNomad_PRDl.md` |
| ERD | Entity Relationship Diagram | `docs/02-erd-production-grade.md` |
| DB | Database Schema | `docs/03-Database Schema.md` |
| API | API Specification | `docs/04-API Specification.md` |
| ARCH | Architecture Rules | `docs/05-Architecture Rules.md` |
| RBAC | RBAC & Business Rules | `docs/06-RBAC_and_Business_Rules.md` |
| WF | Workflow Map | `docs/07-Workflow_Map_Production_Grade_v1.0.md` |
| UI | UI Pages Specification | `docs/08-UI_Pages_Specification_v1.0.md` |
| CLAUDE | Operating Instructions | `CLAUDE.MD` |

---

## Tech Stack (LOCKED)

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 15 (pinned: 15.5.19), React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| Backend | Express.js, TypeScript |
| ORM | Prisma |
| Database | Supabase PostgreSQL (UUID PKs) |
| Auth | Supabase Auth (JWT) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Architecture | Modular Monolith (Route → Controller → Service → Repository → Prisma) |

> **Version flexibility:** the framework/library choices above are locked; their exact major version is not. If an installed/required version doesn't run or conflicts with current tooling, Claude may upgrade or downgrade it — but must ask the user for approval first, then update this table and every other doc stating the old version. Architecture style, business rules, RBAC, workflows, schema, and API contracts are NOT covered by this exception and remain strictly locked.

---

# PHASE 0: Project Initialization & Infrastructure

> Menyiapkan monorepo, konfigurasi, dan tooling dasar.

## 0.1 — Monorepo Setup

- [x] **0.1.1** Inisialisasi root project dengan package.json workspace
  - Buat folder `frontend/` dan `backend/`
  - Setup `.gitignore`, `.editorconfig`, `README.md`
  - **AC:** `npm install` dari root berjalan tanpa error

- [x] **0.1.2** Setup Backend Project
  - Inisialisasi `backend/` dengan TypeScript + Express.js
  - Install dependencies: `express`, `typescript`, `ts-node`, `nodemon`, `@types/express`
  - Buat `tsconfig.json` dengan strict mode
  - Buat entry point `src/index.ts` dengan Express server boilerplate
  - Buat struktur folder sesuai ARCH:
    ```
    backend/src/
    ├── modules/
    ├── middleware/
    ├── services/
    ├── repositories/
    ├── validators/
    ├── routes/
    ├── utils/
    ├── types/
    ├── config/
    └── prisma/
    ```
  - **Ref:** ARCH — Project Structure, Backend Structure
  - **AC:** `npm run dev` dari `backend/` menjalankan Express server di port 3001

- [x] **0.1.3** Setup Frontend Project
  - Inisialisasi `frontend/` dengan Next.js 15 + TypeScript
  - Install: Tailwind CSS, shadcn/ui, Zustand, React Hook Form, Zod
  - Buat folder structure sesuai ARCH:
    ```
    frontend/src/
    ├── app/
    ├── components/
    ├── features/
    ├── hooks/
    ├── lib/
    ├── services/
    ├── stores/
    ├── types/
    ├── constants/
    └── utils/
    ```
  - **Ref:** ARCH — Project Structure, Frontend Structure; PRD — Tech Stack
  - **AC:** `npm run dev` dari `frontend/` membuka Next.js di browser

## 0.2 — Database & ORM Setup

- [x] **0.2.1** Setup Supabase Project
  - Buat project di Supabase (atau gunakan existing)
  - Catat connection string, anon key, service role key
  - Simpan credentials di `.env` (backend & frontend)
  - **AC:** Bisa connect ke Supabase dari local

- [x] **0.2.2** Setup Prisma ORM
  - Install Prisma di backend
  - `npx prisma init` — generate `schema.prisma`
  - Konfigurasi datasource ke Supabase PostgreSQL
  - **Dep:** 0.2.1
  - **AC:** `npx prisma db pull` atau `npx prisma db push` berjalan tanpa error

- [x] **0.2.3** Implementasi Prisma Schema — Users Domain
  - Buat model: `users`, `user_profiles`
  - UUID primary keys, timestamps, enum untuk role & status
  - Relasi: `users` 1:1 `user_profiles`
  - **Ref:** DB — Users Domain
  - **Dep:** 0.2.2
  - **AC:** `npx prisma migrate dev` berhasil, tabel terbuat di Supabase

- [x] **0.2.4** Implementasi Prisma Schema — Skills Domain
  - Model: `skills`, `user_skills`
  - Enum: skill status (PENDING, APPROVED, REJECTED), skill level (BEGINNER, INTERMEDIATE, ADVANCED)
  - Constraints: UNIQUE(name), UNIQUE(slug), UNIQUE(user_id, skill_id)
  - **Ref:** DB — Skills Domain
  - **Dep:** 0.2.3
  - **AC:** Migration berhasil, relasi antar tabel benar

- [x] **0.2.5** Implementasi Prisma Schema — Experiences & Portfolio Domain
  - Model: `experiences`, `portfolio_links`
  - Enum: portfolio link type (GITHUB, FIGMA, BEHANCE, LINKEDIN, OTHER)
  - **Ref:** DB — Experiences Domain, Portfolio Domain
  - **Dep:** 0.2.3
  - **AC:** Migration berhasil

- [x] **0.2.6** Implementasi Prisma Schema — Projects Domain
  - Model: `project_categories`, `projects`, `milestones`, `project_roles`, `role_skills`
  - Enum: project status (DRAFT, PENDING_REVIEW, PUBLISHED, RECRUITING, ACTIVE, OVERDUE, COMPLETED, CANCELLED), milestone status
  - Soft delete: `deleted_at` di projects
  - Constraints: capacity > 0, UNIQUE(project_role_id, skill_id)
  - Indexes: status, deadline, umkm_id, senior_id
  - **Ref:** DB — Projects Domain, Milestones Domain, Project Roles Domain
  - **Dep:** 0.2.3, 0.2.4
  - **AC:** Semua tabel terbuat dengan relasi & index yang benar

- [x] **0.2.7** Implementasi Prisma Schema — Recruitment Domain
  - Model: `senior_applications`, `project_applications`, `project_members`
  - Enum: application status, member status
  - **Ref:** DB — Recruitment Domain
  - **Dep:** 0.2.6
  - **AC:** Migration berhasil, relasi FK benar

- [x] **0.2.8** Implementasi Prisma Schema — Discussions Domain
  - Model: `discussions`, `discussion_members`, `discussion_messages`
  - Enum: discussion type (GROUP, DIRECT)
  - Constraint: UNIQUE(discussion_id, user_id)
  - **Ref:** DB — Discussions Domain
  - **Dep:** 0.2.3
  - **AC:** Migration berhasil

- [x] **0.2.9** Implementasi Prisma Schema — Deliverables Domain
  - Model: `deliverables`, `deliverable_evidences`
  - Enum: deliverable status (DRAFT, SUBMITTED, REVISION_REQUESTED, APPROVED), evidence type (LINK, FILE)
  - **Ref:** DB — Deliverables Domain
  - **Dep:** 0.2.6
  - **AC:** Migration berhasil

- [x] **0.2.10** Implementasi Prisma Schema — Contributions, Artifacts, Reviews Domain
  - Model: `contribution_reports`, `contribution_skills`, `artifacts`, `artifact_versions`, `reviews`
  - Enum: contribution status, review type
  - Constraint: rating BETWEEN 1 AND 5, UNIQUE(artifact_code), UNIQUE(contribution_report_id, skill_id)
  - **Ref:** DB — Contributions, Artifacts, Reviews Domain
  - **Dep:** 0.2.6
  - **AC:** Migration berhasil, semua constraints terbuat

- [x] **0.2.11** Implementasi Prisma Schema — Notifications, Verification, Audit Domain
  - Model: `notifications`, `verification_requests`, `audit_logs`
  - Indexes di audit_logs: user_id, entity_type, entity_id
  - **Ref:** DB — Notifications, Verification, Audit Domain
  - **Dep:** 0.2.3
  - **AC:** Migration berhasil, seluruh schema selesai

- [x] **0.2.12** Seed Data
  - Buat seed script untuk: admin user, project categories, master skills (system skills)
  - **Dep:** 0.2.11 (semua schema selesai)
  - **AC:** `npx prisma db seed` berhasil, data awal tersedia

## 0.3 — Backend Infrastructure

- [x] **0.3.1** Setup Express Middleware Stack
  - CORS middleware
  - JSON body parser
  - Request logging (morgan)
  - Helmet (security headers)
  - Rate limiting dasar
  - **Ref:** ARCH — Security & Performance
  - **AC:** Server menerima request dengan middleware aktif

- [x] **0.3.2** Setup Global Error Handler
  - Buat custom error classes: `AppError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `BusinessRuleError`
  - Buat global error middleware yang catch semua error dan format response standar
  - Format: `{ success: false, message: string, errors?: object }`
  - **Ref:** ARCH — Error Handling; API — Response Format
  - **AC:** Error handler catch semua error dan return format konsisten

- [x] **0.3.3** Setup Response Helpers
  - Buat utility functions untuk standar response:
    - `successResponse(data, message)`
    - `errorResponse(message, errors)`
    - `paginatedResponse(data, meta)`
  - Format: `{ success: true, message: string, data: object }`
  - Paginated: `{ data: [], meta: { page, limit, total, lastPage } }`
  - **Ref:** API — Response Format
  - **AC:** Semua response menggunakan format standar

- [x] **0.3.4** Setup Validation Middleware (Zod)
  - Buat `validateRequest` middleware yang menerima Zod schema
  - Validasi body, params, query
  - Return error format standar saat validasi gagal
  - **Ref:** ARCH — Validation Rules
  - **AC:** Request dengan data invalid ditolak dengan error message yang jelas

- [x] **0.3.5** Setup Prisma Client Singleton
  - Buat Prisma client singleton di `config/database.ts`
  - Handle connection/disconnection
  - **AC:** Prisma client bisa digunakan di seluruh backend

## 0.4 — Frontend Infrastructure

- [x] **0.4.1** Setup Design System & Theme
  - Konfigurasi Tailwind dengan color palette dari UI spec:
    - Primary Green: #67C957
    - Neutral Light: #F5F5F5
    - Neutral Gray: #999999, #CCCCCC
    - Neutral Dark: #333333
    - Dark Background: #1A1A1A
    - Warning: #FFA500, Error: #FF4444
  - Setup typography: Inter font, ukuran sesuai UI spec
  - Setup spacing, border radius, shadows sesuai UI spec
  - **Ref:** UI — Design System
  - **AC:** Design tokens tersedia di Tailwind config

- [x] **0.4.2** Setup shadcn/ui Components
  - Install dan konfigurasi shadcn/ui
  - Kustomisasi theme sesuai color palette
  - Generate base components: Button, Input, Card, Dialog, Badge, etc.
  - **Ref:** UI — Component Inventory
  - **AC:** shadcn/ui components tersedia dan sesuai design system

- [x] **0.4.3** Setup API Client
  - Buat axios/fetch wrapper dengan base URL `/api/v1`
  - Auto-attach Supabase JWT token di header
  - Handle error response secara global
  - **Ref:** API — Authentication & Authorization
  - **AC:** API client bisa melakukan authenticated request ke backend

- [x] **0.4.4** Setup Supabase Client (Frontend)
  - Install `@supabase/supabase-js`
  - Konfigurasi client dengan environment variables
  - Buat auth helper functions (signIn, signUp, signOut, getSession)
  - **AC:** Supabase client berfungsi untuk auth & storage

- [x] **0.4.5** Setup Zustand Stores
  - Auth store: user, session, isAuthenticated, isLoading
  - Notification store: notifications, unreadCount
  - UI store: sidebarOpen, modals
  - **Ref:** ARCH — State Management
  - **AC:** Stores berfungsi dan bisa diakses dari components

- [x] **0.4.6** Setup Layout Components
  - Sidebar navigation component (role-aware)
  - Top header bar (breadcrumbs, notifications, user dropdown)
  - Main content wrapper
  - Mobile hamburger menu
  - **Ref:** UI — Navigation Patterns, Shared Components
  - **AC:** Layout responsive dan navigation sesuai spec

- [x] **0.4.7** Setup Common UI Components
  - Empty state component
  - Loading state / skeleton loaders
  - Error state component
  - Success toast/notification
  - Confirmation dialog/modal
  - **Ref:** UI — Common UI Patterns
  - **AC:** Reusable components tersedia dan konsisten

---

# PHASE 1: Authentication & User Registration

> Workflow 1 dari WF. Fondasi utama yang dibutuhkan semua fitur lain.

## 1.1 — Backend: Auth Module

- [x] **1.1.1** Auth Middleware — JWT Verification
  - Buat `authMiddleware` yang verify Supabase JWT dari header `Authorization: Bearer <token>`
  - Decode JWT, extract user info (id, email, role)
  - Attach user ke `req.user`
  - Handle: token missing, token invalid, token expired
  - **Ref:** ARCH — Authentication Rules; RBAC — Global Rules
  - **AC:** Protected routes hanya bisa diakses dengan valid JWT

- [x] **1.1.2** Role Middleware
  - Buat `roleMiddleware(allowedRoles: string[])` — cek `req.user.role` terhadap allowed roles
  - Return 403 Forbidden jika role tidak cocok
  - **Ref:** ARCH — Authorization Rules; RBAC — Role-Based Permissions
  - **AC:** Endpoint hanya bisa diakses oleh role yang sesuai

- [x] **1.1.3** Verification Status Middleware
  - Buat `verificationMiddleware` — cek `req.user.status === 'VERIFIED'`
  - Block aksi tertentu untuk user PENDING_VERIFICATION
  - Handle SUSPENDED users (block semua akses)
  - **Ref:** RBAC — Rule 1 (Verification Requirement), Rule 2 (Pending Access), Rule 3 (Suspended Users)
  - **AC:** User non-verified tidak bisa apply project, create project, dll

- [x] **1.1.4** Auth Controller & Routes
  - `GET /api/v1/auth/me` — return current user info (Public/Authenticated)
  - `POST /api/v1/auth/logout` — logout dan invalidate session
  - **Ref:** API — Auth Endpoints
  - **Dep:** 1.1.1
  - **AC:** Endpoint berfungsi sesuai spec

- [x] **1.1.5** Auth Service
  - `getCurrentUser(userId)` — ambil user + profile dari DB
  - `syncUserFromSupabase(supabaseUser)` — sync user data dari Supabase Auth ke tabel `users`
  - **Dep:** 1.1.4
  - **AC:** User data tersinkronisasi antara Supabase Auth dan tabel users

## 1.2 — Backend: User Module

- [x] **1.2.1** User Repository
  - CRUD operations: `findById`, `findByEmail`, `create`, `update`
  - Include relations: `user_profiles`, `user_skills`, `experiences`, `portfolio_links`
  - **Ref:** DB — Users Domain; ARCH — Repository Responsibilities
  - **AC:** Repository berfungsi untuk semua operasi user

- [x] **1.2.2** User Profile Service
  - `getMyProfile(userId)` — return profile lengkap
  - `updateMyProfile(userId, data)` — update profile (name, phone, photo, headline, bio, linkedin_url)
  - `getUserProfile(userId, targetUserId)` — view other user's profile (requires authenticated)
  - `getUserPortfolio(targetUserId)` — return portfolio (links + experiences)
  - **Ref:** API — User Endpoints; RBAC — Portfolio Rules (login required)
  - **AC:** Profile CRUD berfungsi, portfolio hanya visible untuk authenticated users

- [x] **1.2.3** User Profile Controller & Routes
  - `GET /api/v1/users/me` — get my profile
  - `PUT /api/v1/users/me` — update my profile
  - `GET /api/v1/users/:id` — get user profile
  - `GET /api/v1/users/:id/portfolio` — get user portfolio
  - Zod validation schemas untuk update
  - **Ref:** API — User Endpoints
  - **Dep:** 1.2.2
  - **AC:** Semua endpoint berfungsi dengan validasi

- [x] **1.2.4** User Skills Service, Controller & Routes
  - `GET /api/v1/skills` — master skills list (Public, dengan filter category/status, pagination)
  - `POST /api/v1/users/me/skills` — add skill (skill_id, level)
  - `PUT /api/v1/users/me/skills/:id` — update skill level
  - `DELETE /api/v1/users/me/skills/:id` — remove skill
  - Validasi: skill harus APPROVED, cek UNIQUE(user_id, skill_id)
  - **Ref:** API — User Skills Endpoints; DB — Skills Domain
  - **AC:** CRUD skills berfungsi, master skills bisa difilter

- [x] **1.2.5** Experiences Service, Controller & Routes
  - `GET /api/v1/users/me/experiences` — list experiences
  - `POST /api/v1/users/me/experiences` — create (title, organization, description, start_date, end_date)
  - `PUT /api/v1/users/me/experiences/:id` — update (ownership check)
  - `DELETE /api/v1/users/me/experiences/:id` — delete (ownership check)
  - **Ref:** API — Experience Endpoints; DB — Experiences Domain
  - **AC:** CRUD experiences berfungsi dengan ownership validation

- [x] **1.2.6** Portfolio Links Service, Controller & Routes
  - `GET /api/v1/users/me/portfolio-links` — list links
  - `POST /api/v1/users/me/portfolio-links` — create (title, url, type)
  - `PUT /api/v1/users/me/portfolio-links/:id` — update
  - `DELETE /api/v1/users/me/portfolio-links/:id` — delete
  - Validasi: type harus salah satu dari GITHUB, FIGMA, BEHANCE, LINKEDIN, OTHER
  - **Ref:** API — Portfolio Links Endpoints; DB — Portfolio Domain
  - **AC:** CRUD portfolio links berfungsi

## 1.3 — Frontend: Auth Pages

- [x] **1.3.1** Login Page
  - URL: `/auth/login`
  - Components: email input, password input (show/hide toggle), "Ingat Saya" checkbox, "Lupa Password?" link, "Masuk →" button, Google OAuth button (disabled/future), register link
  - Integrasi Supabase Auth signInWithPassword
  - States: normal, loading, error, success (redirect to dashboard)
  - Validasi: email format, password required
  - **Ref:** UI — Login Page; WF — Workflow 1
  - **AC:** Login berfungsi end-to-end, redirect ke dashboard sesuai role

- [x] **1.3.2** Register Step 1 — Create Account
  - URL: `/auth/register`
  - Components: nama lengkap, email, password (min 8 char), confirm password, Google OAuth (disabled)
  - Progress indicator: Step 1 of 5
  - Integrasi Supabase Auth signUp
  - **Ref:** UI — Registration Step 1
  - **AC:** Account terbuat di Supabase Auth

- [x] **1.3.3** Register Step 2 — Role Selection
  - URL: `/auth/register/role`
  - 3 role cards: Mahasiswa (BEGINNER), Mentor (SENIOR), UMKM
  - Selected state: highlighted border
  - Store role selection di state/session
  - **Ref:** UI — Registration Step 2; PRD — User Roles
  - **AC:** User bisa pilih role, role tersimpan

- [x] **1.3.4** Register Step 3 — Tell Us About You
  - URL: `/auth/register/about`
  - Dynamic form berdasarkan role:
    - BEGINNER: status saat ini dropdown, institusi, bidang studi, kota
    - SENIOR: company, jabatan, tahun pengalaman, kota
    - UMKM: nama bisnis, deskripsi bisnis, tipe bisnis, lokasi
  - **Ref:** UI — Registration Step 3
  - **AC:** Form adapts per role, data tersimpan

- [x] **1.3.5** Register Step 4 — Portfolio & Experience
  - URL: `/auth/register/portfolio`
  - Sections: "Tentang Saya" textarea (max 300 char), pengalaman sebelumnya (tag selection), portfolio URLs (GitHub, LinkedIn, etc.), project showcase, CV upload (Supabase Storage, max 5MB, PDF/DOCX)
  - **Ref:** UI — Registration Step 4
  - **Dep:** 0.2.1 (Supabase Storage)
  - **AC:** Data tersimpan, file upload berfungsi

- [x] **1.3.6** Register Step 5 — Skills & Interests
  - URL: `/auth/register/skills`
  - Sections: bidang utama (dropdown), role yang diminati (multi-select tags), tingkat pengalaman (radio), keahlian & tools (multi-select tags grouped by category), bidang yang ingin dipelajari
  - **Ref:** UI — Registration Step 5
  - **AC:** Skills tersimpan, user status = PENDING_VERIFICATION

- [x] **1.3.7** Registration Completion & User Sync
  - Setelah step 5:
    - Buat user record di tabel `users` (role, status=PENDING_VERIFICATION)
    - Buat `user_profiles` record
    - Buat `user_skills` records
    - Buat `experiences` records
    - Buat `portfolio_links` records
    - Buat `verification_requests` record (status=PENDING)
  - Redirect ke dashboard dengan status pending
  - **Dep:** 1.3.1–1.3.6, 1.2.1–1.2.6
  - **AC:** Semua data registration tersimpan di DB, user diarahkan ke dashboard

- [x] **1.3.8** Auth Guard & Route Protection
  - Buat middleware/HOC untuk protect pages berdasarkan:
    - Authenticated (redirect ke login jika belum)
    - Role-based (redirect jika role tidak sesuai)
    - Verification status (tampilkan warning jika belum verified)
  - **AC:** Routes terproteksi sesuai role & status

---

# PHASE 2: Admin — User Verification & Core Admin

> Workflow 1 (lanjutan) + Admin features. Dibutuhkan agar user bisa menjadi VERIFIED.

## 2.1 — Backend: Verification Module

- [x] **2.1.1** Verification Service
  - `getVerificationStatus(userId)` — return status verifikasi current user
  - `submitVerificationRequest(userId, data)` — submit request (status=PENDING)
  - `getPendingVerifications(filters, pagination)` — admin: list pending requests
  - `approveVerification(adminId, verificationId)` — update user.status = VERIFIED, buat audit log
  - `rejectVerification(adminId, verificationId, reason)` — update user.status = REJECTED, buat audit log
  - **Ref:** WF — Workflow 1; RBAC — Verification Rules; API — Verification & Admin Endpoints
  - **AC:** Verification workflow end-to-end berfungsi

- [x] **2.1.2** Verification Controller & Routes
  - `GET /api/v1/verification-status` — Authenticated
  - `POST /api/v1/verification-request` — Authenticated
  - `GET /api/v1/admin/verifications` — ADMIN only (with pagination, filter by status)
  - `POST /api/v1/admin/verifications/:id/approve` — ADMIN only
  - `POST /api/v1/admin/verifications/:id/reject` — ADMIN only
  - **Ref:** API — Verification Endpoints, Admin Endpoints
  - **Dep:** 2.1.1
  - **AC:** Semua endpoint berfungsi dengan proper auth & role checks

## 2.2 — Backend: Audit Log Module

- [x] **2.2.1** Audit Log Service
  - `createAuditLog(userId, action, entityType, entityId, metadata)` — insert ke audit_logs
  - `getAuditLogs(filters, pagination)` — admin: query dengan filter (user, action, entity_type, date range)
  - Actions yang WAJIB di-log: VERIFICATION_APPROVED, VERIFICATION_REJECTED, PROJECT_APPROVED, PROJECT_REJECTED, MEMBER_REMOVED, ARTIFACT_GENERATED, ARTIFACT_REGENERATED, PROJECT_COMPLETED
  - **Ref:** ARCH — Audit Logging; API — Admin Endpoints
  - **AC:** Audit log terbuat untuk setiap critical action

- [x] **2.2.2** Audit Log Controller & Routes
  - `GET /api/v1/admin/audit-logs` — ADMIN only, with filters (user_id, action, entity_type, pagination)
  - **Ref:** API — Admin Endpoints (Get Audit Logs)
  - **Dep:** 2.2.1
  - **AC:** Admin bisa melihat dan filter audit logs

## 2.3 — Backend: Admin Module (Partial)

- [x] **2.3.1** Admin Dashboard Service
  - `getDashboardStats()` — return: total users (by status), total projects (by status), total artifacts, recent activities
  - **Ref:** API — Admin Endpoints (Get Admin Dashboard)
  - **AC:** Dashboard statistics akurat

- [x] **2.3.2** Admin Dashboard Controller & Routes
  - `GET /api/v1/admin/dashboard` — ADMIN only
  - **Dep:** 2.3.1
  - **AC:** Endpoint berfungsi

- [x] **2.3.3** Skill Approval Service & Routes
  - `GET /api/v1/admin/skills/pending` — list pending custom skills (ADMIN)
  - `POST /api/v1/admin/skills/:id/approve` — approve skill (ADMIN)
  - `POST /api/v1/admin/skills/:id/reject` — reject skill (ADMIN)
  - Buat audit log saat approve/reject
  - **Ref:** API — Admin Endpoints; RBAC — Skill Approval
  - **AC:** Skill approval workflow berfungsi

- [x] **2.3.4** Category Management Service & Routes
  - `GET /api/v1/categories` — Public, list categories (with pagination)
  - `GET /api/v1/admin/categories` — ADMIN, list all
  - `POST /api/v1/admin/categories` — ADMIN, create (name, slug)
  - `PUT /api/v1/admin/categories/:id` — ADMIN, update
  - `DELETE /api/v1/admin/categories/:id` — ADMIN, delete
  - **Ref:** API — Project Categories Endpoints, Admin Endpoints
  - **AC:** Category CRUD berfungsi

## 2.4 — Frontend: Admin Pages (Core)

- [x] **2.4.1** Admin Dashboard Page
  - URL: `/admin/dashboard`
  - Statistics cards: users (verified/pending/rejected/suspended), projects (by status), artifacts, recent activities
  - Verification queue preview
  - Project review queue preview
  - **Ref:** UI — Admin Dashboard
  - **Dep:** 2.3.2
  - **AC:** Dashboard menampilkan data real dari API

- [x] **2.4.2** User Verification Page
  - URL: `/admin/users/verification`
  - Tabs: Pending | Approved | Rejected
  - List: user name, role, submission date, status, actions
  - Detail view: user profile info, verification documents, notes field
  - Action buttons: Approve, Reject (with reason)
  - **Ref:** UI — User Verification Admin
  - **Dep:** 2.1.2
  - **AC:** Admin bisa verify/reject users, status terupdate, audit log terbuat

- [x] **2.4.3** Audit Logs Page
  - URL: `/admin/audit-logs`
  - Table: timestamp, user, action, entity type, entity ID, metadata
  - Filters: by user, action, entity type, date range
  - Pagination
  - **Ref:** UI — Audit Logs Admin
  - **Dep:** 2.2.2
  - **AC:** Logs ditampilkan dengan filter yang berfungsi

---

# PHASE 3: Project Creation & Admin Approval

> Workflow 2 dari WF. UMKM membuat project, admin review.

## 3.1 — Backend: Project Module

- [x] **3.1.1** Project Repository
  - CRUD: `findById`, `findMany` (with filters, pagination, search), `create`, `update`, `softDelete`
  - Include relations: umkm (user), senior (user), category, milestones, project_roles
  - Filter: status, category, search query
  - **Ref:** DB — Projects Domain; ARCH — Repository Responsibilities
  - **AC:** Repository berfungsi untuk semua operasi project

- [x] **3.1.2** Project Service
  - `getProjects(filters, pagination)` — list projects (Public, filter by status/category/search)
  - `getProjectDetail(projectId)` — detail project with relations
  - `createProject(umkmId, data)` — create (status=DRAFT), enforce UMKM max 5 active projects
  - `updateProject(umkmId, projectId, data)` — update (ownership check, only DRAFT status)
  - `deleteProject(umkmId, projectId)` — soft delete (ownership check, only DRAFT status)
  - `submitForReview(umkmId, projectId)` — change status DRAFT → PENDING_REVIEW
  - `getMyProjects(umkmId, filters, pagination)` — UMKM's own projects
  - **Ref:** API — Projects Endpoints; WF — Workflow 2; RBAC — UMKM Permissions, Project Status Rules
  - **AC:** Project CRUD berfungsi dengan business rules enforced

- [x] **3.1.3** Project Controller & Routes
  - `GET /api/v1/projects` — Public
  - `GET /api/v1/projects/:id` — Public
  - `POST /api/v1/projects` — UMKM, VERIFIED
  - `PUT /api/v1/projects/:id` — UMKM, Owner
  - `DELETE /api/v1/projects/:id` — UMKM, Owner
  - `GET /api/v1/my-projects` — UMKM
  - Zod validation schemas
  - **Ref:** API — Projects Endpoints
  - **Dep:** 3.1.2
  - **AC:** Semua endpoint berfungsi dengan auth, role, ownership checks

- [x] **3.1.4** Milestone Service & Routes
  - `GET /api/v1/projects/:id/milestones` — Authenticated
  - `POST /api/v1/projects/:id/milestones` — UMKM (saat create) atau SENIOR (saat active)
  - `PUT /api/v1/milestones/:id` — SENIOR (project lead)
  - `DELETE /api/v1/milestones/:id` — SENIOR (project lead)
  - **Ref:** API — Project Milestones Endpoints; WF — Workflow 10 (Milestone Revision)
  - **Dep:** 3.1.1
  - **AC:** Milestone CRUD berfungsi dengan proper authorization

- [x] **3.1.5** Project Roles Service & Routes
  - `GET /api/v1/projects/:id/roles` — Authenticated
  - `POST /api/v1/projects/:id/roles` — UMKM (Owner), body: role_name, capacity, requirements, skills[]
  - `PUT /api/v1/roles/:id` — UMKM (Owner)
  - `DELETE /api/v1/roles/:id` — UMKM (Owner)
  - Link skills ke role via `role_skills` table
  - **Ref:** API — Project Roles Endpoints; DB — Project Roles Domain
  - **Dep:** 3.1.1
  - **AC:** Role CRUD berfungsi, skills terhubung ke roles

## 3.2 — Backend: Admin Project Approval

- [x] **3.2.1** Admin Project Review Service & Routes
  - `GET /api/v1/admin/projects/pending` — ADMIN, list pending projects (pagination)
  - `POST /api/v1/admin/projects/:id/approve` — ADMIN, status PENDING_REVIEW → RECRUITING, buat audit log
  - `POST /api/v1/admin/projects/:id/reject` — ADMIN, status → REJECTED, buat audit log, UMKM notified
  - **Ref:** API — Admin Endpoints; WF — Workflow 2 (Admin Project Review); RBAC — Admin Permissions
  - **AC:** Project approval workflow berfungsi end-to-end

## 3.3 — Frontend: Project Pages (UMKM)

- [x] **3.3.1** Create Project Page (Multi-step)
  - URL: `/projects/create`
  - Step 1: Basic info (title, description, category, expected deliverables, start_date, deadline)
  - Step 2: Milestones (create/edit/delete milestones)
  - Step 3: Roles (define role slots with name, capacity, requirements, required skills)
  - Step 4: Review & Submit
  - **Ref:** UI — Create Project UMKM; WF — Workflow 2
  - **Dep:** 3.1.3, 3.1.4, 3.1.5
  - **AC:** UMKM bisa create project melalui multi-step form

- [x] **3.3.2** My Projects Page (UMKM)
  - URL: `/my-projects` (UMKM view)
  - Tabs: Draft | Pending Review | Published | Recruiting | Active | Overdue | Completed | Cancelled
  - Project cards: name, status, team size, deadline, actions (manage, edit, delete)
  - **Ref:** UI — My Projects UMKM
  - **Dep:** 3.1.3
  - **AC:** UMKM bisa lihat semua project dengan filter status

- [x] **3.3.3** Admin Project Review Page
  - URL: `/admin/projects/review`
  - Tabs: Pending | Approved | Rejected
  - Project list: name, UMKM, submission date, status
  - Detail view: full project info, milestones, roles
  - Actions: Approve, Reject (with reason)
  - **Ref:** UI — Project Review Admin
  - **Dep:** 3.2.1
  - **AC:** Admin bisa approve/reject projects

## 3.4 — Frontend: Browse Projects (Beginner & Senior)

- [x] **3.4.1** Browse Projects Page
  - URL: `/projects`
  - Filters: search input, category dropdown, status filter, role filter, sorting
  - Project cards grid (3 columns desktop, 1 mobile): category badge, status badge, title, UMKM name, roles needed, skill tags, deadline, "Lihat Detail →"
  - Pagination
  - **Ref:** UI — Browse Projects Beginner
  - **Dep:** 3.1.3
  - **AC:** Projects ditampilkan dengan filter & pagination

- [x] **3.4.2** Project Detail Page
  - URL: `/projects/:id`
  - Sections: overview, UMKM info, senior info (if assigned), available roles, requirements, milestones, deadline
  - Conditional action buttons berdasarkan role:
    - BEGINNER: "Apply ke Role" (jika eligible)
    - SENIOR: "Apply sebagai Mentor" (jika eligible)
    - UMKM: "Manage" (if owner)
  - **Ref:** UI — Project Detail; PRD — Core Features
  - **Dep:** 3.1.3
  - **AC:** Detail page menampilkan semua info project dengan role-appropriate actions

---

# PHASE 4: Recruitment — Senior & Beginner

> Workflow 3, 4, 5 dari WF. Senior apply sebagai mentor, beginner apply ke role.

## 4.1 — Backend: Senior Application Module

- [x] **4.1.1** Senior Application Service
  - `applyAsMentor(seniorId, projectId, message)` — buat application (status=PENDING)
    - Validasi: user verified, role=SENIOR, project status=RECRUITING, senior belum apply di project ini, senior < 5 active projects
  - `withdrawSeniorApplication(seniorId, applicationId)` — status → WITHDRAWN
  - `getSeniorApplications(umkmId, projectId)` — UMKM: list applications untuk project-nya
  - `acceptSeniorApplication(umkmId, applicationId)` — UMKM: status → ACCEPTED, set project.senior_id, reject other pending applications
  - `rejectSeniorApplication(umkmId, applicationId)` — UMKM: status → REJECTED
  - **Ref:** WF — Workflow 3; RBAC — Senior Application Flow, Recruitment Rules; API — Senior Applications
  - **AC:** Full senior recruitment flow berfungsi dengan semua business rules

- [x] **4.1.2** Senior Application Controller & Routes
  - `POST /api/v1/projects/:id/senior-apply` — SENIOR
  - `DELETE /api/v1/senior-applications/:id` — SENIOR (applicant)
  - `GET /api/v1/projects/:id/senior-applications` — UMKM (owner)
  - `POST /api/v1/senior-applications/:id/accept` — UMKM (owner)
  - `POST /api/v1/senior-applications/:id/reject` — UMKM (owner)
  - **Dep:** 4.1.1
  - **AC:** Routes berfungsi dengan proper auth

## 4.2 — Backend: Beginner Application Module

- [x] **4.2.1** Beginner Application Service
  - `applyToRole(beginnerId, projectId, roleId, motivation)` — buat application (status=PENDING)
    - Validasi: user verified, role=BEGINNER, project status=RECRUITING, project punya senior, beginner belum punya active project, beginner belum apply ke project ini
  - `withdrawApplication(beginnerId, applicationId)` — status → WITHDRAWN
  - `getProjectApplications(seniorId, projectId)` — SENIOR: list beginner applications
  - `acceptApplication(seniorId, applicationId)` — SENIOR: status → ACCEPTED
    - Buat project_member record (status=ACTIVE)
    - Auto-withdraw semua application lain dari beginner ini (BR-005)
    - Kirim notification
  - `rejectApplication(seniorId, applicationId)` — SENIOR: status → REJECTED
  - **Ref:** WF — Workflow 4; RBAC — Beginner Application Flow; PRD — BR-001 to BR-005
  - **AC:** Full beginner recruitment berfungsi, auto-withdrawal works, business rules enforced

- [x] **4.2.2** Beginner Application Controller & Routes
  - `POST /api/v1/projects/:id/apply` — BEGINNER
  - `DELETE /api/v1/applications/:id` — BEGINNER (applicant)
  - `GET /api/v1/projects/:id/applications` — SENIOR (project lead)
  - `POST /api/v1/applications/:id/accept` — SENIOR (project lead)
  - `POST /api/v1/applications/:id/reject` — SENIOR (project lead)
  - **Dep:** 4.2.1
  - **AC:** Routes berfungsi dengan auth & ownership validation

## 4.3 — Backend: Project Members & Lifecycle

- [ ] **4.3.1** Project Members Service & Routes
  - `GET /api/v1/projects/:id/members` — Authenticated, list members
  - `POST /api/v1/members/:id/remove` — SENIOR, request removal (creates removal request, notif admin)
  - `POST /api/v1/members/:id/withdraw` — Member, self-withdraw (status=WITHDRAWN, free up active project slot)
  - `POST /api/v1/admin/members/:id/remove` — ADMIN, confirm removal
  - **Ref:** API — Project Members; WF — Workflow 16, 17; RBAC — Member Removal
  - **AC:** Member management berfungsi dengan admin approval for removals

- [ ] **4.3.2** Project Lifecycle Service
  - `startProject(seniorId, projectId)` — SENIOR: status RECRUITING → ACTIVE
    - Validasi: senior assigned, required roles filled (or senior approval)
  - `requestCompletion(seniorId, projectId)` — SENIOR: request completion (check all deliverables approved, contributions approved, reviews ready)
  - `confirmCompletion(umkmId, projectId)` — UMKM: finalize, status → COMPLETED, read-only mode
  - **Ref:** WF — Workflow 5, 11, 15; API — Project Lifecycle Endpoints
  - **AC:** Full lifecycle flow works: RECRUITING → ACTIVE → COMPLETED

- [ ] **4.3.3** Project Lifecycle Controller & Routes
  - `POST /api/v1/projects/:id/start` — SENIOR
  - `POST /api/v1/projects/:id/complete` — SENIOR
  - `POST /api/v1/projects/:id/confirm-completion` — UMKM
  - **Dep:** 4.3.2
  - **AC:** Lifecycle transitions work with validations

## 4.4 — Frontend: Recruitment Pages

- [x] **4.4.1** Senior — Browse & Apply as Mentor
  - Projects page filtered for RECRUITING without senior
  - "Apply as Mentor" button with message textarea
  - My Mentor Applications page (tabs: Pending | Accepted | Rejected)
  - **Ref:** UI — Browse Mentoring Projects Senior, Mentor Applications Senior
  - **Dep:** 4.1.2
  - **AC:** Senior bisa browse, apply, dan lihat status applications

- [x] **4.4.2** UMKM — Review Senior Applications
  - Senior applicants tab di project management
  - List: applicant name, credentials, message
  - Accept/Reject buttons
  - **Ref:** UI — Senior Applicants UMKM
  - **Dep:** 4.1.2
  - **AC:** UMKM bisa review dan decide senior applications

- [x] **4.4.3** Beginner — Apply to Project Role
  - Apply form: pilih role slot, motivation letter textarea
  - Validasi: cek active project status (disable jika sudah punya active)
  - My Applications page: tabs (Pending | Accepted | Rejected | Withdrawn | Completed)
  - **Ref:** UI — Apply Project, My Applications Beginner
  - **Dep:** 4.2.2
  - **AC:** Beginner bisa apply, lihat status, withdraw

- [x] **4.4.4** Senior — Review Beginner Applications
  - Applicant Management page: list applicants per role
  - View applicant profile, skills, motivation
  - Accept/Reject buttons
  - **Ref:** UI — Applicant Management Senior
  - **Dep:** 4.2.2
  - **AC:** Senior bisa review dan decide beginner applications

---

# PHASE 5: Project Workspace — Active Project

> Workflow 6, 7 dari WF. Workspace untuk tim aktif.

## 5.1 — Backend: Discussion Module

- [ ] **5.1.1** Discussion Service
  - `getProjectDiscussions(projectId)` — list group discussions
  - `createGroupDiscussion(projectId, title, members)` — buat group discussion
  - `getDiscussionMessages(discussionId, pagination)` — paginated messages
  - `sendMessage(userId, discussionId, message)` — send message (verify membership)
  - **Ref:** WF — Workflow 7; API — Discussions Endpoints; RBAC — Discussion Rules
  - **AC:** Group discussion berfungsi dengan membership validation

- [ ] **5.1.2** Direct Message Service
  - `createOrGetDirectChat(userId, targetUserId)` — create/find DM conversation
  - `getDirectChatMessages(chatId, pagination)` — paginated messages
  - `sendDirectMessage(userId, chatId, message)` — send DM
  - **Ref:** API — Direct Messages Endpoints; RBAC — Discussion Rules (DM)
  - **AC:** DM berfungsi antara project members & senior

- [ ] **5.1.3** Discussion & DM Controller & Routes
  - Group: `GET /projects/:id/discussions`, `POST /projects/:id/discussions`, `GET /discussions/:id/messages`, `POST /discussions/:id/messages`
  - DM: `POST /users/:id/direct-chat`, `GET /direct-chat/:id/messages`, `POST /direct-chat/:id/messages`
  - **Dep:** 5.1.1, 5.1.2
  - **AC:** All endpoints work with auth

- [ ] **5.1.4** Supabase Realtime Integration (Discussions)
  - Setup Supabase Realtime subscription untuk discussion_messages
  - Real-time message delivery
  - **Ref:** PRD — Realtime; CLAUDE — Realtime rules
  - **Dep:** 5.1.3
  - **AC:** Messages muncul real-time tanpa refresh

## 5.2 — Frontend: Project Workspace

- [ ] **5.2.1** Project Workspace Layout
  - URL: `/projects/:id/workspace`
  - Sidebar: project navigation menu
  - Tabs: Overview | Milestones | Discussion | Deliverables | Members
  - Role-aware: tampilkan extra tabs untuk Senior (Reviews, Artifacts)
  - **Ref:** UI — Project Workspace Beginner, Senior
  - **AC:** Layout responsive dengan navigation antar tabs

- [ ] **5.2.2** Workspace — Overview Tab
  - Project info, description, UMKM, Senior, deadline
  - Team summary
  - Progress indicator
  - **AC:** Overview menampilkan ringkasan project

- [ ] **5.2.3** Workspace — Milestones Tab
  - List milestones: title, due_date, status (PENDING, IN_PROGRESS, COMPLETED)
  - Progress bar
  - Senior: bisa update milestone status, propose revision
  - **Ref:** WF — Workflow 10 (Milestone Revision)
  - **AC:** Milestones ditampilkan dan manageable oleh senior

- [ ] **5.2.4** Workspace — Discussion Tab
  - Group chat interface
  - Message list (real-time updates via Supabase)
  - Message input
  - Start new discussion
  - **Ref:** WF — Workflow 7
  - **Dep:** 5.1.3, 5.1.4
  - **AC:** Real-time chat berfungsi

- [ ] **5.2.5** Workspace — Members Tab
  - Team members list: name, role, join date, status
  - Senior: member management actions (request removal)
  - Beginner: withdraw button
  - **Dep:** 4.3.1
  - **AC:** Members displayed, management actions work

- [ ] **5.2.6** Direct Message Page
  - URL: `/messages` or within workspace
  - Conversation list
  - Chat interface
  - Real-time messaging
  - **Dep:** 5.1.2, 5.1.4
  - **AC:** DM berfungsi real-time

---

# PHASE 6: Deliverables & Contributions

> Workflow 8, 9 dari WF. Beginner submit deliverables, senior review.

## 6.1 — Backend: Deliverable Module

- [ ] **6.1.1** Deliverable Service
  - `getProjectDeliverables(projectId)` — list deliverables
  - `createDeliverable(beginnerId, projectId, title, description)` — status=DRAFT
    - Validasi: user is project member, project status=ACTIVE
  - `updateDeliverable(beginnerId, deliverableId, data)` — ownership check
  - `submitDeliverable(beginnerId, deliverableId, evidences)` — status DRAFT → SUBMITTED, attach evidences
  - `approveDeliverable(seniorId, deliverableId)` — status → APPROVED (senior project lead check)
  - `requestRevision(seniorId, deliverableId, feedback)` — status → REVISION_REQUESTED
  - **Ref:** WF — Workflow 8; API — Deliverables Endpoints; RBAC — Deliverable Rules
  - **AC:** Full deliverable lifecycle: DRAFT → SUBMITTED → APPROVED (or REVISION_REQUESTED → loop)

- [ ] **6.1.2** Deliverable Controller & Routes
  - `GET /api/v1/projects/:id/deliverables` — Authenticated
  - `POST /api/v1/projects/:id/deliverables` — BEGINNER (member)
  - `PUT /api/v1/deliverables/:id` — BEGINNER (creator)
  - `POST /api/v1/deliverables/:id/submit` — BEGINNER (creator)
  - `POST /api/v1/deliverables/:id/approve` — SENIOR (project lead)
  - `POST /api/v1/deliverables/:id/request-revision` — SENIOR (project lead)
  - **Dep:** 6.1.1
  - **AC:** All endpoints work with proper auth & ownership

## 6.2 — Backend: Contribution Module

- [ ] **6.2.1** Contribution Service
  - `submitContribution(beginnerId, projectId, summary, skills[])` — status=PENDING
    - Validasi: one per beginner per project, project member, project ACTIVE
  - `updateContribution(beginnerId, contributionId, data)` — ownership check
  - `approveContribution(seniorId, contributionId)` — status → APPROVED (project lead check)
  - **Ref:** WF — Workflow 9; API — Contributions Endpoints; RBAC — Contribution Rules
  - **AC:** Contribution submission and approval works

- [ ] **6.2.2** Contribution Controller & Routes
  - `POST /api/v1/projects/:id/contributions` — BEGINNER
  - `PUT /api/v1/contributions/:id` — BEGINNER (creator)
  - `POST /api/v1/contributions/:id/approve` — SENIOR (project lead)
  - **Dep:** 6.2.1
  - **AC:** Endpoints work

## 6.3 — Frontend: Deliverables & Contributions

- [ ] **6.3.1** Workspace — Deliverables Tab (Beginner View)
  - List deliverables: title, status, submission date
  - Create deliverable form: title, description
  - Submit for review: attach evidences (links: GitHub, Figma, Live URL; files via Supabase Storage)
  - View feedback from senior (revision requests)
  - Resubmit after revision
  - **Ref:** UI — Project Workspace Deliverables; WF — Workflow 8
  - **Dep:** 6.1.2
  - **AC:** Beginner bisa create, submit, view feedback, resubmit deliverables

- [ ] **6.3.2** Deliverable Review Page (Senior View)
  - URL: `/projects/:id/deliverables/:deliverableId/review`
  - Deliverable details, evidence links/files
  - Review form: comments textarea
  - Actions: Approve, Request Revision
  - **Ref:** UI — Deliverable Review Senior
  - **Dep:** 6.1.2
  - **AC:** Senior bisa review dan approve/request revision

- [ ] **6.3.3** Contribution Report Page (Beginner)
  - Form: contribution summary textarea, technologies used (skill tags), evidence links
  - One submission per beginner per project
  - **Ref:** WF — Workflow 9
  - **Dep:** 6.2.2
  - **AC:** Beginner bisa submit contribution report

- [ ] **6.3.4** Contribution Review Page (Senior)
  - View contribution summary, technologies, evidence
  - Approve button
  - **Ref:** UI — Contribution Review Senior
  - **Dep:** 6.2.2
  - **AC:** Senior bisa approve contributions

---

# PHASE 7: Reviews & Ratings

> Workflow 12 dari WF. Mandatory sebelum project completion.

## 7.1 — Backend: Review Module

- [ ] **7.1.1** Review Service
  - `reviewBeginner(reviewerId, projectId, revieweeId, rating, comment)` — create review
    - Type auto-determined: SENIOR_TO_BEGINNER or UMKM_TO_BEGINNER based on reviewer role
    - Validasi: reviewer is project senior or umkm, reviewee is project member, project ACTIVE, rating 1-5
  - `reviewSenior(umkmId, projectId, rating, comment)` — UMKM reviews senior
    - Type: UMKM_TO_SENIOR, validasi: reviewer is project UMKM, reviewee is project senior
  - `editReview(reviewerId, reviewId, rating, comment)` — only before project completion
  - `getProjectReviews(projectId)` — list reviews for project
  - `getUserReviews(userId)` — list reviews for user (visible to authenticated)
  - **Ref:** WF — Workflow 12; API — Reviews Endpoints; RBAC — Review Rules
  - **AC:** All review types work, editable before completion, rating 1-5 enforced

- [ ] **7.1.2** Review Controller & Routes
  - `POST /api/v1/projects/:id/reviews/beginner` — SENIOR or UMKM
  - `POST /api/v1/projects/:id/reviews/senior` — UMKM
  - `PUT /api/v1/reviews/:id` — Reviewer (before project closure)
  - **Dep:** 7.1.1
  - **AC:** Endpoints work with validation

## 7.2 — Frontend: Review Pages

- [ ] **7.2.1** Review Center Page (Senior & UMKM)
  - List team members to review
  - Review form: star rating (1-5), comment textarea
  - Submit review
  - View submitted reviews, edit option
  - **Ref:** UI — Review Center UMKM
  - **Dep:** 7.1.2
  - **AC:** Senior & UMKM bisa submit dan edit reviews

- [ ] **7.2.2** My Reviews Page (Beginner)
  - View reviews received: from Senior, from UMKM
  - Display: rating stars, reviewer name, comment, project name
  - **Ref:** UI — My Reviews Beginner
  - **Dep:** 7.1.2
  - **AC:** Beginner bisa lihat semua reviews yang diterima

---

# PHASE 8: Artifact System

> Workflow 13, 14, 18 dari WF. Inti value proposition EduNomad.

## 8.1 — Backend: Artifact Module

- [ ] **8.1.1** Artifact Service
  - `generateArtifact(seniorId, projectId, beginnerIds[], verificationUrl)` — generate artifact per beginner
    - Buat artifact record: kode format EDN-{YEAR}-{SEQUENTIAL}, version=1
    - Buat artifact_version record (version 1, PDF path)
    - Generate PDF artifact document (beginner name, UMKM, senior, project, contribution, technologies, feedback, digital signature, verification ID)
    - Upload PDF ke Supabase Storage
    - Buat audit log
    - Validasi: senior is project lead, contributions approved, reviews exist
  - `regenerateArtifact(seniorId, artifactId, verificationUrl)` — create new version
    - Keep previous version, increment version number
    - Generate new PDF
    - Buat audit log
  - `getArtifactDetail(artifactId)` — return with all versions
  - `downloadArtifactPDF(artifactId)` — stream PDF
  - `verifyArtifact(artifactCode)` — PUBLIC, verify by code (EDN-2026-XXXXX)
  - **Ref:** WF — Workflow 13, 14, 18; API — Artifacts Endpoints; RBAC — Artifact Rules; ARCH — Artifacts
  - **AC:** Full artifact lifecycle: generate → (regenerate) → download → verify (public)

- [ ] **8.1.2** Artifact PDF Generator
  - Generate professional PDF containing:
    - Beginner name, UMKM name, Senior name, Project name
    - Contribution summary, technologies used
    - Senior feedback
    - Digital signature
    - Verification code (EDN-2026-XXXXX)
    - QR code for verification URL
  - **Ref:** WF — Workflow 13 (Artifact Contents)
  - **Dep:** 8.1.1
  - **AC:** PDF generates correctly with all required information

- [ ] **8.1.3** Artifact Controller & Routes
  - `POST /api/v1/projects/:id/generate-artifacts` — SENIOR
  - `POST /api/v1/artifacts/:id/regenerate` — SENIOR
  - `GET /api/v1/artifacts/:id` — Authenticated
  - `GET /api/v1/artifacts/:id/download` — Authenticated
  - `GET /api/v1/verify/:artifactCode` — PUBLIC
  - **Dep:** 8.1.1
  - **AC:** All endpoints work

## 8.2 — Frontend: Artifact Pages

- [ ] **8.2.1** Artifact Generation Page (Senior)
  - URL: `/projects/:id/artifacts/generate`
  - Select beginner(s) to generate artifact for
  - Artifact preview: data yang akan di-include
  - Generate button
  - Success: display artifact code
  - **Ref:** UI — Artifact Generation Senior
  - **Dep:** 8.1.3
  - **AC:** Senior bisa generate artifacts untuk beginners

- [ ] **8.2.2** My Artifacts Page (Beginner)
  - URL: `/artifacts`
  - Artifact cards: code, project name, issue date, verification status
  - Actions: View detail, Download PDF
  - **Ref:** UI — My Artifacts Beginner
  - **Dep:** 8.1.3
  - **AC:** Beginner bisa lihat dan download artifacts

- [ ] **8.2.3** Artifact Verification Page (Public)
  - URL: `/verify` or `/verify/:artifactCode`
  - Input: artifact code (EDN-2026-XXXXX)
  - Result — VALID: show beginner name, project, UMKM, senior, issued date, contribution summary, technologies, status
  - Result — INVALID: "Artifact not found" message
  - **Ref:** WF — Workflow 18; UI — Artifact Verification
  - **Dep:** 8.1.3
  - **AC:** Public verification berfungsi tanpa login

- [ ] **8.2.4** Admin Artifact Monitoring Page
  - URL: `/admin/artifacts`
  - List: artifact code, project, beginner, senior, issue date, status
  - Actions: View, Download, View regeneration history
  - **Ref:** UI — Artifact Monitoring Admin
  - **Dep:** 8.1.3
  - **AC:** Admin bisa monitor semua artifacts

---

# PHASE 9: Notifications & Real-time

> Notification system & Supabase Realtime integration.

## 9.1 — Backend: Notification Module

- [ ] **9.1.1** Notification Service
  - `createNotification(userId, type, title, message, actionUrl)` — create notification
  - `getNotifications(userId, filters, pagination)` — list with filter (is_read)
  - `markAsRead(userId, notificationId)` — mark single as read
  - `markAllAsRead(userId)` — mark all as read
  - Notification types & triggers:
    - APPLICATION_ACCEPTED — beginner/senior diterima
    - APPLICATION_REJECTED — beginner/senior ditolak
    - DELIVERABLE_SUBMITTED — senior: deliverable masuk
    - DELIVERABLE_APPROVED — beginner: deliverable diapprove
    - DELIVERABLE_REVISION — beginner: revision requested
    - CONTRIBUTION_APPROVED — beginner: contribution approved
    - REVIEW_RECEIVED — user: review baru
    - ARTIFACT_GENERATED — beginner: artifact tersedia
    - VERIFICATION_APPROVED — user: verified
    - VERIFICATION_REJECTED — user: rejected
    - PROJECT_APPROVED — umkm: project approved
    - PROJECT_REJECTED — umkm: project rejected
    - COMPLETION_REQUESTED — umkm: senior requests completion
    - MEMBER_REMOVED — beginner: removed from project
  - **Ref:** API — Notifications Endpoints; ARCH — Notification System
  - **AC:** Notifications terbuat di setiap trigger event

- [ ] **9.1.2** Notification Controller & Routes
  - `GET /api/v1/notifications` — Authenticated
  - `POST /api/v1/notifications/:id/read` — Authenticated
  - `POST /api/v1/notifications/read-all` — Authenticated
  - **Dep:** 9.1.1
  - **AC:** Endpoints work

- [ ] **9.1.3** Integrate Notification Triggers
  - Hook notification creation into existing services:
    - Verification service → VERIFICATION_APPROVED/REJECTED
    - Application service → APPLICATION_ACCEPTED/REJECTED
    - Deliverable service → DELIVERABLE_SUBMITTED/APPROVED/REVISION
    - Contribution service → CONTRIBUTION_APPROVED
    - Artifact service → ARTIFACT_GENERATED
    - Project service → PROJECT_APPROVED/REJECTED
    - Lifecycle service → COMPLETION_REQUESTED
  - **Dep:** 9.1.1, all previous phase services
  - **AC:** Notifications auto-created at all specified trigger points

## 9.2 — Frontend: Notifications

- [ ] **9.2.1** Notification Bell & Dropdown
  - Bell icon di header dengan unread count badge
  - Dropdown: recent notifications list
  - Mark as read on click
  - "View all" link
  - **Dep:** 9.1.2
  - **AC:** Real-time notification count updates, dropdown works

- [ ] **9.2.2** Notifications Page
  - URL: `/notifications`
  - Full notification list with pagination
  - Filter: read/unread
  - Mark all as read button
  - Click notification → navigate to action_url
  - **Dep:** 9.1.2
  - **AC:** Full notification management page

- [ ] **9.2.3** Supabase Realtime — Notifications
  - Subscribe ke notifications table untuk current user
  - Real-time badge count update
  - Toast notification saat notification baru masuk
  - **Dep:** 9.2.1
  - **AC:** Notifications appear real-time

---

# PHASE 10: Dashboards, Profiles & Polish

> Dashboard per role, profile pages, finishing touches.

## 10.1 — Frontend: Role-specific Dashboards

- [ ] **10.1.1** Beginner Dashboard
  - URL: `/dashboard` (beginner view)
  - Status card (PENDING_VERIFICATION warning or VERIFIED)
  - Stats: active projects (0/1), applications, artifacts, rating
  - Profile completion progress bar & checklist
  - Tips section
  - Recommended projects (matching skills)
  - Latest projects
  - Artifact portfolio section (info card)
  - Empty state jika belum ada aktivitas
  - **Ref:** UI — Dashboard Beginner (detailed spec)
  - **AC:** Dashboard fully functional, data real dari API

- [ ] **10.1.2** Senior Dashboard
  - URL: `/dashboard` (senior view)
  - Stats: active projects (0/5), pending reviews, artifacts generated
  - Recruitment queue: pending beginner applications
  - Managed projects list
  - Deliverable reviews queue
  - Quick actions
  - **Ref:** UI — Dashboard Senior
  - **AC:** Dashboard functional

- [ ] **10.1.3** UMKM Dashboard
  - URL: `/dashboard` (umkm view)
  - Stats: active projects (0/5), recruiting projects, pending reviews
  - My projects list
  - Senior applications queue
  - **Ref:** UI — Dashboard UMKM
  - **AC:** Dashboard functional

## 10.2 — Frontend: Profile Pages

- [ ] **10.2.1** My Profile Page
  - URL: `/profile`
  - Profile header: photo, name, headline, status badges
  - Sections: About, Skills (with levels), Experiences, Portfolio links, Artifacts (jika beginner), Reviews received
  - Edit button → edit mode
  - **Ref:** UI — Profile Beginner
  - **AC:** Profile page fully rendered with all data

- [ ] **10.2.2** Edit Profile Page
  - URL: `/profile/edit`
  - Edit: name, phone, photo (upload), headline, bio, linkedin_url
  - Add/remove skills, experiences, portfolio links
  - React Hook Form + Zod validation
  - **Dep:** 1.2.3, 1.2.4, 1.2.5, 1.2.6
  - **AC:** Profile editing works end-to-end

- [ ] **10.2.3** View Other User's Profile
  - URL: `/users/:id`
  - View-only: same layout as my profile
  - Requires authentication (RBAC — Portfolio Rules)
  - **AC:** Authenticated users can view other profiles

## 10.3 — Backend & Frontend: Project Monitoring (UMKM & Admin)

- [ ] **10.3.1** UMKM Progress Monitoring
  - Read-only view of project workspace: milestones, deliverables, team, discussions
  - **Ref:** UI — Progress Monitoring UMKM; RBAC — UMKM cannot approve deliverables
  - **AC:** UMKM can monitor but not modify project work

- [ ] **10.3.2** Admin Project Monitoring
  - URL: `/admin/projects/monitoring`
  - All projects list (filterable by status)
  - View project details: team, deliverables, discussions
  - **Ref:** UI — Project Monitoring Admin
  - **AC:** Admin can monitor all projects

- [ ] **10.3.3** Admin Senior Replacement
  - `POST /api/v1/admin/projects/:id/replace-senior` — ADMIN, assign new senior
  - Frontend: admin action to replace senior when withdrawal requested
  - **Ref:** API — Admin Endpoints; WF — Workflow 16 (Senior Withdrawal)
  - **AC:** Admin can replace senior on a project

## 10.4 — Project Completion Flow (E2E)

- [ ] **10.4.1** Senior — Request Completion UI
  - Completion checklist: all deliverables approved ✓, all contributions approved ✓, all reviews submitted ✓, all artifacts generated ✓
  - Request completion button (disabled until checklist complete)
  - **Ref:** WF — Workflow 11, 15
  - **Dep:** 4.3.2
  - **AC:** Senior can request completion when all conditions met

- [ ] **10.4.2** UMKM — Confirm Completion UI
  - Review project goals met
  - Confirm completion button
  - After confirmation: project becomes READ-ONLY
  - **Ref:** WF — Workflow 15
  - **Dep:** 4.3.2
  - **AC:** UMKM can finalize project, project archived

## 10.5 — Supabase Storage Integration

- [ ] **10.5.1** File Upload Components
  - Reusable file upload component (drag & drop, click to upload)
  - File type validation, size limit (5MB)
  - Upload to Supabase Storage
  - Display: file name, size, status, remove button
  - Used for: CV upload, deliverable evidence, profile photo
  - **Ref:** ARCH — File Upload Rules; UI — File Upload component
  - **AC:** File uploads work to Supabase Storage, URLs saved in DB

## 10.6 — Error & Static Pages

- [ ] **10.6.1** Error Pages
  - 404 Not Found page
  - 500 Internal Server Error page
  - Unauthorized (403) page
  - Maintenance page
  - **Ref:** UI — Pages Not Yet Designed
  - **AC:** Error pages display properly

- [ ] **10.6.2** Landing Page (Public)
  - URL: `/`
  - Public homepage explaining EduNomad
  - CTA: Register / Login
  - Features overview
  - How it works section
  - **Ref:** UI — Shared/Public (Landing page)
  - **AC:** Landing page is professional and informative

---

# PHASE 11: Testing & QA

> Verification phase before considering MVP complete.

## 11.1 — End-to-End Flow Testing

- [ ] **11.1.1** Test: Beginner Full Journey
  - Register → Verify → Browse → Apply → Accepted → Workspace → Submit Deliverable → Deliverable Approved → Submit Contribution → Contribution Approved → Receive Review → Artifact Generated → Download Artifact
  - **Ref:** PRD — Acceptance Criteria (Beginner)
  - **AC:** Full flow works without admin database intervention

- [ ] **11.1.2** Test: Senior Full Journey
  - Register → Verify → Browse → Apply Mentor → Accepted → Recruit Beginner → Review Deliverable → Generate Artifact → Complete Reviews
  - **Ref:** PRD — Acceptance Criteria (Senior)
  - **AC:** Full flow works

- [ ] **11.1.3** Test: UMKM Full Journey
  - Register → Create Project → Submit → Admin Approve → Select Senior → Monitor → Confirm Completion → Review Team
  - **Ref:** PRD — Acceptance Criteria (UMKM)
  - **AC:** Full flow works

- [ ] **11.1.4** Test: Admin Full Journey
  - Verify Users → Review Projects → Monitor Activities → Access Artifacts → View Audit Logs
  - **Ref:** PRD — Acceptance Criteria (Admin)
  - **AC:** All admin functions work without direct DB access

## 11.2 — Business Rules Verification

- [ ] **11.2.1** Test: Beginner max 1 active project (BR-001)
- [ ] **11.2.2** Test: Senior max 5 active projects (BR-002)
- [ ] **11.2.3** Test: UMKM max 5 active projects (BR-003)
- [ ] **11.2.4** Test: Senior First Policy — beginner can't apply without senior (BR-004)
- [ ] **11.2.5** Test: Auto-withdrawal of other applications (BR-005)
- [ ] **11.2.6** Test: One Senior Per Project (BR-006)
- [ ] **11.2.7** Test: Verification Required for actions (BR-007)
- [ ] **11.2.8** Test: Artifact Per Beginner (BR-008)
- [ ] **11.2.9** Test: Review Mandatory before completion (BR-009)
- [ ] **11.2.10** Test: Admin Project Approval required (BR-010)

## 11.3 — QA Checklist per Feature

- [ ] **11.3.1** Matches PRD
- [ ] **11.3.2** Matches Workflow Map
- [ ] **11.3.3** Matches RBAC rules
- [ ] **11.3.4** Matches Database Schema
- [ ] **11.3.5** Matches API Specification
- [ ] **11.3.6** Handles errors gracefully
- [ ] **11.3.7** Handles unauthorized access
- [ ] **11.3.8** Handles empty states
- [ ] **11.3.9** Handles loading states
- [ ] **11.3.10** Mobile responsive

---

# Summary

| Phase | Nama | Task Count | Prioritas |
|-------|------|-----------|-----------|
| 0 | Project Initialization & Infrastructure | 22 | 🔴 Critical |
| 1 | Authentication & User Registration | 19 | 🔴 Critical |
| 2 | Admin — User Verification & Core Admin | 11 | 🔴 Critical |
| 3 | Project Creation & Admin Approval | 10 | 🔴 Critical |
| 4 | Recruitment — Senior & Beginner | 11 | 🟠 High |
| 5 | Project Workspace — Active Project | 9 | 🟠 High |
| 6 | Deliverables & Contributions | 8 | 🟠 High |
| 7 | Reviews & Ratings | 4 | 🟡 Medium |
| 8 | Artifact System | 6 | 🟡 Medium |
| 9 | Notifications & Real-time | 6 | 🟡 Medium |
| 10 | Dashboards, Profiles & Polish | 12 | 🟢 Normal |
| 11 | Testing & QA | 18 | 🔴 Critical |
| **Total** | | **~136 tasks** | |

---

## Cara Menggunakan Dokumen Ini

### Untuk AI Coding Assistant:

1. **Baca CLAUDE.MD** terlebih dahulu untuk operating rules
2. **Pilih task** berdasarkan Phase order (0 → 1 → 2 → ... → 11)
3. **Cek dependensi (Dep)** sebelum mulai task
4. **Baca referensi (Ref)** yang disebutkan di setiap task
5. **Implementasi** sesuai acceptance criteria (AC)
6. **Update task status** setelah selesai (`[x]`)
7. **Update memory files** sesuai CLAUDE.MD (current-status, development-log, next-tasks, decisions)

### Dependency Rules:

- Phase 0 harus selesai sebelum phase lain
- Phase 1 harus selesai sebelum Phase 2–10
- Phase 2 bisa paralel dengan Phase 3 (sebagian)
- Phase 4 membutuhkan Phase 3
- Phase 5 membutuhkan Phase 4
- Phase 6 membutuhkan Phase 5
- Phase 7 membutuhkan Phase 6
- Phase 8 membutuhkan Phase 7
- Phase 9 bisa dimulai setelah Phase 4
- Phase 10 bisa dimulai setelah Phase 6
- Phase 11 setelah semua phase lain

---

*Last Updated: 2026-06-19*
*Status: READY FOR IMPLEMENTATION*
*Total Estimated Tasks: ~136*
