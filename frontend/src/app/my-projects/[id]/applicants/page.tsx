"use client";

// Beginner-applicants management under /my-projects. Renders /projects/:id/applicants;
// base path derived from usePathname keeps back/links inside /my-projects.
// Explicit client wrapper instead of a cross-route re-export (see D-DEPLOY-2).
import ApplicantsPage from "@/app/projects/[id]/applicants/page";

export default function MyProjectApplicantsPage() {
  return <ApplicantsPage />;
}
