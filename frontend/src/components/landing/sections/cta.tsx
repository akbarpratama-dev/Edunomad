import Link from "next/link";
import { ArrowRight, GraduationCap, UserCheck, Building2 } from "lucide-react";
import { Container } from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/motion";

export function Cta() {
  return (
    <section className="bg-ln-bg py-12 sm:py-16">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-ln-accent px-6 py-16 text-center sm:px-12 sm:py-20">
            {/* decorative circles */}
            <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-white/15" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-black/[0.04]" />

            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex rounded-full bg-ln-ink/90 px-4 py-1.5 text-[12px] font-bold text-white">
                Bergabung bersama 500+ mahasiswa, 50+ mentor, 90+ UMKM
              </span>
              <h2 className="mt-6 text-[clamp(2rem,1.3rem+3vw,3.25rem)] font-extrabold leading-[1.04] tracking-[-0.04em] text-ln-ink [text-wrap:balance]">
                Jangan Hanya Belajar. Kerjakan Proyek Nyata.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[1.0625rem] leading-[1.6] text-ln-ink/70">
                Bangun pengalaman, portofolio, dan koneksi profesional melalui proyek yang benar-benar dibutuhkan UMKM.
              </p>

              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link
                  href="/auth/register?role=BEGINNER"
                  className="group inline-flex items-center gap-2 rounded-[14px] bg-ln-ink px-6 py-3.5 text-[15px] font-bold text-white transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <GraduationCap className="size-4" aria-hidden /> Saya Mahasiswa
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </Link>
                <Link
                  href="/auth/register?role=SENIOR"
                  className="inline-flex items-center gap-2 rounded-[14px] border-[1.5px] border-ln-ink/25 px-6 py-3.5 text-[15px] font-semibold text-ln-ink transition-[transform,background-color] duration-300 hover:bg-ln-ink/[0.06] active:scale-[0.97]"
                >
                  <UserCheck className="size-4" aria-hidden /> Saya Mentor
                </Link>
                <Link
                  href="/auth/register?role=UMKM"
                  className="inline-flex items-center gap-2 rounded-[14px] border-[1.5px] border-ln-ink/25 px-6 py-3.5 text-[15px] font-semibold text-ln-ink transition-[transform,background-color] duration-300 hover:bg-ln-ink/[0.06] active:scale-[0.97]"
                >
                  <Building2 className="size-4" aria-hidden /> Saya UMKM
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
