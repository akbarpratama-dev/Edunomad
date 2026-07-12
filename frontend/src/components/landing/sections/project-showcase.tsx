import Link from "next/link";
import { Star, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/landing/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/landing/motion";

const FILTERS = ["Semua", "Web Development", "Mobile App", "UI/UX Design", "Graphic Design", "Digital Marketing", "Data Analysis", "Business Development"];

const PROJECTS = [
  {
    status: "Aktif",
    tone: "bg-ln-accent text-ln-ink",
    org: "TokoMaju · Surabaya",
    title: "Sistem Kasir UMKM Berbasis Web",
    desc: "Membangun sistem kasir digital yang mudah digunakan untuk UMKM ritel dengan laporan keuangan real-time.",
    tags: ["React", "Node.js", "PostgreSQL"],
    dur: "4 minggu",
    rating: "4.9",
    img: "/projects/kasir.jpg",
  },
  {
    status: "Aktif",
    tone: "bg-ln-accent text-ln-ink",
    org: "KopiNusantara · Bandung",
    title: "Website Company Profile",
    desc: "Desain dan pengembangan website modern untuk memperkuat identitas brand kopi lokal premium.",
    tags: ["Figma", "Illustrator", "Branding"],
    dur: "3 minggu",
    rating: "5.0",
    img: "/projects/kopi.jpg",
  },
  {
    status: "Hiring",
    tone: "bg-[#38bdf8] text-ln-ink",
    org: "InaPadang · Express",
    title: "Aplikasi Pemesanan Mobile",
    desc: "Aplikasi lintas platform dengan pesanan real-time dan program loyalitas pelanggan.",
    tags: ["Flutter", "Firebase", "UX"],
    dur: "6 minggu",
    rating: "4.8",
    img: "/projects/warung.jpg",
  },
];

export function ProjectShowcase() {
  return (
    <section id="proyek" className="ln-dark bg-ln-ink py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <Reveal className="max-w-2xl">
            <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-ln-accent">Proyek</span>
            <h2 className="mt-4 text-[clamp(1.9rem,1.2rem+2.6vw,2.75rem)] font-extrabold leading-[1.06] tracking-[-0.035em] text-white [text-wrap:balance]">
              Proyek Yang Sedang Membuka Lowongan
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/projects"
              className="inline-flex shrink-0 items-center gap-2 rounded-[12px] border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-[transform,background-color] hover:bg-white/5 active:scale-[0.97]"
            >
              Lihat semua proyek <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.05} className="mt-9 flex flex-wrap gap-2">
          {FILTERS.map((f, i) => (
            <span
              key={f}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
                i === 0 ? "bg-ln-accent text-ln-ink" : "border border-white/12 text-white/70 hover:text-white"
              )}
            >
              {f}
            </span>
          ))}
        </Reveal>

        <Stagger className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <StaggerItem key={p.title} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/20">
                <div
                  className="relative h-36 overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: `url(${p.img})` }}
                >
                  <div className="absolute inset-0 bg-ln-ink/20" />
                  <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold", p.tone)}>
                    {p.status}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/55">{p.org}</p>
                  <h3 className="mt-2 text-[1.0625rem] font-bold tracking-[-0.01em] text-white">{p.title}</h3>
                  <p className="mt-2 text-[0.85rem] leading-relaxed text-white/65">{p.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-md bg-white/8 px-2 py-1 text-[11px] font-medium text-white/70">{t}</span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="inline-flex items-center gap-1.5 text-[12px] text-white/60">
                      <Clock className="size-3.5" aria-hidden /> {p.dur}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[12px] font-bold text-white">
                      <Star className="size-3.5 fill-ln-accent text-ln-accent" aria-hidden /> {p.rating}
                    </span>
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
