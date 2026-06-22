# EduNomad MVP - Product Requirements Document v2.0

**Status:** LOCKED — Approved  
**Product Owner:** EduNomad Team  
**Date:** Juni 2025

_Dokumen ini bersifat FINAL dan LOCKED. Perubahan fitur memerlukan formal review._

---

## Table of Contents
- [1. Executive Summary](#1-executive-summary)
- [2. Problem Statement](#2-problem-statement)
- [3. Vision & Goals](#3-vision--goals)
- [4. Success Metrics](#4-success-metrics)
- [5. User Roles](#5-user-roles)
- [6. User Journey](#6-user-journey)
- [7. Business Rules](#7-business-rules)
- [8. Core Features](#8-core-features)
- [9. UI/UX Structure](#9-uiux-structure)
- [10. Tech Stack](#10-tech-stack)
- [11. MVP Scope](#11-mvp-scope)
- [12. Out of Scope](#12-out-of-scope)
- [13. Future Roadmap](#13-future-roadmap)

---

## 1. Executive Summary

EduNomad adalah platform kolaborasi proyek nyata yang menghubungkan Beginner, Senior Mentor, dan UMKM dalam satu ekosistem pembelajaran berbasis pengalaman kerja nyata. Platform ini dirancang untuk menjembatani kesenjangan antara pembelajaran teoritis dan kebutuhan industri melalui proyek nyata yang didampingi mentor profesional.

Setiap Beginner akan memperoleh:
- ✅ Pengalaman kerja riil
- ✅ Bimbingan mentor profesional
- ✅ Artifact Portofolio Terverifikasi sebagai bukti kontribusi

### Ekosistem Inti EduNomad

| Pihak | Peran | Nilai yang Diperoleh |
|-------|-------|---------------------|
| **UMKM** | Penyedia proyek nyata | Tim pengerjaan proyek + mentor profesional dengan biaya terjangkau |
| **Senior Mentor** | Pembimbing & quality control | Reputasi mentor, pengalaman membimbing, kontribusi ke ekosistem talenta |
| **Beginner** | Pelaksana proyek | Pengalaman kerja nyata + Artifact Portofolio Terverifikasi |

---

## 2. Problem Statement

### Masalah Beginner

Banyak pemula kesulitan memperoleh pengalaman kerja karena terjebak dalam siklus:

- ❌ Tidak memiliki pengalaman industri → tidak diterima kerja → tetap tidak memiliki pengalaman
- ❌ Tidak memiliki portofolio yang relevan untuk ditunjukkan ke perekrut
- ❌ Sulit menemukan mentor yang bersedia membimbing secara gratis atau terjangkau
- ❌ Tidak ada akses ke proyek nyata yang dapat dijadikan bahan pembelajaran

### Masalah UMKM

UMKM membutuhkan dukungan pengerjaan proyek digital namun terkendala oleh:

- ❌ Anggaran terbatas untuk menyewa tenaga ahli profesional penuh
- ❌ Keterbatasan akses ke talenta digital berkualitas
- ❌ Tidak memiliki waktu dan kapasitas untuk melakukan mentoring internal

### Masalah Senior

Profesional berpengalaman tidak memiliki wadah terstruktur untuk:

- ❌ Berbagi pengalaman dan keahlian secara bermakna
- ❌ Membangun reputasi sebagai mentor profesional
- ❌ Berkontribusi pada pengembangan talenta baru di industri

---

## 3. Vision & Goals

### Vision

Menjadi platform pembelajaran berbasis proyek nyata yang membantu pemula membangun pengalaman profesional melalui kolaborasi dengan mentor dan UMKM.

### Mission

- ✅ Memberikan akses proyek nyata kepada Beginner
- ✅ Menghubungkan Beginner dengan Senior Mentor berkualitas
- ✅ Membantu UMKM mendapatkan dukungan pengerjaan proyek digital
- ✅ Menghasilkan Artifact Portofolio Terverifikasi yang kredibel
- ✅ Meningkatkan kesiapan kerja generasi muda dan masyarakat umum

### Business Goals

- ✅ Membangun marketplace proyek berbasis mentoring yang berkelanjutan
- ✅ Menciptakan ekosistem kolaborasi yang saling menguntungkan ketiga pihak
- ✅ Menjadi sumber portofolio terverifikasi paling terpercaya untuk pemula

### Product Goals

- ✅ Mempermudah UMKM membuat dan mengelola proyek
- ✅ Mempermudah Senior melakukan proses mentoring
- ✅ Mempermudah Beginner memperoleh pengalaman kerja nyata
- ✅ Menyediakan sistem artifact yang terstruktur, transparan, dan dapat diverifikasi

---

## 4. Success Metrics

| Kategori | Metrik | Keterangan |
|----------|--------|-----------|
| **Platform** | Jumlah pengguna terverifikasi | Total user aktif di semua role |
| **Platform** | Jumlah proyek aktif | Proyek berstatus Recruiting / Active |
| **Platform** | Completion Rate proyek | Rasio proyek selesai vs total proyek |
| **Platform** | Jumlah artifact dihasilkan | Total artifact terverifikasi |
| **Beginner** | Project Completion Rate | Proyek selesai / total proyek diikuti |
| **Beginner** | Rating dari Senior & UMKM | Rata-rata penilaian performa |
| **Senior** | Jumlah proyek dibimbing | Akumulasi proyek yang dimentor |
| **Senior** | Rating dari UMKM | Kepuasan UMKM terhadap mentoring |
| **UMKM** | Jumlah proyek selesai | Deliverable yang diterima dan disetujui |
| **UMKM** | Kepuasan hasil proyek | Rating dan review terhadap tim |

---

## 5. User Roles

### Role Overview

| Role | Target Pengguna | Batasan Aktif |
|------|-----------------|---------------|
| **Beginner** | Mahasiswa, Fresh Graduate, Career Switcher, Pelajar SMK, Freelancer Pemula | Maks. 1 proyek aktif |
| **Senior** | Professional, Freelancer Berpengalaman, Industry Practitioner | Maks. 5 proyek Recruiting/Active |
| **UMKM** | Pemilik Usaha Mikro Kecil Menengah | Maks. 5 proyek aktif bersamaan |
| **Admin** | Tim internal EduNomad | Tidak ada batasan proyek |

### Hak Akses per Role

| Fitur | Beginner | Senior | UMKM | Admin |
|-------|----------|--------|------|-------|
| Register & Login | ✅ | ✅ | ✅ | ✅ |
| Browse Projects | ✅ | ✅ | ❌ | ✅ |
| Apply Project Role | ✅ | ❌ | ❌ | ❌ |
| Apply sebagai Mentor | ❌ | ✅ | ❌ | ❌ |
| Create Project | ❌ | ❌ | ✅ | ❌ |
| Select Senior / Beginner | ❌ | Beginner | Senior | ❌ |
| Start Project | ❌ | ✅ | ❌ | ❌ |
| Submit Deliverable | ✅ | ❌ | ❌ | ❌ |
| Review & Approve Deliverable | ❌ | ✅ | ❌ | ❌ |
| Generate Artifact | ❌ | ✅ | ❌ | ❌ |
| Download Artifact | ✅ | ✅ | ❌ | ✅ |
| Review Beginner | ❌ | ✅ | ✅ | ❌ |
| Review Senior | ❌ | ❌ | ✅ | ❌ |
| Suspend User | ❌ | ❌ | ❌ | ✅ |
| View Audit Logs | ❌ | ❌ | ❌ | ✅ |

---

## 6. User Journey

### Journey Beginner

1. Register & melengkapi profil (nama, skill, pengalaman, portofolio)
2. Menunggu verifikasi Admin
3. Setelah Verified → Browse Projects, lihat detail proyek
4. Apply ke role yang diinginkan dengan motivation letter
5. Menunggu review dari Senior Mentor
6. Diterima → bergabung ke Project Workspace
7. Mengikuti diskusi, tracking milestone, upload deliverable
8. Submit contribution summary setelah pekerjaan selesai
9. Senior approve contribution → Artifact Portofolio dihasilkan
10. Menerima review dan rating dari Senior & UMKM

### Journey Senior Mentor

1. Register & upload dokumen (LinkedIn, CV, pengalaman kerja)
2. Menunggu verifikasi Admin (lebih ketat dari Beginner)
3. Setelah Verified → Browse Projects yang butuh mentor
4. Apply sebagai mentor ke proyek yang diminati
5. UMKM mereview dan menerima/menolak aplikasi
6. Diterima → mulai Beginner Recruitment (review & accept applicant)
7. Start project → aktif memimpin workspace
8. Review deliverable Beginner, minta revisi jika perlu, approve jika sudah baik
9. Review & approve contribution Beginner → generate artifact
10. Memberikan review akhir ke Beginner

### Journey UMKM

1. Register & melengkapi informasi usaha
2. Menunggu verifikasi Admin
3. Setelah Verified → Create Project (isi info, milestones, roles, deadline)
4. Submit project → Admin review → Published
5. Review aplikasi Senior Mentor → pilih satu mentor
6. Monitor progres proyek melalui workspace (read-only monitoring)
7. Konfirmasi project completion setelah Senior approve
8. Memberikan review ke Beginner dan Senior

---

## 7. Business Rules

| Kode | Nama Aturan | Deskripsi |
|------|------------|-----------|
| **BR-001** | Beginner Project Limit | Beginner hanya bisa aktif di 1 proyek. Tombol apply dinonaktifkan saat ada proyek aktif. |
| **BR-002** | Senior Project Limit | Senior maksimal menangani 5 proyek (Recruiting + Active) bersamaan. |
| **BR-003** | UMKM Project Limit | UMKM maksimal memiliki 5 proyek Active secara bersamaan. |
| **BR-004** | Senior First Policy | Beginner hanya bisa mendaftar setelah Senior diterima di proyek tersebut. |
| **BR-005** | Application Auto Withdrawal | Saat Beginner diterima di satu proyek, semua aplikasi lain otomatis Withdrawn + notifikasi. |
| **BR-006** | One Senior Per Project | Setiap proyek hanya bisa punya 1 Senior. |
| **BR-007** | Verification Required | Hanya user VERIFIED yang bisa apply ke proyek dan membuat proyek. |
| **BR-008** | Artifact Per Beginner | Setiap Beginner mendapat 1 artifact per project (bukan per tim). |
| **BR-009** | Review Mandatory | Sebelum project selesai, review dari Senior & UMKM wajib ada. |
| **BR-010** | Admin Project Approval | Project baru harus di-review & di-approve admin sebelum Published. |

---

## 8. Core Features

### User Management
- ✅ Registration dengan role selection
- ✅ Profile management per role
- ✅ Skill endorsement
- ✅ Portfolio management
- ✅ Account verification workflow

### Project Management
- ✅ Project creation (UMKM)
- ✅ Project draft management
- ✅ Admin approval workflow
- ✅ Project status tracking
- ✅ Milestone management
- ✅ Role slot creation & management

### Recruitment
- ✅ Senior mentor application
- ✅ Beginner application to roles
- ✅ Application review & decision
- ✅ Beginner acceptance auto-withdrawal
- ✅ Team member assignment

### Project Workspace
- ✅ Discussion board (group & DM)
- ✅ Milestone tracking
- ✅ Deliverable submission
- ✅ Deliverable review with revision requests
- ✅ Contribution reporting
- ✅ Progress monitoring

### Artifact System
- ✅ Artifact generation per beginner
- ✅ Artifact version management
- ✅ Artifact verification (public)
- ✅ Artifact download (PDF)
- ✅ Digital signature

### Review & Rating
- ✅ Senior → Beginner review
- ✅ UMKM → Beginner review
- ✅ UMKM → Senior review
- ✅ Rating system (1-5)
- ✅ Review visibility

### Admin Features
- ✅ User verification management
- ✅ Project approval workflow
- ✅ Skill approval for custom skills
- ✅ Audit logging
- ✅ User suspension
- ✅ Member removal approval

---

## 9. UI/UX Structure

### Beginner Area

| Halaman | Konten / Fitur |
|---------|----------------|
| **Dashboard** | Active Projects, Recruiting Projects, Pending Reviews, Notifications |
| **Browse Projects** | Filters: Category, Role, Skill, Status |
| **Project Detail** | Overview, UMKM Info, Senior Info, Roles, Requirements, Deadline, Milestones |
| **Apply Project** | Selected Role, Motivation Letter, Submit |
| **My Applications** | Tabs: Pending \| Accepted \| Rejected \| Withdrawn \| Completed |
| **My Projects** | Tabs: Active \| Overdue \| Completed |
| **Project Workspace** | Tabs: Overview \| Milestones \| Discussion \| Deliverables \| Members |
| **Contribution Submission** | Summary, Technologies Used, Evidence |
| **My Artifacts** | Artifact List, Download, View Metadata |
| **My Reviews** | Reviews Received, Ratings |

### Senior Area

| Halaman | Konten / Fitur |
|---------|----------------|
| **Dashboard** | Active Projects, Recruiting Projects, Pending Reviews, Notifications |
| **Browse Projects** | Projects requiring mentors |
| **Mentor Applications** | Tabs: Pending \| Accepted \| Rejected |
| **Managed Projects** | List of mentored projects |
| **Project Workspace** | Tabs: Overview \| Members \| Milestones \| Discussion \| Deliverables |
| **Applicant Management** | View, Accept, Reject Applicants |
| **Deliverable Reviews** | Pending Reviews, Revision Requests, Approved |
| **Contribution Reviews** | Review, Edit, Approve Contributions |
| **Artifact Management** | Generate, Regenerate, Download Artifact |

### UMKM Area

| Halaman | Konten / Fitur |
|---------|----------------|
| **Dashboard** | Active Projects, Recruiting Projects, Pending Reviews, Notifications |
| **Create Project** | Project Information, Milestones, Roles, Deliverables, Deadline |
| **My Projects** | Tabs: Draft \| Pending Review \| Published \| Recruiting \| Active \| Overdue \| Completed \| Cancelled |
| **Project Detail** | Tabs: Overview \| Milestones \| Team \| Deliverables \| Discussion |
| **Senior Applicants** | Applicant List, Accept, Reject |
| **Progress Monitoring** | Read-only monitoring workspace |
| **Review Center** | Review Beginner, Review Senior |

### Admin Area

| Halaman | Konten / Fitur |
|---------|----------------|
| **Dashboard** | User Statistics, Project Statistics, Verification Queue, Recent Activities |
| **User Verification** | Tabs: Beginner \| Senior \| UMKM — Actions: Approve \| Reject \| Suspend |
| **Project Review** | Tabs: Pending \| Approved \| Rejected \| Revision — Actions: Approve \| Reject \| Request Revision |
| **User Management** | View Users, Suspend Users, Manage Verification |
| **Project Monitoring** | View Projects, Discussions, Deliverables |
| **Artifact Monitoring** | View & Download Artifacts, View Regeneration Logs |
| **Audit Logs** | Verification Logs, Project Logs, Artifact Logs, User Activity Logs |

---

## 10. Tech Stack

### Technology Stack (LOCKED)

> **Version flexibility exception:** the frameworks/libraries below are locked choices; their exact major version is not. If a specified version fails to run or conflicts with current tooling defaults, Claude may upgrade or downgrade it to whatever version makes the program work — but only after asking the user for approval first. Once approved, every document stating the old version (CLAUDE.MD, task-breakdown.md, this PRD, etc.) must be updated to match. This exception covers library/framework version numbers ONLY — it does not extend to business rules, workflows, RBAC, database schema, API contracts, or scope, which remain fully locked.

#### Frontend

**Framework:**
- Next.js 15
- React 19
- TypeScript

**UI:**
- Tailwind CSS
- shadcn/ui

**State Management:**
- Zustand

**Form Handling:**
- React Hook Form
- Zod

---

#### Backend

**Framework:**
- Express.js
- TypeScript

**Architecture:**
- Modular Monolith

**Pattern:**
```
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
```

---

#### Database

**Provider:**
- Supabase PostgreSQL

**Database Type:**
- Relational Database

**Primary Keys:**
- UUID

---

#### ORM

**Provider:**
- Prisma ORM

**Responsibilities:**
- Schema Management
- Database Access
- Query Builder
- Migration Management

---

#### Authentication

**Provider:**
- Supabase Auth

**Authentication Method:**
- JWT

**Supported Login:**
- Email + Password

**Future Roadmap:**
- Google OAuth

**Out of Scope MVP:**
- Multi-factor Authentication

---

#### Storage

**Provider:**
- Supabase Storage

**Supported Files:**
- PDF
- DOCX
- ZIP
- RAR
- PNG
- JPG

**Storage Usage:**
- Verification Files
- Deliverable Evidence
- Artifact PDFs
- Profile Assets

---

#### Realtime

**Provider:**
- Supabase Realtime

**Used For:**
- Project Discussion
- Direct Messaging
- Notifications

---

#### Deployment

| Component | Platform |
|-----------|----------|
| **Frontend** | Vercel |
| **Backend** | Railway or Render |
| **Database** | Supabase Cloud |
| **Storage** | Supabase Cloud |

---

#### Monitoring

**MVP:**
- Supabase Dashboard
- Railway / Render Logs

**Future:**
- Sentry
- PostHog

---

#### Scalability Strategy

**Architecture:**
- Modular Monolith

**Future Upgrade Path:**
```
Modular Monolith
  ↓
Domain Modules
  ↓
Microservices (if needed)
```

**Note:** No microservices in MVP.

---

#### Queue System

**Status:** Not implemented in MVP

**Reason:** Current workload does not justify queue infrastructure.

**Future Candidates:**
- Artifact Generation
- Email Notifications
- Scheduled Jobs

---

#### Admin Panel

**MVP Approach:**
No dedicated admin panel in MVP. Admin features are implemented inside the main application using role-based access control.

**Future:** Admin dashboard may be introduced if operational complexity increases.

---

### Project Structure

#### Frontend (Next.js)

```
frontend/
src/
├── app/                    # Next.js pages/routes
├── components/             # Reusable UI components
├── features/               # Feature-specific components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── services/               # API clients
├── stores/                 # Zustand stores
├── types/                  # TypeScript types
├── constants/              # Constants
└── utils/                  # Helper utilities
```

#### Backend (Express.js)

```
backend/
src/
├── modules/                # Feature modules
├── middleware/             # Express middleware
├── services/               # Business logic
├── repositories/           # Data access
├── validators/             # Zod schemas
├── routes/                 # Route definitions
├── utils/                  # Utilities
├── types/                  # TypeScript types
├── config/                 # Configuration
└── prisma/                 # Prisma schema
```

---

## 11. MVP Scope

MVP berfokus pada validasi alur inti berikut:

| Alur MVP | Deskripsi |
|----------|-----------|
| ① UMKM membuat proyek | Create, draft, submit, admin review, published |
| ② Senior bergabung sebagai mentor | Apply, UMKM review, diterima |
| ③ Beginner mengerjakan proyek | Browse, apply, diterima, workspace aktif |
| ④ Senior melakukan review | Review deliverable, request revisi, approve |
| ⑤ UMKM menerima hasil | Monitor progress, konfirmasi completion |
| ⑥ Artifact terverifikasi dihasilkan | Contribution submitted, reviewed, artifact generated |

### MVP Completion Checklist

- ✅ User registration dan verification workflow berjalan
- ✅ Project creation dan admin review workflow berjalan
- ✅ Senior recruitment workflow berjalan
- ✅ Beginner recruitment workflow berjalan
- ✅ Project workspace (discussion, milestone, deliverable) berfungsi
- ✅ Deliverable submission dan review workflow berjalan
- ✅ Artifact generation workflow berjalan
- ✅ Review dan rating workflow berjalan
- ✅ Notification system (in-app) berfungsi
- ✅ Admin moderation panel berfungsi
- ✅ Audit logging aktif
- ✅ Permission system (RBAC) berjalan
- ✅ Responsive design (mobile, tablet, desktop)

### Acceptance Criteria

| Skenario | Kriteria Keberhasilan |
|----------|----------------------|
| **Beginner** | Dapat register → verify → browse → apply → diterima → workspace → submit → artifact → reviews tanpa bantuan admin |
| **Senior** | Dapat register → verify → apply mentor → diterima → rekrut beginner → review deliverable → generate artifact → complete reviews tanpa bantuan admin |
| **UMKM** | Dapat register → create project → submit → select senior → monitor → konfirmasi selesai → review team tanpa bantuan admin |
| **Admin** | Dapat verify users → review projects → monitor activities → access artifacts → view audit logs tanpa akses langsung ke database |

---

## 12. Out of Scope (MVP)

Fitur-fitur berikut secara eksplisit dikecualikan dari MVP. Tidak boleh diimplementasikan tanpa approval formal.

| Kategori | Fitur yang Dikecualikan |
|----------|------------------------|
| **AI Features** | AI Matching, AI Recommendation, AI Skill Analysis, AI Mentor/Project Recommendation |
| **Communication** | Voice Call, Video Call, Zoom/Google Meet/WhatsApp Integration |
| **Learning** | Course System, LMS, Quiz, Assignment System, Learning Path |
| **Community** | Forum, Community Feed, Social Timeline, Public Discussion Platform |
| **Gamification** | Leaderboards, Badges, XP System, Achievement System |
| **Financial** | Payment Gateway, Escrow, Invoicing, Subscription Billing |
| **Mobile App** | Android App, iOS App — MVP hanya mendukung Web |
| **Blockchain** | NFT Artifact, Blockchain Verification, Crypto Integration |
| **Public Portfolio** | Public Portfolio Website, Public Artifact Pages — akses artifact tetap terbatas |
| **Multi-Admin** | Admin Roles, Moderator Roles, Hierarchical Permissions — MVP: Single Admin Role |
| **Advanced Analytics** | BI Dashboard, Predictive Analytics, AI Insights |

---

## 13. Future Roadmap

| Phase | Fitur |
|-------|-------|
| **Phase 2 (Post-MVP)** | WhatsApp Integration, Public Portfolio Pages, Advanced Project Analytics |
| **Phase 3** | AI Matching, AI Recommendation Engine, Mentor Intelligence System |
| **Phase 4** | Mobile Application (Android & iOS), Public Artifact Verification Portal, Advanced Reputation System |

---

## Status

**PRD Status:** LOCKED — Semua business rules, workflows, permissions, dan MVP requirements telah disetujui.

**Important:** Penambahan fitur baru memerlukan formal requirement review dan revisi PRD.

---

*Last Updated: Juni 2025*  
*Document Status: FINAL & LOCKED*  
*Product Owner: EduNomad Team*
