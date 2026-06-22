import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/motion";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>;
}

// Eyebrow label — small, tracked. `tone` switches for dark sections.
export function SectionLabel({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "accent" }) {
  return (
    <span
      className={cn(
        "text-[12px] font-bold uppercase tracking-[0.18em]",
        tone === "accent" ? "text-ln-accent-strong" : "text-ln-faint"
      )}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  label,
  title,
  subtitle,
  dark = false,
  align = "center",
  labelTone,
  className,
}: {
  label?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  dark?: boolean;
  align?: "center" | "left";
  labelTone?: "muted" | "accent";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {label && <SectionLabel tone={labelTone ?? (dark ? "accent" : "muted")}>{label}</SectionLabel>}
      <h2
        className={cn(
          "max-w-3xl text-[clamp(1.9rem,1.2rem+2.6vw,2.85rem)] font-extrabold leading-[1.08] tracking-[-0.035em] [text-wrap:balance]",
          dark ? "text-white" : "text-ln-ink"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn("max-w-xl text-[1.0625rem] leading-[1.6]", dark ? "text-white/55" : "text-ln-muted")}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
