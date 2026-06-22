// Application status (docs/03 senior_applications + project_applications).
// Shared by senior and beginner application flows (Workflow 3 & 4).
export const ApplicationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
} as const;

export type ApplicationStatusType =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

// Project member status (docs/03 project_members + Workflow 16/17).
// REMOVAL_REQUESTED is the intermediate state after a SENIOR requests removal
// and before an ADMIN confirms it (Workflow 17).
export const MemberStatus = {
  ACTIVE: "ACTIVE",
  REMOVAL_REQUESTED: "REMOVAL_REQUESTED",
  REMOVED: "REMOVED",
  WITHDRAWN: "WITHDRAWN",
  COMPLETED: "COMPLETED",
} as const;

export type MemberStatusType = (typeof MemberStatus)[keyof typeof MemberStatus];
