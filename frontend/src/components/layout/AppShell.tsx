"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import type { BreadcrumbItem } from "@/components/layout/Breadcrumbs";

interface AppShellProps {
  children: React.ReactNode;
  // Deprecated: kept so existing pages compile; breadcrumbs are no longer shown
  // (each page renders its own title, so a breadcrumb header would double it up).
  breadcrumbs?: BreadcrumbItem[];
  // When set, the header shows a back button (left, matching the notif/profile
  // controls) linking here, and the content area reserves the ~56px header band
  // so the back button never overlaps page content.
  backHref?: string;
}

export function AppShell({ children, backHref }: AppShellProps) {
  // The header fills with a solid bar once content scrolls under it, so the
  // notif/profile (and back) controls stay readable instead of overlapping the
  // scrolled content. At the top of non-back pages it stays transparent so the
  // page title can share the row with the controls.
  const [scrolled, setScrolled] = useState(false);

  return (
    <div data-app className="flex h-dvh bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Header backHref={backHref} scrolled={scrolled} />
        <main
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
          className={cn(
            "flex-1 overflow-y-auto px-6 pb-8 lg:px-8",
            backHref ? "pt-16" : "pt-5 lg:pt-6"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
