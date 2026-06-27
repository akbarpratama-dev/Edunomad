import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

// Empty State — premium dashed surface (DESIGN.md). docs/08 Common UI Patterns.
export function EmptyState({ icon: Icon, heading, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="app-reveal flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-border py-16 text-center">
      <span
        className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <Icon className="size-6" />
      </span>
      <div>
        <h3 className="text-base font-semibold text-foreground">{heading}</h3>
        <p className="mx-auto mt-0.5 max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
