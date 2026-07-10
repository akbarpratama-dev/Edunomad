# EduNomad MVP - Workflow Map Production Grade v1.0

## Purpose

This document defines **all business workflows** inside EduNomad MVP.

**This is the source of truth for:**
- ✅ User Journey
- ✅ Business Flow
- ✅ Status Transitions
- ✅ Approval Flow
- ✅ Artifact Flow
- ✅ Project Lifecycle

**If implementation conflicts with this document, this document takes precedence.**

---

## Table of Contents
- [Workflow 1: User Registration](#workflow-1--user-registration)
- [Workflow 2: Project Creation](#workflow-2--project-creation)
- [Workflow 3: Senior Recruitment](#workflow-3--senior-recruitment)
- [Workflow 4: Beginner Recruitment](#workflow-4--beginner-recruitment)
- [Workflow 5: Team Formation](#workflow-5--team-formation)
- [Workflow 6: Active Project](#workflow-6--active-project)
- [Workflow 7: Discussion](#workflow-7--discussion)
- [Workflow 8: Deliverable Submission](#workflow-8--deliverable-submission)
- [Workflow 9: Contribution Approval](#workflow-9--contribution-approval)
- [Workflow 10: Milestone Revision](#workflow-10--milestone-revision)
- [Workflow 11: Project Completion Request](#workflow-11--project-completion-request)
- [Workflow 12: Review Process](#workflow-12--review-process)
- [Workflow 13: Artifact Generation](#workflow-13--artifact-generation)
- [Workflow 14: Artifact Regeneration](#workflow-14--artifact-regeneration)
- [Workflow 15: Project Completion](#workflow-15--project-completion)
- [Workflow 16: Member Withdrawal](#workflow-16--member-withdrawal)
- [Workflow 17: Member Removal](#workflow-17--member-removal)
- [Workflow 18: Artifact Verification](#workflow-18--artifact-verification)
- [Status Lifecycles](#status-lifecycles)
- [Conflict Resolution](#conflict-resolution)

---

## Workflow 1: User Registration

### Beginner Registration

```
REGISTER
  ↓
Choose BEGINNER Role
  ↓
Fill Profile (Name, Email, Bio, Skills, Experience)
  ↓
Status = PENDING_VERIFICATION
  ↓
Access Onboarding Dashboard
  ↓
(Admin Verification Process)
  ↓
Status = VERIFIED ✅
```

#### Restrictions While PENDING_VERIFICATION

**CAN DO:**
- ✅ Login to platform
- ✅ Edit profile information
- ✅ Add skills
- ✅ Add portfolio/experience
- ✅ View projects
- ✅ View other profiles

**CANNOT DO:**
- ❌ Apply to projects
- ❌ Join any project
- ❌ Submit deliverables
- ❌ Generate or view artifacts

---

### Senior Registration

```
REGISTER
  ↓
Choose SENIOR Role
  ↓
Fill Profile (Name, Email, Bio, Expertise)
  ↓
Upload Documentation
  ├─ LinkedIn Profile
  ├─ CV / Resume
  └─ Experience Evidence
  ↓
Status = PENDING_VERIFICATION
  ↓
(Admin Review)
  ↓
Admin Decision:
├─ VERIFIED ✅
└─ REJECTED ❌
```

#### Admin Verification Checks (Senior)
- ✅ Identity verification
- ✅ LinkedIn profile exists and credible
- ✅ CV/Resume quality
- ✅ Experience evidence relevant

---

### UMKM Registration

```
REGISTER
  ↓
Choose UMKM Role
  ↓
Fill Business Profile
  ├─ Business Name
  ├─ Business Description
  ├─ Business Type
  └─ Contact Information
  ↓
Status = PENDING_VERIFICATION
  ↓
(Admin Review)
  ↓
Admin Decision:
├─ VERIFIED ✅
└─ REJECTED ❌
```

#### Admin Verification Checks (UMKM)
- ✅ Business legitimacy
- ✅ Basic authenticity check
- ✅ Contact information valid

**Note:** No formal business registration verification in MVP.

---

## Workflow 2: Project Creation

### UMKM Create Project

```
CREATE PROJECT
  ↓
Fill Project Information
  ├─ Project Title
  ├─ Project Description
  ├─ Expected Deliverables
  ├─ Category
  ├─ Start Date
  └─ Deadline
  ↓
Create Role Slots
  ├─ Role Name (e.g., Frontend Developer)
  ├─ Capacity (Number of positions)
  ├─ Requirements
  └─ Required Skills
  ↓
SUBMIT FOR ADMIN REVIEW
  ↓
Status = PENDING_REVIEW
```

### Admin Project Review

```
ADMIN REVIEWS PROJECT
  ↓
├─ Validate Project Information
├─ Check Requirements Quality
├─ Verify Role Definitions
└─ Check Deliverables Clarity
  ↓
ADMIN DECISION:

┌─────────────────┬──────────────────┐
│  APPROVE        │   REJECT         │
└────────┬────────┴────────┬─────────┘
         │                 │
    Status = RECRUITING   Status = REJECTED
         ↓                 │
   Ready for             (UMKM notified,
   Recruitment           can re-submit)
```

### Project Ready for Recruitment

**After Admin Approval:**
- ✅ Status = `RECRUITING`
- ✅ Project visible to seniors and beginners
- ✅ Open for senior applications
- ✅ Open for beginner applications

---

## Workflow 3: Senior Recruitment

### Senior Application Flow

```
PROJECT STATUS: RECRUITING

SENIOR APPLIES
  ├─ Project selected
  ├─ Message provided
  └─ Submit application
  ↓
Application Status = PENDING
  ↓
UMKM REVIEWS APPLICATION
  ├─ Review senior's credentials
  ├─ Check experience
  └─ Make decision
  ↓
UMKM DECISION:

┌──────────────┬──────────────┐
│   ACCEPT     │   REJECT     │
└──────┬───────┴───────┬──────┘
       │               │
       ↓               ↓
   ACCEPTED      REJECTED
   Senior        Notification
   Assigned      sent to senior
       ↓
   Senior becomes
   Project Lead
```

### Business Rules - Senior Assignment

| Rule | Details |
|------|---------|
| **One Senior Per Project** | Only 1 senior can be assigned |
| **Required for ACTIVE** | Project cannot start without accepted senior |
| **Max 5 Projects** | Senior can have max 5 ACTIVE projects |
| **Application Decision** | Only UMKM decides (not admin) |

---

## Workflow 4: Beginner Recruitment

### Beginner Application Flow

```
PROJECT STATUS: RECRUITING

BEGINNER APPLIES
  ├─ Select desired role slot
  ├─ Provide motivation
  └─ Submit application
  ↓
Application Status = PENDING
  ↓
SENIOR REVIEWS APPLICATION
  ├─ Review beginner's profile
  ├─ Check skills match
  ├─ Review motivation
  └─ Make decision
  ↓
SENIOR DECISION:

┌──────────────┬──────────────┐
│   ACCEPT     │   REJECT     │
└──────┬───────┴───────┬──────┘
       │               │
    ACCEPTED       REJECTED
       ↓
    Beginner
    Becomes
    Project Member
    (Status = ACTIVE)
```

### Business Rules - Beginner Applications

| Rule | Details |
|------|---------|
| **Multiple Applications** | Beginner can apply to multiple projects |
| **Only 1 ACTIVE Project** | Beginner can only have 1 ACTIVE project at a time |
| **Auto-Block if ACTIVE** | System blocks apply/accept if beginner already ACTIVE |
| **Application Decision** | Only Senior decides (not UMKM directly) |
| **Member Assignment** | Accepted beginner assigned to role slot |

---

## Workflow 5: Team Formation

### Team Building Phase

```
PROJECT STATUS: RECRUITING

Step 1: SENIOR ASSIGNED
         ↓ (from senior application)
         
Step 2: RECRUITMENT CONTINUES
         ├─ Beginners apply for roles
         ├─ Senior reviews applications
         └─ Senior accepts beginners
         ↓

Step 3: TEAM COMPLETE
         ├─ Senior assigned ✅
         ├─ Role slots filled ✅
         └─ All members ready ✅
         ↓

Step 4: SENIOR STARTS PROJECT
         ├─ Senior initiates start
         └─ Only senior can trigger
         ↓

Status = ACTIVE 🚀
         ↓
Team ready for deliverables,
discussions, and contributions.
```

### Prerequisites for ACTIVE

Before project can become ACTIVE:
- ✅ Senior must be accepted
- ✅ Required beginner slots filled (or senior approval)
- ✅ Senior must explicitly start project

---

## Workflow 6: Active Project

### Active Project Environment

```
PROJECT STATUS: ACTIVE

Team Members:
├─ UMKM (Project owner)
├─ SENIOR (Project lead)
└─ BEGINNER (Team members) ×N

Available Features:
├─ Discussion Board (Group)
├─ Direct Messages (Beginner ↔ Senior)
├─ Deliverables (Submit & Review)
├─ Contribution Reports (Document work)
└─ Progress Tracking (Milestones)

Project Flow:
├─ Execute project plan
├─ Submit deliverables
├─ Get feedback
├─ Submit contributions
├─ Complete reviews
└─ Prepare for completion
```

### Active Project Rules

| Feature | Access | Notes |
|---------|--------|-------|
| **Discussions** | Senior + members (NOT UMKM) | Group conversations — UMKM excluded (D-DISKUSI-2) |
| **Direct Messages** | Beginner ↔ Senior | Mentoring/feedback |
| **Deliverables** | Beginners submit, Senior reviews | Multiple submissions allowed |
| **Contributions** | Beginners submit, Senior approves | One per beginner |
| **Milestones** | Tracked by senior | Can propose revisions |

---

## Workflow 7: Discussion

> **Phase 12 amendment (Discussion Forum Upgrade — user-approved).** Group
> discussions are upgraded from a flat team chat into a **forum board**: each
> topic has a **title** + **category** (Pengumuman/Pertanyaan/Ide/Kendala/Review
> Mentor/Pembaruan) and can be **pinned** (senior lead / UMKM owner). Within a
> topic, members post messages that support **threaded replies**, **reactions**,
> and **attachments** (file/image/link via Supabase Storage), and topics track
> **unique views**. Delivered in sub-phases 12.1–12.5. Access/roles per docs/06.

### Group Discussion

```
PROJECT MEMBERS

Participants:
├─ UMKM (Optional)
├─ SENIOR (Always included)
└─ All BEGINNERs

Flow:
├─ Any ACTIVE participant opens discussion (SENIOR or a member incl. BEGINNER — UMKM owner excluded, rule D-DISKUSI-2 supersedes D-P12-8)
├─ Invite members
├─ Discussion created
└─ Members join
    ↓
SEND MESSAGES
    ├─ Send message to group
    ├─ Message visible to all members
    └─ Real-time notifications
    ↓
DISCUSSION CONTINUES
    └─ Asynchronous communication
```

### Direct Message

```
BEGINNER → SENIOR

Participants:
├─ BEGINNER (initiator)
└─ SENIOR (receiver)

Purpose:
├─ Mentoring
├─ Clarification
├─ Feedback
└─ Consultation

Flow:
├─ Beginner starts DM with senior
├─ Conversation private (1:1)
└─ Async messaging

NOT SUPPORTED:
❌ File attachments
❌ Voice calls
❌ Video calls
```

---

## Workflow 8: Deliverable Submission

### Beginner Submits Deliverable

```
BEGINNER
  ↓
CREATE DELIVERABLE
  ├─ Title
  ├─ Description
  └─ (Status = DRAFT)
  ↓
ATTACH EVIDENCE
  ├─ GitHub link
  ├─ Figma link
  ├─ Live URL
  ├─ Screenshots
  └─ Documentation
  ↓
SUBMIT FOR REVIEW
  ↓
Status = SUBMITTED
Notification → SENIOR
```

### Senior Reviews Deliverable

```
SENIOR REVIEWS

Deliverable Status = SUBMITTED
  ↓
SENIOR EXAMINES
  ├─ Code quality
  ├─ Completeness
  ├─ Evidence validity
  └─ Requirements met
  ↓
SENIOR DECISION:

┌─────────────┬──────────────────┐
│  APPROVE    │  REQUEST REVISION│
└──────┬──────┴────────┬─────────┘
       │               │
  APPROVED      REVISION_REQUIRED
       ↓               ↓
   Complete    BEGINNER Updates
   (finalized) Resubmits
               ↓
           (Loop back to review)
```

### Revision Cycle

```
Status = REVISION_REQUIRED
  ↓
BEGINNER Gets Feedback
  ├─ Review comments
  ├─ Understand requirements
  └─ Make improvements
  ↓
UPDATE DELIVERABLE
  ├─ Update code/work
  ├─ Update evidence
  └─ Add revision notes
  ↓
RESUBMIT
  ↓
(Loop back to Senior Review)
```

---

## Workflow 9: Contribution Approval

### Beginner Submits Contribution Report

```
BEGINNER SUBMITS CONTRIBUTION REPORT

Content:
├─ Tasks Completed
│  ├─ List of what was done
│  ├─ Deliverables produced
│  └─ Challenges overcome
├─ Links & Evidence
│  ├─ GitHub commits
│  ├─ Deployed links
│  └─ Documentation
└─ Description
   ├─ Technologies used
   ├─ Skills demonstrated
   └─ Learning outcomes

Status = PENDING
Notification → SENIOR
```

### Senior Approves Contribution

```
SENIOR REVIEWS CONTRIBUTION
  ├─ Verify tasks completed
  ├─ Check evidence quality
  ├─ Assess skill demonstration
  └─ Validate learning outcome
  ↓
SENIOR DECISION:

APPROVE ✅
  ↓
Status = APPROVED

Contribution becomes data source
for artifact generation.
```

### Contribution Impact

**Approved contributions:**
- ✅ Used for artifact generation
- ✅ Referenced in artifact content
- ✅ Demonstrate skill acquisition
- ✅ Part of permanent record

---

## Workflow 10: Milestone Revision

### Initial Milestones

```
UMKM CREATES PROJECT
  ↓
Define Milestones
  ├─ Milestone 1: Planning
  ├─ Milestone 2: Development
  ├─ Milestone 3: Testing
  └─ Milestone 4: Deployment
  ↓
Milestones become project roadmap
```

### Senior Proposes Revision

```
PROJECT ACTIVE

SENIOR REVIEWS MILESTONES
  ├─ Assess feasibility
  ├─ Check timeline
  ├─ Evaluate scope
  └─ Identify issues
  ↓
SENIOR PROPOSES REVISION
  ├─ Specify milestone to change
  ├─ Propose new date/scope
  └─ Provide reason
  ↓
Status = REVISION_PROPOSED
Notification → UMKM
```

### UMKM Reviews Revision

```
UMKM RECEIVES PROPOSAL
  ↓
UMKM REVIEWS
  ├─ Consider senior's reasoning
  ├─ Assess project impact
  └─ Evaluate feasibility
  ↓
UMKM DECISION:

┌──────────┬──────────┐
│ APPROVE  │  REJECT  │
└────┬─────┴────┬─────┘
     │          │
  APPROVED  REJECTED
     ↓          ↓
Milestone   Keep original
updated     milestone

Only APPROVED changes
become active milestones
```

---

## Workflow 11: Project Completion Request

> **AMANDEMEN D-P14-1 (2026-07-08, user-approved).** Alur di bawah (Senior *Ajukan* → status AWAITING_COMPLETION → UMKM *Konfirmasi*) DIGANTI menjadi **penyelesaian 1-langkah oleh Senior**: Senior menekan **"Selesaikan Proyek"** sekali → proyek `ACTIVE → COMPLETED` langsung, **tanpa** state antara `AWAITING_COMPLETION` dan **tanpa** konfirmasi UMKM. Sertifikat setiap mahasiswa aktif **otomatis diterbitkan** sebagai bagian dari langkah ini (Workflow 13 dilipat ke sini; idempotent). **Gate kesiapan Workflow 15 TETAP** (deliverable APPROVED + kontribusi + review per-mahasiswa) sehingga sertifikat tetap "verified" — kecuali flag demo `DEMO_COMPLETE_BYPASS=true` yang melewati gate untuk keperluan expo. Diagram AWAITING_COMPLETION + langkah UMKM di bawah dipertahankan hanya sebagai referensi/back-compat untuk proyek yang terlanjur berstatus AWAITING_COMPLETION. Lihat D-P14-1.

### Senior Verifies Readiness

```
PROJECT STATUS: ACTIVE

SENIOR VERIFIES COMPLETION CHECKLIST
  ├─ All deliverables complete? ✓
  │  └─ All statuses = APPROVED
  ├─ All contributions approved? ✓
  │  └─ All statuses = APPROVED
  └─ All required reviews ready? ✓
     └─ Ready for submission
  ↓
Request Completion
```

### Completion Request Flow

```
SENIOR INITIATES
  ↓
REQUEST COMPLETION
  ├─ Confirm deliverables complete
  ├─ Confirm contributions approved
  ├─ Confirm reviews submitted
  └─ Submit request
  ↓
Status: AWAITING_COMPLETION
Notification → UMKM
```

### UMKM Confirms Completion

```
UMKM REVIEWS
  ├─ Verify project goals met
  ├─ Check deliverables quality
  ├─ Assess team performance
  └─ Make decision
  ↓
UMKM CONFIRMS
  ↓
Status = COMPLETED ✅
  ↓
Project Archived
Read-only mode activated
```

---

## Workflow 12: Review Process

### Mandatory Reviews

**Reviews MUST be completed before project completion.**

**Review Types:**

| Reviewer | Reviewee | Rating | Visibility |
|----------|----------|--------|-----------|
| SENIOR | BEGINNER | 1-5 ⭐ | Public |
| UMKM | BEGINNER | 1-5 ⭐ | Public |
| UMKM | SENIOR | 1-5 ⭐ | Public |

### Senior Reviews Beginner

```
SENIOR REVIEWS EACH BEGINNER

For Each Team Member:
  ├─ Rate Performance (1-5)
  ├─ Write Review Comment
  │  ├─ Strengths shown
  │  ├─ Skills demonstrated
  │  ├─ Areas for improvement
  │  └─ Recommendation
  └─ SUBMIT REVIEW
     ↓
   Status = SUBMITTED
   Visible on Beginner's Profile ✓
```

### UMKM Reviews Beginner

```
UMKM REVIEWS EACH BEGINNER

For Each Team Member:
  ├─ Rate Performance (1-5)
  ├─ Write Review Comment
  │  ├─ Project contribution
  │  ├─ Deliverable quality
  │  ├─ Collaboration
  │  └─ Recommendation
  └─ SUBMIT REVIEW
     ↓
   Status = SUBMITTED
   Visible on Beginner's Profile ✓
```

### UMKM Reviews Senior

```
UMKM REVIEWS SENIOR/MENTOR

Assessment:
  ├─ Leadership quality
  ├─ Mentorship effectiveness
  ├─ Communication
  ├─ Delivery on promises
  └─ Overall performance
  ↓
Rate Performance (1-5)
  ↓
Write Review Comment
  ├─ What went well
  ├─ Areas for improvement
  └─ Recommendation
  ↓
SUBMIT REVIEW
  ↓
Status = SUBMITTED
Visible on Senior's Profile ✓
```

### Review Impact

**Reviews become:**
- ✅ Public profile data
- ✅ Reputation metrics
- ✅ Historical record
- ✅ Reference for future projects

---

## Workflow 13: Artifact Generation

### Prerequisites for Artifact

```
REQUIREMENTS MET:

✓ Project Status = ACTIVE (or completing)
✓ All contributions approved
✓ Reviews submitted
✓ Deliverables approved
```

### Senior Generates Artifact

```
SENIOR OPENS ARTIFACT MODULE
  ↓
REVIEW CONTRIBUTION SUMMARY
  ├─ Check beginner's contributed tasks
  ├─ Review technologies used
  ├─ Verify evidence quality
  └─ Assess impact
  ↓
GENERATE ARTIFACT
  │
  ├─ Per Beginner (NOT per team)
  │
  └─ Each beginner gets 1 artifact
     ↓
     Artifact Created
```

### Artifact Contents

**Each artifact includes:**

| Component | Details |
|-----------|---------|
| **Beginner Name** | Who completed the work |
| **UMKM Name** | Project organization |
| **Senior Name** | Mentor/Project lead |
| **Project Name** | Project title |
| **Contribution Summary** | What was accomplished |
| **Technologies Used** | Stack/tools learned |
| **Senior Feedback** | Mentor's assessment |
| **Digital Signature** | Authentication proof |
| **Verification ID** | Unique artifact code (EDN-2026-XXXXX) |

### Artifact Code Format

```
EDN-2026-000001
 ├─ EDN: EduNomad prefix
 ├─ 2026: Year
 └─ 000001: Sequential number
```

### Artifact Issuance

```
ARTIFACT GENERATED
  ↓
Contains:
├─ All required information
├─ Digital signature
├─ Unique verification code
└─ PDF version
  ↓
Status = ISSUED
Visible on Beginner's Profile ✓
  ↓
Verification URL Generated
(Public verification available)
```

---

## Workflow 14: Artifact Regeneration

### When to Regenerate

```
SCENARIO:
Beginner's contribution updated
  ↓
Contribution re-approved
  ↓
Artifact needs refresh
```

### Regeneration Process

```
ARTIFACT EXISTS
  ├─ Current Version: 1
  └─ Issued at: Date
  ↓
CONTRIBUTION UPDATED
  ├─ Tasks expanded
  ├─ Additional evidence
  └─ Enhanced description
  ↓
SENIOR REGENERATES
  ├─ Review updated contribution
  ├─ Select regeneration option
  └─ Generate new version
  ↓
NEW VERSION CREATED
  ├─ Version: 2
  ├─ Previous version: Archived
  └─ Both versions accessible
```

### Version History

**Regeneration Rules:**
- ✅ Old version remains stored
- ✅ New version created
- ✅ Version number incremented
- ✅ Both accessible for verification
- ✅ Latest version is primary

---

## Workflow 15: Project Completion

> **AMANDEMEN D-P14-1 (2026-07-08).** Transisi final kini `ACTIVE → COMPLETED` dalam **satu aksi Senior** (`POST /projects/:id/complete`), bukan `AWAITING_COMPLETION → COMPLETED` oleh UMKM. Requirement di bawah tetap menjadi **gate** yang diperiksa saat Senior menyelesaikan (kecuali `DEMO_COMPLETE_BYPASS`). "Artifacts generated" bukan lagi prasyarat manual — sertifikat diterbitkan otomatis oleh langkah penyelesaian.

### Completion Requirements

```
ALL OF THESE MUST BE TRUE:

✓ Deliverables:
  └─ All submitted and approved

✓ Contributions:
  └─ All submitted and approved

✓ Reviews:
  ├─ Senior → Beginner reviews done
  ├─ UMKM → Beginner reviews done
  └─ UMKM → Senior review done

✓ Artifacts:
  └─ Generated for all beginners
```

### Completion Flow

```
SENIOR INITIATES
  ↓
Request Completion
  (All requirements checked)
  ↓
Status = AWAITING_COMPLETION
Notification → UMKM
  ↓
UMKM CONFIRMS
  ├─ Review project success
  ├─ Verify goals met
  └─ Finalize project
  ↓
Confirm Completion
  ↓
Status = COMPLETED ✅
  ↓
PROJECT ARCHIVED
├─ Read-only mode activated
├─ No new changes allowed
├─ Historical data preserved
└─ Achievements recorded
```

### After Completion

**Project becomes:**
- 🔒 Read-only
- 📊 Part of portfolio
- 📋 Reference for future
- 🏆 Credited work

---

## Workflow 16: Member Withdrawal

### Beginner Withdrawal

```
ACTIVE PROJECT

BEGINNER REQUESTS WITHDRAWAL
  ├─ Provide reason (optional)
  └─ Confirm withdrawal
  ↓
Status = WITHDRAWN
(for that specific project)
  ↓
PROFILE UPDATED
├─ Remove from project
├─ Update statistics
└─ Record withdrawal

Next Steps:
├─ Can apply to new projects
└─ Can have new ACTIVE project
```

### Senior Withdrawal

```
ACTIVE PROJECT

SENIOR REQUESTS WITHDRAWAL
  ↓
Request sent to ADMIN
  ├─ Senior's reason
  └─ Project status check
  ↓
ADMIN ASSIGNS REPLACEMENT
  ├─ Select new senior
  └─ Transfer context
  ↓
NEW SENIOR ASSIGNED
├─ Inherits team
├─ Inherits progress
└─ Continues project
  ↓
Project Remains ACTIVE
(No disruption)
```

---

## Workflow 17: Member Removal

### Removal Request Flow

```
SENIOR IDENTIFIES ISSUE
  ├─ Non-performance
  ├─ Violations
  ├─ Inactivity
  └─ Other reasons
  ↓
SENIOR REQUESTS REMOVAL
  ├─ Select member to remove
  ├─ Provide detailed reason
  └─ Submit request
  ↓
Status = REMOVAL_REQUESTED
Notification → ADMIN
```

### Admin Review & Approval

```
ADMIN REVIEWS REQUEST
  ├─ Verify reason validity
  ├─ Check member's activity
  ├─ Review contributions
  └─ Assess fairness
  ↓
ADMIN DECISION:

APPROVE REMOVAL ✓
  ↓
Member Removed
├─ Removed from project
├─ Status = REMOVED
├─ Removal count incremented
└─ Notification → Member

OR

REJECT REMOVAL ✗
  ├─ Decision communicated to Senior
  └─ Member remains in project
```

### Removal Impact

**On Member's Profile:**
- 📊 Removal count recorded
- 🏷️ Historical record
- 📈 Affects reputation
- 📋 Visible to future seniors

---

## Workflow 18: Artifact Verification

### Public Verification Flow

```
EXTERNAL VERIFICATION
(Anyone can verify)

OPEN VERIFICATION PAGE
  ↓
INPUT ARTIFACT CODE
  ├─ Code format: EDN-2026-XXXXX
  ├─ Enter code
  └─ Search
  ↓
SYSTEM VALIDATES
  ├─ Check code format
  ├─ Query artifact database
  ├─ Verify signatures
  └─ Validate authenticity
  ↓
DISPLAY VERIFICATION RESULT
  ├─ Status: VALID ✓
  │  └─ Show artifact details
  │
  └─ Status: INVALID ✗
     └─ Code not found message
```

### Verification Details Shown

**If VALID:**
- ✅ Beginner name
- ✅ Project name
- ✅ UMKM name
- ✅ Senior name
- ✅ Issued date
- ✅ Contribution summary
- ✅ Technologies used
- ✅ Verification status

**If INVALID:**
- ❌ "Artifact not found"
- ❌ Suggestion to check code
- ❌ Link to support

---

## Status Lifecycles

### Project Status Lifecycle

```
DRAFT
  ↓
(Submit for review)
  ↓
PENDING_REVIEW
  ├─ ADMIN approves → RECRUITING
  └─ ADMIN rejects → REJECTED
  ↓
RECRUITING
  ├─ Senior applied and accepted
  ├─ Beginners join team
  └─ Senior starts project
  ↓
ACTIVE
  ├─ Team works on deliverables
  ├─ Contributions submitted
  ├─ Reviews completed
  └─ Completion requested
  ↓
COMPLETED ✅
  └─ Read-only mode
```

**Alternative Paths:**
- → `REJECTED` (admin rejects at review)
- → `CANCELLED` (umkm cancels)
- → `OVERDUE` (deadline passed)

### Application Status Lifecycle

```
PENDING
  ├─ User applied
  └─ Awaiting decision
  ↓
FROM PENDING:
├─ ACCEPTED → Join project/assigned
├─ REJECTED → Not accepted, can reapply
└─ WITHDRAWN → User withdrew application
```

### User Verification Status Lifecycle

```
PENDING_VERIFICATION
  ├─ User registered
  └─ Awaiting admin review
  ↓
FROM PENDING:
├─ VERIFIED ✅
│  ├─ Can apply to projects
│  ├─ Can create projects
│  └─ Can review users
│
├─ REJECTED ❌
│  ├─ Cannot apply to projects
│  ├─ Cannot create projects
│  └─ Limited platform access
│
└─ FROM VERIFIED/REJECTED:
   └─ SUSPENDED 🔒
      └─ Full platform access blocked
```

---

## Conflict Resolution

### Priority Hierarchy

**If workflows conflict, follow this priority:**

```
PRIORITY LEVEL 1 (HIGHEST)
    ↓
Workflow Map
(This document)
    ↓
PRIORITY LEVEL 2
    ↓
RBAC & Business Rules
(09-RBAC_and_Business_Rules_v1.0.md)
    ↓
PRIORITY LEVEL 3
    ↓
PRD
(Product Requirements Document)
    ↓
PRIORITY LEVEL 4
    ↓
API Specification
(03-API_Specification_v1.0.md)
    ↓
PRIORITY LEVEL 5 (LOWEST)
    ↓
Implementation
(Actual code)
```

**Rule:** Implementation must follow this workflow document.

**If conflict found:**
1. ✅ Reference this document (Workflow Map)
2. ✅ Cross-check with RBAC Rules
3. ✅ Verify against PRD
4. ✅ Implementation updated

---

## Quick Reference

### Key Status Values

| Entity | Statuses |
|--------|----------|
| **Projects** | DRAFT, PENDING_REVIEW, RECRUITING, ACTIVE, COMPLETED, REJECTED, CANCELLED, OVERDUE |
| **Applications** | PENDING, ACCEPTED, REJECTED, WITHDRAWN |
| **User Account** | PENDING_VERIFICATION, VERIFIED, REJECTED, SUSPENDED |
| **Deliverables** | DRAFT, SUBMITTED, REVISION_REQUIRED, APPROVED |
| **Contributions** | PENDING, APPROVED |

### Key Workflows Summary

| # | Name | Key Decision Maker |
|---|------|-------------------|
| 1 | User Registration | Admin (verifies) |
| 2 | Project Creation | Admin (approves) |
| 3 | Senior Recruitment | UMKM (accepts/rejects) |
| 4 | Beginner Recruitment | Senior (accepts/rejects) |
| 5 | Team Formation | Senior (starts project) |
| 6 | Active Project | All members |
| 7 | Discussion | Senior + members (NOT UMKM — D-DISKUSI-2) |
| 8 | Deliverable | Senior (reviews/approves) |
| 9 | Contribution | Senior (approves) |
| 10 | Milestone Revision | UMKM (approves revision) |
| 11 | Completion Request | UMKM (confirms) |
| 12 | Reviews | Senior & UMKM (both review) |
| 13 | Artifact Generation | Senior (generates) |
| 14 | Artifact Regeneration | Senior (regenerates) |
| 15 | Project Completion | UMKM (finalizes) |
| 16 | Member Withdrawal | Self (initiates) |
| 17 | Member Removal | Admin (approves removal) |
| 18 | Artifact Verification | Public (anyone verifies) |

---

## Implementation Checklist

- [ ] User registration follows specified status flow
- [ ] Project creation requires admin approval
- [ ] Senior recruitment only allows UMKM to decide
- [ ] Beginner recruitment only allows senior to decide
- [ ] Project cannot go ACTIVE without senior
- [ ] Deliverable review cycle with revision support
- [ ] Contribution approval before artifact generation
- [ ] Reviews mandatory before completion
- [ ] Artifacts generated per beginner (not team)
- [ ] Artifact regeneration keeps version history
- [ ] Project completion requires UMKM confirmation
- [ ] Member withdrawal handled properly
- [ ] Member removal requires admin approval
- [ ] Artifact verification is public
- [ ] All status transitions implemented
- [ ] Conflict resolution follows priority

---

*Last Updated: v1.0 - Production Grade*

*This document is the definitive source for all business workflows.*
