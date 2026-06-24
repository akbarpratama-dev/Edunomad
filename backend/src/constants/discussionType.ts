// docs/03-Database Schema.md — discussions.type (VARCHAR, no DB enum).
export const DiscussionType = {
  GROUP: "GROUP",
  DIRECT: "DIRECT",
} as const;

export type DiscussionTypeValue = (typeof DiscussionType)[keyof typeof DiscussionType];
