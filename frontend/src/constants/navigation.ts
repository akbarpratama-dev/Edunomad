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
} from "lucide-react";
import type { Role } from "@/types/user";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Sidebar Navigation — docs/08-UI_Pages_Specification_v1.0.md Shared Components & Patterns.
// Items shared by every role.
const COMMON_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Telusuri Proyek", href: "/projects", icon: FolderKanban },
];

// Role-specific items appended after the common ones (per-role page sets now exist — Phase 3).
const ROLE_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: "Tinjau Proyek", href: "/admin/projects/review", icon: ClipboardCheck },
  ],
  UMKM: [
    { label: "Buat Proyek", href: "/projects/create", icon: FolderPlus },
    { label: "Proyek Saya", href: "/my-projects", icon: FolderKanban },
  ],
  SENIOR: [
    { label: "Lamaran Mentor", href: "/applications/mentor", icon: FileSignature },
  ],
  BEGINNER: [
    { label: "Lamaran Saya", href: "/applications", icon: FileSignature },
  ],
};

const TRAILING_ITEMS: NavItem[] = [
  { label: "Sertifikat", href: "/artifacts", icon: Award },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export function getNavItems(role?: Role): NavItem[] {
  return [...COMMON_ITEMS, ...(role ? ROLE_ITEMS[role] : []), ...TRAILING_ITEMS];
}

export const FOOTER_NAV_ITEMS: NavItem[] = [
  { label: "Help", href: "/help", icon: HelpCircle },
  { label: "Privacy", href: "/privacy", icon: Shield },
  { label: "Terms", href: "/terms", icon: FileText },
];
