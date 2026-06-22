# EduNomad MVP - ERD Production Grade v2.0

## Table of Contents
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
  - [User Domain](#user-domain)
  - [Project Domain](#project-domain)
  - [Recruitment Domain](#recruitment-domain)
  - [Discussion Domain](#discussion-domain)
  - [Deliverable Domain](#deliverable-domain)
  - [Contribution Domain](#contribution-domain)
  - [Artifact Domain](#artifact-domain)
  - [Review Domain](#review-domain)
  - [Notification Domain](#notification-domain)
  - [Verification Domain](#verification-domain)
  - [Audit Domain](#audit-domain)
- [Critical Business Constraints](#critical-business-constraints)

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend Framework | Next.js |
| Language | TypeScript |
| Backend Framework | Express.js |
| ORM | Prisma |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |

---

## Database Schema

### User Domain

#### Entity Relationship
```
auth.users
    │
    │ 1:1
    ▼
users
    │
    ├── user_profiles
    ├── user_skills
    ├── experiences
    ├── portfolio_links
    ├── notifications
    ├── verification_requests
    └── reviews
```

#### users
Stores application users.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Same as auth.users.id |
| `name` | String | User's full name |
| `email` | String | User's email address |
| `role` | Enum | See roles below |
| `status` | Enum | See statuses below |
| `email_verified_at` | Timestamp | Email verification timestamp |
| `created_at` | Timestamp | Account creation date |
| `updated_at` | Timestamp | Last update date |

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

#### user_profiles
User profile information.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `phone` | String | Phone number |
| `photo` | String | Profile photo URL |
| `headline` | String | Professional headline |
| `bio` | Text | Biography |
| `linkedin_url` | String | LinkedIn profile URL |
| `verification_notes` | Text | Admin verification notes |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Relationship:** 1 User → 1 Profile

#### skills
Master skill library.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `name` | String | Skill name |
| `slug` | String | URL-friendly slug |
| `category` | String | Skill category |
| `status` | Enum | See statuses below |
| `is_system` | Boolean | System-defined skill flag |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Statuses:**
- `PENDING`
- `APPROVED`
- `REJECTED`

#### user_skills
User's proficiency in specific skills.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `skill_id` | UUID | Foreign key to skills |
| `level` | Enum | Proficiency level |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Levels:**
- `BEGINNER`
- `INTERMEDIATE`
- `ADVANCED`

#### experiences
User's work experience.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `title` | String | Job title |
| `organization` | String | Organization name |
| `description` | Text | Experience description |
| `start_date` | Date | Start date |
| `end_date` | Date | End date (nullable) |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

#### portfolio_links
User's portfolio and social links.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `title` | String | Link title |
| `url` | String | Link URL |
| `type` | Enum | Link type |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Types:**
- `GITHUB`
- `FIGMA`
- `BEHANCE`
- `LINKEDIN`
- `OTHER`

---

### Project Domain

#### project_categories
Project categories.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `name` | String | Category name |
| `slug` | String | URL-friendly slug |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Examples:**
- Web Development
- Mobile Development
- UI/UX Design
- Graphic Design
- Digital Marketing
- Data Analysis
- Business Development

#### projects
Main project entity.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `umkm_id` | UUID | Foreign key to users (UMKM) |
| `senior_id` | UUID | Foreign key to users (Senior) |
| `category_id` | UUID | Foreign key to project_categories |
| `title` | String | Project title |
| `description` | Text | Project description |
| `expected_deliverables` | Text | List of expected deliverables |
| `start_date` | Date | Project start date |
| `deadline` | Date | Project deadline |
| `completed_at` | Timestamp | Completion timestamp (nullable) |
| `status` | Enum | Project status |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |
| `deleted_at` | Timestamp | Soft delete timestamp (nullable) |

**Statuses:**
- `DRAFT`
- `PENDING_REVIEW`
- `PUBLISHED`
- `RECRUITING`
- `ACTIVE`
- `OVERDUE`
- `COMPLETED`
- `CANCELLED`

**Related Entities:**
- Milestones
- Roles
- Senior Applications
- Beginner Applications
- Members
- Deliverables
- Discussions
- Artifacts
- Reviews

#### milestones
Project milestones.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `title` | String | Milestone title |
| `description` | Text | Milestone description |
| `due_date` | Date | Due date |
| `status` | Enum | Milestone status |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Statuses:**
- `PENDING`
- `IN_PROGRESS`
- `COMPLETED`

#### project_roles
Project roles/positions.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `role_name` | String | Name of the role |
| `capacity` | Integer | Number of positions available |
| `requirements` | Text | Role requirements |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Examples:**
- Frontend Developer
- Backend Developer
- UI/UX Designer

#### role_skills
Skills required for a project role.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `project_role_id` | UUID | Foreign key to project_roles |
| `skill_id` | UUID | Foreign key to skills |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

---

### Recruitment Domain

#### senior_applications
Senior developer applications to projects.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `senior_id` | UUID | Foreign key to users (Senior) |
| `message` | Text | Application message |
| `status` | Enum | Application status |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Statuses:**
- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `WITHDRAWN`

**Business Rule:** Senior maximum 5 active projects

#### project_applications
Beginner applications to project roles.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `project_role_id` | UUID | Foreign key to project_roles |
| `beginner_id` | UUID | Foreign key to users (Beginner) |
| `motivation` | Text | Application motivation |
| `status` | Enum | Application status |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Statuses:**
- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `WITHDRAWN`

**Business Rules:**
- Beginner can apply freely
- Cannot apply if currently in an ACTIVE project

#### project_members
Project team members.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `user_id` | UUID | Foreign key to users |
| `project_role_id` | UUID | Foreign key to project_roles |
| `status` | Enum | Member status |
| `joined_at` | Timestamp | Join date |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Statuses:**
- `ACTIVE`
- `REMOVED`
- `WITHDRAWN`
- `COMPLETED`

**Usage:**
- Completed Project Count
- Removed Project Count

---

### Discussion Domain

#### discussions
Project discussions.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `type` | Enum | Discussion type |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Types:**
- `GROUP`
- `DIRECT`

#### discussion_members
Discussion participants.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `discussion_id` | UUID | Foreign key to discussions |
| `user_id` | UUID | Foreign key to users |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

#### discussion_messages
Discussion messages.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `discussion_id` | UUID | Foreign key to discussions |
| `sender_id` | UUID | Foreign key to users |
| `message` | Text | Message content |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Business Rule:** File attachments not supported in MVP

---

### Deliverable Domain

#### deliverables
Project deliverables.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `submitted_by` | UUID | Foreign key to users |
| `title` | String | Deliverable title |
| `description` | Text | Deliverable description |
| `status` | Enum | Deliverable status |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Statuses:**
- `DRAFT`
- `SUBMITTED`
- `REVISION_REQUESTED`
- `APPROVED`

#### deliverable_evidences
Evidence for deliverables.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `deliverable_id` | UUID | Foreign key to deliverables |
| `type` | Enum | Evidence type |
| `url` | String | Evidence URL (for links) |
| `file_path` | String | Evidence file path (for files) |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Types:**
- `LINK`
- `FILE`

**Business Rule:** One deliverable can have multiple evidences

---

### Contribution Domain

#### contribution_reports
Beginner contribution reports.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `beginner_id` | UUID | Foreign key to users (Beginner) |
| `contribution_summary` | Text | Summary of contributions |
| `status` | Enum | Report status |
| `reviewed_by` | UUID | Foreign key to users (Reviewer) |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Statuses:**
- `PENDING`
- `APPROVED`

#### contribution_skills
Skills used in contribution.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `contribution_report_id` | UUID | Foreign key to contribution_reports |
| `skill_id` | UUID | Foreign key to skills |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Purpose:** Track technologies/skills used by Beginner

---

### Artifact Domain

#### artifacts
Skill artifacts (certificates/credentials).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `artifact_code` | String | Unique artifact code (format: EDN-2026-000001) |
| `project_id` | UUID | Foreign key to projects |
| `beginner_id` | UUID | Foreign key to users (Beginner) |
| `senior_id` | UUID | Foreign key to users (Senior) |
| `verification_url` | String | Verification URL |
| `current_version` | Integer | Current version number |
| `issued_at` | Timestamp | Issuance date |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Format:** `EDN-2026-000001`

**Business Rule:** 1 Project → 3 Beginner → 3 Artifact

#### artifact_versions
Artifact version history.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `artifact_id` | UUID | Foreign key to artifacts |
| `version` | Integer | Version number |
| `pdf_path` | String | PDF file path |
| `generated_by` | UUID | Foreign key to users (Generator) |
| `created_at` | Timestamp | Creation date |

**Business Rule:** Regeneration does not delete previous versions

---

### Review Domain

#### reviews
User and project reviews.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `project_id` | UUID | Foreign key to projects |
| `reviewer_id` | UUID | Foreign key to users |
| `reviewee_id` | UUID | Foreign key to users |
| `rating` | Integer | Rating 1-5 |
| `comment` | Text | Review comment |
| `type` | Enum | Review type |
| `is_edited` | Boolean | Whether review was edited |
| `edited_at` | Timestamp | Edit timestamp (nullable) |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Types:**
- `SENIOR_TO_BEGINNER`
- `UMKM_TO_BEGINNER`
- `UMKM_TO_SENIOR`

**Ratings:** 1 - 5

---

### Notification Domain

#### notifications
User notifications.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `type` | String | Notification type |
| `title` | String | Notification title |
| `message` | Text | Notification message |
| `action_url` | String | Action URL (nullable) |
| `is_read` | Boolean | Read status |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

---

### Verification Domain

#### verification_requests
User verification requests.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `status` | Enum | Request status |
| `notes` | Text | Verification notes |
| `reviewed_by` | UUID | Foreign key to users (Admin) |
| `created_at` | Timestamp | Creation date |
| `updated_at` | Timestamp | Last update date |

**Statuses:**
- `PENDING`
- `APPROVED`
- `REJECTED`

---

### Audit Domain

#### audit_logs
Audit trail for critical actions.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `action` | String | Action performed |
| `entity_type` | String | Entity type affected |
| `entity_id` | UUID | Entity ID affected |
| `metadata` | JSONB | Additional metadata |
| `created_at` | Timestamp | Timestamp |

**Examples:**
- User Verified
- Project Approved
- Artifact Regenerated
- User Suspended

---

## Critical Business Constraints

### User Constraints

| Constraint | Details |
|-----------|---------|
| **Beginner - Active Projects** | Beginner can only have 1 ACTIVE project at a time |
| **Senior - Active Projects** | Senior maximum 5 ACTIVE projects |
| **UMKM - Active Projects** | UMKM maximum 5 ACTIVE projects |

### Project Constraints

| Constraint | Details |
|-----------|---------|
| **Senior Requirement** | Project must have exactly 1 Senior |
| **Active Status** | Project cannot be ACTIVE without a Senior |
| **Review Requirement** | Review is mandatory before project completion |

### Skill Constraints

| Constraint | Details |
|-----------|---------|
| **Custom Skills** | "Other" skills require Admin approval |

### General Constraints

| Constraint | Details |
|-----------|---------|
| **Artifact Creation** | Created per Beginner (1 Project → 3 Beginner → 3 Artifact) |
| **Portfolio Visibility** | Viewable by other logged-in users |
| **Admin Responsibilities** | Admin manages Project Categories |

---

*Last Updated: v2.0 - Production Grade*
