"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default function AdminDashboardPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <AppShell breadcrumbs={[{ label: "Admin" }, { label: "Dashboard" }]}>
        <div className="flex w-full flex-col gap-6">
          <AdminDashboard />
        </div>
      </AppShell>
    </AuthGuard>
  );
}
