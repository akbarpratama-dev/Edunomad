import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, SectionHeading } from "@/components/landing/primitives";
import { Stagger, StaggerItem } from "@/components/landing/motion";

// Decorative QR-like glyph.
function Qr({ className }: { className?: string }) {
  const cells = "1101011 1001101 0110110 1011011 0101101 1100101 1011010".split(" ");
  return (
    <div className={cn("grid grid-cols-7 gap-0.5", className)} aria-hidden>
      {cells.flatMap((row, r) =>
        row.split("").map((c, i) => (
          <span key={`${r}-${i}`} className={cn("aspect-square rounded-[1px]", c === "1" ? "bg-ln-ink" : "bg-transparent")} />
        ))
      )}
    </div>
  );
}

function Avatar({ from, to, size = "size-7", ring = "ring-ln-card" }: { from: string; to: string; size?: string; ring?: string }) {
  return <span className={`${size} rounded-[9px] ring-2 ${ring}`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} aria-hidden />;
}

function Card({ title, body, children, className }: { title: string; body: string; children?: React.ReactNode; className?: string }) {
  return (
    <StaggerItem className={cn("h-full", className)}>
      <div className="flex h-full flex-col rounded-2xl border border-ln-line bg-ln-card p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,17,21,0.07)]">
        <h3 className="text-[1.0625rem] font-bold tracking-[-0.01em] text-ln-ink">{title}</h3>
        <p className="mt-2.5 text-[0.9rem] leading-relaxed text-ln-muted">{body}</p>
        {children && <div className="mt-6 flex-1">{children}</div>}
      </div>
    </StaggerItem>
  );
}

export function FeatureGrid() {
  return (
    <section id="fitur" className="bg-ln-bg py-20 sm:py-28">
      <Container>
        <SectionHeading label="Fitur" title={<>Semua yang kamu butuhkan untuk membangun kredibilitas.</>} />

        <Stagger className="mt-14 grid gap-5 lg:grid-cols-3">
          {/* Sertifikat Portfolio */}
          <Card title="Sertifikat Portfolio Terverifikasi" body="Setiap kontribusi dicatat dan diverifikasi oleh mentor dan pemilik bisnis.">
            <div className="rounded-xl border border-ln-line bg-ln-surface p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-ln-faint">Sistem Kasir UMKM</p>
              <div className="mt-3 flex flex-col gap-2">
                {[["Page Setup", "100%"], ["Database", "100%"], ["UI Kasir", "80%"]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-[11px]">
                    <span className="text-ln-muted">{k}</span>
                    <span className="rounded bg-ln-accent-soft px-1.5 py-0.5 font-bold text-ln-accent-ink">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-lg bg-ln-ink px-3 py-2.5">
                <span className="text-[11px] font-bold text-white">Sertifikat Terbit</span>
                <Qr className="w-7" />
              </div>
            </div>
          </Card>

          {/* Pendampingan Mentor */}
          <Card title="Pendampingan Mentor" body="Belajar langsung dari profesional berpengalaman di bidangnya.">
            <div className="rounded-xl border border-ln-line bg-ln-surface p-4">
              <div className="flex items-center gap-3">
                <Avatar from="#93c5fd" to="#6366f1" size="size-10" />
                <div>
                  <p className="text-[12px] font-bold text-ln-ink">Mentor Senior</p>
                  <p className="text-[11px] text-ln-muted">Lead Engineer · 8 thn</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[["#fca5a5", "#f59e0b"], ["#86efac", "#16a34a"], ["#f9a8d4", "#a855f7"]].map(([f, t], i) => (
                    <Avatar key={i} from={f} to={t} />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-ln-muted">+63 mentor aktif</span>
              </div>
            </div>
          </Card>

          {/* Verifikasi Sertifikat Digital (tall) */}
          <Card
            className="lg:row-span-2"
            title="Verifikasi Sertifikat Digital"
            body="Setiap proyek dilengkapi sertifikat digital dan QR verifikasi."
          >
            <div className="flex h-full flex-col gap-4">
              <div className="grid place-items-center rounded-xl border border-ln-line bg-ln-surface py-6">
                <Qr className="w-24" />
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-ln-faint">Scan untuk verifikasi</p>
              </div>
              <div className="flex flex-col gap-2">
                {["Verified oleh Mentor", "Verified oleh UMKM", "Verified oleh Admin"].map((t) => (
                  <div key={t} className="flex items-center gap-2 rounded-lg bg-ln-accent-soft px-3 py-2">
                    <Check className="size-3.5 text-ln-accent-ink" strokeWidth={3} />
                    <span className="text-[12px] font-semibold text-ln-accent-ink">{t}</span>
                  </div>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between rounded-xl bg-ln-ink px-4 py-3">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/40">Credential ID</p>
                  <p className="text-[12px] font-bold text-white">EN-2025-AR · 0x891F</p>
                </div>
                <span className="grid size-8 place-items-center rounded-lg bg-ln-accent/15">
                  <Check className="size-4 text-ln-accent" strokeWidth={3} />
                </span>
              </div>
            </div>
          </Card>

          {/* Tim Berdasarkan Role */}
          <Card title="Tim Berdasarkan Role" body="Bekerja sama dalam tim terstruktur dengan role yang jelas.">
            <div className="flex flex-wrap gap-2">
              {[["Frontend", true], ["UI/UX", false], ["Backend", false], ["Marketing", false]].map(([label, active]) => (
                <span
                  key={label as string}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-[12px] font-semibold",
                    active ? "bg-ln-ink text-white" : "border border-ln-line bg-ln-surface text-ln-muted"
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          </Card>

          {/* Monitoring Progress */}
          <Card title="Monitoring Progress" body="Pantau progres, kelola tugas, dan capai setiap milestone proyek.">
            <div>
              <div className="grid grid-cols-3 gap-2">
                {[["24", "Proyek Aktif"], ["78%", "Rata-rata"], ["96%", "Tepat Waktu"]].map(([v, l]) => (
                  <div key={l} className="rounded-xl border border-ln-line bg-ln-surface px-3 py-3 text-center">
                    <p className="text-[1.25rem] font-black tracking-[-0.03em] text-ln-ink">{v}</p>
                    <p className="mt-0.5 text-[10px] font-medium text-ln-muted">{l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-ln-muted">Progress</span>
                  <span className="font-bold text-ln-ink">73%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#ebebeb]">
                  <div className="h-full rounded-full bg-ln-accent" style={{ width: "73%" }} />
                </div>
              </div>
            </div>
          </Card>
        </Stagger>
      </Container>
    </section>
  );
}
