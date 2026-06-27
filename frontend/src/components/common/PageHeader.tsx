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
        <h1 className="text-2xl font-bold tracking-tight text-pretty text-foreground sm:text-[28px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-pretty text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
