import "dotenv/config";
import { prisma } from "../config/database";
import { deliverableService } from "../services/deliverable.service";
import { contributionService } from "../services/contribution.service";
import { reviewService } from "../services/review.service";
import { projectLifecycleService } from "../services/projectLifecycle.service";

// Showcase seed — turns two already-ACTIVE real projects into a full, testable
// end-to-end example by driving the REAL services (so certificates are genuine,
// not hand-crafted):
//   - "Aplikasi Kasir Digital — Toko Maju Bersama": completed → certificates
//     issued for both members (Hasil Kerja → Review → Sertifikat → Portofolio → Verify).
//   - "Aplikasi Absensi & Penggajian — Bengkel Motor Jaya": approved work +
//     contribution + mentor review, but LEFT ACTIVE (a "running with results" example).
// Idempotent-ish: each mutation is best-effort (duplicates are skipped), and a
// project that is already COMPLETED is left alone.
// Run: npx tsx src/prisma/seed-showcase.ts

const VERIFY_BASE = process.env.DEMO_VERIFY_BASE ?? "https://edunomad-woad.vercel.app";

async function skillIds(names: string[]): Promise<string[]> {
  const rows = await prisma.skill.findMany({ where: { name: { in: names } }, select: { id: true } });
  return rows.map((r) => r.id);
}

async function ok<T>(label: string, p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch (e) {
    console.log(`     · lewati ${label}: ${(e as Error).message}`);
    return null;
  }
}

interface WorkSpec {
  beginnerId: string;
  deliverables: { title: string; desc: string; url: string }[];
  contribution: string;
  skills: string[];
  seniorReview: { rating: number; comment: string };
  umkmReview?: { rating: number; comment: string };
}

async function seedWork(projectId: string, seniorId: string, umkmId: string, w: WorkSpec) {
  for (const d of w.deliverables) {
    const created = (await ok("buat deliverable", deliverableService.create(w.beginnerId, projectId, d.title, d.desc))) as
      | { id: string }
      | null;
    if (created?.id) {
      await ok("submit", deliverableService.submit(w.beginnerId, created.id, [{ type: "LINK", url: d.url }]));
      await ok("approve", deliverableService.approve(seniorId, created.id));
    }
  }
  const contrib = (await ok(
    "kontribusi",
    contributionService.submit(w.beginnerId, projectId, w.contribution, await skillIds(w.skills))
  )) as { id: string } | null;
  if (contrib?.id) await ok("approve kontribusi", contributionService.approve(seniorId, contrib.id));
  await ok(
    "review mentor",
    reviewService.reviewBeginner(seniorId, projectId, w.beginnerId, w.seniorReview.rating, w.seniorReview.comment)
  );
  if (w.umkmReview) {
    await ok(
      "review UMKM",
      reviewService.reviewBeginner(umkmId, projectId, w.beginnerId, w.umkmReview.rating, w.umkmReview.comment)
    );
  }
}

async function findProject(title: string) {
  return prisma.project.findFirst({
    where: { title },
    select: {
      id: true, title: true, status: true, umkmId: true, seniorId: true,
      projectMembers: { where: { status: "ACTIVE" }, select: { userId: true, user: { select: { name: true } } } },
    },
  });
}

