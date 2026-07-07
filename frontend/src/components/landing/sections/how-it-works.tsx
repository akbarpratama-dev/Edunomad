import { Building2, ShieldCheck, UserCheck, FileText, GitBranch, BadgeCheck } from "lucide-react";
import { Container } from "@/components/landing/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/landing/motion";

const STEPS = [
  { n: "01", icon: Building2, title: "UMKM Mengajukan Proyek", body: "Pelaku UMKM mengajukan brief proyek nyata dengan tujuan, timeline, dan keahlian yang dibutuhkan." },
  { n: "02", icon: ShieldCheck, title: "Admin Memverifikasi", body: "Tim kami meninjau dan memverifikasi untuk memastikan kualitas, ruang lingkup, dan kelayakan proyek." },
  { n: "03", icon: UserCheck, title: "Mentor Bergabung", body: "Pakar industri bergabung sebagai mentor proyek, memberikan bimbingan dan pengawasan teknis." },
  { n: "04", icon: FileText, title: "Mahasiswa Melamar", body: "Mahasiswa melamar proyek terbuka sesuai keahlian, membentuk tim yang terverifikasi." },
  { n: "05", icon: GitBranch, title: "Proyek Dikerjakan", body: "Tim berkolaborasi, memantau milestone, dan menghasilkan karya nyata dengan dukungan mentor." },
  { n: "06", icon: BadgeCheck, title: "Sertifikat Terverifikasi", body: "Pekerjaan yang selesai diverifikasi oleh mentor dan UMKM, menciptakan bukti karya." },
];

const AV = [["#fca5a5", "#f59e0b"], ["#93c5fd", "#6366f1"], ["#86efac", "#16a34a"], ["#f9a8d4", "#a855f7"]];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="bg-ln-bg pb-20 sm:pb-28">
      <Container>
        <div className="overflow-hidden rounded-[32px] bg-ln-ink px-6 py-14 sm:px-12 sm:py-16">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <Reveal className="max-w-xl">
              <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-ln-accent">Cara Kerja</span>
              <h2 className="mt-4 text-[clamp(1.9rem,1.2rem+2.6vw,2.75rem)] font-extrabold leading-[1.06] tracking-[-0.035em] text-white [text-wrap:balance]">
                Bagaimana EduNomad bekerja?
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {AV.map(([f, t], i) => (
                  <span key={i} className="size-8 rounded-[10px] ring-[2.5px] ring-ln-ink" style={{ background: `linear-gradient(135deg, ${f}, ${t})` }} />
                ))}
              </div>
              <p className="max-w-[180px] text-[12px] leading-snug text-white/65">
                Bergabung bersama <span className="font-bold text-white">871 mentor</span> di seluruh Indonesia
              </p>
            </Reveal>
          </div>

          {/* Banner */}
          <Reveal delay={0.05} className="mt-10">
            <div
              className="relative overflow-hidden rounded-2xl border border-white/10 px-8 py-10"
              style={{ background: "linear-gradient(120deg, rgba(216,242,119,0.18), rgba(255,255,255,0.02) 55%)" }}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-ln-accent/15 blur-3xl" />
              <h3 className="relative text-[1.3rem] font-extrabold tracking-[-0.02em] text-white">
                Dari pengajuan proyek hingga sertifikat terverifikasi
              </h3>
              <p className="relative mt-2 text-[0.95rem] text-white/70">
                Dirancang untuk hasil nyata, bukan sekadar simulasi belajar.
              </p>
            </div>
          </Reveal>

          {/* Steps */}
          <Stagger className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map(({ n, icon: Icon, title, body }) => (
              <StaggerItem key={n} className="h-full">
                <div className="group h-full bg-ln-ink p-7 transition-colors duration-300 hover:bg-white/[0.03]">
                  <div className="flex items-center justify-between">
                    <span className="text-[1.05rem] font-black tracking-[-0.02em] text-ln-accent">{n}</span>
                    <Icon className="size-5 text-white/40 transition-colors duration-300 group-hover:text-ln-accent" strokeWidth={2} aria-hidden />
                  </div>
                  <h4 className="mt-5 text-[1.0625rem] font-bold tracking-[-0.01em] text-white">{title}</h4>
                  <p className="mt-2.5 text-[0.9rem] leading-relaxed text-white/65">{body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
