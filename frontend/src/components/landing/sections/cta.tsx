import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
                Jangan cuma belajar. Kerjakan proyek nyata.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[1.0625rem] leading-[1.6] text-ln-ink/70">
                Bangun pengalaman, portofolio, dan koneksi profesional melalui proyek yang benar-benar dibutuhkan UMKM.
              </p>

              <div className="mt-9 flex justify-center">
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center gap-2 rounded-full bg-ln-ink px-8 py-4 text-[15px] font-bold text-white transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,17,21,0.24)] active:scale-[0.97]"
                >
                  Gabung EduNomad
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
