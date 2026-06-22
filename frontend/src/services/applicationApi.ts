import { apiClient } from "@/lib/apiClient";
import type { Category, ProjectStatus } from "@/services/projectApi";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

// Project summary embedded in an applicant's own application list.
export interface ApplicationProjectSummary {
  id: string;
  title: string;
  status: ProjectStatus;
  deadline: string;
  category: Category;
  umkm: { id: string; name: string };
}

export interface RoleSummary {
  id: string;
  roleName: string;
}

// --- Senior applications ---
export interface SeniorApplicationMine {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  project: ApplicationProjectSummary;
}

export interface SeniorApplicant {
  id: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
  senior: {
    id: string;
    name: string;
    email: string;
    profile: {
      headline: string | null;
      bio: string | null;
      photo: string | null;
      linkedinUrl: string | null;
    } | null;
  };
}

// --- Beginner applications ---
export interface BeginnerApplicationMine {
  id: string;
  status: ApplicationStatus;
  motivation: string | null;
  createdAt: string;
  project: ApplicationProjectSummary;
  projectRole: RoleSummary;
}

export interface BeginnerApplicant {
  id: string;
  status: ApplicationStatus;
  motivation: string | null;
  createdAt: string;
  projectRole: RoleSummary;
  beginner: {
    id: string;
    name: string;
    email: string;
    profile: { headline: string | null; bio: string | null; photo: string | null } | null;
    userSkills: { level: string; skill: { id: string; name: string } }[];
  };
}

export const applicationApi = {
  // === Senior (Workflow 3) ===
  async applyAsMentor(projectId: string, message?: string): Promise<SeniorApplicationMine> {
    const res = await apiClient.post<Envelope<SeniorApplicationMine>>(
      `/projects/${projectId}/senior-apply`,
      { message }
    );
    return res.data.data;
  },

  async withdrawSenior(applicationId: string): Promise<void> {
    await apiClient.delete(`/senior-applications/${applicationId}`);
  },

  async mySeniorApplications(): Promise<SeniorApplicationMine[]> {
    const res = await apiClient.get<Envelope<SeniorApplicationMine[]>>("/senior-applications");
    return res.data.data;
  },

  async projectSeniorApplications(projectId: string): Promise<SeniorApplicant[]> {
    const res = await apiClient.get<Envelope<SeniorApplicant[]>>(
      `/projects/${projectId}/senior-applications`
    );
    return res.data.data;
  },

  async acceptSenior(applicationId: string): Promise<void> {
    await apiClient.post(`/senior-applications/${applicationId}/accept`);
  },

  async rejectSenior(applicationId: string): Promise<void> {
    await apiClient.post(`/senior-applications/${applicationId}/reject`);
  },

  // === Beginner (Workflow 4) ===
  async applyToRole(
    projectId: string,
    input: { project_role_id: string; motivation?: string }
  ): Promise<BeginnerApplicationMine> {
    const res = await apiClient.post<Envelope<BeginnerApplicationMine>>(
      `/projects/${projectId}/apply`,
      input
    );
    return res.data.data;
  },

  async withdrawApplication(applicationId: string): Promise<void> {
    await apiClient.delete(`/applications/${applicationId}`);
  },

  async myApplications(): Promise<BeginnerApplicationMine[]> {
    const res = await apiClient.get<Envelope<BeginnerApplicationMine[]>>("/applications");
    return res.data.data;
  },

  async projectApplications(projectId: string): Promise<BeginnerApplicant[]> {
    const res = await apiClient.get<Envelope<BeginnerApplicant[]>>(
      `/projects/${projectId}/applications`
    );
    return res.data.data;
  },

  async acceptApplication(applicationId: string): Promise<void> {
    await apiClient.post(`/applications/${applicationId}/accept`);
  },

  async rejectApplication(applicationId: string): Promise<void> {
    await apiClient.post(`/applications/${applicationId}/reject`);
  },
};

// Status display metadata (Indonesian labels + Badge tint). Badge has no
// success/warning variant, so distinct colors use a className tint.
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { label: string; variant: BadgeVariant; className?: string }
> = {
  PENDING: {
    label: "Menunggu",
    variant: "outline",
    className: "border-amber-300 bg-amber-50 text-amber-700",
  },
  ACCEPTED: {
    label: "Diterima",
    variant: "outline",
    className: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
  REJECTED: { label: "Ditolak", variant: "destructive" },
  WITHDRAWN: { label: "Ditarik", variant: "secondary" },
};
