// Portfolio = the verified-certificate showcase that lives INSIDE the profile
// page (Sertifikat tab), fed by GET /users/:id/profile-overview — there is no
// standalone public portfolio page/endpoint (D-P13-2). These types describe the
// per-certificate detail the Sertifikat cards + the "Preview di Portofolio"
// modal render.

export interface PortfolioTeamMember {
  id: string;
  name: string;
  roleName: string | null;
}

// One verified certificate, with enough project detail to render the
// "Preview di Portofolio" modal without a second request.
export interface PortfolioArtifact {
  id: string;
  artifactCode: string;
  verificationUrl: string;
  currentVersion: number;
  issuedAt: string;
  roleName: string | null;
  technologies: string[];
  contributionSummary: string | null;
  contributionApproved: boolean;
  project: {
    id: string;
    title: string;
    description: string;
    imageUrl: string | null;
    status: string;
    startDate: string;
    deadline: string;
    completedAt: string | null;
    category: { id: string; name: string };
  };
  umkm: { id: string; name: string } | null;
  senior: { id: string; name: string } | null;
  // Mentor's endorsement (rating + comment) of the beginner's work in this project.
  seniorReview: { reviewerName: string; rating: number; comment: string | null } | null;
  team: PortfolioTeamMember[];
}

// Number of full weeks between two ISO dates, min 1 — the "Durasi Pengerjaan"
// figure shown across the portfolio surfaces.
export function durationWeeks(startIso: string, endIso: string | null): string {
  if (!endIso) return "—";
  const weeks = Math.max(
    1,
    Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / (7 * 86_400_000))
  );
  return `${weeks} Minggu`;
}
