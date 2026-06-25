import { apiClient } from "@/lib/apiClient";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type DeliverableStatus = "DRAFT" | "SUBMITTED" | "REVISION_REQUESTED" | "APPROVED";
export type EvidenceType = "LINK" | "FILE";

export interface DeliverableEvidence {
  id: string;
  type: EvidenceType;
  url: string | null;
  filePath: string | null;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  createdAt: string;
  updatedAt: string;
  submittedBy: string;
  submitter: { id: string; name: string; email: string };
  evidences: DeliverableEvidence[];
  revisionFeedback?: string | null;
}

export interface EvidenceInput {
  type: EvidenceType;
  url?: string;
  file_path?: string;
}

export const deliverableApi = {
  async listForProject(projectId: string): Promise<Deliverable[]> {
    const res = await apiClient.get<Envelope<Deliverable[]>>(`/projects/${projectId}/deliverables`);
    return res.data.data;
  },

  async create(
    projectId: string,
    input: { title: string; description?: string }
  ): Promise<Deliverable> {
    const res = await apiClient.post<Envelope<Deliverable>>(
      `/projects/${projectId}/deliverables`,
      input
    );
    return res.data.data;
  },

  async update(id: string, input: { title?: string; description?: string }): Promise<Deliverable> {
    const res = await apiClient.put<Envelope<Deliverable>>(`/deliverables/${id}`, input);
    return res.data.data;
  },

  async submit(id: string, evidences: EvidenceInput[]): Promise<Deliverable> {
    const res = await apiClient.post<Envelope<Deliverable>>(`/deliverables/${id}/submit`, {
      evidences,
    });
    return res.data.data;
  },

  async approve(id: string): Promise<Deliverable> {
    const res = await apiClient.post<Envelope<Deliverable>>(`/deliverables/${id}/approve`);
    return res.data.data;
  },

  async requestRevision(id: string, feedback: string): Promise<Deliverable> {
    const res = await apiClient.post<Envelope<Deliverable>>(
      `/deliverables/${id}/request-revision`,
      { feedback }
    );
    return res.data.data;
  },
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
export const DELIVERABLE_STATUS_META: Record<
  DeliverableStatus,
  { label: string; variant: BadgeVariant; className?: string }
> = {
  DRAFT: { label: "Draf", variant: "secondary" },
  SUBMITTED: {
    label: "Menunggu Review",
    variant: "outline",
    className: "border-amber-300 bg-amber-50 text-amber-700",
  },
  REVISION_REQUESTED: {
    label: "Perlu Revisi",
    variant: "outline",
    className: "border-orange-300 bg-orange-50 text-orange-700",
  },
  APPROVED: {
    label: "Disetujui",
    variant: "outline",
    className: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
};
