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
