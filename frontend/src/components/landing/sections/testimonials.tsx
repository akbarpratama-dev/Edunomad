"use client";

import { useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, SectionLabel } from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/motion";

const ITEMS = [
  {
    dark: false,
    role: "Mahasiswa",
    roleClass: "bg-[#e0f7ff] text-[#0284c7]",
    quote:
      "EduNomad benar-benar mengubah trajektori karier saya. Saya masuk tanpa pengalaman industri sama sekali, dan setelah dua proyek, saya punya portofolio terverifikasi yang membawa saya ke pekerjaan di startup teknologi.",
    name: "Arief Hidayat",
    sub: "Frontend Developer · Universitas Binus → TechVenture ID",
    grad: "linear-gradient(135deg,#93c5fd,#6366f1)",
  },
  {
    dark: true,
    role: "Mentor",
    roleClass: "bg-ln-accent/20 text-ln-accent",
    quote:
      "Sebagai mentor, akhirnya saya menemukan cara yang terstruktur untuk berbagi ilmu. Saya bisa melihat perkembangan mentee secara real-time dan benar-benar memverifikasi pertumbuhan mereka. Platform ini yang saya butuhkan dulu waktu masih pemula.",
    name: "Rina Santoso",
    sub: "Product Design Lead · Tokopedia",
    grad: "linear-gradient(135deg,#f9a8d4,#a855f7)",
  },
  {
    dark: false,
    role: "UMKM",
    roleClass: "bg-[#fef3c7] text-[#b45309]",
    quote:
      "Kami butuh website tapi tidak bisa bayar harga agensi. EduNomad menghubungkan kami dengan tim mahasiswa yang luar biasa dan mentor yang menjaga kualitas. Hasilnya melebihi ekspektasi kami, dan kami sudah mengajukan proyek kedua.",
    name: "Budi Hartono",
    sub: "Pemilik · WarungDigital",
    grad: "linear-gradient(135deg,#fdba74,#ef4444)",
  },
];

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);

  // Scroll the mobile track by roughly one card.
  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="bg-ln-bg py-20 sm:py-28">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <Reveal>
            <SectionLabel>
              <span className="rounded-full bg-ln-ink px-3 py-1 text-white">Testimoni</span>
            </SectionLabel>
            <h2 className="mt-4 text-[clamp(1.9rem,1.2rem+2.6vw,2.85rem)] font-extrabold tracking-[-0.035em] text-ln-ink">
              Cerita dari mereka
            </h2>
          </Reveal>
          {/* Carousel controls — only meaningful where the track scrolls (mobile) */}
          <Reveal delay={0.1} className="flex gap-2 md:hidden">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Testimoni sebelumnya"
              className="grid size-10 place-items-center rounded-full border border-ln-line text-ln-muted transition-transform active:scale-95"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Testimoni berikutnya"
              className="grid size-10 place-items-center rounded-full bg-ln-ink text-white transition-transform active:scale-95"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </Reveal>
        </div>

        <div
          ref={trackRef}
          className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible md:pb-0"
        >
          {ITEMS.map((t) => (
            <figure
              key={t.name}
              className={cn(
                "flex min-w-[85%] snap-center flex-col rounded-2xl border p-7 transition-transform duration-300 hover:-translate-y-1 md:min-w-0",
                t.dark ? "border-ln-ink bg-ln-ink" : "border-ln-line bg-ln-card"
              )}
            >
              <div className="flex gap-0.5" aria-label="Rating 5 dari 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-[#f5b301] text-[#f5b301]" aria-hidden />
                ))}
              </div>
              <span className={cn("mt-4 w-fit rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em]", t.roleClass)}>
                {t.role}
              </span>
              <blockquote className={cn("mt-4 flex-1 text-[0.95rem] leading-[1.65]", t.dark ? "text-white/80" : "text-ln-ink-soft")}>
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="size-10 shrink-0 rounded-xl" style={{ background: t.grad }} aria-hidden />
                <div>
                  <p className={cn("text-[0.875rem] font-bold", t.dark ? "text-white" : "text-ln-ink")}>{t.name}</p>
                  <p className={cn("text-[0.75rem]", t.dark ? "text-white/60" : "text-ln-muted")}>{t.sub}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
