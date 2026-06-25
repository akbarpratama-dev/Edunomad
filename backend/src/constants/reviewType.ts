// docs/03-Database Schema.md — reviews.type (VARCHAR, no DB enum).
// docs/06 Review Rules matrix: SENIOR→BEGINNER, UMKM→BEGINNER, UMKM→SENIOR.
export const ReviewType = {
  SENIOR_TO_BEGINNER: "SENIOR_TO_BEGINNER",
  UMKM_TO_BEGINNER: "UMKM_TO_BEGINNER",
  UMKM_TO_SENIOR: "UMKM_TO_SENIOR",
} as const;

export type ReviewTypeValue = (typeof ReviewType)[keyof typeof ReviewType];
