import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  heading?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

// Error State — docs/08-UI_Pages_Specification_v1.0.md Common UI Patterns
export function ErrorState({
  heading = "Terjadi Kesalahan",
  message,
  actionLabel = "Coba Lagi",
  onAction,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <AlertTriangle className="size-10 text-error" />
      <h3 className="text-h3 text-neutral-dark">{heading}</h3>
      <p className="max-w-sm text-body text-neutral-gray">{message}</p>
      {onAction && (
        <Button variant="outline" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
