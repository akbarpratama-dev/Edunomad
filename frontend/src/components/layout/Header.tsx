"use client";

import Link from "next/link";
import { Menu, Bell, LogOut, User as UserIcon, ChevronDown, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useNotificationStore } from "@/stores/notificationStore";
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
export function Header({ backHref }: { backHref?: string }) {
  const mobileNavOpen = useUIStore((s) => s.modals["mobile-nav"] ?? false);
  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const user = useAuthStore((s) => s.user);
  const appUser = useAuthStore((s) => s.appUser);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <header
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-30 flex h-14 items-center justify-between px-4 lg:px-8",
        // Back pages reserve the header band, so fill it with a solid bar — keeps
        // the back button readable over content that scrolls underneath. Other
        // pages stay transparent so the page title can share the row with controls.
        backHref && "border-b border-border bg-background/85 backdrop-blur-md"
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
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 justify-center px-1 text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Button>

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
