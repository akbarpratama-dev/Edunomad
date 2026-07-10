"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavItems, FOOTER_NAV_ITEMS } from "@/constants/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { projectApi } from "@/services/projectApi";
import type { Role } from "@/types/user";

// Statuses where a project's Diskusi is worth linking to first.
const LIVE_PROJECT_STATUSES = ["ACTIVE", "AWAITING_COMPLETION"];

const ROLE_LABEL: Record<Role, string> = {
  BEGINNER: "Mahasiswa",
  SENIOR: "Mentor",
  UMKM: "UMKM",
  ADMIN: "Admin",
};

interface SidebarProps {
  onNavigate?: () => void;
}

// Premium dark navy sidebar (Figma node 229-2). Brand block + role-aware nav with a
// chartreuse active pill + a profile mini-card pinned to the bottom.
export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const appUser = useAuthStore((s) => s.appUser);
  const role = appUser?.role;
  const navItems = getNavItems(role);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  // "Diskusi Proyek" — a direct sidebar shortcut to the user's project Diskusi,
  // reachable from anywhere (not only inside a workspace). Only the mentor and
  // mahasiswa collaborate in discussion, so it is shown for SENIOR/BEGINNER only
  // — hidden for ADMIN and UMKM (rule D-DISKUSI-2, supersedes D-P12-8).
  // Resolution order:
  //  1. If already inside a workspace, use that project's id from the URL.
  //  2. Otherwise resolve the user's current live project (like the old topbar
  //     MessageButton did), falling back to the projects hub while it loads.
  const showDiskusi = role === "BEGINNER" || role === "SENIOR";
  const workspaceMatch = pathname?.match(
    /^\/(projects|my-projects)\/([^/]+)\/workspace/
  );
  const [resolvedDiskusiHref, setResolvedDiskusiHref] = useState("/my-projects");

  useEffect(() => {
    if (!showDiskusi) return;
    let active = true;
    (async () => {
      try {
        let projectId: string | undefined;
        if (role === "BEGINNER") {
          const m = await projectApi.myMemberships();
          projectId = (m.find((x) => LIVE_PROJECT_STATUSES.includes(x.project.status)) ?? m[0])
            ?.project.id;
        } else if (role === "SENIOR") {
          const p = await projectApi.mentoredProjects();
          projectId = (p.find((x) => LIVE_PROJECT_STATUSES.includes(x.status)) ?? p[0])?.id;
        } else {
          const r = await projectApi.myProjects({ limit: 100 });
          projectId = (r.data.find((x) => LIVE_PROJECT_STATUSES.includes(x.status)) ?? r.data[0])?.id;
        }
        if (active && projectId) {
          setResolvedDiskusiHref(`/my-projects/${projectId}/workspace/diskusi`);
        }
      } catch {
        // keep the /my-projects fallback
      }
    })();
    return () => {
      active = false;
    };
  }, [role, showDiskusi]);

  const diskusiHref = showDiskusi
    ? workspaceMatch
      ? `/${workspaceMatch[1]}/${workspaceMatch[2]}/workspace/diskusi`
      : resolvedDiskusiHref
    : null;

  // Highlight a single item: the one whose href is the longest prefix of the
  // current path (so /projects/create wins over /projects, and nested admin
  // pages match their own entry rather than nothing).
  const activeHref = useMemo(() => {
    if (!pathname) return undefined;
    const allHrefs = [...navItems.map((i) => i.href), ...(diskusiHref ? [diskusiHref] : [])];
    return allHrefs
      .filter((href) => pathname === href || pathname.startsWith(href + "/"))
      .sort((a, b) => b.length - a.length)[0];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navItems, pathname, diskusiHref]);

  return (
    <div className="app-dark flex h-full w-64 flex-col bg-[#201f31] text-[#e8e8ec]">
      {/* Brand */}
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-3 px-5 py-5"
      >
        <span className="grid size-9 place-items-center rounded-xl bg-primary text-[15px] font-black text-primary-foreground">
          E
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[15px] font-bold tracking-tight text-white">EduNomad</span>
          {role && <span className="text-[11px] text-[#8a8a96]">{ROLE_LABEL[role]}</span>}
        </span>
      </Link>

      <p className="px-5 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8f8f9b]">
        Menu
      </p>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const isActive = item.href === activeHref;
          const Icon = item.icon;
          const isNotif = item.href === "/notifications";
          return (
            <Fragment key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-[#b6b6c0] hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isNotif && unreadCount > 0 && (
                  <span
                    className={cn(
                      "grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold",
                      isActive ? "bg-primary-foreground text-primary" : "bg-[#e5484d] text-white"
                    )}
                  >
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* Diskusi Proyek — placed right below "Proyek Saya". Direct
                  shortcut to the user's project Diskusi from anywhere. */}
              {diskusiHref && item.href === "/my-projects" && (
                <Link
                  href={diskusiHref}
                  onClick={onNavigate}
                  aria-current={diskusiHref === activeHref ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors duration-200",
                    diskusiHref === activeHref
                      ? "bg-primary text-primary-foreground"
                      : "text-[#b6b6c0] hover:bg-white/5 hover:text-white"
                  )}
                >
                  <MessageSquare className="size-[18px] shrink-0" />
                  <span className="flex-1">Diskusi Proyek</span>
                </Link>
              )}
            </Fragment>
          );
        })}
      </nav>

      {/* Secondary links */}
      <div className="flex flex-col gap-0.5 px-3 pt-2">
        {FOOTER_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-[#9595a1] transition-colors duration-200 hover:bg-white/5 hover:text-white"
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
