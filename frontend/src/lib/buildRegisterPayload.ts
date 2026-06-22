import type { RegisterPayload } from "@/services/authApi";
import type { AboutData, PortfolioData, RegRole, SkillsData } from "@/stores/registrationStore";

// Maps the wizard store into the backend register payload. Role-specific
// "about" fields with no DB column are composed into headline + one
// experiences row; the CV + profile URLs become portfolio_links
// (decisions.md 2026-06-20).
export function buildRegisterPayload(state: {
  name: string;
  role: RegRole;
  about: AboutData;
  portfolio: PortfolioData;
  skills: SkillsData;
}): RegisterPayload {
  const { name, role, about, portfolio, skills } = state;

  // Compose a role-specific headline from the un-storable "about" fields.
  let headline: string | undefined;
  const affiliation: { title: string; organization: string } | null = (() => {
    if (role === "BEGINNER") {
      const parts = [about.status, about.fieldOfStudy, about.city].filter(Boolean);
      headline = parts.join(" · ") || undefined;
      if (about.institution) {
        return { title: about.fieldOfStudy || "Mahasiswa", organization: about.institution };
      }
      return null;
    }
    if (role === "SENIOR") {
      const parts = [about.position, about.company, about.city].filter(Boolean);
      headline = parts.join(" · ") || undefined;
      if (about.company) {
        return { title: about.position || "Profesional", organization: about.company };
      }
      return null;
    }
    // UMKM
    const parts = [about.businessType, about.location].filter(Boolean);
    headline = parts.join(" · ") || undefined;
    if (about.businessName) {
      return { title: "Pemilik Usaha", organization: about.businessName };
    }
    return null;
  })();

  // bio: the "Tentang Saya" text, plus learning interests appended if present.
  let bio = portfolio.bio?.trim() || undefined;
  if (skills.learningInterests.length > 0) {
    const interests = `Minat belajar: ${skills.learningInterests.join(", ")}`;
    bio = bio ? `${bio}\n\n${interests}` : interests;
  }

  const portfolioLinks: RegisterPayload["portfolio_links"] = [];
  if (portfolio.github)
    portfolioLinks.push({ title: "GitHub", url: portfolio.github, type: "GITHUB" });
  if (portfolio.linkedin)
    portfolioLinks.push({ title: "LinkedIn", url: portfolio.linkedin, type: "LINKEDIN" });
  if (portfolio.behance)
    portfolioLinks.push({ title: "Behance", url: portfolio.behance, type: "BEHANCE" });
  if (portfolio.portfolio)
    portfolioLinks.push({ title: "Portfolio", url: portfolio.portfolio, type: "OTHER" });
  if (portfolio.cvUrl)
    portfolioLinks.push({ title: "CV", url: portfolio.cvUrl, type: "OTHER" });

  const level = skills.experienceLevel ?? "INTERMEDIATE";

  return {
    name,
    role,
    profile: {
      ...(bio ? { bio } : {}),
      ...(headline ? { headline } : {}),
      ...(portfolio.linkedin ? { linkedin_url: portfolio.linkedin } : {}),
    },
    skills: skills.skillIds.map((id) => ({ skill_id: id, level })),
    experiences: affiliation
      ? [
          {
            title: affiliation.title,
            organization: affiliation.organization,
            start_date: new Date().toISOString().slice(0, 10),
            end_date: null,
          },
        ]
      : [],
    portfolio_links: portfolioLinks,
  };
}
