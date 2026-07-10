"use client";

// Project detail under the "Proyek Saya / Proyek Mentoring" section. Renders the
// same page as /projects/:id (the component reads usePathname to keep navigation
// inside /my-projects). Uses an explicit client wrapper instead of a cross-route
// `export { default } from` re-export — the re-export form crashes on Vercel's
// serverless bundler (FUNCTION_INVOCATION_FAILED) though it works locally.
import ProjectDetailPage from "@/app/projects/[id]/page";

export default function MyProjectDetailPage() {
  return <ProjectDetailPage />;
}
