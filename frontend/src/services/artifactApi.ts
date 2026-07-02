import { apiClient } from "@/lib/apiClient";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Ref {
  id: string;
  name: string;
  email?: string;
}

export interface ArtifactVersion {
  id: string;
  artifactId: string;
  version: number;
  pdfPath: string;
  generatedBy: string;
  createdAt: string;
}

export interface Artifact {
  id: string;
  artifactCode: string;
  projectId: string;
  beginnerId: string;
  seniorId: string;
  verificationUrl: string;
  currentVersion: number;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
  project: { id: string; title: string; umkm?: { id: string; name: string } | null };
  beginner: Ref;
  senior: Ref;
  versions: ArtifactVersion[];
}

// Public verification result (GET /verify/:code) — VALID or INVALID.
export type VerifyResult =
  | { valid: false }
  | {
      valid: true;
      artifactCode: string;
      beginnerName: string;
      projectTitle: string;
      umkmName: string | null;
      seniorName: string;
      issuedAt: string;
      currentVersion: number;
    };

export type PipelineStatus = "VERIFIED" | "READY" | "IN_PROGRESS";

export interface PipelineStage {
  key: string;
  label: string;
  done: boolean;
}

export interface PipelineItem {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  projectImageUrl: string | null;
  umkm: { id: string; name: string } | null;
  senior: { id: string; name: string } | null;
  roleName: string | null;
  team: { id: string; name: string }[];
  technologies: string[];
  contributionApproved: boolean;
  hasSeniorReview: boolean;
  hasUmkmReview: boolean;
  status: PipelineStatus;
  stages: PipelineStage[];
  artifact: {
    id: string;
    artifactCode: string;
    currentVersion: number;
    issuedAt: string;
    verifiedBy: string | null;
  } | null;
}

export interface PipelineReview {
  reviewerName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface PipelineDetail {
  projectId: string;
  status: PipelineStatus;
  project: {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    status: string;
    startDate: string;
    deadline: string;
    completedAt: string | null;
  };
  umkm: { id: string; name: string } | null;
  senior: { id: string; name: string } | null;
  roleName: string | null;
  technologies: string[];
  contributionSummary: string | null;
  achievements: string[];
  contributionApproved: boolean;
  seniorReview: PipelineReview | null;
  umkmReview: PipelineReview | null;
  deliverables: {
    id: string;
    title: string;
    status: string;
    evidences: { type: string; url: string | null; filePath: string | null }[];
  }[];
  team: { id: string; name: string; roleName: string | null }[];
  timeline: { key: string; label: string; done: boolean; at: string | null; by: string | null }[];
  artifact: { id: string; artifactCode: string; currentVersion: number; issuedAt: string } | null;
}

// The public verify page base the backend appends the code to.
export function verificationBase() {
  return `${window.location.origin}/verify`;
}

export const artifactApi = {
  // Beginner: my certificates.
  async listMine(): Promise<Artifact[]> {
    const res = await apiClient.get<Envelope<Artifact[]>>("/artifacts");
    return res.data.data;
  },

  // Admin monitoring: all certificates.
  async listAll(): Promise<Artifact[]> {
    const res = await apiClient.get<Envelope<Artifact[]>>("/admin/artifacts");
    return res.data.data;
  },

  // Certificates for a project (senior "Sertifikat" tab).
  async listForProject(projectId: string): Promise<Artifact[]> {
    const res = await apiClient.get<Envelope<Artifact[]>>(`/projects/${projectId}/artifacts`);
    return res.data.data;
  },

  async detail(id: string): Promise<Artifact> {
    const res = await apiClient.get<Envelope<Artifact>>(`/artifacts/${id}`);
    return res.data.data;
  },

  // Senior lead: generate one certificate per beginner.
  async generate(projectId: string, beginnerIds: string[]): Promise<Artifact[]> {
    const res = await apiClient.post<Envelope<Artifact[]>>(
      `/projects/${projectId}/generate-artifacts`,
      { beginner_ids: beginnerIds, verification_url: verificationBase() }
    );
    return res.data.data;
  },

  // Senior lead: regenerate a new version (keeps history).
  async regenerate(id: string): Promise<Artifact> {
    const res = await apiClient.post<Envelope<Artifact>>(`/artifacts/${id}/regenerate`, {
      verification_url: verificationBase(),
    });
    return res.data.data;
  },

  // Beginner: derived per-project pipeline for "Artifact Saya".
  async pipeline(): Promise<PipelineItem[]> {
    const res = await apiClient.get<Envelope<PipelineItem[]>>("/me/artifact-pipeline");
    return res.data.data;
  },

  // Beginner: full detail for one project in the pipeline.
  async pipelineDetail(projectId: string): Promise<PipelineDetail> {
    const res = await apiClient.get<Envelope<PipelineDetail>>(`/me/artifact-pipeline/${projectId}`);
    return res.data.data;
  },

  // Public: verify by code.
  async verify(code: string): Promise<VerifyResult> {
    const res = await apiClient.get<Envelope<VerifyResult>>(
      `/verify/${encodeURIComponent(code)}`
    );
    return res.data.data;
  },

  // Authenticated PDF download → triggers a browser save.
  async download(id: string, filename: string): Promise<void> {
    const res = await apiClient.get(`/artifacts/${id}/download`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
