// Phase 10 (Discussion Forum Upgrade) — discussions.category (VARCHAR, no DB
// enum; allowed values validated at the Zod layer per schema convention).
// UI labels (id): ANNOUNCEMENT=Pengumuman, QUESTION=Pertanyaan, IDEA=Ide,
// BLOCKER=Kendala, MENTOR_REVIEW=Review Mentor, UPDATE=Pembaruan.
export const DiscussionCategory = {
  ANNOUNCEMENT: "ANNOUNCEMENT",
  QUESTION: "QUESTION",
  IDEA: "IDEA",
  BLOCKER: "BLOCKER",
  MENTOR_REVIEW: "MENTOR_REVIEW",
  UPDATE: "UPDATE",
} as const;

export type DiscussionCategoryValue =
  (typeof DiscussionCategory)[keyof typeof DiscussionCategory];

export const DISCUSSION_CATEGORIES = Object.values(DiscussionCategory) as [
  DiscussionCategoryValue,
  ...DiscussionCategoryValue[],
];
