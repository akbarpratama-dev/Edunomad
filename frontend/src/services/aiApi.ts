import { apiClient } from "@/lib/apiClient";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// Every AI endpoint returns this envelope with HTTP 200 — including the
// "unavailable" case — so the UI distinguishes "AI off/down" from a real error
// and can always fall back gracefully (D-AI-1).
export type AiResult<T> =
  | { available: true; cached: boolean; generatedAt: string; data: T }
  | { available: false; reason: string };

// --- Feature payloads (mirror backend aiInsight.service schemas) ---

export interface PortfolioRec {
  recommendedItems: { type: "SKILL" | "CERTIFICATE" | "EXPERIENCE"; label: string; reason: string }[];
  suggestedHighlights: string[];
  overallAdvice: string;
}

export interface ApplicantRankingRow {
  applicationId: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  reason: string;
}
export interface ApplicantRanking {
  rankings: ApplicantRankingRow[];
}

export interface ProfileSummary {
  summary: string;
  strengths: string[];
  suggestedRoles: string[];
}

function regenParam(regenerate?: boolean) {
  return regenerate ? { params: { regenerate: "true" } } : undefined;
}

export const aiApi = {
  // SENIOR lead: AI-ranked applicant list for a project.
  async applicantRanking(projectId: string, regenerate?: boolean): Promise<AiResult<ApplicantRanking>> {
    const res = await apiClient.get<Envelope<AiResult<ApplicantRanking>>>(
      `/projects/${projectId}/applicants/ranking`,
      regenParam(regenerate)
    );
    return res.data.data;
  },

  // BEGINNER: which of my portfolio items to highlight for this vacancy.
  async portfolioRecommendation(
    projectId: string,
    regenerate?: boolean
  ): Promise<AiResult<PortfolioRec>> {
    const res = await apiClient.get<Envelope<AiResult<PortfolioRec>>>(
      `/projects/${projectId}/portfolio-recommendation`,
      regenParam(regenerate)
    );
    return res.data.data;
  },

  // Professional summary of a user's profile ("me" or a user id).
  async userSummary(userId: string, regenerate?: boolean): Promise<AiResult<ProfileSummary>> {
    const res = await apiClient.get<Envelope<AiResult<ProfileSummary>>>(
      `/users/${userId}/ai-summary`,
      regenParam(regenerate)
    );
    return res.data.data;
  },
};
