// docs/03-Database Schema.md — deliverables.status / deliverable_evidences.type
// (VARCHAR, validated at Zod/service; no DB enum).
export const DeliverableStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  REVISION_REQUESTED: "REVISION_REQUESTED",
  APPROVED: "APPROVED",
} as const;

export type DeliverableStatusValue =
  (typeof DeliverableStatus)[keyof typeof DeliverableStatus];

export const EvidenceType = {
  LINK: "LINK",
  FILE: "FILE",
} as const;

export type EvidenceTypeValue = (typeof EvidenceType)[keyof typeof EvidenceType];

// docs/03 — contribution_reports.status.
export const ContributionStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
} as const;

export type ContributionStatusValue =
  (typeof ContributionStatus)[keyof typeof ContributionStatus];
