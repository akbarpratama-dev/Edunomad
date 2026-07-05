import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export const metadata = { title: "Halaman tidak ditemukan · EduNomad" };

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-[#eef7d6] text-[#5f8c00]">
          <Compass className="size-8" />
        </span>
        <p className="mt-6 text-5xl font-black tracking-tight text-foreground">404</p>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-foreground">Halaman tidak ditemukan</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          Halaman yang kamu cari mungkin sudah dipindahkan atau tidak pernah ada.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#d8f277] px-6 py-3 text-sm font-semibold text-[#0b0b0b] transition-colors hover:bg-[#cdec5a]"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
