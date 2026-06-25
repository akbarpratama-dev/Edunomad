import { apiClient } from "@/lib/apiClient";

// --- Envelopes ---
interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}
export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; lastPage: number };
}

// --- Domain types (mirror Prisma camelCase output) ---
export type ProjectStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "RECRUITING"
  | "REJECTED"
  | "ACTIVE"
  | "AWAITING_COMPLETION"
  | "COMPLETED";

export type MemberStatus =
  | "ACTIVE"
  | "REMOVAL_REQUESTED"
  | "REMOVED"
  | "WITHDRAWN"
  | "COMPLETED";

export interface ProjectMember {
  id: string;
  status: MemberStatus;
  joinedAt: string;
  user: { id: string; name: string; email: string };
  projectRole: { id: string; roleName: string };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProjectListItem {
  id: string;
  title: string;
  description: string;
  expectedDeliverables: string;
  startDate: string;
  deadline: string;
  status: ProjectStatus;
  categoryId: string;
  umkmId: string;
  createdAt: string;
  umkm: { id: string; name: string };
  category: Category;
}

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: string;
}

export interface RoleSkill {
  id: string;
  skill: { id: string; name: string };
}

export interface ProjectRole {
  id: string;
  roleName: string;
  capacity: number;
  requirements: string | null;
  roleSkills: RoleSkill[];
}

export interface ProjectDetail extends Omit<ProjectListItem, "umkm"> {
  umkm: { id: string; name: string; email: string };
  senior: { id: string; name: string; email: string } | null;
  milestones: Milestone[];
  projectRoles: ProjectRole[];
}

// GET /me/projects — a membership row with enough project info for "Proyek Saya".
export interface MyMembership {
  id: string;
  status: MemberStatus;
  joinedAt: string;
  projectRole: { id: string; roleName: string };
  project: {
    id: string;
    title: string;
    status: ProjectStatus;
    deadline: string;
    startDate: string;
    umkm: { id: string; name: string };
    senior: { id: string; name: string } | null;
    category: Category;
  };
}

// --- Request payloads ---
export interface ProjectBasicInput {
  category_id: string;
  title: string;
  description: string;
  expected_deliverables: string;
  start_date: string;
  deadline: string;
}
export interface MilestoneInput {
  title: string;
  description?: string;
  due_date: string;
}
export interface RoleInput {
  role_name: string;
  capacity: number;
  requirements?: string;
  skills: string[];
}

