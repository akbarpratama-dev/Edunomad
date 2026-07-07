import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Standard page header (DESIGN.md display role + muted subtitle). Use at the top
// of every authed page so titles share one rhythm.
//
// When `action` is present it is right-aligned, which would land under the
// floating header controls (notif + profile) in the top-right corner. So we add
// top padding to drop the whole row below that ~56px control band. Title-only
// pages stay flush at the top (their left-aligned title never collides).
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "app-reveal flex flex-wrap items-end justify-between gap-x-3 gap-y-2",
        action && "sm:pt-8"
      )}
    >
      <div className="min-w-0">
        <h1 className="text-h1 tracking-tight text-balance text-foreground">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 max-w-[65ch] text-body-lg text-pretty text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 max-sm:ml-auto">{action}</div>}
    </div>
  );
}
