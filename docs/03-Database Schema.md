# EduNomad MVP - Database Schema Production Grade v2.0

## Table of Contents
- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Database Conventions](#database-conventions)
- [Schema Reference](#schema-reference)
  - [Users Domain](#users-domain)
  - [Skills Domain](#skills-domain)
  - [Experiences Domain](#experiences-domain)
  - [Portfolio Domain](#portfolio-domain)
  - [Project Categories Domain](#project-categories-domain)
  - [Projects Domain](#projects-domain)
  - [Milestones Domain](#milestones-domain)
  - [Project Roles Domain](#project-roles-domain)
  - [Recruitment Domain](#recruitment-domain)
  - [Discussions Domain](#discussions-domain)
  - [Deliverables Domain](#deliverables-domain)
  - [Contributions Domain](#contributions-domain)
  - [Artifacts Domain](#artifacts-domain)
  - [Reviews Domain](#reviews-domain)
  - [Notifications Domain](#notifications-domain)
  - [Verification Domain](#verification-domain)
  - [Audit Domain](#audit-domain)
- [Business Constraints](#business-constraints)

---

## Overview

This document defines the complete database schema for **EduNomad MVP** and serves as the source of truth for:
- Prisma Schema
- Database Migration
- Express.js API
- Service Layer
- Repository Layer
- RBAC Rules

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | Next.js |
| Language | TypeScript |
| Backend Framework | Express.js |
| ORM | Prisma ORM |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |

---

## Database Conventions

### Primary Key

All tables use **UUID** as primary key:

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

### User Authentication

Authentication is handled by **Supabase Auth**.

```
auth.users
    │
    ▼
public.users
```

**Rule:** `users.id = auth.users.id` (No separate auth_user_id column)

### Timestamps

All tables include timestamp fields:

```sql
created_at TIMESTAMP NOT NULL DEFAULT NOW()
updated_at TIMESTAMP NOT NULL DEFAULT NOW()
```

### Soft Deletes

Only the `projects` table uses soft deletes:

```sql
deleted_at TIMESTAMP NULL
```

---

## Schema Reference

### Users Domain

#### users

**Purpose:** Application user account.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(255) | User's full name |
| `email` | VARCHAR(255) | User's email address |
| `role` | VARCHAR(20) | User role (see below) |
| `status` | VARCHAR(30) | Account status (see below) |
| `email_verified_at` | TIMESTAMP NULL | Email verification timestamp |
| `created_at` | TIMESTAMP | Account creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Roles:**
- `BEGINNER`
- `SENIOR`
- `UMKM`
- `ADMIN`

**Statuses:**
- `PENDING_VERIFICATION`
- `VERIFIED`
- `REJECTED`
- `SUSPENDED`

**Indexes:**
- `INDEX(role)`
- `INDEX(status)`

---

#### user_profiles

**Purpose:** Additional profile information.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `user_id` | UUID FK | Foreign Key to users.id |
| `phone` | VARCHAR(30) | Phone number |
| `photo` | VARCHAR(1000) | Profile photo URL |
| `headline` | VARCHAR(255) | Professional headline |
| `bio` | TEXT | User biography |
| `linkedin_url` | VARCHAR(1000) | LinkedIn profile URL |
| `verification_notes` | TEXT | Admin verification notes |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Constraints:**
- `UNIQUE(user_id)`

---

### Skills Domain

#### skills

**Purpose:** Master skill database.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(100) | Skill name |
| `slug` | VARCHAR(150) | URL-friendly slug |
| `category` | VARCHAR(100) | Skill category |
| `status` | VARCHAR(20) | Approval status (see below) |
| `is_system` | BOOLEAN | System-defined skill flag |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Statuses:**
- `PENDING`
- `APPROVED`
- `REJECTED`

**Constraints:**
- `UNIQUE(name)`
- `UNIQUE(slug)`

---

#### user_skills

**Purpose:** User-owned skills.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `user_id` | UUID FK | Foreign Key to users |
| `skill_id` | UUID FK | Foreign Key to skills |
| `level` | VARCHAR(20) | Proficiency level (see below) |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Levels:**
- `BEGINNER`
- `INTERMEDIATE`
- `ADVANCED`

**Constraints:**
- `UNIQUE(user_id, skill_id)`

---

### Experiences Domain

#### experiences

**Purpose:** User work experience.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `user_id` | UUID FK | Foreign Key to users |
| `title` | VARCHAR(255) | Job title |
| `organization` | VARCHAR(255) | Organization name |
| `description` | TEXT | Experience description |
| `start_date` | DATE | Start date |
| `end_date` | DATE NULL | End date (nullable) |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

---

### Portfolio Domain

#### portfolio_links

**Purpose:** User portfolio and social media links.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `user_id` | UUID FK | Foreign Key to users |
| `title` | VARCHAR(255) | Link title |
| `url` | VARCHAR(1000) | Link URL |
| `type` | VARCHAR(30) | Link type (see below) |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Types:**
- `GITHUB`
- `FIGMA`
- `BEHANCE`
- `LINKEDIN`
- `OTHER`

---

### Project Categories Domain

#### project_categories

**Purpose:** Project categorization.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `name` | VARCHAR(100) | Category name |
| `slug` | VARCHAR(150) | URL-friendly slug |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Constraints:**
- `UNIQUE(name)`
- `UNIQUE(slug)`

---

### Projects Domain

#### projects

**Purpose:** Main project entity.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `umkm_id` | UUID FK | Foreign Key to users (UMKM) |
| `senior_id` | UUID FK NULL | Foreign Key to users (Senior) |
| `category_id` | UUID FK | Foreign Key to project_categories |
| `title` | VARCHAR(255) | Project title |
| `description` | TEXT | Project description |
| `expected_deliverables` | TEXT | List of expected deliverables |
| `start_date` | DATE | Project start date |
| `deadline` | DATE | Project deadline |
| `completed_at` | TIMESTAMP NULL | Completion timestamp |
| `status` | VARCHAR(30) | Project status (see below) |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |
| `deleted_at` | TIMESTAMP NULL | Soft delete timestamp |

**Statuses:**
- `DRAFT`
- `PENDING_REVIEW`
- `PUBLISHED`
- `RECRUITING`
- `ACTIVE`
- `OVERDUE`
- `COMPLETED`
- `CANCELLED`

**Indexes:**
- `INDEX(status)`
- `INDEX(deadline)`
- `INDEX(umkm_id)`
- `INDEX(senior_id)`

---

### Milestones Domain

#### milestones

**Purpose:** Project milestones.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `project_id` | UUID FK | Foreign Key to projects |
| `title` | VARCHAR(255) | Milestone title |
| `description` | TEXT | Milestone description |
| `due_date` | DATE | Due date |
| `status` | VARCHAR(20) | Status (see below) |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Statuses:**
- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`

---

### Project Roles Domain

#### project_roles

**Purpose:** Project roles/positions.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `project_id` | UUID FK | Foreign Key to projects |
| `role_name` | VARCHAR(100) | Name of the role |
| `capacity` | INTEGER | Number of positions available |
| `requirements` | TEXT | Role requirements |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Constraints:**
- `capacity > 0`

---

#### role_skills

**Purpose:** Skills required for a project role.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `project_role_id` | UUID FK | Foreign Key to project_roles |
| `skill_id` | UUID FK | Foreign Key to skills |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Constraints:**
- `UNIQUE(project_role_id, skill_id)`

---

### Recruitment Domain

#### senior_applications

**Purpose:** Senior developer applications to projects.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `project_id` | UUID FK | Foreign Key to projects |
| `senior_id` | UUID FK | Foreign Key to users (Senior) |
| `message` | TEXT | Application message |
| `status` | VARCHAR(20) | Application status (see below) |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Statuses:**
- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `WITHDRAWN`

---

#### project_applications

**Purpose:** Beginner applications to project roles.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `project_id` | UUID FK | Foreign Key to projects |
| `project_role_id` | UUID FK | Foreign Key to project_roles |
| `beginner_id` | UUID FK | Foreign Key to users (Beginner) |
| `motivation` | TEXT | Application motivation |
| `status` | VARCHAR(20) | Application status (see below) |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Statuses:**
- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `WITHDRAWN`

---

#### project_members

**Purpose:** Project team members.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `project_id` | UUID FK | Foreign Key to projects |
| `user_id` | UUID FK | Foreign Key to users |
| `project_role_id` | UUID FK | Foreign Key to project_roles |
| `status` | VARCHAR(20) | Member status (see below) |
| `joined_at` | TIMESTAMP | Join date |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Statuses:**
- `ACTIVE`
- `REMOVED`
- `WITHDRAWN`
- `COMPLETED`

---

### Discussions Domain

#### discussions

**Purpose:** Project and direct message discussions.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `project_id` | UUID FK NULL | Foreign Key to projects |
| `type` | VARCHAR(20) | Discussion type (see below) |
| `title` | VARCHAR(255) NULL | **Phase 12:** forum topic title (GROUP; null for DIRECT) |
| `category` | VARCHAR(30) NULL | **Phase 12:** forum category (see below; null for DIRECT) |
| `is_pinned` | BOOLEAN | **Phase 12:** topic pinned to top (default false) |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Types:**
- `GROUP`
- `DIRECT`

**Categories (Phase 12 — Discussion Forum Upgrade; VARCHAR, validated at Zod):**
- `ANNOUNCEMENT` (Pengumuman) · `QUESTION` (Pertanyaan) · `IDEA` (Ide) · `BLOCKER` (Kendala) · `MENTOR_REVIEW` (Review Mentor) · `UPDATE` (Pembaruan)

> **Phase 12 amendment:** the original MVP discussion model was a flat group chat.
> The user explicitly approved upgrading discussions into a full forum. Columns
> above were added in sub-phase 12.1 (migration `phase10_discussion_forum_metadata`).
> Subsequent sub-phases add: 12.2 threaded replies (`discussion_messages.parent_id`),
> 12.3 reactions (`message_reactions` table), 12.4 attachments (`discussion_attachments`
> table + Supabase Storage — **overrides the "no attachments in MVP" rule below**),
> 12.5 views (`discussion_views` table).

---

#### discussion_members

**Purpose:** Discussion participants.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `discussion_id` | UUID FK | Foreign Key to discussions |
| `user_id` | UUID FK | Foreign Key to users |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Constraints:**
- `UNIQUE(discussion_id, user_id)`

---

#### discussion_messages

**Purpose:** Discussion messages.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `discussion_id` | UUID FK | Foreign Key to discussions |
| `sender_id` | UUID FK | Foreign Key to users |
| `message` | TEXT | Message content |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Business Rule:** ~~Discussion attachment not supported in MVP~~ — **superseded by Phase 12.4** (Discussion Forum Upgrade, user-approved): attachments (file/image/link) are supported via the `discussion_attachments` table + Supabase Storage (store URL/path only).

---

### Deliverables Domain

#### deliverables

**Purpose:** Project deliverables.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `project_id` | UUID FK | Foreign Key to projects |
| `submitted_by` | UUID FK | Foreign Key to users |
| `title` | VARCHAR(255) | Deliverable title |
| `description` | TEXT | Deliverable description |
| `status` | VARCHAR(30) | Deliverable status (see below) |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Statuses:**
- `DRAFT`
- `SUBMITTED`
- `REVISION_REQUESTED`
- `APPROVED`

---

#### deliverable_evidences

**Purpose:** Evidence for deliverables.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `deliverable_id` | UUID FK | Foreign Key to deliverables |
| `type` | VARCHAR(20) | Evidence type (see below) |
| `url` | VARCHAR(1000) NULL | URL (for LINK type) |
| `file_path` | VARCHAR(1000) NULL | File path (for FILE type) |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Types:**
- `LINK`
- `FILE`

---

### Contributions Domain

#### contribution_reports

**Purpose:** Beginner contribution reports.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `project_id` | UUID FK | Foreign Key to projects |
| `beginner_id` | UUID FK | Foreign Key to users (Beginner) |
| `contribution_summary` | TEXT | Summary of contributions |
| `status` | VARCHAR(20) | Report status (see below) |
| `reviewed_by` | UUID FK | Foreign Key to users (Reviewer) |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Statuses:**
- `PENDING`
- `APPROVED`

---

#### contribution_skills

**Purpose:** Skills used in contribution.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `contribution_report_id` | UUID FK | Foreign Key to contribution_reports |
| `skill_id` | UUID FK | Foreign Key to skills |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Constraints:**
- `UNIQUE(contribution_report_id, skill_id)`

---

### Artifacts Domain

#### artifacts

**Purpose:** Skill artifacts (certificates/credentials).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `artifact_code` | VARCHAR(50) | Unique artifact code |
| `project_id` | UUID FK | Foreign Key to projects |
| `beginner_id` | UUID FK | Foreign Key to users (Beginner) |
| `senior_id` | UUID FK | Foreign Key to users (Senior) |
| `verification_url` | VARCHAR(1000) | Verification URL |
| `current_version` | INTEGER | Current version number |
| `issued_at` | TIMESTAMP | Issuance date |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Code Format:** `EDN-2026-000001`

**Constraints:**
- `UNIQUE(artifact_code)`

---

#### artifact_versions

**Purpose:** Artifact version history.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `artifact_id` | UUID FK | Foreign Key to artifacts |
| `version` | INTEGER | Version number |
| `pdf_path` | VARCHAR(1000) | PDF file path |
| `generated_by` | UUID FK | Foreign Key to users |
| `created_at` | TIMESTAMP | Creation date |

**Business Rule:** Regeneration does not delete previous versions

---

### Reviews Domain

#### reviews

**Purpose:** User and project reviews.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `project_id` | UUID FK | Foreign Key to projects |
| `reviewer_id` | UUID FK | Foreign Key to users |
| `reviewee_id` | UUID FK | Foreign Key to users |
| `rating` | INTEGER | Rating score (1-5) |
| `comment` | TEXT | Review comment |
| `type` | VARCHAR(50) | Review type (see below) |
| `is_edited` | BOOLEAN | Whether review was edited |
| `edited_at` | TIMESTAMP NULL | Edit timestamp |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Types:**
- `SENIOR_TO_BEGINNER`
- `UMKM_TO_BEGINNER`
- `UMKM_TO_SENIOR`

**Constraints:**
- `rating BETWEEN 1 AND 5`

---

### Notifications Domain

#### notifications

**Purpose:** User notifications.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `user_id` | UUID FK | Foreign Key to users |
| `type` | VARCHAR(30) | Notification type |
| `title` | VARCHAR(255) | Notification title |
| `message` | TEXT | Notification message |
| `action_url` | VARCHAR(500) | Action URL |
| `is_read` | BOOLEAN | Read status |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

---

### Verification Domain

#### verification_requests

**Purpose:** User verification requests.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `user_id` | UUID FK | Foreign Key to users |
| `status` | VARCHAR(20) | Request status (see below) |
| `notes` | TEXT | Verification notes |
| `reviewed_by` | UUID FK | Foreign Key to users (Admin) |
| `created_at` | TIMESTAMP | Creation date |
| `updated_at` | TIMESTAMP | Last update date |

**Statuses:**
- `PENDING`
- `APPROVED`
- `REJECTED`

---

### Audit Domain

#### audit_logs

**Purpose:** Audit trail for critical actions.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary Key |
| `user_id` | UUID FK | Foreign Key to users |
| `action` | VARCHAR(255) | Action performed |
| `entity_type` | VARCHAR(100) | Entity type affected |
| `entity_id` | UUID | Entity ID affected |
| `metadata` | JSONB | Additional metadata |
| `created_at` | TIMESTAMP | Timestamp |

**Indexes:**
- `INDEX(user_id)`
- `INDEX(entity_type)`
- `INDEX(entity_id)`

---

## Business Constraints

### User Constraints

| Constraint | Description |
|-----------|-------------|
| **Beginner Active Projects** | Beginner hanya boleh memiliki **1 ACTIVE project** |
| **Senior Active Projects** | Senior maksimal **5 ACTIVE project** |
| **UMKM Active Projects** | UMKM maksimal **5 ACTIVE project** |

### Project Constraints

| Constraint | Description |
|-----------|-------------|
| **Senior Requirement** | Project wajib memiliki tepat **1 Senior** |
| **Active Status** | Project tidak dapat **ACTIVE tanpa Senior** |
| **Review Requirement** | Review wajib **sebelum project selesai** |

### Skill & Admin Constraints

| Constraint | Description |
|-----------|-------------|
| **Custom Skills** | Skill **Other** harus disetujui **Admin** sebelum masuk Master Skill |
| **Category Management** | Project **Category dikelola Admin** |

### Feature Constraints

| Constraint | Description |
|-----------|-------------|
| **Artifacts** | Artifact dibuat **per Beginner** |
| **Portfolio Visibility** | Portfolio dapat dilihat **user lain yang login** |
| **Discussion Attachments** | Discussion attachment **tidak didukung pada MVP** |

---

*Last Updated: v2.0 - Production Grade*

*Source of Truth: Prisma Schema, Database Migrations, API Specifications*
