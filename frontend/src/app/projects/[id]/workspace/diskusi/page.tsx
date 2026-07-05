"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { DiscussionTab } from "@/components/workspace/DiscussionTab";
import { ApiError } from "@/lib/apiClient";
import { projectApi, type ProjectDetail } from "@/services/projectApi";

// Dedicated Diskusi page (split out of the workspace tabs) so links can point
// straight to it. Back returns to the project workspace.
function Inner() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    projectApi
      .detail(id)
      .then((p) => active && setProject(p))
      .catch((err) => active && setError(err instanceof ApiError ? err.message : "Gagal memuat proyek"));
    return () => {
      active = false;
    };
  }, [id]);

  if (error) return <ErrorState message={error} />;
  if (!project) return <ListSkeleton rows={6} />;
  return <DiscussionTab project={project} />;
}

export default function DiskusiPage() {
  const params = useParams();
  const id = params.id as string;
  const pathname = usePathname();
  const base = pathname.startsWith("/my-projects") ? "/my-projects" : "/projects";
  return (
    <AuthGuard>
      <AppShell backHref={`${base}/${id}/workspace`}>
        <Inner />
      </AppShell>
    </AuthGuard>
  );
}
