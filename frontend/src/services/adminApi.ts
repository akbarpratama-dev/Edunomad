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
};
