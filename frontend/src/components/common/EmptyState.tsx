import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

// Empty State — docs/08-UI_Pages_Specification_v1.0.md Common UI Patterns
export function EmptyState({ icon: Icon, heading, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <Icon className="size-10 text-muted-foreground" />
      <h3 className="text-base font-semibold text-foreground">{heading}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
