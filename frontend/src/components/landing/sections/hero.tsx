"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, TrendingUp, Activity, BadgeCheck, Check } from "lucide-react";
import { Floaty } from "@/components/landing/motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// Decorative gradient avatar (Figma photo assets are temporary URLs).
function Avatar({ from, to, ring = "ring-ln-bg", size = "size-7" }: { from: string; to: string; ring?: string; size?: string }) {
  return (
    <span
      className={`inline-block ${size} rounded-[10px] ring-[2.5px] ${ring}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden
    />
  );
}

const AVATARS = [
  ["#fca5a5", "#f59e0b"],
  ["#93c5fd", "#6366f1"],
  ["#86efac", "#16a34a"],
  ["#f9a8d4", "#a855f7"],
  ["#fdba74", "#ef4444"],
];

function ProjectRow({
  name,
  tag,
  tagColor,
  tagBg,
  pct,
  lime,
  delay,
}: {
  name: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  pct: number;
  lime?: boolean;
  delay: number;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="rounded-xl border border-black/[0.04] bg-[#fafafa] px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[11px] font-semibold text-ln-ink">{name}</p>
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold"
          style={{ color: tagColor, background: tagBg }}
        >
          {tag}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#ebebeb]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: lime ? "#96da55" : "#0f1115" }}
            initial={reduce ? undefined : { width: 0 }}
            whileInView={reduce ? undefined : { width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE, delay }}
          />
        </div>
        <span className="text-[10px] font-bold text-ln-ink">{pct}%</span>
      </div>
    </div>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease: EASE, delay },
        };

  return (
    <section className="relative overflow-hidden bg-ln-bg pt-28 pb-16 sm:pt-32 lg:pb-24">
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 size-[640px] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(150,218,85,0.22), transparent 65%)" }}
      />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
        {/* ── Copy ── */}
        <div className="max-w-xl">
          <motion.div {...fade(0)} className="inline-flex items-center gap-2 rounded-full border border-ln-line bg-ln-card/60 px-3 py-1.5">
            <span className="inline-block size-1.5 rounded-full bg-ln-accent-strong" />
            <span className="text-[12px] font-semibold text-ln-muted">
              Platform kolaborasi proyek nyata
            </span>
          </motion.div>

          <motion.h1
            {...fade(0.08)}
            className="mt-5 text-pretty text-[clamp(2.5rem,1.4rem+4.8vw,3.9rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ln-ink [text-wrap:balance]"
          >
            Belajar, Membimbing, dan Bertumbuh Melalui Proyek Nyata{" "}
            <span className="text-ln-accent-strong">UMKM.</span>
          </motion.h1>

          <motion.p {...fade(0.16)} className="mt-6 max-w-md text-[1.0625rem] leading-[1.65] text-ln-muted">
            EduNomad menghubungkan mahasiswa, mentor profesional, dan UMKM dalam
            proyek nyata yang menghasilkan sertifikat portofolio terverifikasi.
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/auth/register"
              className="group inline-flex items-center gap-2 rounded-[14px] bg-ln-ink px-7 py-3.5 text-[15px] font-bold tracking-[-0.01em] text-white transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,17,21,0.22)] active:scale-[0.97]"
            >
              Gabung EduNomad
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
            <a
              href="#cara-kerja"
              className="inline-flex items-center rounded-[14px] border-[1.5px] border-ln-ink/15 px-7 py-3.5 text-[15px] font-semibold text-ln-ink transition-[transform,border-color,background-color] duration-300 hover:border-ln-ink/40 hover:bg-ln-ink/[0.03] active:scale-[0.97]"
            >
              Lihat Cara Kerja
            </a>
          </motion.div>

          <motion.div {...fade(0.32)} className="mt-9 flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {AVATARS.map(([from, to], i) => (
                <Avatar key={i} from={from} to={to} />
              ))}
            </div>
            <p className="text-[13px] text-ln-muted">
              Dipercaya <span className="font-bold text-ln-ink">500+</span> mahasiswa
            </p>
          </motion.div>
        </div>

        {/* ── Floating card cluster (decorative, desktop only) ── */}
        <motion.div
          aria-hidden
          {...(reduce
            ? {}
            : { initial: { opacity: 0, scale: 0.94 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.9, ease: EASE, delay: 0.2 } })}
          className="relative hidden h-[480px] lg:block"
        >
          {/* Main dashboard card */}
          <Floaty rotate={-2} amplitude={12} duration={7} className="absolute left-1/2 top-10 z-20 w-[300px] -translate-x-1/2">
            <div className="rounded-[22px] border border-black/[0.06] bg-white p-5 shadow-[0_24px_50px_rgba(0,0,0,0.13)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#aaa]">Dasbor Proyek</p>
                  <p className="mt-0.5 text-[17px] font-extrabold tracking-[-0.02em] text-ln-ink">24 Proyek Berjalan</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-ln-accent-soft px-2 py-1 text-[9px] font-bold text-ln-accent-ink">
                  <TrendingUp className="size-2.5" /> +12% minggu ini
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <ProjectRow name="Sistem Kasir — TokoMaju" tag="Web Dev" tagColor="#0ea5e9" tagBg="#e0f7ff" pct={78} delay={0.4} />
                <ProjectRow name="Brand Identity — KopiNusantara" tag="Desain" tagColor="#6366f1" tagBg="#eef2ff" pct={55} delay={0.55} />
                <ProjectRow name="Kampanye Digital — BatikModern" tag="Marketing" tagColor="#f59e0b" tagBg="#fffbeb" pct={92} lime delay={0.7} />
              </div>
            </div>
          </Floaty>

          {/* Mentor online card */}
          <Floaty rotate={-10} amplitude={9} duration={6} delay={0.5} className="absolute right-2 top-0 z-30 w-[200px]">
            <div className="rounded-[18px] border border-black/[0.06] bg-white p-4 shadow-[0_16px_34px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-ln-accent-strong" />
                <span className="text-[9px] font-bold tracking-[0.04em] text-ln-accent-strong">87 MENTOR ONLINE</span>
              </div>
              <div className="mt-2.5 flex -space-x-2">
                {AVATARS.slice(0, 3).map(([from, to], i) => (
                  <Avatar key={i} from={from} to={to} ring="ring-white" size="size-8" />
                ))}
                <span className="grid size-8 place-items-center rounded-[10px] bg-[#f0f0f0] text-[9px] font-bold text-ln-muted ring-[2.5px] ring-white">+84</span>
              </div>
              <p className="mt-2 text-[10px] text-ln-muted">
                Siap membimbing proyek <span className="font-bold text-ln-ink">hari ini</span>
              </p>
            </div>
          </Floaty>

          {/* Artifact card (dark) */}
          <Floaty rotate={-7.6} amplitude={8} duration={6.5} delay={0.9} className="absolute left-0 top-52 z-30 w-[150px]">
            <div className="rounded-[18px] bg-ln-ink p-3.5 shadow-[0_14px_36px_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-lg bg-ln-accent/15">
                  <BadgeCheck className="size-4 text-ln-accent" />
                </span>
                <div>
                  <p className="text-[8px] font-bold text-white">EN-2025-AR</p>
                  <p className="text-[7px] text-white/30">0x891F</p>
                </div>
              </div>
              <div className="mt-2.5 flex flex-col gap-1">
                {["Mentor", "UMKM", "Admin"].map((r) => (
                  <div key={r} className="flex items-center gap-1.5">
                    <Check className="size-2.5 text-ln-accent" />
                    <span className="text-[10px] font-semibold text-ln-accent">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </Floaty>

          {/* Active projects card (green) */}
          <Floaty rotate={7.5} amplitude={11} duration={7.5} delay={0.3} className="absolute bottom-2 right-6 z-10 w-[168px]">
            <div className="rounded-[18px] bg-ln-accent p-4 shadow-[0_18px_40px_rgba(142,240,90,0.32)]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-black/50">Proyek Aktif</span>
                <span className="grid size-5 place-items-center rounded-md bg-black/10">
                  <Activity className="size-3 text-black/60" />
                </span>
              </div>
              <p className="mt-1 text-[36px] font-black leading-none tracking-[-0.04em] text-ln-ink">24</p>
              <p className="mt-1 text-[10px] font-medium text-black/50">dari 8 universitas</p>
              <div className="mt-2.5 flex items-end gap-[3px]">
                {[12, 16, 11, 18, 14, 20, 17].map((h, i) => (
                  <span key={i} className="flex-1 rounded-sm bg-black/15" style={{ height: h }} />
                ))}
              </div>
            </div>
          </Floaty>
        </motion.div>
      </div>
    </section>
  );
}