export const projectApi = {
  // --- Public discovery ---
  async list(params: {
    q?: string;
    category?: string;
    status?: ProjectStatus;
    page?: number;
    limit?: number;
  }): Promise<Paginated<ProjectListItem>> {
    const res = await apiClient.get<Paginated<ProjectListItem>>("/projects", { params });
    return res.data;
  },

  async detail(id: string): Promise<ProjectDetail> {
    const res = await apiClient.get<Envelope<ProjectDetail>>(`/projects/${id}`);
    return res.data.data;
  },

  async categories(): Promise<Category[]> {
    const res = await apiClient.get<Paginated<Category>>("/categories", {
      params: { limit: 100 },
    });
    return res.data.data;
  },

  // --- UMKM project lifecycle ---
  async create(input: ProjectBasicInput): Promise<ProjectDetail> {
    const res = await apiClient.post<Envelope<ProjectDetail>>("/projects", input);
    return res.data.data;
  },

  async update(id: string, input: ProjectBasicInput): Promise<ProjectDetail> {
    const res = await apiClient.put<Envelope<ProjectDetail>>(`/projects/${id}`, input);
    return res.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },

  async submit(id: string): Promise<ProjectDetail> {
    const res = await apiClient.post<Envelope<ProjectDetail>>(`/projects/${id}/submit`);
    return res.data.data;
  },

  async myProjects(params: {
    status?: ProjectStatus;
    page?: number;
    limit?: number;
  }): Promise<Paginated<ProjectListItem>> {
    const res = await apiClient.get<Paginated<ProjectListItem>>("/my-projects", { params });
    return res.data;
  },

  // GET /me/projects — the caller's own project memberships (beginner "Proyek Saya").
  async myMemberships(): Promise<MyMembership[]> {
    const res = await apiClient.get<Envelope<MyMembership[]>>("/me/projects");
    return res.data.data;
  },

  // --- Milestones (nested under a project) ---
  async addMilestone(projectId: string, input: MilestoneInput): Promise<Milestone> {
    const res = await apiClient.post<Envelope<Milestone>>(
      `/projects/${projectId}/milestones`,
      input
    );
    return res.data.data;
  },

  async deleteMilestone(milestoneId: string): Promise<void> {
    await apiClient.delete(`/milestones/${milestoneId}`);
  },

  // --- Roles (nested under a project) ---
  async addRole(projectId: string, input: RoleInput): Promise<ProjectRole> {
    const res = await apiClient.post<Envelope<ProjectRole>>(`/projects/${projectId}/roles`, input);
    return res.data.data;
  },

  async deleteRole(roleId: string): Promise<void> {
    await apiClient.delete(`/roles/${roleId}`);
  },

  // --- Members (Workflow 5/16/17) ---
  async members(projectId: string): Promise<ProjectMember[]> {
    const res = await apiClient.get<Envelope<ProjectMember[]>>(`/projects/${projectId}/members`);
    return res.data.data;
  },

  async requestRemoveMember(memberId: string, reason: string): Promise<void> {
    await apiClient.post(`/members/${memberId}/remove`, { reason });
  },

  async withdrawMember(memberId: string): Promise<void> {
    await apiClient.post(`/members/${memberId}/withdraw`);
  },

  // --- Lifecycle (Workflow 5/11/15) ---
  async start(id: string): Promise<ProjectDetail> {
    const res = await apiClient.post<Envelope<ProjectDetail>>(`/projects/${id}/start`);
    return res.data.data;
  },

  async requestCompletion(id: string): Promise<ProjectDetail> {
    const res = await apiClient.post<Envelope<ProjectDetail>>(`/projects/${id}/complete`);
    return res.data.data;
  },

  async confirmCompletion(id: string): Promise<ProjectDetail> {
    const res = await apiClient.post<Envelope<ProjectDetail>>(`/projects/${id}/confirm-completion`);
    return res.data.data;
  },

  // --- Admin ---
  async confirmMemberRemoval(memberId: string): Promise<void> {
    await apiClient.post(`/admin/members/${memberId}/remove`);
  },

  // --- Admin approval ---
  async pending(page = 1, limit = 50): Promise<Paginated<ProjectListItem>> {
    const res = await apiClient.get<Paginated<ProjectListItem>>("/admin/projects/pending", {
      params: { page, limit },
    });
    return res.data;
  },

  async approve(id: string): Promise<void> {
    await apiClient.post(`/admin/projects/${id}/approve`);
  },

  async reject(id: string, reason: string): Promise<void> {
    await apiClient.post(`/admin/projects/${id}/reject`, { reason });
  },
};

// Status display metadata (labels in Indonesian + badge variant + optional tint).
// Badge has no success/warning variant, so distinct colors use a className tint.
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
export const PROJECT_STATUS_META: Record<
  ProjectStatus,
  { label: string; variant: BadgeVariant; className?: string }
> = {
  DRAFT: { label: "Draf", variant: "secondary" },
  PENDING_REVIEW: {
    label: "Menunggu Tinjauan",
    variant: "outline",
    className: "border-amber-300 bg-amber-50 text-amber-700",
  },
  RECRUITING: {
    label: "Rekrutmen",
    variant: "outline",
    className: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
  REJECTED: { label: "Ditolak", variant: "destructive" },
  ACTIVE: { label: "Aktif", variant: "default" },
  AWAITING_COMPLETION: {
    label: "Menunggu Konfirmasi",
    variant: "outline",
    className: "border-violet-300 bg-violet-50 text-violet-700",
  },
  COMPLETED: {
    label: "Selesai",
    variant: "outline",
    className: "border-sky-300 bg-sky-50 text-sky-700",
  },
};

// Member status display metadata (Indonesian labels + Badge tint).
export const MEMBER_STATUS_META: Record<
  MemberStatus,
  { label: string; variant: BadgeVariant; className?: string }
> = {
  ACTIVE: {
    label: "Aktif",
    variant: "outline",
    className: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
  REMOVAL_REQUESTED: {
    label: "Diajukan Keluar",
    variant: "outline",
    className: "border-amber-300 bg-amber-50 text-amber-700",
  },
  REMOVED: { label: "Dikeluarkan", variant: "destructive" },
  WITHDRAWN: { label: "Mengundurkan Diri", variant: "secondary" },
  COMPLETED: {
    label: "Selesai",
    variant: "outline",
    className: "border-sky-300 bg-sky-50 text-sky-700",
  },
};
