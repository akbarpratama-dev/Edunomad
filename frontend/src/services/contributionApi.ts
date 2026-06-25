import { apiClient } from "@/lib/apiClient";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type ContributionStatus = "PENDING" | "APPROVED";

export interface ContributionSkill {
  id: string;
  skill: { id: string; name: string };
}

export interface Contribution {
  id: string;
  contributionSummary: string;
  status: ContributionStatus;
  beginnerId: string;
  beginner: { id: string; name: string; email: string };
  contributionSkills: ContributionSkill[];
  reviewedBy: string | null;
  createdAt: string;
}

export const contributionApi = {
  async listForProject(projectId: string): Promise<Contribution[]> {
    const res = await apiClient.get<Envelope<Contribution[]>>(
      `/projects/${projectId}/contributions`
    );
    return res.data.data;
  },

  async submit(
    projectId: string,
    input: { contribution_summary: string; skills?: string[] }
  ): Promise<Contribution> {
    const res = await apiClient.post<Envelope<Contribution>>(
      `/projects/${projectId}/contributions`,
      input
    );
    return res.data.data;
  },

  async update(
    id: string,
    input: { contribution_summary?: string; skills?: string[] }
  ): Promise<Contribution> {
    const res = await apiClient.put<Envelope<Contribution>>(`/contributions/${id}`, input);
    return res.data.data;
  },

  async approve(id: string): Promise<Contribution> {
    const res = await apiClient.post<Envelope<Contribution>>(`/contributions/${id}/approve`);
    return res.data.data;
  },
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
export const CONTRIBUTION_STATUS_META: Record<
  ContributionStatus,
  { label: string; variant: BadgeVariant; className?: string }
> = {
  PENDING: {
    label: "Menunggu",
    variant: "outline",
    className: "border-amber-300 bg-amber-50 text-amber-700",
  },
  APPROVED: {
    label: "Disetujui",
    variant: "outline",
    className: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
};
