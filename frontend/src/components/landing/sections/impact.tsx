import { Container } from "@/components/landing/primitives";
import { Reveal, Stagger, StaggerItem, CountUp } from "@/components/landing/motion";

const STATS = [
  { to: 500, suffix: "+", label: "Mahasiswa", body: "Pelajar aktif yang membangun portofolio nyata" },
  { to: 100, suffix: "+", label: "Proyek", body: "Proyek nyata yang telah diselesaikan dengan hasil terverifikasi" },
  { to: 50, suffix: "+", label: "Mentor", body: "Pakar industri yang membimbing generasi berikutnya" },
  { to: 90, suffix: "+", label: "UMKM", body: "Pelaku usaha lokal yang tumbuh bersama talenta mahasiswa" },
];

export function Impact() {
  return (
    <section className="bg-ln-ink py-20 sm:py-28">
      <Container>
        <Reveal className="flex flex-col items-center gap-4 text-center">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.18em] text-ln-accent">
            Dampak
          </span>
          <h2 className="text-[clamp(1.9rem,1.2rem+2.6vw,2.75rem)] font-extrabold tracking-[-0.035em] text-white">
            Dampak yang bisa diukur
          </h2>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-2 gap-y-12 sm:gap-y-0 lg:grid-cols-4">
          {STATS.map(({ to, suffix, label, body }, i) => (
            <StaggerItem
              key={label}
              className={i > 0 ? "lg:border-l lg:border-white/10 lg:pl-8" : "lg:pl-0"}
            >
              <div className="px-2 text-center lg:text-left">
                <CountUp
                  to={to}
                  suffix={suffix}
                  className="block text-[clamp(3rem,2rem+3vw,4.25rem)] font-black leading-none tracking-[-0.04em] text-white"
                />
                <p className="mt-3 text-[1.0625rem] font-bold text-white">{label}</p>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-white/60">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
