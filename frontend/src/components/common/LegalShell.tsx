import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Minimal standalone chrome for static/legal pages (help, privacy, terms). Works
// signed in or out — no auth context, no sidebar. Logo links home, back to app.
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-[#d8f277] text-sm font-black text-[#0b0b0b]">
              E
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">EduNomad</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <h1 className="text-h1 tracking-tight text-balance text-foreground">{title}</h1>
        {updated && <p className="mt-2 text-sm text-muted-foreground">Terakhir diperbarui: {updated}</p>}
        <div className="legal-prose mt-8 flex flex-col gap-6 text-[15px] leading-relaxed text-foreground/80">
          {children}
        </div>
      </main>
    </div>
  );
}

// Section heading + body helper, keeps the pages declarative.
export function LegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{heading}</h2>
      {children}
    </section>
  );
}
