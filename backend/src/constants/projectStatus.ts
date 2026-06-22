// Project status lifecycle (user-confirmed 2026-06-21, decisions.md):
// DRAFT → PENDING_REVIEW → RECRUITING (admin approve) / REJECTED (reject)
// → ACTIVE → AWAITING_COMPLETION (senior requests) → COMPLETED (umkm confirms).
// AWAITING_COMPLETION added in Phase 4.3 (Workflow 11/15). PUBLISHED/OVERDUE
// (schema comment) are dropped.
export const ProjectStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  RECRUITING: "RECRUITING",
  REJECTED: "REJECTED",
  ACTIVE: "ACTIVE",
  AWAITING_COMPLETION: "AWAITING_COMPLETION",
  COMPLETED: "COMPLETED",
} as const;

export type ProjectStatusType = (typeof ProjectStatus)[keyof typeof ProjectStatus];

// Statuses visible to the public project list (after admin approval). DRAFT,
// PENDING_REVIEW and REJECTED belong to the owner only (Workflow 2: project
// becomes visible to seniors/beginners once RECRUITING).
export const PUBLIC_PROJECT_STATUSES: ProjectStatusType[] = [
  ProjectStatus.RECRUITING,
  ProjectStatus.ACTIVE,
  ProjectStatus.AWAITING_COMPLETION,
  ProjectStatus.COMPLETED,
];
