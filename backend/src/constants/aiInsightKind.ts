// Kinds of cached AI insight (D-AI-1). Mirrors the string-constant pattern used
// by notificationType.ts — VARCHAR in the DB with a raw-SQL CHECK, no DB enum.
export const AiInsightKind = {
  SUMMARY: "SUMMARY", // AI Professional Summary of a user's profile
  MATCH: "MATCH", // AI Candidate Matching & Ranking for a project's applicants
  PORTFOLIO_REC: "PORTFOLIO_REC", // AI Portfolio Recommendation for a beginner applying to a project
} as const;

export type AiInsightKind = (typeof AiInsightKind)[keyof typeof AiInsightKind];
