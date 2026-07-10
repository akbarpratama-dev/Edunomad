"use client";

// Senior-applications management under /my-projects. Renders /projects/:id/manage;
// base path derived from usePathname keeps back/links inside /my-projects.
// Explicit client wrapper instead of a cross-route re-export (see D-DEPLOY-2).
import ManagePage from "@/app/projects/[id]/manage/page";

export default function MyProjectManagePage() {
  return <ManagePage />;
}
