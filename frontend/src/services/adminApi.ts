import { apiClient } from "@/lib/apiClient";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}
interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; lastPage: number };
}

export interface DashboardStats {
  users: { byStatus: Record<string, number>; total: number };
  projects: { byStatus: Record<string, number>; total: number };
  artifacts: number;
  recentActivities: {
    id: string;
    action: string;
    entityType: string;
    createdAt: string;
    user: { id: string; name: string; role: string };
  }[];
}

export interface VerificationRequestItem {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    profile: { headline: string | null; bio: string | null; linkedinUrl: string | null } | null;
  };
}

export interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string; email: string; role: string } | null;
}

export interface AdminProjectItem {
  id: string;
  title: string;
  status: string;
  deadline: string;
  createdAt: string;
  imageUrl: string | null;
  umkm: { id: string; name: string };
  senior: { id: string; name: string } | null;
  category: { id: string; name: string };
  _count: { projectMembers: number };
}

export interface SeniorCandidate {
  id: string;
  name: string;
  email: string;
  profile: { headline: string | null } | null;
  activeCount: number;
  eligible: boolean;
}

export const adminApi = {
  async dashboard(): Promise<DashboardStats> {
    const res = await apiClient.get<Envelope<DashboardStats>>("/admin/dashboard");
    return res.data.data;
  },

  async listVerifications(status: string, page = 1, limit = 10): Promise<Paginated<VerificationRequestItem>> {
    const res = await apiClient.get<Paginated<VerificationRequestItem>>("/admin/verifications", {
      params: { status, page, limit },
    });
    return res.data;
  },

  async approveVerification(id: string) {
    await apiClient.post(`/admin/verifications/${id}/approve`);
  },

  async rejectVerification(id: string, reason: string) {
    await apiClient.post(`/admin/verifications/${id}/reject`, { reason });
  },

  async auditLogs(params: {
    user_id?: string;
    action?: string;
    entity_type?: string;
    page?: number;
    limit?: number;
  }): Promise<Paginated<AuditLogItem>> {
    const res = await apiClient.get<Paginated<AuditLogItem>>("/admin/audit-logs", { params });
    return res.data;
  },

  // --- Project monitoring + mentor replacement (Workflow 16) ---
  async listProjects(params: {
    status?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<Paginated<AdminProjectItem>> {
    const res = await apiClient.get<Paginated<AdminProjectItem>>("/admin/projects", { params });
    return res.data;
  },

  async seniorCandidates(projectId: string): Promise<SeniorCandidate[]> {
    const res = await apiClient.get<Envelope<SeniorCandidate[]>>(
      `/admin/projects/${projectId}/senior-candidates`
    );
    return res.data.data;
  },

  async replaceSenior(projectId: string, newSeniorId: string): Promise<void> {
    await apiClient.post(`/admin/projects/${projectId}/replace-senior`, {
      new_senior_id: newSeniorId,
    });
  },
};
