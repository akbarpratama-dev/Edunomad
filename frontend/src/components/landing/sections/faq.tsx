"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, SectionHeading } from "@/components/landing/primitives";
import { Stagger, StaggerItem } from "@/components/landing/motion";

const FAQS = [
  {
    q: "Apa itu EduNomad?",
    a: "EduNomad adalah platform pembelajaran berbasis proyek nyata yang menghubungkan mahasiswa dengan UMKM (usaha kecil dan menengah) dan mentor profesional. Mahasiswa mengerjakan proyek sungguhan dari UMKM, dibimbing mentor industri, dan mendapatkan sertifikat portofolio terverifikasi sebagai bukti pengalaman nyata.",
  },
  {
    q: "Bagaimana sertifikat diverifikasi?",
    a: "Setiap sertifikat melewati tiga lapis validasi: mentor proyek meninjau kontribusi, pemilik UMKM mengonfirmasi hasil pekerjaan, dan admin EduNomad memvalidasi keasliannya. Sertifikat memiliki QR dan ID unik yang dapat dicek publik kapan saja.",
  },
  {
    q: "Apakah mahasiswa dibayar?",
    a: "Fokus utama EduNomad adalah pengalaman dan portofolio nyata, bukan upah. Sebagian proyek dapat menyertakan apresiasi dari UMKM, namun nilai utamanya adalah bukti karya terverifikasi yang bisa kamu tunjukkan ke perusahaan.",
  },
  {
    q: "Bagaimana proses seleksi mahasiswa?",
    a: "Mahasiswa melamar peran yang sesuai keahlian. Mentor proyek meninjau lamaran, skill, dan motivasi, lalu memilih anggota tim yang paling cocok untuk proyek tersebut.",
  },
  {
    q: "Apakah UMKM bisa membuat banyak proyek?",
    a: "Ya. Setiap UMKM dapat mengajukan beberapa proyek, dengan batas proyek aktif sesuai kebijakan platform agar kualitas pendampingan dan kolaborasi tetap terjaga.",
  },
  {
    q: "Apakah EduNomad gratis untuk mahasiswa?",
    a: "Gratis. Mahasiswa dapat bergabung, melamar proyek, dan memperoleh sertifikat portofolio tanpa biaya.",
  },
  {
    q: "Bagaimana cara kerja pendampingan mentor?",
    a: "Setiap proyek memiliki satu mentor yang membimbing tim, meninjau deliverable, memberi umpan balik, dan memverifikasi kontribusi sebelum proyek dinyatakan selesai.",
  },
];

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="bg-ln-bg py-20 sm:py-28">
      <Container className="max-w-3xl">
        <SectionHeading label="FAQ" title="Pertanyaan Yang Sering Ditanyakan" />

        <Stagger className="mt-12 flex flex-col gap-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <StaggerItem key={item.q}>
                <div
                  className={cn(
                    "rounded-2xl border transition-colors",
                    isOpen ? "border-ln-line bg-ln-card shadow-[0_12px_30px_rgba(15,17,21,0.05)]" : "border-transparent bg-ln-card/60"
                  )}
                >
                  <button
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                  >
                    <span className="text-[0.95rem] font-bold text-ln-ink">{item.q}</span>
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full transition-colors",
                        isOpen ? "bg-ln-ink text-white" : "bg-ln-ink/5 text-ln-ink"
                      )}
                    >
                      {isOpen ? <Minus className="size-3.5" aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-a-${i}`}
                        role="region"
                        aria-labelledby={`faq-q-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-6 text-[0.9375rem] leading-[1.65] text-ln-muted">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </section>
  );
}
