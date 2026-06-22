import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type RegRole = "BEGINNER" | "SENIOR" | "UMKM";

// Role-specific "about" fields (Step 3). Per decisions.md 2026-06-20 these map
// onto headline/bio/experiences at completion (no DB columns of their own).
export interface AboutData {
  // BEGINNER
  status?: string;
  institution?: string;
  fieldOfStudy?: string;
  city?: string;
  // SENIOR
  company?: string;
  position?: string;
  yearsOfExperience?: string;
  // UMKM
  businessName?: string;
  businessType?: string;
  location?: string;
}

export interface PortfolioData {
  bio: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  behance?: string;
  cvUrl?: string;
  cvName?: string;
}

export interface SkillsData {
  primaryField?: string;
  experienceLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  learningInterests: string[];
  skillIds: string[];
}

interface RegistrationState {
  name: string;
  role: RegRole | null;
  about: AboutData;
  portfolio: PortfolioData;
  skills: SkillsData;
  setName: (name: string) => void;
  setRole: (role: RegRole) => void;
  setAbout: (about: AboutData) => void;
  setPortfolio: (portfolio: Partial<PortfolioData>) => void;
  setSkills: (skills: Partial<SkillsData>) => void;
  reset: () => void;
}

const initial = {
  name: "",
  role: null as RegRole | null,
  about: {} as AboutData,
  portfolio: { bio: "" } as PortfolioData,
  skills: { learningInterests: [], skillIds: [] } as SkillsData,
};

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set) => ({
      ...initial,
      setName: (name) => set({ name }),
      setRole: (role) => set({ role }),
      setAbout: (about) => set({ about }),
      setPortfolio: (portfolio) => set((s) => ({ portfolio: { ...s.portfolio, ...portfolio } })),
      setSkills: (skills) => set((s) => ({ skills: { ...s.skills, ...skills } })),
      reset: () => set({ ...initial }),
    }),
    {
      name: "edunomad-registration",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
