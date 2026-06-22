# EduNomad MVP - UI Pages Specification v1.0

**Status:** Based on Figma Design Screenshots + PRD Requirements

---

## Table of Contents
- [Design System](#design-system)
- [Component Inventory](#component-inventory)
- [Authentication Pages](#authentication-pages)
- [Registration Pages (Multi-Step)](#registration-pages-multi-step)
- [Beginner Area](#beginner-area)
- [Senior Area](#senior-area)
- [UMKM Area](#umkm-area)
- [Admin Area](#admin-area)
- [Shared Components & Patterns](#shared-components--patterns)
- [Pages Not Yet Designed](#pages-not-yet-designed)

---

## Design System

### Color Palette

| Color | Usage | Hex/Value |
|-------|-------|-----------|
| **Primary Green** | Primary CTA, Active states, Success | #67C957 (dari design) |
| **Neutral Light** | Background, Cards | #F5F5F5 |
| **Neutral Gray** | Text secondary, Borders | #999999, #CCCCCC |
| **Neutral Dark** | Text primary, Headings | #333333, #000000 |
| **Dark Background** | Info cards (alerts) | #1A1A1A |
| **Success** | Positive messages, Badges | #67C957 |
| **Warning** | Alerts, Status | #FFA500 |
| **Error** | Errors, Rejections | #FF4444 |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| **H1 (Page Title)** | Inter/System | 28-32px | Bold (700) |
| **H2 (Section)** | Inter/System | 20-24px | Bold (700) |
| **H3 (Subsection)** | Inter/System | 16-18px | Semibold (600) |
| **Body Large** | Inter/System | 16px | Regular (400) |
| **Body Normal** | Inter/System | 14px | Regular (400) |
| **Body Small** | Inter/System | 12px | Regular (400) |
| **Label** | Inter/System | 14px | Semibold (600) |
| **Button** | Inter/System | 14px | Semibold (600) |

### Spacing

- **xs:** 4px
- **sm:** 8px
- **md:** 12px
- **lg:** 16px
- **xl:** 24px
- **2xl:** 32px
- **3xl:** 48px

### Border Radius

- **None:** 0px
- **sm:** 4px
- **md:** 8px
- **lg:** 12px
- **full:** 9999px (buttons, badges)

### Shadows

- **sm:** 0 1px 2px rgba(0,0,0,0.05)
- **md:** 0 4px 6px rgba(0,0,0,0.1)
- **lg:** 0 10px 15px rgba(0,0,0,0.1)

---

## Component Inventory

### Form Components

#### Input Text Field
```
- Label (required asterisk if needed)
- Input field with placeholder
- Helper text below
- Error state with error message
- Disabled state
- Focus state (border highlight)
- Icon support (left/right)

Example: Email input with envelope icon
```

#### Password Input
```
- Label
- Input with password dots
- Show/hide toggle button (eye icon)
- Error state
- Helper text
```

#### Textarea
```
- Label
- Resizable textarea
- Character counter (max characters)
- Placeholder
- Helper text
- Error state
```

#### Dropdown/Select
```
- Label
- Trigger button showing selected value
- Dropdown menu with options
- Search/filter if many options
- Selected indicator (checkmark)
- Disabled state
```

#### Checkbox
```
- Checkbox input
- Label text
- Checked/unchecked states
- Disabled state
- Radio button variant
```

#### Tag Input / Pills
```
- Pills showing selected items
- X button to remove
- Input field to add
- Suggestion list
- Multiple selection allowed
```

#### File Upload
```
- Upload area (drag & drop)
- File icon
- File name display
- File size
- Remove button
- Supported formats hint
```

#### Button Styles

**Primary Button (Green)**
```
Background: #67C957
Text: White
Padding: 12px 24px
Border Radius: Full (9999px)
States:
  - Normal: #67C957
  - Hover: #5AB946
  - Active: #4FA835
  - Disabled: #CCCCCC
```

**Secondary Button (White/Border)**
```
Background: White
Border: 1px #CCCCCC
Text: #333333
Padding: 12px 24px
Border Radius: Full
States:
  - Normal: white border
  - Hover: light gray background
  - Active: darker border
```

**Tertiary Button (Text Only)**
```
Background: Transparent
Text: #67C957
No border
States:
  - Normal: #67C957
  - Hover: Underline
  - Active: #5AB946
```

### Layout Components

#### Card
```
- White background
- Rounded corners (md: 8px or lg: 12px)
- Light shadow (sm or md)
- Padding: 16-24px
- Optional border: 1px #EEEEEE
```

#### Modal/Dialog
```
- Centered on screen
- Dark overlay (semi-transparent)
- White card
- Title
- Content area
- Action buttons at bottom
- Close button (X) top-right
```

#### Alert/Notification
```
- Dark background (#1A1A1A or colored)
- Icon (left)
- Title + Message
- Action buttons (optional)
- Close button
- Colored left border for type indication
```

#### Progress Bar
```
- Background track (#EEEEEE)
- Filled portion (#67C957)
- Percentage label
- Status indicator
```

#### Badge/Tag
```
- Small pill-shaped element
- Background color (green for active, gray for inactive)
- Text (12-14px)
- Padding: 4-8px
- Optional X button to remove
```

---

## Authentication Pages

### 🔐 Login Page (DONE ✅)

**URL:** `/auth/login` or `/login`

**Visual Reference:** Image 1 - Premium SaaS Landing Page design

**Layout:**
- Centered card on light background
- Modal/dialog style

**Components:**
- Logo/Brand (top)
- Heading: "Login"
- Email input
  - Placeholder: "nama@email.com"
  - Label: "Email"
- Password input
  - Placeholder: "Masukkan password"
  - Label: "Password"
  - Show/hide toggle
- Checkbox: "Ingat Saya"
- Link: "Lupa Password?" (right)
- Primary Button: "Masuk →"
- Divider: "atau"
- Secondary Button: "Masuk dengan Google"
- Link: "Belum punya akun? Daftar Sekarang"

**Actions:**
- Email + Password login
- Google OAuth (future)
- Forgot password link
- Register link

**Validation:**
- Email format validation
- Password required
- Show error messages inline

**States:**
- Normal
- Loading (button disabled, spinner)
- Error (error messages shown)
- Success (redirect to dashboard)

---

### 📝 Registration - Step 1: Create Account (DONE ✅)

**URL:** `/auth/register` or `/register`

**Visual Reference:** Image 4 - Buat Akun

**Layout:**
- Centered card
- Progress indicator at top (Step 1 of N)

**Components:**
- Heading: "Buat Akun"
- Full Name input
  - Label: "Nama Lengkap"
  - Placeholder: "Masukkan nama lengkap"
- Email input
  - Label: "Alamat Email"
  - Placeholder: "nama@email.com"
- Password input
  - Label: "Kata Sandi"
  - Placeholder: "Minimal 8 karakter"
  - Show/hide toggle
  - Helper text: "Minimal 8 karakter"
- Confirm Password input
  - Label: "Konfirmasi Kata Sandi"
  - Placeholder: "Ulang kata sandi"
  - Show/hide toggle
- Primary Button: "Buat Akun →"
- Divider: "atau"
- Secondary Button: "Lanjutkan dengan Google"
- Link: "Sudah punya akun? Masuk"

**Validation:**
- Full name: required, min 3 characters
- Email: format validation, check if exists
- Password: min 8 characters, strength indicator (future)
- Confirm password: must match password
- Show validation errors inline

**Actions:**
- Create account (API call)
- Google OAuth (future)
- Navigate to login if already have account

---

### 🎯 Registration - Step 2: Role Selection (DONE ✅)

**URL:** `/register/role`

**Visual Reference:** Image 3 - Pilih Peran Anda

**Layout:**
- Centered card
- Progress: Step 2 of N

**Components:**
- Heading: "Pilih Peran Anda"
- Subtitle: "Pilih peran yang sesuai untuk memulai perjalanan Anda di EduNomad."
- Three role cards (selectable):

  **Card 1: Mahasiswa (Beginner)**
  - Icon: 👁️ (eye icon)
  - Title: "Mahasiswa"
  - Description: "Membangun pengalaman dan portofolio melalui proyek nyata."
  - Selectable/clickable

  **Card 2: Mentor (Senior)**
  - Icon: 📋 (clipboard/document icon)
  - Title: "Mentor"
  - Description: "Membimbing mahasiswa dan berbagi pengalaman profesional."
  - Selectable/clickable

  **Card 3: UMKM**
  - Icon: 🏢 (building icon)
  - Title: "UMKM"
  - Description: "Mengerjakan proyek dan mendapatkan solusi dari tim mahasiswa."
  - Selectable/clickable

- Selected state: highlighted border, filled background
- Primary Button: "Lanjutkan →"
- Link: "Sudah punya akun? Masuk"

**Actions:**
- Select one role
- Store selected role in state
- Continue to next step

**Validation:**
- Role must be selected before continuing

---

### ℹ️ Registration - Step 3: Tell Us About You (DONE ✅)

**URL:** `/register/about`

**Visual Reference:** Image 2 - Ceritakan tentang diri Anda

**Layout:**
- Centered card
- Progress: Step 3 of N

**Components:**
- Heading: "Ceritakan tentang diri Anda"
- Subtitle: "Bantu kami mempersonalisasi rekomendasi proyek dan peluang terbaik untuk Anda."

**For BEGINNER role:**
- Status Saat Ini dropdown
  - Options: Mahasiswa, Fresh Graduate, Career Switcher, Pelajar SMK, etc.
  - Helper: "Pilih status yang paling mengambarkan kondisi Anda sekarang."
- Institusi/Universitas input
  - Placeholder: "cth. Universitas Indonesia, Telkom University..."
  - Helper: "Universitas, perusahaan, atau organisasi tempat Anda beraung."
- Bidang Studi/Keahlian input
  - Placeholder: "cth. Informatika, UI/UX Design, Marketing..."
  - Helper: "Kelak bidang studi atau keahlian utama Anda — tersedia sarana otomatis."
- Kota Domisili input
  - Placeholder: "cth. Jakarta, Bandung, Surabaya..."
  - Helper: "Proyek akan dicocokkan berdasarkan lokasi Anda."
- Primary Button: "Lanjutkan →"
- Secondary Button: "Kembali"

**For SENIOR role:**
- Similar fields but adapted (e.g., Company instead of Institution)

**For UMKM role:**
- Business name
- Industry field
- Company location

**Validation:**
- All fields required
- Show helper text for each field

**Actions:**
- Save about info
- Continue to next step (profile completion)

---

### 👤 Registration - Step 4: Portfolio & Experience (DONE ✅)

**URL:** `/register/portfolio`

**Visual Reference:** Image 5 - Portfolio & Pengalaman

**Layout:**
- Centered card, scrollable
- Progress: Step 4 of N

**Components:**

#### Section 1: Tentang Saya
- Label: "Tentang Saya"
- Textarea
  - Placeholder: "Ceritakan dirimu, minatmu, pengalaman yang pernah dimulai, dan tujaranmu bergabung di EduNomad."
  - Max 300 characters
  - Character counter: "Maksimal 300 karakter" | "X/X Tersisa"

#### Section 2: Pengalaman Sebelumnya
- Label: "Pengalaman Sebelumnya"
- Helper: "Pilih pengalaman yang pernah kamu miliki."
- Tag buttons (multi-select):
  - Belum Pernah
  - Proyek Kuliah
  - Organisasi
  - Freelance
  - Magang
  - Kompetisi
  - Pelataran Profesional
  - Bootcamp
  - Volunteer
  - Lainnya
- Selected tags shown with styling

#### Section 3: Portofolio & Profil Profesional
- Label: "Portofolio & Profil Profesional"
- Helper: "Semua kolom bersifat opsional, namun sangat disarankan untuk meningkatkan peluang diterima proyek."
- 4 input fields:
  - GitHub URL: "https://github.com/username"
  - LinkedIn URL: "https://linkedin.com/in/username"
  - Portfolio URL: "https://portfolio.com"
  - Behance/Dribbble URL: "https://behance.net/username"

#### Section 4: Project Showcase
- Label: "Project Showcase"
- Helper: "Tambahkan proyek terbaik yang pernah kamu kerjakan."
- Button: "+ Tambah Proyek" (with optional/limit indicator like "0/3")

#### Section 5: CV
- Label: "CV"
- Helper: "Unggah CV jika tersedia."
- File upload area:
  - Drag & drop zone
  - Upload icon
  - Text: "Klik untuk unggah atau seret file di sini"
  - Supported: PDF, DOCX — Maksimal 5 MB
- File display (if uploaded):
  - File name
  - File size
  - Remove button
  - Status: "Green checkmark + 'Valid'"

- Primary Button: "Selesaikan Profil →"
- Secondary Button: "Kembali"

**Validation:**
- Optional fields but encourage filling
- File size validation (max 5MB)
- File type validation (PDF, DOCX)

**Actions:**
- Save portfolio data
- Upload CV to storage
- Continue to next step (verification)

---

### 🎯 Registration - Step 5: Skills & Interests (DONE ✅)

**URL:** `/register/skills`

**Visual Reference:** Image 6 - Bidang dan Minat

**Layout:**
- Centered card, scrollable
- Progress: Step 5 of N (Final)

**Components:**

#### Section 1: Bidang Utama
- Label: "Bidang Utama"
- Helper: "Pilih bidang yang paling sesuai dengan kampanye dan minatmu."
- Dropdown:
  - Options: Frontend Development, Backend Development, Mobile Development, UI/UX Design, Graphic Design, Digital Marketing, Data Analysis, Product Management, Business Development, etc.

#### Section 2: Role yang Diminati
- Label: "Role yang Diminati"
- Helper: "Kamu dapat memilih lebih dari satu role."
- Tag buttons (multi-select):
  - Frontend Developer
  - Backend Developer
  - Fullstack Developer
  - Mobile Developer
  - UI Designer
  - UX Researcher
  - Product Designer
  - Graphic Designer
  - Content Creator
  - Social Media Specialist
  - SEO Specialist
  - Digital Marketing Specialist
  - Data Analyst
  - Business Analyst
  - Project Coordinator
  - Quality Assurance (QA)
  - Lainnya

#### Section 3: Tingkat Pengalaman
- Label: "Tingkat Pengalaman"
- Helper: "Pilih level yang paling sesuai dengan kemampuan dan minatmu saat ini."
- Radio buttons:
  - Pemula: "Baru belajar dan belum memiliki banyak satu ini."
  - Menengah: "Sudah memiliki pengalaman bertahun-tahun proyek atau pengalaman organisasi."
  - Mahir: "Sudah memiliki pengalaman nyata, freelance, atau profesional."

#### Section 4: Keahlian dan Tools
- Label: "Keahlian dan Tools"
- Helper: "Pilih teknologi, tools, atau keahlian yang kamu kuasai."
- Multiple tag buttons grouped by category:

  **WEB DEVELOPMENT:**
  - HTML
  - CSS
  - JavaScript
  - TypeScript
  - React
  - Next.js
  - Vue.js
  - Laravel
  - PHP
  - MySQL
  - PostgreSQL

  **MOBILE DEVELOPMENT:**
  - Flutter
  - React Native
  - Kotlin
  - Swift

  **DESIGN:**
  - Figma
  - Wireframing
  - Prototyping
  - Design System

- Button: "+ Tambah Keahlian Sendiri"

#### Section 5: Bidang yang Ingin Dipelajari
- Label: "Bidang yang Ingin Dipelajari"
- Helper: "Pilih topik yang ingin kamu pelajari."
- Multiple tag buttons:
  - Frontend Development
  - Backend Development
  - Mobile Development
  - UIUX Design
  - Digital Marketing
  - Data Analysis
  - Business Development
  - Product Management
  - Public Speaking
  - Leadership
  - Lainnya

- Primary Button: "Lanjutkan →"
- Secondary Button: "Kembali"

**Actions:**
- Save skills and interests
- Continue to verification or dashboard

---

## Beginner Area

### 📊 Dashboard - Beginner (DONE ✅)

**URL:** `/dashboard` (when logged in as Beginner)

**Visual Reference:** Image 7 - Dashboard (full page)

**Layout:**
- Sidebar (left): Navigation
- Main content (right): Dashboard content
- Header: Logo, notifications, user profile dropdown

**Sidebar Components:**
- Logo: "EduNomad"
- Navigation items:
  - 🏠 Dashboard (active/highlighted)
  - 📁 Projects
  - 🏆 Artifacts
  - 🔔 Notifications

**Header:**
- Left: Breadcrumb or page title
- Right: Notification bell icon, User dropdown (Akbar)

**Main Content Sections:**

#### 1. Status Card (Dark/Alert)
- Background: Dark (#1A1A1A)
- Status badge: "⏳ Pending Verification" (yellow)
- Time: "Estimasi 1-2 Hari Kerja"
- Heading: "Akun Anda Sedang Ditinjau"
- Message: "Tim EduNomad sedang melakukan verifikasi akun Anda. Selama proses ini, Anda tetap dapat menjelajahi proyek dan mengisi profil aplikasi proyek."
- Action buttons:
  - "Lengkapi Profil →"
  - "Lihat Proyek"

#### 2. Stats Cards (Grid: 4 columns)
- Card 1: 0 | Proyek Aktif | "Lihat proyek"
- Card 2: 0 | Aplikasi | "Lihat aplikasi"
- Card 3: 0 | Artifact | "Lihat proyek selesai"
- Card 4: — | Rating | "Belum ada ulasan"

#### 3. Profile Completion
- Label: "Kelengkapan Profil"
- Progress bar: 85% filled (green)
- Incomplete items checklist:
  - ✅ Informasi Dasar
  - ✅ Bidang & Minat
  - ✅ Portofolio
  - ⚪ Foto Profil (empty/not done)
  - ⚪ Banner Profil (empty/not done)
- Button: "Lengkapi Profil →"

#### 4. Tips Section
- Heading: "Tips Meningkatkan Peluang"
- Tips list with checkmarks:
  - "Tambahkan foto profil"
  - "Upload portofolio di LinkedIn untuk meningkatkan peluang diterima"
  - "3 dari 5 tips selesai. Tambahkan foto profil di LinkedIn untuk meningkatkan peluang diterima."

#### 5. Recommended Projects Section
- Heading: "Rekomendasi Proyek Untuk Anda"
- Button: "Lihat Semua →"
- Project cards (3 columns, scrollable):
  - Each card shows:
    - Category badge (e.g., "Web Development")
    - Status badge (e.g., "Recruiting")
    - Project title: "Website Company Profile Toko Batik Nusantara"
    - Company/UMKM: "PT Nusantara"
    - Roles needed: "Frontend Developer, UI Designer, React"
    - Tags: "Figma"
    - Deadline: "15 Jul 2025"
    - Button: "Lihat Detail →"
    - Verification badge: "✅ Terverifikasi"

#### 6. Latest Projects Section
- Heading: "Proyek Terbaru"
- Button: "Jelajahi Semua →"
- Similar project cards
- 6 projects shown (2 rows × 3 columns)

#### 7. Artifact Portfolio Section
- Dark card with artifact info
- Icon: "🏆 Artifact EduNomad"
- Heading: "Apa Itu Artifact EduNomad?"
- Description: "Setelah menyelesaikan proyek dan mendapatkan persetujuan mentor serta UMKM, Anda akan memperoleh artifact portofolio yang terverifikasi. Ini adalah bukti nyata kesehatan dan kompetensi Anda kepada recruiter."
- Benefits list:
  - "✅ Nama peserta, UMKM, dan mentor tercatat nyata"
  - "✅ Teknologi dan kontribusi yang diakuai dialaki"
  - "✅ Feedback mentor tersimpan"
  - "✅ QR code untuk verifikasi autentikasi"

- Example artifact card on right:
  - Title: "Website Company Profile UMKM Batik Nusantara"
  - People: "Akbar Mauland", "Batik Nusantara"
  - Role: "Frontend Developer"
  - Technologies: "React, Tailwind CSS, Figma, Next.js"
  - Feedback: "Akbar memberikan kontribusi frontend yang solid. Kerja bagus, respons cepat, dan hasil rapih."
  - Link: "✅ Autentik"
  - View button: "Pelajari Lebih Lanjut →"

#### 8. Empty State (if no activities)
- Icon: 📋
- Heading: "Belum Ada Aktivitas"
- Message: "Setelah akun Anda terverifikasi, Anda dapat melihat proyek sesuai dengan minat Anda."
- Button: "🔍 Jelajahi Proyek"

**Actions:**
- Complete profile (link to profile completion)
- View projects (go to browse projects)
- View applications
- View artifacts

**Responsive:**
- On mobile: Stack cards vertically
- Sidebar collapses to hamburger menu

---

### 🔍 Browse Projects - Beginner

**URL:** `/projects` or `/beginner/projects`

**Components:**
- Header: "Telusuri Proyek"
- Filters sidebar:
  - Search input
  - Category filter (dropdown)
  - Status filter (Recruiting, Active, etc.)
  - Role filter
  - Sorting (newest, deadline soonest, etc.)

- Main grid: Project cards (3 columns on desktop, 1 on mobile)
- Pagination: Next/Previous, page numbers

---

### 📋 My Applications - Beginner

**URL:** `/applications` or `/beginner/applications`

**Components:**
- Tabs: Pending | Accepted | Rejected | Withdrawn | Completed
- Application cards showing:
  - Project name
  - Applied role
  - Status
  - Application date
  - Actions: View project, Withdraw (if pending), etc.

---

### 📁 My Projects - Beginner

**URL:** `/my-projects` or `/beginner/my-projects`

**Components:**
- Tabs: Active | Overdue | Completed
- Project cards showing:
  - Project name
  - Company
  - Role assigned
  - Progress (milestones completed)
  - Deadline
  - Action: View workspace

---

### 💼 Project Workspace - Beginner

**URL:** `/projects/:id/workspace`

**Layout:**
- Sidebar: Project menu
- Tabs:
  - Overview
  - Milestones
  - Discussion
  - Deliverables
  - Members

**Components:**
- Overview: Project info, team, description
- Milestones: List of milestones with progress
- Discussion: Group chat
- Deliverables: Upload and manage deliverables
- Members: Team members list

---

### 📦 My Artifacts - Beginner

**URL:** `/artifacts` or `/beginner/artifacts`

**Components:**
- Artifact list/cards showing:
  - Artifact code (EDN-2026-XXXXX)
  - Project name
  - Issue date
  - Verification status
  - Action: Download PDF, View detail, Share

---

### 👤 Profile - Beginner

**URL:** `/profile` or `/profile/me` (if logged in)

**Components:**
- Profile header: Photo, name, headline, status badges
- Sections:
  - About
  - Skills (with proficiency levels)
  - Experiences
  - Portfolio links
  - Artifacts
  - Reviews/Ratings

---

## Senior Area

### 📊 Dashboard - Senior (NOT YET DESIGNED)

**URL:** `/dashboard` (when logged in as Senior)

**Expected Components:**
- Stats: Active projects (0/5), Pending reviews, Artifacts generated
- Recruitment queue: Pending applications
- Project list: Mentored projects
- Deliverable reviews queue
- Quick actions: Review deliverable, Approve contribution, Generate artifact

---

### 🎓 Browse Mentoring Projects - Senior

**URL:** `/projects` (Senior view)

**Expected Components:**
- Projects needing mentors (filtered status=RECRUITING without senior)
- Project cards with: Title, UMKM, Deadline, Roles needed, Action: "Apply as Mentor"

---

### 📋 Mentor Applications - Senior

**URL:** `/applications/mentor`

**Expected Components:**
- Tabs: Pending | Accepted | Rejected
- Application cards

---

### 💼 Project Workspace - Senior

**URL:** `/projects/:id/workspace` (Senior view)

**Expected Components:**
- Similar to Beginner but with additional tabs:
  - Team Management
  - Deliverable Reviews
  - Contribution Approvals
  - Artifact Management
  - Team Reviews

---

### ✅ Deliverable Review - Senior

**URL:** `/projects/:id/deliverables/:deliverableId/review`

**Expected Components:**
- Deliverable details
- Submitted evidence (links, images)
- Review form:
  - Comments textarea
  - Action buttons: Approve, Request Revision
- Previous reviews (if any)

---

### 📜 Contribution Review - Senior

**URL:** `/projects/:id/contributions/:contributionId/review`

**Expected Components:**
- Contribution summary
- Technologies used
- Evidence links
- Review form:
  - Rating
  - Comments
  - Action: Approve
- Approve button triggers artifact generation

---

### 🏆 Artifact Generation - Senior

**URL:** `/projects/:id/artifacts/generate`

**Expected Components:**
- Beginner selection (who to generate artifact for)
- Artifact preview showing data that will be included
- Verification URL input
- Action: Generate artifact
- Success message with artifact code

---

## UMKM Area

### 📊 Dashboard - UMKM (NOT YET DESIGNED)

**URL:** `/dashboard` (when logged in as UMKM)

**Expected Components:**
- Stats: Active projects (0/5), Recruiting projects, Pending reviews
- My projects list
- Senior applications queue
- Project cards showing:
  - Project name
  - Status
  - Team size
  - Deadline
  - Actions: Manage, Monitor

---

### ➕ Create Project - UMKM

**URL:** `/projects/create` or `/umkm/projects/create`

**Expected Components:**
- Multi-step form:
  - Step 1: Basic info (title, description, category, deadline)
  - Step 2: Milestones (create/edit milestones)
  - Step 3: Roles (define role slots, requirements, skills)
  - Step 4: Deliverables (expected deliverables)
  - Step 5: Review & Submit

---

### 📁 My Projects - UMKM

**URL:** `/my-projects` (UMKM view)

**Expected Components:**
- Tabs: Draft | Pending Review | Published | Recruiting | Active | Overdue | Completed | Cancelled
- Project cards with status, team size, deadline

---

### 💼 Project Management - UMKM

**URL:** `/projects/:id/manage` or `/projects/:id` (UMKM view)

**Expected Components:**
- Project overview
- Senior applications tab
  - Application list
  - Accept/Reject buttons
- Progress monitoring (read-only)
  - Milestones
  - Deliverables
  - Team
- Review section (after project near completion)

---

## Admin Area

### 📊 Admin Dashboard

**URL:** `/admin/dashboard`

**Expected Components:**
- Statistics:
  - Total users verified/pending/rejected/suspended
  - Total projects (by status)
  - Total artifacts generated
  - Recent activities

- Verification queue (pending users)
- Project review queue (pending projects)
- Reported issues/problems

---

### 👥 User Verification - Admin

**URL:** `/admin/users/verification`

**Expected Components:**
- Tabs: Pending | Approved | Rejected
- Verification requests list:
  - User name
  - Role
  - Submission date
  - Status
  - Actions: View detail, Approve, Reject

- Detail view:
  - User profile info
  - Verification documents
  - Status radio buttons
  - Notes field
  - Action buttons

---

### 🔍 Project Review - Admin

**URL:** `/admin/projects/review`

**Expected Components:**
- Tabs: Pending | Approved | Rejected
- Project list:
  - Project name
  - UMKM
  - Submission date
  - Status
  - Actions: View detail, Approve, Reject, Request revision

---

### 📊 Project Monitoring - Admin

**URL:** `/admin/projects/monitoring`

**Expected Components:**
- All projects list (filterable by status)
- Project details: Team, deliverables, discussions
- Ability to view everything (monitoring)

---

### 🏆 Artifact Monitoring - Admin

**URL:** `/admin/artifacts`

**Expected Components:**
- Artifacts list:
  - Artifact code
  - Project
  - Beginner
  - Senior
  - Issue date
  - Status
  - Actions: View, Download, View regeneration history

---

### 📋 Audit Logs - Admin

**URL:** `/admin/audit-logs`

**Expected Components:**
- Logs table:
  - Timestamp
  - User
  - Action
  - Entity type
  - Entity ID
  - Metadata
- Filters: by user, by action, by entity type, date range

---

## Shared Components & Patterns

### Navigation Patterns

#### Sidebar Navigation
```
Logo/Brand
├─ Dashboard
├─ Projects
├─ Artifacts (or Notifications)
└─ Notifications (or Artifacts)

Footer:
├─ Help
├─ Privacy
└─ Terms
```

#### Top Navigation (Alternative for Mobile)
- Hamburger menu
- Logo
- Notifications bell
- User profile dropdown

#### Breadcrumbs
```
Dashboard > Projects > Project Name > Workspace
```

---

### Common UI Patterns

#### Empty State
```
Icon (centered)
Heading: "Belum Ada [Item]"
Message: "Deskripsi kondisi kosong dan apa yang perlu dilakukan"
Button: "Primary action"
```

#### Loading State
```
Skeleton loaders for:
- Cards
- Lists
- Tables
- Form inputs
```

#### Error State
```
Error icon
Heading: "Terjadi Kesalahan"
Message: "Detailed error description"
Button: "Try again" or "Go back"
```

#### Success State
```
Success icon/checkmark
Message: "Action berhasil dilakukan"
Auto-dismiss after 3-5 seconds
```

#### Modal/Dialog Pattern
```
Dark overlay
White card (centered)
├─ Close button (X, top-right)
├─ Title
├─ Content
└─ Action buttons (bottom)
```

---

### Form Patterns

#### Multi-Step Form
```
Progress indicator (dots or steps)
Current step content
Navigation buttons:
├─ Back (secondary)
└─ Next/Continue (primary)
```

#### Inline Validation
```
As user types:
├─ Green checkmark for valid
├─ Red X for invalid
└─ Helper text for guidance
```

#### Form Submission
```
Loading state: Button disabled, spinner
Success: Success message, redirect
Error: Error messages shown inline, data preserved
```

---

### Data Table Pattern

```
Column headers (sortable)
├─ Table rows
├─ Pagination (bottom)
└─ Rows per page selector
```

---

## Pages Not Yet Designed

### Authentication & Registration

- ✅ Login
- ✅ Register (Steps 1-5)
- ❌ Forgot Password (recovery flow)
- ❌ Reset Password (email flow)
- ❌ Verify Email (confirmation)
- ❌ Email Verification Success

### Beginner Features

- ✅ Dashboard
- ✅ Browse Projects
- ✅ My Applications
- ✅ My Projects
- ✅ Project Workspace (basic structure)
- ❌ Deliverable detail & submission form
- ❌ Contribution report form
- ❌ Artifact detail page
- ❌ Artifact verification (public)
- ❌ Reviews & rating (view/leave)
- ❌ Edit profile
- ❌ Settings page
- ❌ Direct message view
- ❌ Notification detail

### Senior Features

- ❌ Dashboard (not yet designed)
- ❌ Browse mentoring projects
- ❌ Mentor applications
- ❌ Project workspace (senior view)
- ❌ Applicant management/acceptance
- ❌ Deliverable review
- ❌ Contribution review & approval
- ❌ Artifact generation & management
- ❌ Leave project flow
- ❌ Profile view/edit

### UMKM Features

- ❌ Dashboard (not yet designed)
- ❌ Create project (multi-step form)
- ❌ My projects
- ❌ Project management
- ❌ Senior applications review
- ❌ Project monitoring
- ❌ Review team members
- ❌ Profile view/edit

### Admin Features

- ❌ Dashboard (not yet designed)
- ❌ User verification
- ❌ Project review
- ❌ Project monitoring
- ❌ Artifact monitoring
- ❌ Audit logs
- ❌ Category management
- ❌ Member removal approval
- ❌ Senior replacement

### Shared/Public

- ❌ Landing page (public homepage)
- ❌ Artifact verification (public, no login)
- ❌ 404 page
- ❌ 500 error page
- ❌ Maintenance page

---

## Implementation Priority

### Priority 1 (MVP Core - Must Have First)
1. Login page
2. Register flow (all 5 steps)
3. Beginner Dashboard
4. Browse Projects
5. Project Workspace
6. Deliverable submission & review

### Priority 2 (MVP Completion)
7. Senior Dashboard
8. Artifact generation
9. Admin Dashboard
10. Admin verification flow

### Priority 3 (Nice to Have)
11. Error pages
12. Profile pages
13. Settings
14. Advanced features

---

## Notes for Implementation

### Color Usage
- Use the green (#67C957) as primary color for all CTAs
- Use neutral grays for secondary actions and disabled states
- Use dark background (#1A1A1A) for alert/info cards only

### Typography
- Keep hierarchy clear (H1 > H2 > H3 > body)
- Maintain consistent spacing between text elements
- Use semibold for labels and buttons

### Accessibility
- Ensure all form labels are associated with inputs
- Provide alt text for icons and images
- Maintain sufficient color contrast
- Use focus states for keyboard navigation

### Responsive Design
- Design mobile-first
- Test on common breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
- Stack multi-column grids on mobile

---

*Last Updated: Based on Figma Screenshots*  
*Status: Design Reference + Gap Analysis*  
*Next: Design remaining pages in Figma*
