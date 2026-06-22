import { GraduationCap, Building2, Users } from "lucide-react";
import { Container, SectionHeading } from "@/components/landing/primitives";
import { Stagger, StaggerItem } from "@/components/landing/motion";

const ITEMS = [
  {
    icon: GraduationCap,
    title: "70% Mahasiswa sulit Mendapatkan Pengalaman Nyata",
    body: "Banyak mahasiswa memiliki kemampuan tetapi belum memiliki pengalaman proyek yang dapat ditunjukkan kepada perusahaan.",
  },
  {
    icon: Building2,
    title: "UMKM Membutuhkan Solusi Digital",
    body: "Banyak UMKM membutuhkan website, aplikasi, desain, dan pemasaran digital, namun sulit menemukan talenta yang terjangkau.",
  },
  {
    icon: Users,
    title: "Mentor Membutuhkan Wadah Berbagi",
    body: "Profesional ingin membimbing mahasiswa melalui proyek nyata, namun belum ada platform terstruktur untuk berbagi keahlian.",
  },
];

export function Problem() {
  return (
    <section className="bg-ln-bg py-20 sm:py-28">
      <Container>
        <SectionHeading label="Masalah" title="Belajar Saja Tidak Cukup." />
        <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title}>
              <div className="group h-full rounded-2xl border border-ln-line bg-ln-card p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,17,21,0.07)]">
                <span className="grid size-11 place-items-center rounded-xl bg-ln-ink/[0.04] text-ln-ink transition-colors duration-300 group-hover:bg-ln-accent/15 group-hover:text-ln-accent-ink">
                  <Icon className="size-5" strokeWidth={2} aria-hidden />
                </span>
                <h3 className="mt-5 text-[1.0625rem] font-bold leading-snug tracking-[-0.01em] text-ln-ink">
                  {title}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-ln-muted">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
