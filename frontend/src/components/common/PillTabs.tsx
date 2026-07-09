"use client";

import { cn } from "@/lib/utils";

export interface PillTab<T extends string> {
  key: T;
  label: string;
  count?: number;
  // "alert" makes the count badge pop (attention color) when it represents
  // pending actions the user should notice; "default" is a neutral count.
  tone?: "default" | "alert";
}

// Shared premium tabs. Two looks:
// - "pill" (default): navy-fill chip, for status/segment switching (keeps every
//   existing page unchanged).
// - "underline": classic tab bar with a bottom active indicator — reads
//   unmistakably as *tabs*, not functional buttons (used in the workspace where
//   the pill chips were mistaken for action buttons).
export function PillTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
  ariaLabel,
  variant = "underline",
}: {
  tabs: PillTab<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  ariaLabel?: string;
  variant?: "pill" | "underline";
}) {
  const underline = variant === "underline";
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        underline
          ? "flex flex-nowrap gap-1 overflow-x-auto border-b border-border"
          : "flex flex-wrap gap-2 overflow-x-auto",
        className
      )}
    >
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 text-sm font-medium transition-colors",
              underline
                ? cn(
                    "-mb-px border-b-2 px-3 py-2.5",
                    active
                      ? "border-[#201f31] text-foreground"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  )
                : cn(
                    "rounded-full border px-4 py-1.5",
                    active
                      ? "border-[#201f31] bg-[#201f31] text-white"
                      : "border-border bg-card text-muted-foreground hover:border-[#a3ce00] hover:text-foreground"
                  )
            )}
          >
            {t.label}
            {typeof t.count === "number" && t.count > 0 && (
              <span
                className={cn(
                  "grid min-w-[1.25rem] place-items-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
                  t.tone === "alert"
                    ? "bg-red-500 text-white"
                    : active && !underline
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
