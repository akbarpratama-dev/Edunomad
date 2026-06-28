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
  return (
    <div data-app className="flex h-dvh bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Floating controls (notif + profile, + back when backHref) — sit on the
            same row as each page's title instead of in a separate breadcrumb bar. */}
        <Header backHref={backHref} />
        <main
          className={cn(
            "flex-1 overflow-y-auto px-6 pb-8 lg:px-8",
            // Back pages reserve the full header band; others let the title share
            // the row with the floating controls (title is left, controls right).
            backHref ? "pt-16" : "pt-5 lg:pt-6"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
