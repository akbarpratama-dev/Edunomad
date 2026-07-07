import { apiClient } from "@/lib/apiClient";
import type { Role } from "@/types/user";
import type { ProjectStatus } from "@/services/projectApi";
import type { PortfolioArtifact } from "@/services/portfolioApi";

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

// Level → progress-bar percentage (schema stores level, not a %). Kept here so
// the bar and any future sorting share one mapping.
export const SKILL_LEVEL_PCT: Record<SkillLevel, number> = {
  BEGINNER: 40,
  INTERMEDIATE: 70,
  ADVANCED: 100,
};

export const SKILL_LEVEL_LABEL: Record<SkillLevel, string> = {
  BEGINNER: "Pemula",
  INTERMEDIATE: "Menengah",
  ADVANCED: "Mahir",
};

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: string;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface ProfileData {
  headline: string | null;
  bio: string | null;
  phone: string | null;
  photo: string | null;
  linkedinUrl: string | null;
}

export interface ProfileSkill {
  id: string;
  level: SkillLevel;
  skill: { id: string; name: string };
}

export interface ProfileExperience {
  id: string;
  title: string;
  organization: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
}

export interface ProfileLink {
  id: string;
  title: string;
  url: string;
  type: string; // GITHUB | FIGMA | BEHANCE | LINKEDIN | OTHER
}

export interface ProfileStats {
  verifiedArtifacts: number;
  completedProjects: number;
  currentProjects: number;
  avgRating: number | null;
  reviewCount: number;
  contributionHours: number; // placeholder 0 — no tracking field yet (D-P10-2)
}

// The Sertifikat tab renders the rich portfolio artifact (see portfolioApi).
export type ProfileArtifact = PortfolioArtifact;

// Role-aware project row. Beginner rows carry membership status + role name;
// senior/UMKM rows are flat projects.
export interface ProfileProjectMember {
  status: string;
  projectRole: { roleName: string };
  project: {
    id: string;
    title: string;
    status: ProjectStatus;
    imageUrl: string | null;
    category: { id: string; name: string };
  };
}
export interface ProfileProjectFlat {
  id: string;
  title: string;
  status: ProjectStatus;
  imageUrl: string | null;
  category: { id: string; name: string };
}
export type ProfileProject = ProfileProjectMember | ProfileProjectFlat;

export function isMemberProject(p: ProfileProject): p is ProfileProjectMember {
  return (p as ProfileProjectMember).project !== undefined;
}

export interface ProfileOverview {
  user: ProfileUser;
  profile: ProfileData | null;
  skills: ProfileSkill[];
  experiences: ProfileExperience[];
  portfolioLinks: ProfileLink[];
  stats: ProfileStats;
  artifacts: PortfolioArtifact[];
  projects: ProfileProject[];
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  photo?: string;
  headline?: string;
  bio?: string;
  linkedin_url?: string;
}

export type LinkType = "GITHUB" | "FIGMA" | "BEHANCE" | "LINKEDIN" | "OTHER";
export const LINK_TYPES: LinkType[] = ["GITHUB", "FIGMA", "BEHANCE", "LINKEDIN", "OTHER"];

export interface AddSkillInput {
  skill_id: string;
  level: SkillLevel;
}
export interface ExperienceInput {
  title: string;
  organization: string;
  description?: string;
  start_date: string;
  end_date?: string | null;
}
export interface LinkInput {
  title: string;
  url: string;
  type: LinkType;
}

export const profileApi = {
  // Composite payload for the profile page (own via appUser.id, or another user).
  async getOverview(userId: string): Promise<ProfileOverview> {
    const res = await apiClient.get<Envelope<ProfileOverview>>(
      `/users/${userId}/profile-overview`
    );
    return res.data.data;
  },

  // Partial update of the caller's own profile (name → users; rest → profile).
  async updateMe(input: UpdateProfileInput): Promise<void> {
    await apiClient.put("/users/me", input);
  },

  // --- Own skills (Workflow: profile management) ---
  skills: {
    async add(input: AddSkillInput): Promise<ProfileSkill> {
      const res = await apiClient.post<Envelope<ProfileSkill>>("/users/me/skills", input);
      return res.data.data;
    },
    async updateLevel(id: string, level: SkillLevel): Promise<ProfileSkill> {
      const res = await apiClient.put<Envelope<ProfileSkill>>(`/users/me/skills/${id}`, { level });
      return res.data.data;
    },
    async remove(id: string): Promise<void> {
      await apiClient.delete(`/users/me/skills/${id}`);
    },
  },

  // --- Own experiences ---
  experiences: {
    async add(input: ExperienceInput): Promise<ProfileExperience> {
      const res = await apiClient.post<Envelope<ProfileExperience>>("/users/me/experiences", input);
      return res.data.data;
    },
    async update(id: string, input: ExperienceInput): Promise<ProfileExperience> {
      const res = await apiClient.put<Envelope<ProfileExperience>>(
        `/users/me/experiences/${id}`,
        input
      );
      return res.data.data;
    },
    async remove(id: string): Promise<void> {
      await apiClient.delete(`/users/me/experiences/${id}`);
    },
  },

  // --- Own portfolio / social links ---
  links: {
    async add(input: LinkInput): Promise<ProfileLink> {
      const res = await apiClient.post<Envelope<ProfileLink>>("/users/me/portfolio-links", input);
      return res.data.data;
    },
    async update(id: string, input: LinkInput): Promise<ProfileLink> {
      const res = await apiClient.put<Envelope<ProfileLink>>(
        `/users/me/portfolio-links/${id}`,
        input
      );
      return res.data.data;
    },
    async remove(id: string): Promise<void> {
      await apiClient.delete(`/users/me/portfolio-links/${id}`);
    },
  },
};
