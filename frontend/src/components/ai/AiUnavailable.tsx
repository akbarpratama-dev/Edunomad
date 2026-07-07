"use client";

import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shared fallback shown whenever an AI result is unavailable (key not set / AI
// down). Purely informational — the surrounding feature keeps working (D-AI-1).
export function AiUnavailable({
  reason,
  onRetry,
  compact,
}: {
  reason?: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={
        "flex items-center gap-2.5 rounded-[14px] border border-dashed border-border bg-muted/40 text-sm text-muted-foreground " +
        (compact ? "px-3 py-2" : "px-4 py-3")
      }
    >
      <Sparkles className="size-4 shrink-0 text-muted-foreground/70" />
      <span className="min-w-0 flex-1">{reason || "Fitur AI sedang tidak tersedia."}</span>
      {onRetry && (
        <Button variant="ghost" size="sm" className="shrink-0 gap-1.5" onClick={onRetry}>
          <RefreshCw className="size-3.5" /> Coba lagi
        </Button>
      )}
    </div>
  );
}
