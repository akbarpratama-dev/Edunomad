"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";

// App-level error boundary (Next.js). Catches render/runtime errors in the route
// subtree and offers a retry without a full reload.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface for debugging; real telemetry can hook in here later.
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-red-50 text-error">
          <AlertTriangle className="size-8" />
        </span>
        <h1 className="mt-6 text-xl font-bold tracking-tight text-foreground">Terjadi kesalahan</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Maaf, ada yang tidak beres saat memuat halaman ini. Coba lagi, atau kembali ke beranda.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-[#d8f277] px-6 py-3 text-sm font-semibold text-[#0b0b0b] transition-colors hover:bg-[#cdec5a]"
          >
            <RotateCcw className="size-4" />
            Coba Lagi
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
            Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
