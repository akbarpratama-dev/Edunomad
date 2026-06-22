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
} as const;