async function main() {
  // ── 1) COMPLETE: Toko Maju Bersama ─────────────────────────────────────────
  const tm = await findProject("Aplikasi Kasir Digital — Toko Maju Bersama");
  if (!tm || !tm.seniorId) {
    console.log("Toko Maju: tidak ditemukan / tanpa mentor — dilewati.");
  } else if (tm.status === "COMPLETED") {
    console.log("Toko Maju: sudah COMPLETED — dilewati.");
  } else {
    console.log(`Toko Maju (${tm.projectMembers.length} anggota) → menuju SELESAI…`);
    const byName = (n: string) => tm.projectMembers.find((m) => m.user.name.includes(n))?.userId;
    const akbar = byName("Akbar") ?? tm.projectMembers[0]?.userId;
    const dimas = byName("Dimas") ?? tm.projectMembers[1]?.userId;
    if (akbar) {
      await seedWork(tm.id, tm.seniorId, tm.umkmId, {
        beginnerId: akbar,
        deliverables: [
          { title: "Modul Transaksi Kasir (Frontend)", desc: "Halaman kasir: keranjang, hitung total, cetak struk.", url: "https://github.com/edunomad-demo/kasir-frontend" },
          { title: "Halaman Laporan Penjualan", desc: "Rekap penjualan harian & grafik ringkas.", url: "https://github.com/edunomad-demo/kasir-laporan" },
        ],
        contribution: "Membangun modul transaksi kasir dan halaman laporan penjualan menggunakan React + integrasi API.",
        skills: ["React", "JavaScript", "TypeScript"],
        seniorReview: { rating: 5, comment: "Kerja rapi dan komunikatif. UI kasir bersih, kode mudah dibaca. Pertahankan!" },
        umkmReview: { rating: 5, comment: "Sangat membantu digitalisasi kasir toko kami. Hasilnya langsung bisa dipakai." },
      });
    }
    if (dimas) {
      await seedWork(tm.id, tm.seniorId, tm.umkmId, {
        beginnerId: dimas,
        deliverables: [
          { title: "REST API Kasir & Autentikasi", desc: "Endpoint transaksi, produk, dan login staf.", url: "https://github.com/edunomad-demo/kasir-api" },
        ],
        contribution: "Mengembangkan REST API kasir, autentikasi staf, dan skema database menggunakan Node.js + PostgreSQL.",
        skills: ["Node.js", "Express.js", "PostgreSQL"],
        seniorReview: { rating: 4, comment: "Backend solid dan terstruktur. Tambah validasi input di beberapa endpoint akan lebih sempurna." },
        umkmReview: { rating: 5, comment: "Sistemnya stabil dan cepat. Terima kasih atas kerjanya." },
      });
    }
    await ok("review UMKM→mentor", reviewService.reviewSenior(tm.umkmId, tm.id, 5, "Mentor membimbing tim dengan sabar dan terarah. Proyek selesai tepat sasaran."));
    const done = await ok("completeProject", projectLifecycleService.completeProject(tm.seniorId, tm.id, VERIFY_BASE));
    console.log(done ? "  ✓ Toko Maju SELESAI — sertifikat terbit." : "  ! Toko Maju belum bisa diselesaikan (cek pesan di atas).");
  }

  // ── 2) RUNNING WITH RESULTS: Bengkel Motor Jaya (tetap ACTIVE) ──────────────
  const bk = await findProject("Aplikasi Absensi & Penggajian — Bengkel Motor Jaya");
  if (!bk || !bk.seniorId) {
    console.log("Bengkel: tidak ditemukan / tanpa mentor — dilewati.");
  } else if (bk.status !== "ACTIVE") {
    console.log(`Bengkel: status ${bk.status} — dilewati.`);
  } else {
    const fajar = bk.projectMembers[0]?.userId;
    if (fajar) {
      console.log("Bengkel → tambah hasil kerja (tetap ACTIVE)…");
      await seedWork(bk.id, bk.seniorId, bk.umkmId, {
        beginnerId: fajar,
        deliverables: [
          { title: "Prototype Halaman Absensi Karyawan", desc: "Form check-in/out + rekap kehadiran harian.", url: "https://github.com/edunomad-demo/absensi" },
        ],
        contribution: "Membuat halaman absensi karyawan dan rekap kehadiran menggunakan React.",
        skills: ["React", "JavaScript"],
        seniorReview: { rating: 4, comment: "Progress bagus, alur absensi jelas. Lanjut ke modul penggajian ya." },
        // no UMKM review + not completed → stays ACTIVE
      });
      console.log("  ✓ Bengkel tetap ACTIVE dengan hasil kerja + review mentor.");
    }
  }

  console.log("\nSelesai.");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
