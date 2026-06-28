# EduNomad MVP - API Specification Production Grade v1.0

## Table of Contents
- [Overview](#overview)
- [Authentication & Authorization](#authentication--authorization)
- [Response Format](#response-format)
- [Endpoints](#endpoints)
  - [Auth Endpoints](#auth-endpoints)
  - [User Endpoints](#user-endpoints)
  - [User Skills Endpoints](#user-skills-endpoints)
  - [Experience Endpoints](#experience-endpoints)
  - [Portfolio Links Endpoints](#portfolio-links-endpoints)
  - [Project Categories Endpoints](#project-categories-endpoints)
  - [Projects Endpoints](#projects-endpoints)
  - [Project Milestones Endpoints](#project-milestones-endpoints)
  - [Project Roles Endpoints](#project-roles-endpoints)
  - [Senior Applications Endpoints](#senior-applications-endpoints)
  - [Beginner Applications Endpoints](#beginner-applications-endpoints)
  - [Project Members Endpoints](#project-members-endpoints)
  - [Project Lifecycle Endpoints](#project-lifecycle-endpoints)
  - [Discussions Endpoints](#discussions-endpoints)
  - [Direct Messages Endpoints](#direct-messages-endpoints)
  - [Deliverables Endpoints](#deliverables-endpoints)
  - [Contributions Endpoints](#contributions-endpoints)
  - [Artifacts Endpoints](#artifacts-endpoints)
  - [Reviews Endpoints](#reviews-endpoints)
  - [Notifications Endpoints](#notifications-endpoints)
  - [Verification Endpoints](#verification-endpoints)
  - [Admin Endpoints](#admin-endpoints)
- [Business Rules](#business-rules)

---

## Overview

### API Architecture
- **Type:** REST API
- **Base URL:** `/api/v1`
- **Authentication:** Supabase JWT
- **Content-Type:** application/json

### Authorization Roles

| Role | Description |
|------|-------------|
| `ADMIN` | Administrator with full system access |
| `UMKM` | Business/Project creator |
| `SENIOR` | Mentor/Project lead |
| `BEGINNER` | Learner/Team member |

---

## Authentication & Authorization

### Authentication Method

All protected routes require a valid **Supabase JWT token** in the request header:

```
Authorization: Bearer <jwt_token>
```

### Authorization

Role-based authorization is enforced via middleware. Each endpoint specifies required role(s).

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

### Paginated Response

**Query Parameters:**
```
?page=1&limit=10
```

**Response:**
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "lastPage": 10
  }
}
```

---

## Endpoints

### Auth Endpoints

#### Get Current User
```
GET /auth/me
```

**Access:** Public  
**Description:** Get current authenticated user information.  
**Response:** User object

---

#### Logout
```
POST /auth/logout
```

**Access:** Public  
**Description:** Logout current user and invalidate session.  
**Response:** Success message

---

### User Endpoints

#### Get My Profile
```
GET /users/me
```

**Access:** Authenticated  
**Description:** Get authenticated user's profile.  
**Response:** User profile object

---

#### Update My Profile
```
PUT /users/me
```

**Access:** Authenticated  
**Description:** Update authenticated user's profile information.  
**Body:**
```json
{
  "name": "string",
  "phone": "string",
  "photo": "string",
  "headline": "string",
  "bio": "string",
  "linkedin_url": "string"
}
```
**Response:** Updated user profile

---

#### Get User Profile
```
GET /users/:id
```

**Access:** Authenticated  
**Description:** Get another user's profile information.  
**Response:** User profile object

---

#### Get User Portfolio
```
GET /users/:id/portfolio
```

**Access:** Authenticated (Login required)  
**Description:** Get user's portfolio information.  
**Response:** Portfolio object with links and experiences

---

### User Skills Endpoints

#### Get Master Skills
```
GET /skills
```

**Access:** Public  
**Description:** Get list of all available master skills.  
**Query Parameters:**
- `?category=string` - Filter by category
- `?status=string` - Filter by status (PENDING, APPROVED, REJECTED)
- `?page=1&limit=10` - Pagination

**Response:** Paginated list of skills

---

#### Add User Skill
```
POST /users/me/skills
```

**Access:** Authenticated  
**Description:** Add a new skill to user's profile.  
**Body:**
```json
{
  "skill_id": "uuid",
  "level": "BEGINNER|INTERMEDIATE|ADVANCED"
}
```
**Response:** Created user skill object

---

#### Update Skill Level
```
PUT /users/me/skills/:id
```

**Access:** Authenticated  
**Description:** Update proficiency level for a skill.  
**Body:**
```json
{
  "level": "BEGINNER|INTERMEDIATE|ADVANCED"
}
```
**Response:** Updated user skill object

---

#### Delete User Skill
```
DELETE /users/me/skills/:id
```

**Access:** Authenticated  
**Description:** Remove a skill from user's profile.  
**Response:** Success message

---

### Experience Endpoints

#### Get My Experiences
```
GET /users/me/experiences
```

**Access:** Authenticated  
**Description:** Get authenticated user's work experiences.  
**Response:** List of experience objects

---

#### Create Experience
```
POST /users/me/experiences
```

**Access:** Authenticated  
**Description:** Add new work experience.  
**Body:**
```json
{
  "title": "string",
  "organization": "string",
  "description": "string",
  "start_date": "date",
  "end_date": "date|null"
}
```
**Response:** Created experience object

---

#### Update Experience
```
PUT /users/me/experiences/:id
```

**Access:** Authenticated  
**Description:** Update work experience.  
**Body:** Same as create  
**Response:** Updated experience object

---

#### Delete Experience
```
DELETE /users/me/experiences/:id
```

**Access:** Authenticated  
**Description:** Delete work experience.  
**Response:** Success message

---

### Portfolio Links Endpoints

#### Get My Portfolio Links
```
GET /users/me/portfolio-links
```

**Access:** Authenticated  
**Description:** Get authenticated user's portfolio links.  
**Response:** List of portfolio link objects

---

#### Create Portfolio Link
```
POST /users/me/portfolio-links
```

**Access:** Authenticated  
**Description:** Add new portfolio/social media link.  
**Body:**
```json
{
  "title": "string",
  "url": "string",
  "type": "GITHUB|FIGMA|BEHANCE|LINKEDIN|OTHER"
}
```
**Response:** Created portfolio link object

---

#### Update Portfolio Link
```
PUT /users/me/portfolio-links/:id
```

**Access:** Authenticated  
**Description:** Update portfolio link.  
**Body:** Same as create  
**Response:** Updated portfolio link object

---

#### Delete Portfolio Link
```
DELETE /users/me/portfolio-links/:id
```

**Access:** Authenticated  
**Description:** Delete portfolio link.  
**Response:** Success message

---

### Project Categories Endpoints

#### Get Categories
```
GET /categories
```

**Access:** Public  
**Description:** Get all project categories.  
**Query Parameters:**
- `?page=1&limit=10` - Pagination

**Response:** Paginated list of categories

---

### Projects Endpoints

#### Get Projects List
```
GET /projects
```

**Access:** Public  
**Description:** Get list of all projects with filters.  
**Query Parameters:**
- `?q=string` - Search query
- `?category=uuid` - Filter by category
- `?status=string` - Filter by status
- `?page=1&limit=10` - Pagination

**Response:** Paginated list of projects

---

#### Get Project Detail
```
GET /projects/:id
```

**Access:** Public  
**Description:** Get detailed information about a specific project.  
**Response:** Project object with all details

---

#### Create Project
```
POST /projects
```

**Access:** UMKM  
**Description:** Create a new project.  
**Body:**
```json
{
  "category_id": "uuid",
  "title": "string",
  "description": "string",
  "expected_deliverables": "string",
  "start_date": "date",
  "deadline": "date"
}
```
**Response:** Created project object

---

#### Edit Project
```
PUT /projects/:id
```

**Access:** UMKM (Owner)  
**Description:** Edit project information.  
**Body:** Same as create  
**Response:** Updated project object

---

#### Delete Project
```
DELETE /projects/:id
```

**Access:** UMKM (Owner)  
**Description:** Soft delete project.  
**Response:** Success message

---

#### Get My Projects
```
GET /my-projects
```

**Access:** UMKM  
**Description:** Get all projects created by authenticated UMKM.  
**Query Parameters:**
- `?status=string` - Filter by status
- `?page=1&limit=10` - Pagination

**Response:** Paginated list of user's projects

---

### Project Milestones Endpoints

#### Get Project Milestones
```
GET /projects/:id/milestones
```

**Access:** Authenticated  
**Description:** Get all milestones for a project.  
**Response:** List of milestone objects

---

#### Create Milestone
```
POST /projects/:id/milestones
```

**Access:** SENIOR (Project lead)  
**Description:** Create new project milestone.  
**Body:**
```json
{
  "title": "string",
  "description": "string",
  "due_date": "date"
}
```
**Response:** Created milestone object

---

#### Update Milestone
```
PUT /milestones/:id
```

**Access:** SENIOR (Project lead)  
**Description:** Update milestone information.  
**Body:** Same as create  
**Response:** Updated milestone object

---

#### Delete Milestone
```
DELETE /milestones/:id
```

**Access:** SENIOR (Project lead)  
**Description:** Delete milestone.  
**Response:** Success message

---

### Project Roles Endpoints

#### Get Project Roles
```
GET /projects/:id/roles
```

**Access:** Authenticated  
**Description:** Get all roles available for a project.  
**Response:** List of project role objects

---

#### Create Role
```
POST /projects/:id/roles
```

**Access:** UMKM (Project owner)  
**Description:** Create new project role.  
**Body:**
```json
{
  "role_name": "string",
  "capacity": "integer",
  "requirements": "string",
  "skills": ["uuid"]
}
```
**Response:** Created project role object

---

#### Update Role
```
PUT /roles/:id
```

**Access:** UMKM (Project owner)  
**Description:** Update role information.  
**Body:** Same as create  
**Response:** Updated project role object

---

#### Delete Role
```
DELETE /roles/:id
```

**Access:** UMKM (Project owner)  
**Description:** Delete project role.  
**Response:** Success message

---

### Senior Applications Endpoints

#### Apply as Mentor
```
POST /projects/:id/senior-apply
```

**Access:** SENIOR  
**Description:** Apply to be mentor for a project.  
**Body:**
```json
{
  "message": "string"
}
```
**Response:** Created senior application object

---

#### Withdraw Senior Application
```
DELETE /senior-applications/:id
```

**Access:** SENIOR (Applicant)  
**Description:** Withdraw senior application.  
**Response:** Success message

---

#### Get Senior Applications
```
GET /projects/:id/senior-applications
```

**Access:** UMKM (Project owner)  
**Description:** Get list of senior applications for a project.  
**Response:** List of senior application objects

---

#### Accept Senior Application
```
POST /senior-applications/:id/accept
```

**Access:** UMKM (Project owner)  
**Description:** Accept senior application and assign mentor.  
**Response:** Updated application object with status ACCEPTED

---

#### Reject Senior Application
```
POST /senior-applications/:id/reject
```

**Access:** UMKM (Project owner)  
**Description:** Reject senior application.  
**Response:** Updated application object with status REJECTED

---

### Beginner Applications Endpoints

#### Apply to Role
```
POST /projects/:id/apply
```

**Access:** BEGINNER  
**Description:** Apply to a project role.  
**Body:**
```json
{
  "project_role_id": "uuid",
  "motivation": "string"
}
```
**Response:** Created beginner application object

---

#### Withdraw Application
```
DELETE /applications/:id
```

**Access:** BEGINNER (Applicant)  
**Description:** Withdraw application from project.  
**Response:** Success message

---

#### Get Project Applicants
```
GET /projects/:id/applications
```

**Access:** SENIOR (Project lead)  
**Description:** Get list of beginner applicants for a project.  
**Response:** List of beginner application objects

---

#### Accept Application
```
POST /applications/:id/accept
```

**Access:** SENIOR (Project lead)  
**Description:** Accept beginner application.  
**Response:** Updated application object with status ACCEPTED

---

#### Reject Application
```
POST /applications/:id/reject
```

**Access:** SENIOR (Project lead)  
**Description:** Reject beginner application.  
**Response:** Updated application object with status REJECTED

---

### Project Members Endpoints

#### Get Project Members
```
GET /projects/:id/members
```

**Access:** Authenticated  
**Description:** Get all members of a project.  
**Response:** List of project member objects

---

#### Request Member Removal
```
POST /members/:id/remove
```

**Access:** SENIOR (Project lead)  
**Description:** Request removal of team member (requires admin approval).  
**Body:**
```json
{
  "reason": "string"
}
```
**Response:** Removal request object

---

#### Withdraw from Project
```
POST /members/:id/withdraw
```

**Access:** Authenticated (Member)  
**Description:** Voluntarily leave project.  
**Response:** Success message

---

### Project Lifecycle Endpoints

#### Start Project
```
POST /projects/:id/start
```

**Access:** SENIOR (Project lead)  
**Description:** Transition project from RECRUITING to ACTIVE status.  
**Response:** Updated project object with status ACTIVE

---

#### Request Completion
```
POST /projects/:id/complete
```

**Access:** SENIOR (Project lead)  
**Description:** Request project completion (requires reviews and UMKM confirmation).  
**Response:** Updated project object with completion timestamp

---

#### Confirm Project Completion
```
POST /projects/:id/confirm-completion
```

**Access:** UMKM (Project owner)  
**Description:** Finalize project completion.  
**Response:** Updated project object with status COMPLETED

---

### Discussions Endpoints

#### Get Project Discussions
```
GET /projects/:id/discussions
```

**Access:** Authenticated  
**Description:** Get all group discussions for a project.  
**Response:** List of discussion objects

---

#### Create Group Discussion
```
POST /projects/:id/discussions
```

**Access:** Senior lead or UMKM owner (Phase 12)  
**Description:** Create new group discussion (forum topic) for project.  
**Body (Phase 12 — `title` + `category` now required & persisted):**
```json
{
  "title": "string (3–255)",
  "category": "ANNOUNCEMENT|QUESTION|IDEA|BLOCKER|MENTOR_REVIEW|UPDATE",
  "members": ["uuid"]
}
```
**Response:** Created discussion object

---

#### Pin / Unpin Discussion (Phase 12)
```
POST /discussions/:id/pin
```

**Access:** Senior lead or UMKM owner  
**Description:** Pin or unpin a forum topic (pinned topics sort first).  
**Body:**
```json
{ "pinned": true }
```
**Response:** Updated discussion object

> **Phase 12 (Discussion Forum Upgrade — user-approved) roadmap of new endpoints:**
> 12.2 `POST /discussions/:id/messages` accepts optional `parent_id` (threaded reply);
> 12.3 `POST /messages/:id/reactions` + `DELETE /messages/:id/reactions` (toggle);
> 12.4 `POST /messages/:id/attachments` (+ Supabase Storage signed upload) and
> attachments embedded in message payloads; 12.5 `POST /discussions/:id/view` (track unique views).

---

#### Get Discussion Messages
```
GET /discussions/:id/messages
```

**Access:** Authenticated  
**Description:** Get all messages in a discussion.  
**Query Parameters:**
- `?page=1&limit=20` - Pagination

**Response:** Paginated list of discussion messages

---

#### Send Message to Discussion
```
POST /discussions/:id/messages
```

**Access:** Authenticated  
**Description:** Send message to group discussion.  
**Body:**
```json
{
  "message": "string"
}
```
**Response:** Created message object

---

### Direct Messages Endpoints

#### Create/Get Direct Chat
```
POST /users/:id/direct-chat
```

**Access:** Authenticated  
**Description:** Create new direct message conversation or get existing one.  
**Response:** Direct chat object

---

#### Get Direct Chat Messages
```
GET /direct-chat/:id/messages
```

**Access:** Authenticated  
**Description:** Get all messages in direct chat.  
**Query Parameters:**
- `?page=1&limit=20` - Pagination

**Response:** Paginated list of messages

---

#### Send Direct Message
```
POST /direct-chat/:id/messages
```

**Access:** Authenticated  
**Description:** Send message in direct chat.  
**Body:**
```json
{
  "message": "string"
}
```
**Response:** Created message object

---

### Deliverables Endpoints

#### Get Project Deliverables
```
GET /projects/:id/deliverables
```

**Access:** Authenticated  
**Description:** Get all deliverables for a project.  
**Response:** List of deliverable objects

---

#### Create Deliverable
```
POST /projects/:id/deliverables
```

**Access:** BEGINNER (Team member)  
**Description:** Create new deliverable for project.  
**Body:**
```json
{
  "title": "string",
  "description": "string"
}
```
**Response:** Created deliverable object with status DRAFT

---

#### Update Deliverable
```
PUT /deliverables/:id
```

**Access:** BEGINNER (Creator)  
**Description:** Update deliverable information.  
**Body:** Same as create  
**Response:** Updated deliverable object

---

#### Submit Deliverable
```
POST /deliverables/:id/submit
```

**Access:** BEGINNER (Creator)  
**Description:** Submit deliverable for review.  
**Body:**
```json
{
  "evidences": [
    {
      "type": "LINK|FILE",
      "url": "string",
      "file_path": "string"
    }
  ]
}
```
**Response:** Updated deliverable object with status SUBMITTED

---

#### Approve Deliverable
```
POST /deliverables/:id/approve
```

**Access:** SENIOR (Project lead)  
**Description:** Approve submitted deliverable.  
**Response:** Updated deliverable object with status APPROVED

---

#### Request Deliverable Revision
```
POST /deliverables/:id/request-revision
```

**Access:** SENIOR (Project lead)  
**Description:** Request revisions on deliverable.  
**Body:**
```json
{
  "feedback": "string"
}
```
**Response:** Updated deliverable object with status REVISION_REQUESTED

---

### Contributions Endpoints

#### Submit Contribution Report
```
POST /projects/:id/contributions
```

**Access:** BEGINNER (Team member)  
**Description:** Submit contribution report after project.  
**Body:**
```json
{
  "contribution_summary": "string",
  "skills": ["uuid"]
}
```
**Response:** Created contribution report object with status PENDING

---

#### Update Contribution Report
```
PUT /contributions/:id
```

**Access:** BEGINNER (Creator)  
**Description:** Update contribution report.  
**Body:** Same as create  
**Response:** Updated contribution report object

---

#### Approve Contribution
```
POST /contributions/:id/approve
```

**Access:** SENIOR (Project lead)  
**Description:** Approve beginner's contribution report.  
**Response:** Updated contribution report object with status APPROVED

---

### Artifacts Endpoints

#### Generate Artifact
```
POST /projects/:id/generate-artifacts
```

**Access:** SENIOR (Project lead)  
**Description:** Generate artifact certificates for beginners.  
**Body:**
```json
{
  "beginner_ids": ["uuid"],
  "verification_url": "string"
}
```
**Response:** List of created artifact objects

---

#### Regenerate Artifact
```
POST /artifacts/:id/regenerate
```

**Access:** SENIOR (Project lead)  
**Description:** Regenerate artifact (keeps version history).  
**Body:**
```json
{
  "verification_url": "string"
}
```
**Response:** Updated artifact object with new version

---

#### Get Artifact Detail
```
GET /artifacts/:id
```

**Access:** Authenticated  
**Description:** Get artifact certificate details.  
**Response:** Artifact object with all versions

---

#### Download Artifact PDF
```
GET /artifacts/:id/download
```

**Access:** Authenticated  
**Description:** Download artifact as PDF.  
**Response:** PDF file (binary)

---

#### Verify Artifact
```
GET /verify/:artifactCode
```

**Access:** Public  
**Description:** Verify artifact authenticity using artifact code.  
**Response:** Artifact verification object with status

---

### Reviews Endpoints

#### Review Beginner (by Senior)
```
POST /projects/:id/reviews/beginner
```

**Access:** SENIOR (Project lead)  
**Description:** Review beginner performance in project.  
**Body:**
```json
{
  "reviewee_id": "uuid",
  "rating": "1-5",
  "comment": "string"
}
```
**Response:** Created review object

---

#### Review Beginner (by UMKM)
```
POST /projects/:id/reviews/beginner
```

**Access:** UMKM (Project owner)  
**Description:** Review beginner performance in project.  
**Body:** Same as senior review  
**Response:** Created review object

---

#### Review Senior
```
POST /projects/:id/reviews/senior
```

**Access:** UMKM (Project owner)  
**Description:** Review senior/mentor performance.  
**Body:**
```json
{
  "rating": "1-5",
  "comment": "string"
}
```
**Response:** Created review object

---

#### Edit Review
```
PUT /reviews/:id
```

**Access:** Authenticated (Reviewer)  
**Description:** Edit review before project closure.  
**Body:**
```json
{
  "rating": "1-5",
  "comment": "string"
}
```
**Response:** Updated review object with edited_at timestamp

---

### Notifications Endpoints

#### Get Notifications
```
GET /notifications
```

**Access:** Authenticated  
**Description:** Get all notifications for authenticated user.  
**Query Parameters:**
- `?is_read=boolean` - Filter by read status
- `?page=1&limit=10` - Pagination

**Response:** Paginated list of notifications

---

#### Mark Notification as Read
```
POST /notifications/:id/read
```

**Access:** Authenticated  
**Description:** Mark single notification as read.  
**Response:** Updated notification object

---

#### Mark All Notifications as Read
```
POST /notifications/read-all
```

**Access:** Authenticated  
**Description:** Mark all notifications as read.  
**Response:** Success message with count

---

### Verification Endpoints

#### Get Verification Status
```
GET /verification-status
```

**Access:** Authenticated  
**Description:** Get current user's verification status.  
**Response:** Verification status object

---

#### Submit Verification Request
```
POST /verification-request
```

**Access:** Authenticated  
**Description:** Submit account verification request.  
**Body:**
```json
{
  "portfolio_url": "string",
  "experience_years": "integer",
  "additional_info": "string"
}
```
**Response:** Created verification request object with status PENDING

---

### Admin Endpoints

#### Get Admin Dashboard
```
GET /admin/dashboard
```

**Access:** ADMIN  
**Description:** Get dashboard statistics and summary.  
**Response:** Dashboard object with metrics

---

#### Get Pending Verifications
```
GET /admin/verifications
```

**Access:** ADMIN  
**Description:** Get list of pending user verification requests.  
**Query Parameters:**
- `?status=PENDING|APPROVED|REJECTED`
- `?page=1&limit=10` - Pagination

**Response:** Paginated list of verification requests

---

#### Approve Verification
```
POST /admin/verifications/:id/approve
```

**Access:** ADMIN  
**Description:** Approve user verification request.  
**Response:** Updated verification request with status APPROVED

---

#### Reject Verification
```
POST /admin/verifications/:id/reject
```

**Access:** ADMIN  
**Description:** Reject user verification request.  
**Body:**
```json
{
  "reason": "string"
}
```
**Response:** Updated verification request with status REJECTED

---

#### Get Pending Skills
```
GET /admin/skills/pending
```

**Access:** ADMIN  
**Description:** Get list of pending custom skills awaiting approval.  
**Query Parameters:**
- `?page=1&limit=10` - Pagination

**Response:** Paginated list of pending skills

---

#### Approve Skill
```
POST /admin/skills/:id/approve
```

**Access:** ADMIN  
**Description:** Approve custom skill for master skill database.  
**Response:** Updated skill object with status APPROVED

---

#### Reject Skill
```
POST /admin/skills/:id/reject
```

**Access:** ADMIN  
**Description:** Reject custom skill submission.  
**Body:**
```json
{
  "reason": "string"
}
```
**Response:** Updated skill object with status REJECTED

---

#### Get Pending Projects
```
GET /admin/projects/pending
```

**Access:** ADMIN  
**Description:** Get list of projects awaiting approval.  
**Query Parameters:**
- `?page=1&limit=10` - Pagination

**Response:** Paginated list of pending projects

---

#### Approve Project
```
POST /admin/projects/:id/approve
```

**Access:** ADMIN  
**Description:** Approve project and change status to PUBLISHED.  
**Response:** Updated project object with status PUBLISHED

---

#### Reject Project
```
POST /admin/projects/:id/reject
```

**Access:** ADMIN  
**Description:** Reject project submission.  
**Body:**
```json
{
  "reason": "string"
}
```
**Response:** Updated project object with status rejected

---

#### Confirm Member Removal
```
POST /admin/members/:id/remove
```

**Access:** ADMIN  
**Description:** Confirm and finalize member removal request.  
**Response:** Success message

---

#### Replace Project Senior
```
POST /admin/projects/:id/replace-senior
```

**Access:** ADMIN  
**Description:** Assign replacement mentor for a project.  
**Body:**
```json
{
  "new_senior_id": "uuid"
}
```
**Response:** Updated project object with new senior assigned

---

#### Get Project Categories
```
GET /admin/categories
```

**Access:** ADMIN  
**Description:** Get all project categories.  
**Response:** List of category objects

---

#### Create Category
```
POST /admin/categories
```

**Access:** ADMIN  
**Description:** Create new project category.  
**Body:**
```json
{
  "name": "string",
  "slug": "string"
}
```
**Response:** Created category object

---

#### Update Category
```
PUT /admin/categories/:id
```

**Access:** ADMIN  
**Description:** Update project category.  
**Body:** Same as create  
**Response:** Updated category object

---

#### Delete Category
```
DELETE /admin/categories/:id
```

**Access:** ADMIN  
**Description:** Delete project category.  
**Response:** Success message

---

#### Get Audit Logs
```
GET /admin/audit-logs
```

**Access:** ADMIN  
**Description:** Get system audit logs.  
**Query Parameters:**
- `?user_id=uuid` - Filter by user
- `?action=string` - Filter by action
- `?entity_type=string` - Filter by entity type
- `?page=1&limit=50` - Pagination

**Response:** Paginated list of audit log entries

---

## Business Rules

### Authentication & Authorization
- ✅ All APIs use Supabase JWT authentication
- ✅ All protected routes require valid authentication token
- ✅ Role-based authorization enforced via middleware
- ✅ Users can only access/modify their own resources unless role permits otherwise

### Project & Team Constraints
- ✅ Beginner cannot apply when already assigned to an ACTIVE project
- ✅ Senior maximum **5 ACTIVE projects** simultaneously
- ✅ UMKM maximum **5 ACTIVE projects** simultaneously
- ✅ Project must have accepted SENIOR before transitioning to ACTIVE status
- ✅ Reviews required from all parties before project completion

### Artifact Generation
- ✅ Artifacts generated per Beginner completion
- ✅ Artifact code format: `EDN-2026-XXXXXX`
- ✅ Version history maintained on regeneration

### Communication Features
- ✅ Discussion file attachments disabled in MVP
- ✅ Direct messaging enabled between authenticated users
- ✅ Group discussions limited to project participants

### Notifications
- ✅ Notifications are in-app only (no email/SMS in MVP)
- ✅ Real-time notification delivery recommended
- ✅ Users can mark notifications as read

### Verification & Approval
- ✅ Custom skills require Admin approval
- ✅ New users require verification before full access
- ✅ Projects require Admin approval before publishing
- ✅ Member removals require Admin confirmation

---

*Last Updated: v1.0 - Production Grade*

*For questions or updates, contact the development team.*
