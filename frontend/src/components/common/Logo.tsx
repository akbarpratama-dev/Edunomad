import { cn } from "@/lib/utils";

export type LogoTone = "navy" | "lime";

/**
 * EduNomad brand mark — a rounded badge with the "E" drawn as an ascending
 * staircase (growth / the learning journey). Decorative by default
 * (`aria-hidden`): pair it with visible "EduNomad" text, or put an `aria-label`
 * on the parent link/button.
 *
 *  - `tone="navy"` → navy badge + lime mark. Use on LIGHT backgrounds.
 *  - `tone="lime"` → lime badge + navy mark. Use on DARK backgrounds.
 *
 * Size it with a Tailwind size class, e.g. `<LogoMark className="size-7" />`.
 */
export function LogoMark({ tone = "navy", className }: { tone?: LogoTone; className?: string }) {
  const badge = tone === "navy" ? "#201f31" : "#d8f277";
  const mark = tone === "navy" ? "#d8f277" : "#201f31";
  return (
    <svg viewBox="0 0 128 128" aria-hidden="true" className={cn("shrink-0", className)}>
      <rect x="6" y="6" width="116" height="116" rx="32" fill={badge} />
      <g fill={mark}>
        <rect x="40" y="34" width="14" height="60" rx="7" />
        <rect x="40" y="34" width="30" height="14" rx="7" />
        <rect x="40" y="57" width="40" height="14" rx="7" />
        <rect x="40" y="80" width="50" height="14" rx="7" />
      </g>
    </svg>
  );
}
