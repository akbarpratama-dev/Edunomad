"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Explainable match score chip. Color-coded by band; the reason is exposed on
// hover (title) so the senior sees "why" without opening the profile.
export function MatchScoreBadge({
  score,
  reason,
  className,
}: {
  score: number;
  reason?: string;
  className?: string;
}) {
  const tone =
    score >= 70
      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
      : score >= 40
        ? "border-amber-300 bg-amber-50 text-amber-700"
        : "border-border bg-muted text-muted-foreground";
  return (
    <span
      title={reason || undefined}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums",
        tone,
        className
      )}
    >
      <Sparkles className="size-3.5" />
      {Math.round(score)}% cocok
    </span>
  );
}
