import { apiClient } from "@/lib/apiClient";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type ReviewType = "SENIOR_TO_BEGINNER" | "UMKM_TO_BEGINNER" | "UMKM_TO_SENIOR";

interface ReviewPerson {
  id: string;
  name: string;
  role: string;
}

// Shape returned by GET /projects/:id/reviews (listInclude).
export interface ProjectReview {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  type: ReviewType;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  reviewer: ReviewPerson;
  reviewee: ReviewPerson;
}

// Shape returned by GET /users/:id/reviews (reviewer + project only).
export interface UserReview {
  id: string;
  rating: number;
  comment: string | null;
  type: ReviewType;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  reviewer: ReviewPerson;
  project: { id: string; title: string };
}

export const reviewApi = {
  // Reviews given on a project (both reviewer & reviewee visible to participants).
  async listForProject(projectId: string): Promise<ProjectReview[]> {
    const res = await apiClient.get<Envelope<ProjectReview[]>>(`/projects/${projectId}/reviews`);
    return res.data.data;
  },

  // Reviews a user has received, across all their projects.
  async listForUser(userId: string): Promise<UserReview[]> {
    const res = await apiClient.get<Envelope<UserReview[]>>(`/users/${userId}/reviews`);
    return res.data.data;
  },

  // SENIOR lead or UMKM owner reviews a beginner member. Type derived server-side.
  async reviewBeginner(
    projectId: string,
    input: { reviewee_id: string; rating: number; comment?: string }
  ): Promise<ProjectReview> {
    const res = await apiClient.post<Envelope<ProjectReview>>(
      `/projects/${projectId}/reviews/beginner`,
      input
    );
    return res.data.data;
  },

  // UMKM owner reviews the assigned senior.
  async reviewSenior(
    projectId: string,
    input: { rating: number; comment?: string }
  ): Promise<ProjectReview> {
    const res = await apiClient.post<Envelope<ProjectReview>>(
      `/projects/${projectId}/reviews/senior`,
      input
    );
    return res.data.data;
  },

  // Reviewer edits their own review (only before the project is completed).
  async update(id: string, input: { rating?: number; comment?: string }): Promise<ProjectReview> {
    const res = await apiClient.put<Envelope<ProjectReview>>(`/reviews/${id}`, input);
    return res.data.data;
  },
};

export const REVIEW_TYPE_LABEL: Record<ReviewType, string> = {
  SENIOR_TO_BEGINNER: "Mentor → Mahasiswa",
  UMKM_TO_BEGINNER: "UMKM → Mahasiswa",
  UMKM_TO_SENIOR: "UMKM → Mentor",
};
