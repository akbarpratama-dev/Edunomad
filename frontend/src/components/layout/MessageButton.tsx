"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { projectApi } from "@/services/projectApi";

const LIVE = ["ACTIVE", "AWAITING_COMPLETION"];

// Topbar shortcut to the user's project Diskusi page. Resolves the current
// (live) project per role once; falls back to the projects hub if none. Hidden
// for ADMIN (no member projects).
export function MessageButton() {
  const role = useAuthStore((s) => s.appUser?.role);
  const [href, setHref] = useState("/my-projects");

  useEffect(() => {
    if (!role || role === "ADMIN") return;
    let active = true;
    (async () => {
      try {
        let projectId: string | undefined;
        if (role === "BEGINNER") {
          const m = await projectApi.myMemberships();
          projectId = (m.find((x) => LIVE.includes(x.project.status)) ?? m[0])?.project.id;
        } else if (role === "SENIOR") {
          const p = await projectApi.mentoredProjects();
          projectId = (p.find((x) => LIVE.includes(x.status)) ?? p[0])?.id;
        } else {
          const r = await projectApi.myProjects({ limit: 100 });
          projectId = (r.data.find((x) => LIVE.includes(x.status)) ?? r.data[0])?.id;
        }
        if (active && projectId) setHref(`/my-projects/${projectId}/workspace/diskusi`);
      } catch {
        // keep fallback
      }
    })();
    return () => {
      active = false;
    };
  }, [role]);

  if (!role || role === "ADMIN") return null;

  return (
    <Button variant="ghost" size="icon" aria-label="Diskusi" render={<Link href={href} />}>
      <MessageSquare className="size-5" />
    </Button>
  );
}
