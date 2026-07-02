# EduNomad MVP - RBAC & Business Rules v1.0

## Purpose

This document defines:
- ✅ Role Permissions
- ✅ Access Control
- ✅ Ownership Rules
- ✅ Business Restrictions

**This document is the source of truth for authorization logic.**

---

## Table of Contents
- [Roles & Account Status](#roles--account-status)
- [Global Rules](#global-rules)
- [Role-Based Permissions](#role-based-permissions)
- [Ownership Rules](#ownership-rules)
- [Recruitment Rules](#recruitment-rules)
- [Project Status Rules](#project-status-rules)
- [Business Rules by Feature](#business-rules-by-feature)
- [Conflict Resolution](#conflict-resolution)

---

## Roles & Account Status

### System Roles

| Role | Description | Level |
|------|-------------|-------|
| `ADMIN` | Administrator - Full system access | Highest |
| `UMKM` | Business owner - Project creator | High |
| `SENIOR` | Mentor/Project lead | Medium |
| `BEGINNER` | Learner/Team member | Basic |

### Account Status

| Status | Description | Can Perform Activities |
|--------|-------------|----------------------|
| `PENDING_VERIFICATION` | Awaiting identity verification | Limited (see Rule 2) |
| `VERIFIED` | Account verified and active | ✅ Full access (by role) |
| `REJECTED` | Verification rejected | ❌ No access |
| `SUSPENDED` | Account suspended by admin | ❌ No access |

---

## Global Rules

### Rule 1: Verification Requirement

**Only VERIFIED users may perform project activities.**

**Restricted Actions (Require VERIFIED status):**
- ❌ Apply to Project
- ❌ Apply as Senior
- ❌ Create Project
- ❌ Generate Artifact
- ❌ Review Users

**Enforcement:**
```
if (user.status !== 'VERIFIED') {
  throw new UnverifiedUserError(
    'User must be verified to perform this action'
  );
}
```

---

### Rule 2: Pending Verification Access

**PENDING_VERIFICATION users MAY:**
- ✅ Login
- ✅ Access Dashboard
- ✅ Edit Profile
- ✅ Add Skills
- ✅ Add Experience
- ✅ View Projects

**PENDING_VERIFICATION users CANNOT:**
- ❌ Apply to Project
- ❌ Apply as Senior
- ❌ Create Project

**Use Case:** User can prepare profile while waiting for verification.

---

### Rule 3: Suspended Users

**SUSPENDED users cannot access platform features.**

**Enforcement:**
```
if (user.status === 'SUSPENDED') {
  throw new SuspendedUserError(
    'Account has been suspended'
  );
}
```

---

## Role-Based Permissions

### Admin Permissions

#### Admin CAN:

| Feature | Actions |
|---------|---------|
| User Management | View all users, verify users, reject users, suspend users |
| Project Approval | Approve projects, reject projects |
| Skill Approval | Approve custom skills, reject custom skills |
| Audit & Logs | View audit logs |
| Member Management | Remove members, replace senior |
| Categories | Manage project categories |

#### Admin CANNOT:

| Feature | Why |
|---------|-----|
| Join Projects | Admin role is for management only |
| Apply to Projects | Admin has no participant role |
| Generate Artifacts | Only seniors assigned to project can do this |

---

### UMKM Permissions

#### UMKM CAN:

| Feature | Actions |
|---------|---------|
| Project Management | Create project, edit own project, delete own project |
| Recruitment | Accept senior applications |
| Monitoring | View project progress, approve milestone changes |
| Finalization | Confirm project completion |
| Reviews | Review beginners, review senior |

#### UMKM CANNOT:

| Feature | Why |
|---------|-----|
| Select Beginners | Senior makes acceptance decision |
| Generate Artifacts | Only assigned senior can generate |
| Approve Deliverables | Only senior can approve deliverables |

**UMKM Constraint:** Max **5 ACTIVE projects** (see Business Rules)

---

### Senior Permissions

#### Senior CAN:

| Feature | Actions |
|---------|---------|
| Recruitment | Apply as mentor, accept/reject beginners, manage team |
| Deliverables | Review deliverables, request revisions |
| Contributions | Approve contribution reports |
| Artifacts | Generate artifacts, regenerate artifacts |
| Project Lifecycle | Start project, request completion |
| Communication | Create discussions, send messages |

#### Senior CANNOT:

| Feature | Why |
|---------|-----|
| Create Project | UMKM creates projects |
| Approve Project | Admin approves projects |
| Verify Users | Admin verifies users |
| Accept Other Seniors | Only one senior per project |

**Senior Constraint:** Max **5 ACTIVE projects** (see Business Rules)

---

### Beginner Permissions

#### Beginner CAN:

| Feature | Actions |
|---------|---------|
| Recruitment | Apply to project roles, withdraw application |
| Deliverables | Submit deliverables, edit own deliverables |
| Contributions | Submit contribution reports, edit own reports |
| Communication | Join discussions, send direct messages, view portfolios |

#### Beginner CANNOT:

| Feature | Why |
|---------|-----|
| Approve Deliverables | Senior approves |
| Generate Artifacts | Senior generates |
| Review Users | Senior/UMKM review |
| Create Project | UMKM creates |

**Beginner Constraint:** Max **1 ACTIVE project** (see Business Rules)

---

## Ownership Rules

### Project Ownership

**Project Owner:** `UMKM`

**UMKM (Project Owner) May:**
- ✅ Edit project details
- ✅ Delete project
- ✅ Accept senior application
- ✅ Confirm project completion

**Only Project Owner has access to these operations.**

---

### Senior Ownership

**Senior Assignment:** Project-specific

**Assigned Senior May:**
- ✅ Review deliverables
- ✅ Approve contributions
- ✅ Manage recruitment (accept/reject beginners)
- ✅ Generate artifacts for project

**Other Seniors Have NO Access:**
- ❌ Cannot review or approve deliverables
- ❌ Cannot manage team
- ❌ Cannot access project-specific features

**Enforcement:**
```typescript
// Verify senior is assigned to project
const project = await projectRepo.findById(projectId);
if (project.senior_id !== userId) {
  throw new UnauthorizedError(
    'Only assigned senior can perform this action'
  );
}
```

---

### Beginner Ownership

**Beginner Resources:** Deliverables & Contributions

**Beginner May Edit:**
- ✅ Own deliverables
- ✅ Own contribution reports

**Beginner CANNOT Edit:**
- ❌ Other beginner's deliverables
- ❌ Other beginner's contributions

**Enforcement:**
```typescript
// Verify beginner owns the resource
const deliverable = await deliverableRepo.findById(id);
if (deliverable.submitted_by !== userId) {
  throw new UnauthorizedError(
    'Can only edit own deliverables'
  );
}
```

---

## Recruitment Rules

### Senior Application Flow

```
SENIOR APPLIES
    ↓
UMKM Reviews Application
    ↓
UMKM Accepts/Rejects
    ↓
(Only UMKM decides)
```

**Rules:**
- ✅ Senior initiates by applying
- ✅ UMKM has full control over acceptance
- ✅ Project can have only 1 senior
- ✅ Senior acceptance required before project starts

---

### Beginner Application Flow

```
BEGINNER APPLIES
    ↓
SENIOR Reviews Application
    ↓
SENIOR Accepts/Rejects
    ↓
(Only SENIOR decides)
```

**Rules:**
- ✅ Beginner initiates by applying
- ✅ Senior has full control over acceptance
- ✅ UMKM only sees results (no direct control)
- ✅ Multiple beginners can join same project

---

## Project Status Rules

### DRAFT Status

**Allowed Actions:**
- ✅ Edit project details
- ✅ Delete project
- ✅ Change status (by admin/owner)

**Not Allowed:**
- ❌ Senior applications
- ❌ Beginner applications
- ❌ Modify team members

---

### PENDING_REVIEW Status

**Allowed Actions:**
- ✅ Admin reviews project
- ✅ Admin approves/rejects

**Not Allowed:**
- ❌ Recruitment (applications blocked)
- ❌ Team modifications

---

### RECRUITING Status

**Allowed Actions:**
- ✅ Senior applications accepted
- ✅ Beginner applications accepted
- ✅ Team building phase

**Not Allowed:**
- ❌ Deliverable submissions
- ❌ Contributions
- ❌ Project start

---

### ACTIVE Status

**Allowed Actions:**
- ✅ Deliverable submissions
- ✅ Discussions
- ✅ Contribution reports
- ✅ Reviews

**Not Allowed:**
- ❌ New applications (recruitment closed)
- ❌ Team modifications

---

### COMPLETED Status

**Status:** 🔒 **READ-ONLY**

**Allowed:**
- ✅ View project data
- ✅ View deliverables
- ✅ View reviews

**Not Allowed:**
- ❌ Any modifications
- ❌ New deliverables
- ❌ New discussions
- ❌ Any state changes

---

## Business Rules by Feature

### Beginner Business Rules

#### Rule: Single Active Project

**Constraint:**
> Beginner may apply to many projects but may only belong to **ONE ACTIVE project**.

**System Must Block:**
- ❌ Apply to new project if already ACTIVE
- ❌ Accept application if already ACTIVE
- ❌ Join team if already ACTIVE

**Enforcement:**
```typescript
async checkBeginnerActiveProjects(beginnerId: string) {
  const activeProjects = await projectMemberRepo.findMany({
    where: {
      user_id: beginnerId,
      status: 'ACTIVE'
    }
  });
  
  if (activeProjects.length > 0) {
    throw new BusinessRuleError(
      'Beginner already assigned to 1 ACTIVE project'
    );
  }
}
```

---

### Senior Business Rules

#### Rule: Maximum 5 Active Projects

**Constraint:**
> Senior can have maximum **5 ACTIVE projects**.

**System Must:**
- ✅ Count senior's ACTIVE projects
- ✅ Reject new acceptance if count >= 5
- ✅ Allow acceptance if count < 5

**Enforcement:**
```typescript
async checkSeniorActiveProjects(seniorId: string) {
  const activeProjects = await projectRepo.findMany({
    where: {
      senior_id: seniorId,
      status: 'ACTIVE'
    }
  });
  
  if (activeProjects.length >= 5) {
    throw new BusinessRuleError(
      'Senior has reached maximum 5 ACTIVE projects'
    );
  }
}
```

---

### UMKM Business Rules

#### Rule: Maximum 5 Active Projects

**Constraint:**
> UMKM can have maximum **5 ACTIVE projects**.

**System Must:**
- ✅ Prevent project activation above limit
- ✅ Count UMKM's ACTIVE projects before starting

**Enforcement:**
```typescript
async checkUMKMActiveProjects(umkmId: string) {
  const activeProjects = await projectRepo.findMany({
    where: {
      umkm_id: umkmId,
      status: 'ACTIVE'
    }
  });
  
  if (activeProjects.length >= 5) {
    throw new BusinessRuleError(
      'UMKM has reached maximum 5 ACTIVE projects'
    );
  }
}
```

---

### Deliverable Rules

**Who Can Submit:**
- ✅ Only project members (assigned beginners)

**Deliverable Owner:**
- Assignment: The beginner who submitted it

**Senior Actions:**
- ✅ Approve deliverable
- ✅ Request revision

**Status Workflow:**
```
DRAFT
  ↓ (submit)
SUBMITTED
  ↓
├─ APPROVED (by senior)
└─ REVISION_REQUESTED (by senior)
```

---

### Contribution Rules

**Who Can Submit:**
- ✅ Only assigned beginner
- ✅ After project completion phase

**Who Can Approve:**
- ✅ Only assigned senior

**Cannot Submit Multiple Times:**
- ❌ One contribution report per beginner per project

---

### Review Rules

**When Required:**
- ✅ Mandatory before project completion

**Review Types:**

| Reviewer | Reviewee | Allowed |
|----------|----------|---------|
| SENIOR | BEGINNER | ✅ Yes |
| UMKM | BEGINNER | ✅ Yes |
| UMKM | SENIOR | ✅ Yes |

**Review Properties:**
- ✅ Rating: 1-5 (integer)
- ✅ Public: Reviewee can see review
- ✅ Editable: Before project closure only

**Cannot Edit After:**
- ❌ Project completion is finalized

---

### Artifact Rules

**Who Can Generate:**
- ✅ Only assigned senior

**Generation Scope:**
- ✅ One beginner → one artifact
- ❌ Not per team (one artifact for multiple)

**Regeneration:**
- ✅ Allowed by assigned senior
- ✅ Previous versions kept
- ✅ Version number incremented

**Verification:**
- ✅ Public verification URL required
- ✅ Anyone can verify artifact code

**Artifact status (added 2026-07-02, D-P8-4):**
- Artifact records stay IMMUTABLE (no status column). The "Artifact Saya" page
  statuses — Terverifikasi / Siap Diterbitkan / Dalam Proses — are DERIVED per
  project from existing contribution / review / artifact data, not stored.
  "Ditolak" has no data model and is always empty.

**Public Portfolio (PLANNED — deferred to its own phase, D-P8-5):**
- Not built yet. Artifact pages only link placeholder buttons to the future
  `/portfolio/:id` route. When built: read-only profile + skills + experiences +
  links + issued artifacts; anyone can view; no email/private data exposed.

---

### Discussion Rules

#### Group Discussions

**Access:** Project members only

**Rules:**
- ✅ Only project members can access
- ✅ Assigned senior auto-included
- ✅ Accepted beginners included

**Phase 12 (Discussion Forum Upgrade — user-approved) additions:**
- ✅ Create a discussion topic (title + category): **senior lead or UMKM owner only** (beginners post messages/replies, not new topics)
- ✅ Pin / unpin a topic: **senior lead or UMKM owner only** (`POST /discussions/:id/pin`)
- ✅ Reply to a message (12.2), react to a message (12.3), attach file/image/link (12.4): **any discussion member**
- ✅ Topic categories: `ANNOUNCEMENT|QUESTION|IDEA|BLOCKER|MENTOR_REVIEW|UPDATE`

#### Direct Messages

**Access:** Project members ↔ Senior

**Rules:**
- ✅ Send DM between project members
- ✅ Send DM between member and senior

**Not Supported:**
- ❌ ~~File attachments (MVP)~~ — **superseded by Phase 12.4** (forum upgrade): file/image/link attachments supported on discussion messages via Supabase Storage. (DM attachments remain optional/out-of-scope; forum group messages only.)
- ❌ Group voice/video calls

---

### Portfolio Rules

**Visibility:**
- ✅ Visible to authenticated users only
- ❌ Not public

**Access:**
- ✅ Login required to view portfolio
- ✅ Can view any user's portfolio (if logged in)

**Portfolio Includes:**
- ✅ Experiences
- ✅ Skills
- ✅ Portfolio links (GitHub, Figma, etc.)

---

### Verification Rules

#### Beginner Verification

**Requirements:**
- ✅ Identity check
- ✅ Profile completeness

**Admin Review:**
- ✅ Verify name, email, phone
- ✅ Check profile has headline and bio
- ✅ Approve or reject

#### Senior Verification

**Requirements:**
- ✅ Identity check
- ✅ LinkedIn profile
- ✅ CV/Resume
- ✅ Experience evidence

**Admin Review:**
- ✅ Verify credentials
- ✅ Check LinkedIn profile exists
- ✅ Review CV quality
- ✅ Approve or reject

#### UMKM Verification

**Requirements:**
- ✅ Basic business authenticity check
- ❌ No formal business registration verification in MVP

**Admin Review:**
- ✅ Basic identity verification
- ✅ Verify business description
- ✅ Approve or reject

---

## Conflict Resolution

### Resolution Priority

**If authorization rules conflict, follow this priority:**

1. **RBAC Rules** (This document - highest priority)
2. **PRD** (Product Requirements)
3. **API Specification**
4. **Implementation** (lowest priority)

```
RBAC Rules (Priority 1)
    ↓
PRD (Priority 2)
    ↓
API Spec (Priority 3)
    ↓
Implementation (Priority 4)
```

**Rule:** Implementation must follow this document (RBAC Rules).

---

## Authorization Middleware Pattern

### Recommended Implementation

```typescript
// Middleware stack for protected endpoints
router.post('/projects/:id/approve',
  authMiddleware,              // Verify JWT token
  roleMiddleware(['ADMIN']),   // Verify role
  ownershipMiddleware,         // Verify ownership/assignment
  verificationMiddleware,      // Verify account status
  controller.approveProject    // Handle request
);
```

### Middleware Functions

```typescript
// Role Check
const roleMiddleware = (allowedRoles: string[]) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  }
};

// Ownership Check
const ownershipMiddleware = async (req, res, next) => {
  const resource = await findResource(req.params.id);
  if (resource.owner_id !== req.user.id) {
    throw new UnauthorizedError('Not resource owner');
  }
  next();
};

// Verification Check
const verificationMiddleware = (req, res, next) => {
  if (req.user.status !== 'VERIFIED') {
    throw new UnverifiedUserError('Account not verified');
  }
  next();
};
```

---

## Permission Matrix Summary

### Quick Reference

| Action | ADMIN | UMKM | SENIOR | BEGINNER |
|--------|-------|------|--------|----------|
| Create Project | ❌ | ✅ | ❌ | ❌ |
| Edit Own Project | ❌ | ✅ | ❌ | ❌ |
| Approve Project | ✅ | ❌ | ❌ | ❌ |
| Apply as Senior | ❌ | ❌ | ✅ | ❌ |
| Accept Senior | ❌ | ✅ | ❌ | ❌ |
| Apply to Role | ❌ | ❌ | ❌ | ✅ |
| Accept Beginner | ❌ | ❌ | ✅ | ❌ |
| Submit Deliverable | ❌ | ❌ | ❌ | ✅ |
| Approve Deliverable | ❌ | ❌ | ✅ | ❌ |
| Generate Artifact | ❌ | ❌ | ✅ | ❌ |
| Review Beginner | ✅* | ✅ | ✅ | ❌ |
| Review Senior | ❌ | ✅ | ❌ | ❌ |
| Verify User | ✅ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ❌ | ❌ | ❌ |

*Admin can view all reviews but typically doesn't review

---

## Implementation Checklist

- [ ] All role checks implemented via middleware
- [ ] Account status verified before sensitive actions
- [ ] Ownership verified before update/delete
- [ ] Senior assignment verified for project-specific actions
- [ ] Beginner active project limit enforced
- [ ] Senior 5-project limit enforced
- [ ] UMKM 5-project limit enforced
- [ ] Reviews required before completion enforced
- [ ] Artifacts generated per beginner (not team)
- [ ] Deliverables only submittable by members
- [ ] Contributions only submittable by assigned beginner
- [ ] Portfolio only visible to authenticated users
- [ ] Verification status checked for restricted actions
- [ ] Project status controls allowed actions
- [ ] No hardcoded role checks in controllers
- [ ] Centralized authorization logic

---

*Last Updated: v1.0 - Production Grade*

*This document is mandatory for all authorization implementation.*
