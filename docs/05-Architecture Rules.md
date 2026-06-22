# EduNomad MVP - Architecture Rules Production Grade v1.0

## Purpose

This document is the **architectural source of truth** for EduNomad MVP.

**All generated code MUST follow these rules.**

Claude Code, developers, contributors, and future maintainers must treat this document as **mandatory**.

---

## Table of Contents
- [Core Principles](#core-principles)
- [Project Structure](#project-structure)
- [Architectural Patterns](#architectural-patterns)
- [Code Standards](#code-standards)
- [Authentication & Authorization](#authentication--authorization)
- [Validation & Error Handling](#validation--error-handling)
- [State Management & Data Fetching](#state-management--data-fetching)
- [Features & Constraints](#features--constraints)
- [Business Rules](#business-rules)
- [Security & Performance](#security--performance)
- [Out of Scope (Locked)](#out-of-scope-locked)
- [Final Authority](#final-authority)

---

## Core Principles

### Rule 1: Scope Only

**Implement only what exists in:**
- `01-prd-final.md`
- `04-erd-production-grade.md`
- `05-database-schema-production-grade.md`
- `06-api-specification-production-grade.md`

**Forbidden:**
- ❌ Do not invent features
- ❌ Do not add extra modules
- ❌ Do not create functionality outside approved scope

---

### Rule 2: Ask When Unclear

**If requirements are unclear:**

1. **STOP**
2. **ASK**
3. **DO NOT ASSUME**

**Never guess business logic.**

---

### Rule 3: MVP First

**Prioritize:**
- ✅ Working
- ✅ Simple
- ✅ Maintainable

**Avoid:**
- ❌ Complex
- ❌ Enterprise-heavy
- ❌ Over-engineered

---

## Project Structure

### Frontend Structure

```
frontend/
src/
├── app/                    # Next.js pages/routes
├── components/             # Reusable UI components
├── features/               # Feature-specific components & logic
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
├── services/               # API service clients
├── stores/                 # Zustand state stores
├── types/                  # TypeScript type definitions
├── constants/              # Application constants
└── utils/                  # Helper utilities
```

---

### Backend Structure

```
backend/
src/
├── modules/                # Feature modules (auth, users, projects, etc.)
├── middleware/             # Express middleware (auth, error handling, etc.)
├── services/               # Business logic layer
├── repositories/           # Data access layer
├── validators/             # Request validation schemas (Zod)
├── routes/                 # Express route definitions
├── utils/                  # Utility functions
├── types/                  # TypeScript type definitions
├── config/                 # Configuration files
└── prisma/                 # Prisma schema & migrations
```

---

## Architectural Patterns

### Mandatory Backend Layering

**Request Flow (REQUIRED):**

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

**Forbidden Pattern:**
```
Route
  ↓
Prisma ❌ (NEVER do this)
```

---

### Controller Responsibilities

**Controllers ARE ALLOWED to:**
- ✅ Receive request
- ✅ Validate input
- ✅ Call service
- ✅ Return response

**Controllers MUST NOT:**
- ❌ Contain business logic
- ❌ Perform complex queries
- ❌ Access database directly

---

### Service Responsibilities

**Services CONTAIN:**
- ✅ Business logic
- ✅ Permission checks
- ✅ Status changes
- ✅ Validation rules

**Service Examples:**
- Project Activation
- Application Acceptance
- Artifact Generation
- Review Rules

---

### Repository Responsibilities

**Repositories ONLY:**
- ✅ Database operations: `findById()`, `create()`, `update()`, `delete()`
- ✅ Query building with proper relationships

**Repositories MUST NOT:**
- ❌ Contain business logic
- ❌ Implement complex validation
- ❌ Handle authorization

---

### Database Access

**All database access must use:**
- ✅ **Prisma Client**

**Avoid:**
- ❌ Raw SQL (unless absolutely required and documented)
- ❌ Direct database connections
- ❌ Query builders outside Prisma

---

## Authentication & Authorization

### Authentication Rules

**Authentication Source:**
- Supabase Auth (mandatory)

**Backend Receives:**
```
Authorization: Bearer <JWT_TOKEN>
```

**JWT Verification:**
- Supabase JWT Verification (built-in)

**Forbidden:**
- ❌ Custom authentication implementation
- ❌ Manual token generation
- ❌ Bypass JWT verification

---

### Authorization Rules

**Roles:**
| Role | Description |
|------|-------------|
| `ADMIN` | Administrator |
| `UMKM` | Business owner |
| `SENIOR` | Mentor/Project lead |
| `BEGINNER` | Learner |

**Authorization Implementation:**
- ✅ Use middleware for role checks
- ✅ Centralized authorization logic

**Forbidden:**
- ❌ Hardcode role checks inside controllers
- ❌ Pass authorization to frontend
- ❌ Trust client-side role information

**Middleware Pattern:**
```typescript
// Route definition
router.post('/projects/:id/approve', 
  authMiddleware,
  roleMiddleware(['ADMIN']),
  controller.approveProject
);
```

---

## Validation & Error Handling

### Validation Rules

**All request validation uses:**
- ✅ **Zod** (only validation library)

**Every endpoint with body data must have:**
- ✅ `POST` - validation schema
- ✅ `PUT` - validation schema
- ✅ `PATCH` - validation schema

**Validation Example:**
```typescript
const createProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  category_id: z.string().uuid(),
  // ... more fields
});
```

---

### API Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

**Rule:** Never return inconsistent response formats.

---

### Error Handling

**Error Handling Architecture:**

```
Request
  ↓
Route Handler (try-catch if necessary)
  ↓
Service/Repository (throw custom errors)
  ↓
Global Error Middleware (catches all)
  ↓
Formatted Error Response
```

**Rules:**
- ✅ Use centralized error handler
- ✅ All errors flow through global middleware
- ✅ Use try-catch only when necessary in controllers
- ✅ Let services throw descriptive errors

**Forbidden:**
- ❌ try-catch in every controller
- ❌ Inline error handling scattered throughout code

---

## State Management & Data Fetching

### Frontend State Management

**State Store Library:**
- ✅ **Zustand** (only state management library)

**Use Zustand for:**
- ✅ Authentication state
- ✅ Notification state
- ✅ Global UI state (modals, sidebars, etc.)

**Do NOT use Zustand for:**
- ❌ Server data (projects, users, etc.)
- ❌ Cached API responses

**Server Data Fetching:**
- ✅ Use React Query / SWR / Fetch API with proper caching
- ✅ Re-fetch when needed
- ✅ Don't store server data in global state

---

## File Upload Rules

**File Upload Implementation:**
- ✅ Use **Supabase Storage**

**Frontend:**
- ✅ Upload directly to Supabase Storage
- ✅ Send file URL to backend

**Backend:**
- ✅ Store only file URL
- ✅ Store only file path

**Forbidden:**
- ❌ Store actual files on backend server
- ❌ Process file uploads through API endpoint
- ❌ Keep files in temporary directories

---

## Features & Constraints

### Query Requirements

**All list endpoints must support:**

| Feature | Parameter | Example |
|---------|-----------|---------|
| Pagination | `?page=` | `?page=1` |
| Limit | `?limit=` | `?limit=10` |
| Search | `?q=` | `?q=web+development` |
| Filtering | `?category=` | `?category=uuid` |

**Example URL:**
```
GET /api/v1/projects?q=ecommerce&category=web-dev&page=1&limit=20
```

---

### Chat Features

**Supported:**
- ✅ Project group discussions
- ✅ Direct messages between users

**NOT Supported (MVP):**
- ❌ Voice calls
- ❌ Video calls
- ❌ File attachments
- ❌ Screen sharing

---

### Notification System

**MVP Scope:**
- ✅ In-app notifications only

**NOT Supported:**
- ❌ Email notifications
- ❌ SMS notifications
- ❌ WhatsApp notifications
- ❌ Push notifications

---

### Artifacts

**Artifact Generation Rules:**

| Constraint | Description |
|-----------|-------------|
| **Scope** | One project → 3 beginners → 3 artifacts |
| **Per** | Artifact generated per beginner |
| **NOT** | One artifact for entire team |
| **Format** | `EDN-2026-XXXXXX` |
| **Versions** | Keep version history on regeneration |

---

## Business Rules

### Project Constraints

**Project Requirements:**
- ✅ Must have **exactly 1 SENIOR** before ACTIVE
- ✅ Cannot be ACTIVE without assigned SENIOR
- ✅ Requires SENIOR acceptance to start

---

### Beginner Constraints

**Beginner Rules:**
- ✅ Can apply to multiple projects
- ❌ **Only 1 ACTIVE project** allowed at any time

**Application Logic:**
```
Beginner Status Check
  ├─ Has ACTIVE project? → Cannot apply
  └─ No ACTIVE project? → Can apply
```

---

### Senior Constraints

**Senior Rules:**
- ⚠️ Maximum **5 ACTIVE projects** simultaneously

**Enforcement:**
```
POST /projects/:id/senior-apply
  ├─ Check senior's ACTIVE projects count
  ├─ If count >= 5 → Reject with error
  └─ If count < 5 → Allow application
```

---

### UMKM Constraints

**UMKM Rules:**
- ⚠️ Maximum **5 ACTIVE projects** simultaneously

**Same enforcement as Senior**

---

### Review Requirements

**Reviews are MANDATORY before:**
- ✅ Project completion

**Review Types:**
| Reviewer | Reviewee | Allowed |
|----------|----------|---------|
| SENIOR | BEGINNER | ✅ |
| UMKM | BEGINNER | ✅ |
| UMKM | SENIOR | ✅ |

**Enforcement:**
```
POST /projects/:id/complete
  ├─ Check all required reviews exist
  ├─ If missing → Reject with error
  └─ If complete → Allow completion
```

---

### Audit Logging

**Must Log (Mandatory):**
- ✅ Verification Approval
- ✅ Verification Rejection
- ✅ Project Approval
- ✅ Project Rejection
- ✅ Member Removal
- ✅ Artifact Generation
- ✅ Artifact Regeneration
- ✅ Project Completion

**Implementation:**
```typescript
// In service layer
await auditLog.create({
  user_id: userId,
  action: 'VERIFICATION_APPROVED',
  entity_type: 'verification_requests',
  entity_id: verificationId,
  metadata: { reason: 'documents valid' }
});
```

---

## Security & Performance

### Database Rules

**ID Types:**
- ✅ Use **UUID everywhere**
- ❌ Never use BIGINT IDs

**Prisma Schema:**
```prisma
model User {
  id String @id @default(uuid()) @db.Uuid
  // ...
}
```

---

### Security Rules

**Before any update/delete operation:**

1. ✅ **Validate Input** - Check data format
2. ✅ **Authorize Access** - Verify user has permission
3. ✅ **Verify Ownership** - Confirm user owns resource

**Security Check Pattern:**
```typescript
// In service
async updateProject(projectId: string, userId: string, data: any) {
  // 1. Validate
  const validated = projectSchema.parse(data);
  
  // 2. Authorize
  const project = await projectRepo.findById(projectId);
  if (project.umkm_id !== userId) {
    throw new UnauthorizedError('Not project owner');
  }
  
  // 3. Update
  return projectRepo.update(projectId, validated);
}
```

---

### Performance Rules

**Avoid N+1 Queries:**

**Bad Pattern:**
```typescript
// ❌ N+1 Query Problem
const projects = await prisma.project.findMany();
const data = projects.map(p => ({
  ...p,
  members: await prisma.projectMember.findMany({
    where: { projectId: p.id }
  })
}));
```

**Good Pattern:**
```typescript
// ✅ Proper Prisma Pattern
const projects = await prisma.project.findMany({
  include: {
    members: true
  }
});
```

**Prisma Best Practices:**
- ✅ Use `include` for relationships
- ✅ Use `select` for specific fields
- ✅ Use `where` for filtering
- ✅ Batch operations when possible

---

## Out of Scope (Locked)

**These features are NOT approved for MVP and must NOT be implemented:**

### Payment & Financial
- ❌ Payment System
- ❌ Escrow
- ❌ Wallet
- ❌ Blockchain

### Community & Portfolio
- ❌ Public Portfolio Pages
- ❌ Certificate Marketplace
- ❌ Achievement System
- ❌ Leaderboard

### Communication
- ❌ WhatsApp Integration
- ❌ Email Notification
- ❌ Video Calls
- ❌ Voice Calls
- ❌ Live Streaming

### Project Management
- ❌ Task Kanban Board
- ❌ Time Tracking
- ❌ Attendance System

### Advanced Features
- ❌ AI Features
- ❌ Multi-Tenant Organizations
- ❌ Multiple Senior Per Project
- ❌ Gamification

### Platforms
- ❌ Mobile Application

**Status:** 🔒 **LOCKED** - Unless explicitly approved in future versions.

---

## Final Authority

### Rule: Documentation Wins

**If any generated code conflicts with:**
- PRD
- ERD
- Database Schema
- API Specification

**Then:**

> ✅ **The Documentation Wins**
>
> Code must be adjusted to follow documentation.

---

### Checklist Before Deployment

- [ ] All code follows layered architecture (Route → Controller → Service → Repository → Prisma)
- [ ] All endpoints have proper request validation (Zod schemas)
- [ ] All business logic is in Service layer
- [ ] All database operations use Prisma
- [ ] All authorization uses middleware
- [ ] All responses follow standard format
- [ ] All errors flow through global error handler
- [ ] All file uploads use Supabase Storage
- [ ] All state management uses Zustand (frontend only)
- [ ] All list endpoints support pagination, search, filtering
- [ ] All required audits are logged
- [ ] No out-of-scope features are implemented
- [ ] All N+1 queries are eliminated
- [ ] Security checks (validate, authorize, verify) implemented

---

*Last Updated: v1.0 - Production Grade*

*This document is the mandatory source of truth for all development.*
