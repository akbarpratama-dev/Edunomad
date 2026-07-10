"use client";

// Workspace under the "Proyek Saya / Proyek Mentoring" section. Renders the same
// page as /projects/:id/workspace (tab deep-link via ?tab= still works); base
// path is derived from usePathname so back/links stay inside /my-projects.
// Explicit client wrapper instead of a cross-route re-export (see D-DEPLOY-2).
import WorkspacePage from "@/app/projects/[id]/workspace/page";

export default function MyProjectWorkspacePage() {
  return <WorkspacePage />;
}
