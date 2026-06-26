import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  FolderPlus,
  Award,
  Bell,
  HelpCircle,
  Shield,
  FileText,
  ClipboardCheck,
  FileSignature,
  Star,
  ShieldCheck,
  ScrollText,
} from "lucide-react";
import type { Role } from "@/types/user";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Sidebar Navigation — docs/08-UI_Pages_Specification_v1.0.md Shared Components & Patterns.
// The Dashboard entry is role-aware: ADMIN lands on /admin/dashboard (a /dashboard
// visit redirects there), so the nav must point there too or it never highlights.
const dashboardItem = (role?: Role): NavItem => ({
  label: "Dashboard",
  href: role === "ADMIN" ? "/admin/dashboard" : "/dashboard",
  icon: LayoutDashboard,
});

// Browse the public project catalogue — only for roles that join/apply to projects.
// UMKM creates & manages its own projects (Buat Proyek / Proyek Saya) and never
// browses to find one, so it is intentionally excluded (docs/08 only documents
// "Browse Projects" for Beginner and Senior).
const BROWSE_PROJECTS: NavItem = {
  label: "Telusuri Proyek",
  href: "/projects",
  icon: FolderKanban,
};

// Role-specific items appended after the common ones (per-role page sets now exist — Phase 3).
const ROLE_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    BROWSE_PROJECTS,
    { label: "Tinjau Proyek", href: "/admin/projects/review", icon: ClipboardCheck },
    { label: "Verifikasi Pengguna", href: "/admin/users/verification", icon: ShieldCheck },
    { label: "Audit Log", href: "/admin/audit-logs", icon: ScrollText },
  ],
  UMKM: [
    { label: "Buat Proyek", href: "/projects/create", icon: FolderPlus },
    { label: "Proyek Saya", href: "/my-projects", icon: FolderKanban },
  ],
  SENIOR: [
    BROWSE_PROJECTS,
    { label: "Lamaran Mentor", href: "/applications/mentor", icon: FileSignature },
  ],
  BEGINNER: [
    BROWSE_PROJECTS,
    { label: "Proyek Saya", href: "/my-projects", icon: FolderKanban },
    { label: "Lamaran Saya", href: "/applications", icon: FileSignature },
    { label: "Review Saya", href: "/reviews", icon: Star },
  ],
};

const TRAILING_ITEMS: NavItem[] = [
  { label: "Sertifikat", href: "/artifacts", icon: Award },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export function getNavItems(role?: Role): NavItem[] {
  // Sertifikat/Notifications don't apply to ADMIN (and aren't built yet), so the
  // admin sidebar skips the trailing items.
  const trailing = role === "ADMIN" ? [] : TRAILING_ITEMS;
  return [dashboardItem(role), ...(role ? ROLE_ITEMS[role] : []), ...trailing];
}

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { label: "Help", href: "/help", icon: HelpCircle },
  { label: "Privacy", href: "/privacy", icon: Shield },
  { label: "Terms", href: "/terms", icon: FileText },
];
