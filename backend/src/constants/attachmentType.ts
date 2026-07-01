// Phase 12.4 — discussion message attachment kinds.
export const ATTACHMENT_TYPES = ["FILE", "IMAGE", "LINK"] as const;
export type AttachmentType = (typeof ATTACHMENT_TYPES)[number];
