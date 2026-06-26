"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavItems, FOOTER_NAV_ITEMS } from "@/constants/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import type { Role } from "@/types/user";

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

  // Highlight a single item: the one whose href is the longest prefix of the
  // current path (so /projects/create wins over /projects, and nested admin
  // pages match their own entry rather than nothing).
  const activeHref = useMemo(() => {
    if (!pathname) return undefined;
    return navItems
      .filter((i) => pathname === i.href || pathname.startsWith(i.href + "/"))
      .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  }, [navItems, pathname]);

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
            <Link
              key={item.href}
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

      {/* Profile mini-card */}
      {appUser && (
        <div className="m-3 mt-2 flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground">
            {appUser.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">{appUser.name}</p>
            <p className="flex items-center gap-1.5 text-[11px] text-[#8a8a96]">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              {appUser.status === "VERIFIED" ? "Terverifikasi" : "Belum terverifikasi"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
