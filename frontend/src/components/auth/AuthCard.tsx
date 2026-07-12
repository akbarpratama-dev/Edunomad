import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoMark } from "@/components/common/Logo";

// Centered card shell for all auth/registration pages. Matches Figma node
// 11-3463/11-3478: warm page bg, white card with a warm hairline border, soft
// layered shadow, 20px radius, and a large 32px heading.
export function AuthCard({
  title,
  subtitle,
  children,
  wide = false,
  backHref = "/",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  wide?: boolean;
  // Where the "back" link points. Defaults to the marketing landing page (`/`).
  // Pass null to hide it (e.g. a mid-flow step that has its own step navigation).
  backHref?: string | null;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"}`}>
        {backHref && (
          <Link
            href={backHref}
            className="mb-4 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Kembali ke beranda
          </Link>
        )}
        <div className="rounded-[20px] border border-[#e7e3d8] bg-card p-8 shadow-[0_4px_3px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.08)]">
          <Link href="/" aria-label="EduNomad beranda" className="mb-6 inline-flex items-center gap-2">
            <LogoMark tone="navy" className="size-8 rounded-[10px]" />
            <span className="text-lg font-extrabold tracking-[-0.03em] text-foreground">EduNomad</span>
          </Link>
          <h1 className="text-[2rem] font-bold leading-[1.2] tracking-[-0.01em] text-foreground">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
