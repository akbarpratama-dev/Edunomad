import type { ReactNode } from "react";

// Standard page header (DESIGN.md display role + muted subtitle). Use at the top
// of every authed page so titles share one rhythm.
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
    <div className="app-reveal flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">{title}</h1>
        {subtitle && <p className="mt-1 max-w-prose text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
