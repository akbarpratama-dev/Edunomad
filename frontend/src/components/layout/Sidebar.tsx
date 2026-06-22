"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavItems, FOOTER_NAV_ITEMS } from "@/constants/navigation";
import { useAuthStore } from "@/stores/authStore";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.appUser?.role);
  const navItems = getNavItems(role);

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center px-4">
        <Link href="/dashboard" className="text-h3 font-semibold text-primary" onClick={onNavigate}>
          EduNomad
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-body text-neutral-dark transition-colors",
                isActive ? "bg-primary/10 text-primary" : "hover:bg-neutral-light"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border px-2 py-3">
        {FOOTER_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-body-sm text-neutral-gray hover:bg-neutral-light"
            >
              <Icon className="size-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
