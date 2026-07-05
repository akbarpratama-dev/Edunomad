// Audit actions that MUST be logged (docs/05 Audit Logging, task-breakdown 2.2.1)
// plus admin-action additions used in Phase 2.
export const AuditAction = {
  VERIFICATION_APPROVED: "VERIFICATION_APPROVED",
  VERIFICATION_REJECTED: "VERIFICATION_REJECTED",
  SKILL_APPROVED: "SKILL_APPROVED",
  SKILL_REJECTED: "SKILL_REJECTED",
  PROJECT_APPROVED: "PROJECT_APPROVED",
  PROJECT_REJECTED: "PROJECT_REJECTED",
  MEMBER_REMOVED: "MEMBER_REMOVED",
  ARTIFACT_GENERATED: "ARTIFACT_GENERATED",
  ARTIFACT_REGENERATED: "ARTIFACT_REGENERATED",
  PROJECT_COMPLETED: "PROJECT_COMPLETED",
  // Phase 6 — deliverable review (revision feedback lives in the audit metadata
  // since the schema has no feedback column) + contribution approval.
  DELIVERABLE_APPROVED: "DELIVERABLE_APPROVED",
  DELIVERABLE_REVISION_REQUESTED: "DELIVERABLE_REVISION_REQUESTED",
  CONTRIBUTION_APPROVED: "CONTRIBUTION_APPROVED",
  // Phase 10 — admin reassigns a project's mentor (Workflow 16).
  SENIOR_REPLACED: "SENIOR_REPLACED",
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

// Entity types referenced by audit logs.
export const EntityType = {
  USER: "user",
  VERIFICATION_REQUEST: "verification_request",
  SKILL: "skill",
  PROJECT: "project",
  PROJECT_MEMBER: "project_member",
  ARTIFACT: "artifact",
  DELIVERABLE: "deliverable",
  CONTRIBUTION_REPORT: "contribution_report",
} as const;
