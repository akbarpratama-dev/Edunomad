import Link from "next/link";
import { Container } from "@/components/landing/primitives";
import { LogoMark } from "@/components/common/Logo";

// Only links that resolve to a real destination (landing anchors, existing
// routes, or the auth flow). Placeholder marketing/legal pages were removed
// until those pages exist.
const COLS = [
  {
    title: "Platform",
    links: [
      ["Cara Kerja", "#cara-kerja"],
      ["Fitur", "#fitur"],
      ["Portofolio", "#portofolio"],
      ["FAQ", "#faq"],
      ["Papan Proyek", "/projects"],
    ],
  },
  {
    title: "Mulai",
    links: [
      ["Daftar sebagai Mahasiswa", "/auth/register?role=BEGINNER"],
      ["Daftar sebagai Mentor", "/auth/register?role=SENIOR"],
      ["Daftar sebagai UMKM", "/auth/register?role=UMKM"],
      ["Masuk", "/auth/login"],
    ],
  },
];

export function LandingFooter() {
  return (
    <footer className="ln-dark bg-ln-ink pt-16 pb-10">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.6fr_repeat(2,1fr)]">
          <div className="max-w-xs">
            <span className="flex items-center gap-2">
              <LogoMark tone="lime" className="size-7 rounded-[9px]" />
              <span className="text-[18px] font-extrabold tracking-[-0.03em] text-white">EduNomad</span>
            </span>
            <p className="mt-4 text-[0.875rem] leading-relaxed text-white/60">
              Menghubungkan mahasiswa, mentor, dan UMKM melalui proyek nyata yang menciptakan dampak dan portofolio terverifikasi.
            </p>
            <div className="mt-5 flex gap-2">
              {["Twitter", "LinkedIn", "Instagram"].map((s) => (
                <a
                  key={s}
                  href="#"
                  aria-label={`EduNomad di ${s}`}
                  className="rounded-lg bg-white/8 px-3 py-1.5 text-[12px] font-medium text-white/70 transition-[transform,background-color,color] hover:bg-white/12 hover:text-white active:scale-95"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">{col.title}</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-[0.875rem] text-white/65 transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-[0.8125rem] text-white/55">© 2026 EduNomad. Seluruh hak dilindungi.</p>
          <p className="inline-flex items-center gap-2 text-[0.8125rem] text-white/55">
            <span className="size-2 rounded-full bg-ln-accent" aria-hidden /> Semua sistem berjalan normal
          </p>
        </div>
      </Container>
    </footer>
  );
}
