import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  FolderPlus,
  Award,
  HelpCircle,
  Shield,
  FileText,
  ClipboardCheck,
  ShieldCheck,
  ScrollText,
  Activity,
  Search,
  UserRound,
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
  label: "Beranda",
  href: role === "ADMIN" ? "/admin/dashboard" : "/dashboard",
  icon: LayoutDashboard,
});

// Browse the public project catalogue — only for roles that join/apply to projects.
// UMKM creates & manages its own projects (Buat Proyek / Proyek Saya) and never
// browses to find one, so it is intentionally excluded (docs/08 only documents
// "Browse Projects" for Beginner and Senior).
const BROWSE_PROJECTS: NavItem = {
  label: "Cari Proyek",
  href: "/projects",
  icon: Search,
};

// Role-specific items appended after the common ones (per-role page sets now exist — Phase 3).
const ROLE_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    BROWSE_PROJECTS,
    { label: "Tinjau Proyek", href: "/admin/projects/review", icon: ClipboardCheck },
    { label: "Pantau Proyek", href: "/admin/projects", icon: Activity },
    { label: "Verifikasi Pengguna", href: "/admin/users/verification", icon: ShieldCheck },
    { label: "Sertifikat", href: "/admin/artifacts", icon: Award },
    { label: "Audit Log", href: "/admin/audit-logs", icon: ScrollText },
  ],
  UMKM: [
    { label: "Buat Proyek", href: "/projects/create", icon: FolderPlus },
    { label: "Proyek Saya", href: "/my-projects", icon: FolderKanban },
  ],
  SENIOR: [
    BROWSE_PROJECTS,
    // The senior's assigned projects — their route into each project's workspace
    // (and the Diskusi tab), mirroring the Beginner/UMKM "Proyek Saya" entry.
    { label: "Proyek Saya", href: "/my-projects", icon: FolderKanban },
  ],
  BEGINNER: [
    BROWSE_PROJECTS,
    { label: "Proyek Saya", href: "/my-projects", icon: FolderKanban },
    // "Artifact Saya" is beginner-only. Seniors generate artifacts inside each
    // project workspace (Sertifikat tab); UMKM see them there too; admins have
    // their own /admin/artifacts monitoring — so /artifacts isn't in their nav.
    { label: "Daftar Sertifikat", href: "/artifacts", icon: Award },
  ],
};

// Profile access lives in the sidebar (all roles) — the header avatar is just
// the account menu.
const profileItem: NavItem = { label: "Profil", href: "/profile", icon: UserRound };

export function getNavItems(role?: Role): NavItem[] {
  // Notifications live in the header bell only (not the sidebar).
  return [dashboardItem(role), ...(role ? ROLE_ITEMS[role] : []), profileItem];
}

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { label: "Help", href: "/help", icon: HelpCircle },
  { label: "Privacy", href: "/privacy", icon: Shield },
  { label: "Terms", href: "/terms", icon: FileText },
];
