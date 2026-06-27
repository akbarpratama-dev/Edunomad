import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import type { BreadcrumbItem } from "@/components/layout/Breadcrumbs";

interface AppShellProps {
  children: React.ReactNode;
  // Deprecated: kept so existing pages compile; breadcrumbs are no longer shown
  // (each page renders its own title, so a breadcrumb header would double it up).
  breadcrumbs?: BreadcrumbItem[];
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div data-app className="flex h-dvh bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 pb-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
