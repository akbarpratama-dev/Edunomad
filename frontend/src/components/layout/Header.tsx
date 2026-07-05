"use client";

import Link from "next/link";
import { Menu, LogOut, User as UserIcon, ChevronDown, ArrowLeft, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { signOut } from "@/services/auth";
import type { Role } from "@/types/user";

const ROLE_LABEL: Record<Role, string> = {
  BEGINNER: "Mahasiswa",
  SENIOR: "Mentor",
  UMKM: "UMKM",
  ADMIN: "Admin",
};

// Slim top bar — no breadcrumbs (each page owns its own title). Just the mobile
// nav trigger on the left and the notification + profile controls on the right.
export function Header({ backHref, scrolled }: { backHref?: string; scrolled?: boolean }) {
  const mobileNavOpen = useUIStore((s) => s.modals["mobile-nav"] ?? false);
  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const user = useAuthStore((s) => s.user);
  const appUser = useAuthStore((s) => s.appUser);

  return (
    <header
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-30 flex h-14 items-center justify-between px-4 lg:px-8 transition-colors duration-200",
        // Fill the bar (matching page bg, frosted) once content scrolls under it,
        // so the notif/profile/back controls stay readable instead of overlapping
        // the scrolled content. Back pages keep it filled (band is reserved); other
        // pages stay transparent at the top so the title can share the row.
        (backHref || scrolled) && "border-b border-border bg-background/85 backdrop-blur-md"
      )}
    >
      {/* Left controls: mobile nav + optional back, same ghost-icon style as the right cluster */}
      <div className="pointer-events-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => openModal("mobile-nav")}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </Button>
        {backHref && (
          <Button variant="ghost" size="icon" aria-label="Kembali" render={<Link href={backHref} />}>
            <ArrowLeft className="size-5" />
          </Button>
        )}
      </div>

      <div className="pointer-events-auto flex items-center gap-2">
        {/* Diskusi shortcut — leads to the projects hub where each project's
            Diskusi page lives (no global inbox). Hidden for ADMIN (no projects). */}
        {appUser && appUser.role !== "ADMIN" && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Diskusi"
            render={<Link href="/my-projects" />}
          >
            <MessageSquare className="size-5" />
          </Button>
        )}

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <span className="flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-muted">
              {appUser ? (
                <UserAvatar
                  name={appUser.name}
                  className="size-8 bg-[#d8f277] text-[12px] font-bold text-[#0b0b0b]"
                />
              ) : (
                <Avatar className="size-8">
                  <AvatarFallback className="bg-[#d8f277] text-[#0b0b0b]">
                    <UserIcon className="size-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              {appUser && (
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-semibold text-foreground">{appUser.name}</span>
                  <span className="block text-xs text-muted-foreground">{ROLE_LABEL[appUser.role]}</span>
                </span>
              )}
              <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>{user?.email ?? "Guest"}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Sheet open={mobileNavOpen} onOpenChange={(open) => (open ? openModal("mobile-nav") : closeModal("mobile-nav"))}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavigate={() => closeModal("mobile-nav")} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
