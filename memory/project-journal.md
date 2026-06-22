PROJECT MEMORY SYSTEM

Every completed task must update project memory.

Claude must maintain project continuity.

Never finish implementation without updating memory files.

⸻

Required Memory Files

memory/

├── current-status.md

├── development-log.md

├── next-tasks.md

├── known-issues.md

└── decisions.md

⸻

current-status.md

Purpose:

Current state of project.

Must contain:

- Current milestone
- Completed modules
- In progress modules
- Blocked modules

Example:

Current Milestone:
Authentication

Completed:

- Login
- Register
- RBAC

In Progress:

- User Verification

Blocked:

- None

⸻

development-log.md

Append-only log.

Every completed task must create entry.

Format:

YYYY-MM-DD HH:mm

Task:
Implemented Project Applications

Files:

- application.service.ts
- application.controller.ts

Database Changes:

- None

API Changes:

- POST /projects/:id/apply

Summary:
Implemented beginner application flow.

⸻

next-tasks.md

Purpose:

Single source of truth for next actions.

Format:

High Priority:

Medium Priority:

Low Priority:

⸻

known-issues.md

Track unresolved problems.

Format:

Issue:
Description

Severity:
Low | Medium | High

Status:
Open | Closed

⸻

decisions.md

Store architectural decisions.

Format:

Date:

Decision:

Reason:

Impact:

Status:
Approved
