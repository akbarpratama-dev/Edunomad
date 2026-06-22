"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const NAV = [
  { label: "Cara Kerja", href: "#cara-kerja", id: "cara-kerja" },
  { label: "Fitur", href: "#fitur", id: "fitur" },
  { label: "Portofolio", href: "#portofolio", id: "portofolio" },
  { label: "FAQ", href: "#faq", id: "faq" },
];

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="EduNomad beranda">
      <span className="grid size-7 place-items-center rounded-[9px] bg-ln-ink text-ln-accent">
        <span className="text-[15px] font-black leading-none">E</span>
      </span>
      <span className="text-[18px] font-extrabold tracking-[-0.03em] text-ln-ink">EduNomad</span>
    </Link>
  );
}

export function LandingHeader() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight the nav item for the section in view.
  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5] }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Lock body scroll + close on Escape while the mobile menu is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <motion.header
      initial={reduce ? false : { y: -24, opacity: 0 }}
      animate={reduce ? undefined : { y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || open
          ? "border-b border-ln-line bg-ln-bg/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Wordmark />

        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={active === item.id ? "true" : undefined}
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                active === item.id ? "text-ln-ink" : "text-ln-muted hover:text-ln-ink"
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="rounded-[12px] bg-ln-ink px-5 py-2.5 text-sm font-bold tracking-[-0.01em] text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
            >
              Buka Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden rounded-[12px] px-4 py-2.5 text-sm font-semibold text-ln-ink transition-colors hover:bg-ln-ink/5 sm:block"
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="hidden rounded-[12px] bg-ln-ink px-5 py-2.5 text-sm font-bold tracking-[-0.01em] text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97] sm:block"
              >
                Gabung
              </Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid size-10 place-items-center rounded-[12px] text-ln-ink transition-colors hover:bg-ln-ink/5 active:scale-95 md:hidden"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-ln-line bg-ln-bg/95 backdrop-blur-xl md:hidden"
          >
            <nav aria-label="Navigasi seluler" className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors",
                    active === item.id ? "bg-ln-ink/5 text-ln-ink" : "text-ln-muted hover:bg-ln-ink/5 hover:text-ln-ink"
                  )}
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-ln-line pt-3">
                {isAuthenticated ? (
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-[12px] bg-ln-ink px-5 py-3 text-center text-sm font-bold text-white active:scale-[0.98]">
                    Buka Dashboard
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setOpen(false)} className="rounded-[12px] border border-ln-line px-5 py-3 text-center text-sm font-semibold text-ln-ink active:scale-[0.98]">
                      Masuk
                    </Link>
                    <Link href="/auth/register" onClick={() => setOpen(false)} className="rounded-[12px] bg-ln-ink px-5 py-3 text-center text-sm font-bold text-white active:scale-[0.98]">
                      Gabung EduNomad
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
