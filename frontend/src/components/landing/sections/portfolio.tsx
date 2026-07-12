import { Check, BadgeCheck } from "lucide-react";
import { LogoMark } from "@/components/common/Logo";
import { Container, SectionLabel } from "@/components/landing/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/landing/motion";

const POINTS = [
  { t: "Kontribusi nyata", d: "Setiap kontribusi dicatat dan diukur secara nyata dalam sebuah sertifikat." },
  { t: "Feedback mentor", d: "Mentor memberikan ulasan dan pengarahan atas setiap hasil kerja proyek." },
  { t: "Validasi UMKM", d: "Bisnis yang kamu bantu mengkonfirmasi dampak nyata dari pekerjaanmu." },
  { t: "QR Verification", d: "Siapa pun bisa memindai QR untuk memverifikasi keaslian sertifikat secara instan." },
  { t: "Siap ditampilkan di CV", d: "Bagikan URL sertifikat di LinkedIn, CV, atau portofolio online kamu." },
];

export function Portfolio() {
  return (
    <section id="portofolio" className="bg-ln-bg py-20 sm:py-28">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        {/* Certificate mock */}
        <Reveal className="flex justify-center">
          <div className="w-full max-w-sm rotate-[-1.5deg] rounded-[26px] border border-ln-line bg-ln-card p-6 shadow-[0_30px_60px_rgba(15,17,21,0.1)]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[13px] font-extrabold tracking-[-0.02em] text-ln-ink">
                <LogoMark tone="navy" className="size-5 rounded-md" />
                EduNomad
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-ln-accent-soft px-2 py-1 text-[10px] font-bold text-ln-accent-ink">
                <BadgeCheck className="size-3" /> Terverifikasi
              </span>
            </div>

            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-ln-faint">Sertifikat Penyelesaian Proyek</p>
            <h3 className="mt-1 text-[1.25rem] font-extrabold tracking-[-0.02em] text-ln-ink">Redesain Platform E-Commerce</h3>
            <p className="text-[12px] text-ln-muted">untuk WarungDigital · 6 minggu</p>

            <div className="mt-4 flex items-center gap-2.5">
              <span className="size-9 rounded-[10px]" style={{ background: "linear-gradient(135deg,#93c5fd,#6366f1)" }} />
              <div>
                <p className="text-[12px] font-bold text-ln-ink">Arief Hidayat</p>
                <p className="text-[11px] text-ln-muted">Frontend Developer · Universitas Bina</p>
              </div>
            </div>

            <div className="mt-4 h-28 rounded-xl bg-cover bg-center" style={{ backgroundImage: "url(/projects/distro.jpg)" }} />

            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-ln-faint">Kontribusi</p>
            <div className="mt-2 flex flex-col gap-1.5">
              {[["Komponen UI Dibangun", "24 komponen"], ["Commit Kode", "89 commit"], ["Dampak Performa", "+34% konversi"]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-[12px]">
                  <span className="text-ln-muted">{k}</span>
                  <span className="font-bold text-ln-ink">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[["Mentor", "Rina S."], ["UMKM Verif", "WarungDigital"]].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-ln-line bg-ln-surface px-3 py-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-ln-faint">{k}</p>
                  <p className="text-[11px] font-bold text-ln-ink">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg bg-ln-ink px-3 py-2.5">
              <div>
                <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/40">ID Blockchain</p>
                <p className="text-[11px] font-bold text-ln-accent">EN-2025-AR-0x891F</p>
              </div>
              <BadgeCheck className="size-4 text-ln-accent" />
            </div>
          </div>
        </Reveal>

        {/* Copy + checklist */}
        <div>
          <Reveal>
            <SectionLabel>Sertifikat</SectionLabel>
            <h2 className="mt-4 text-[clamp(1.9rem,1.2rem+2.4vw,2.6rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-ln-ink">
              Lebih Dari Sekadar Sertifikat.
            </h2>
            <p className="mt-4 max-w-md text-[1.0625rem] leading-[1.6] text-ln-muted">
              Sertifikat menunjukkan kontribusi nyata yang telah diverifikasi mentor dan UMKM.
            </p>
          </Reveal>

          <Stagger className="mt-8 flex flex-col gap-3">
            {POINTS.map(({ t, d }) => (
              <StaggerItem key={t}>
                <div className="flex gap-3 rounded-xl border border-ln-line bg-ln-card px-4 py-3.5">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-ln-accent-soft">
                    <Check className="size-3.5 text-ln-accent-ink" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="text-[0.95rem] font-bold text-ln-ink">{t}</p>
                    <p className="mt-0.5 text-[0.875rem] leading-relaxed text-ln-muted">{d}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
