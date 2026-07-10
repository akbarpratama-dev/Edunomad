"use client";

// Diskusi page under the "Proyek Saya / Proyek Mentoring" section. Renders the
// same page as /projects/:id/workspace/diskusi; base is derived from usePathname.
// Explicit client wrapper instead of a cross-route re-export (see D-DEPLOY-2) —
// the re-export form 500s on Vercel (FUNCTION_INVOCATION_FAILED).
import DiskusiPage from "@/app/projects/[id]/workspace/diskusi/page";

export default function MyProjectDiskusiPage() {
  return <DiskusiPage />;
}
