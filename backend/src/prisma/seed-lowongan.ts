import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// -----------------------------------------------------------------------------
// LOWONGAN seed — an extra batch of 10 realistic RECRUITING projects on top of
// seed-expo's 10, owned by 5 NEW UMKM accounts. Mix of:
//   - 4 projects with a mentor already hired + PENDING applicants (so a senior
//     lead can accept beginners → the project becomes usable)
//   - 6 open projects with no mentor (so a senior respondent can apply as mentor)
// Reuses seed-expo's ready senior06..08 as leads and junior01..12 as applicants.
// Idempotent — re-running skips users/projects that already exist.
// Run: npx tsx src/prisma/seed-lowongan.ts
// -----------------------------------------------------------------------------

// Prefer the pooled DATABASE_URL (reachable everywhere the app runs); fall back
// to the direct DIRECT_URL. The seed only does simple creates, so the pooler's
// transaction mode is fine.
const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"] ?? process.env["DIRECT_URL"],
});
const prisma = new PrismaClient({ adapter });

const SUPABASE_URL = process.env["SUPABASE_URL"];
const SUPABASE_SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"];
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env");
}
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PASSWORD = "TestPass123!";

async function ensureUser(opts: {
  email: string;
  name: string;
  role: "UMKM" | "SENIOR" | "BEGINNER";
  headline: string;
  bio: string;
}): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { email: opts.email } });
  if (existing) return existing.id;
  let authId: string | undefined;
  const created = await supabaseAdmin.auth.admin.createUser({
    email: opts.email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (created.data.user) authId = created.data.user.id;
  else {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    authId = data.users.find((u) => u.email === opts.email)?.id;
  }
  if (!authId) throw new Error(`Auth user failed for ${opts.email}: ${created.error?.message}`);
  await prisma.user.create({
    data: {
      id: authId,
      name: opts.name,
      email: opts.email,
      role: opts.role,
      status: "VERIFIED",
      emailVerifiedAt: new Date(),
      profile: { create: { headline: opts.headline, bio: opts.bio } },
    },
  });
  return authId;
}

const skillCache = new Map<string, string>();
async function skillId(name: string): Promise<string> {
  if (skillCache.has(name)) return skillCache.get(name)!;
  const s = await prisma.skill.findUnique({ where: { name } });
  if (!s) throw new Error(`Skill not found: ${name}`);
  skillCache.set(name, s.id);
  return s.id;
}

// --- data -------------------------------------------------------------------

const UMKMS: { email: string; name: string; headline: string }[] = [
  { email: "kedaikopisenja@edunomad.com", name: "Kedai Kopi Senja", headline: "Coffee shop & roastery — Jakarta" },
  { email: "laundrykilatbersih@edunomad.com", name: "Laundry Kilat Bersih", headline: "Jasa laundry kiloan & satuan — Surabaya" },
  { email: "tokobangunansejahtera@edunomad.com", name: "Toko Bangunan Sejahtera", headline: "Toko material & bangunan — Medan" },
  { email: "saloncantikayu@edunomad.com", name: "Salon Cantik Ayu", headline: "Salon & perawatan kecantikan — Bandung" },
  { email: "tokorotimanis@edunomad.com", name: "Toko Roti Manis", headline: "Bakery & kue ulang tahun — Yogyakarta" },
];

const FE: string[] = ["React", "JavaScript", "TypeScript"];
const BE: string[] = ["Node.js", "Express.js", "PostgreSQL"];
const DS: string[] = ["UI Design", "Figma", "UX Research"];

interface ProjSpec {
  umkm: string;
  title: string;
  category: string;
  description: string;
  deliverables: string;
  roles: { name: string; skills: string[] }[];
  lead?: string; // senior email — omit for an open (no-mentor) vacancy
  applicants?: number[]; // junior numbers (1-based) — PENDING applicants to role 0
}

const PROJECTS: ProjSpec[] = [
  {
    umkm: "kedaikopisenja@edunomad.com",
    title: "Website Pemesanan Kopi & Program Loyalitas",
    category: "Web Development",
    description:
      "Website pemesanan kopi online untuk Kedai Kopi Senja lengkap dengan katalog menu, keranjang, dan program poin loyalitas untuk pelanggan tetap.",
    deliverables: "Website responsif (menu, keranjang, checkout, poin loyalitas) + API + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
    lead: "senior06@edunomad.com",
    applicants: [1, 2, 11],
  },
  {
    umkm: "kedaikopisenja@edunomad.com",
    title: "Desain Menu & Identitas Visual Kedai Kopi",
    category: "UI/UX Design",
    description:
      "Perancangan identitas visual dan desain menu digital serta cetak untuk Kedai Kopi Senja agar tampil lebih modern dan konsisten.",
    deliverables: "Logo, palet warna, desain menu (digital & cetak), dan panduan brand ringkas.",
    roles: [{ name: "UI/UX Designer", skills: DS }],
  },
  {
    umkm: "laundrykilatbersih@edunomad.com",
    title: "Aplikasi Order & Lacak Status Laundry",
    category: "Mobile Development",
    description:
      "Aplikasi untuk pelanggan Laundry Kilat Bersih: buat order, pilih layanan, dan lacak status cucian dari masuk hingga siap diambil.",
    deliverables: "Aplikasi (order, pilih layanan, tracking status, notifikasi) + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }],
    lead: "senior07@edunomad.com",
    applicants: [3, 7, 12],
  },
  {
    umkm: "laundrykilatbersih@edunomad.com",
    title: "Sistem Manajemen Pesanan & Kasir Laundry",
    category: "Web Development",
    description:
      "Sistem internal untuk mengelola pesanan, pelanggan, dan transaksi kasir di outlet Laundry Kilat Bersih.",
    deliverables: "Web admin (pesanan, pelanggan, kasir, laporan harian) + API + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
  },
  {
    umkm: "tokobangunansejahtera@edunomad.com",
    title: "Katalog Produk & Cek Stok Online",
    category: "Web Development",
    description:
      "Website katalog material bangunan Toko Bangunan Sejahtera dengan pencarian produk, cek harga, dan ketersediaan stok real-time.",
    deliverables: "Web katalog (pencarian, detail produk, cek stok) + API + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
  },
  {
    umkm: "tokobangunansejahtera@edunomad.com",
    title: "Dashboard Rekap Penjualan & Stok",
    category: "Data & Analytics",
    description:
      "Dashboard analitik untuk memantau penjualan harian, produk terlaris, dan level stok toko bangunan.",
    deliverables: "Dashboard grafik penjualan & stok + laporan bulanan.",
    roles: [{ name: "Backend / Data", skills: BE }],
    lead: "senior08@edunomad.com",
    applicants: [4, 9],
  },
  {
    umkm: "saloncantikayu@edunomad.com",
    title: "Website Booking Perawatan & Jadwal Salon",
    category: "Web Development",
    description:
      "Website reservasi online Salon Cantik Ayu: pilih layanan, pilih kapster, tentukan jadwal, dan konfirmasi otomatis.",
    deliverables: "Web booking (layanan, kapster, jadwal, admin) + API + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
  },
  {
    umkm: "saloncantikayu@edunomad.com",
    title: "Kampanye Konten Instagram Salon",
    category: "Digital Marketing",
    description:
      "Pembuatan konten visual dan strategi posting untuk meningkatkan jangkauan Instagram Salon Cantik Ayu.",
    deliverables: "Template konten, katalog layanan digital, dan kalender posting sebulan.",
    roles: [{ name: "Content Designer", skills: DS }],
  },
  {
    umkm: "tokorotimanis@edunomad.com",
    title: "Toko Online Kue & Roti dengan Pre-Order",
    category: "Web Development",
    description:
      "Toko online Toko Roti Manis: katalog kue & roti, keranjang, checkout, dan fitur pre-order kue ulang tahun.",
    deliverables: "Web e-commerce (katalog, keranjang, checkout, pre-order) + API + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
    lead: "senior07@edunomad.com",
    applicants: [5, 6, 10],
  },
  {
    umkm: "tokorotimanis@edunomad.com",
    title: "Redesain UI Website Toko Roti",
    category: "UI/UX Design",
    description:
      "Perancangan ulang tampilan website Toko Roti Manis agar lebih menggugah selera dan mudah digunakan di ponsel.",
    deliverables: "Wireframe + desain UI halaman utama, katalog, dan pemesanan.",
    roles: [{ name: "UI/UX Designer", skills: DS }],
  },
];

const MOTIVATIONS = [
  "Saya tertarik dengan proyek ini dan yakin keahlian saya cocok untuk perannya.",
  "Saya ingin menambah pengalaman nyata dan berkontribusi pada proyek ini.",
  "Proyek ini sesuai dengan minat dan skill yang sedang saya kembangkan.",
];

// --- main -------------------------------------------------------------------

async function main() {
  console.log("Seeding LOWONGAN batch (10 extra RECRUITING projects)…");

  const umkmId: Record<string, string> = {};
  for (const u of UMKMS) {
    umkmId[u.email] = await ensureUser({
      email: u.email, name: u.name, role: "UMKM", headline: u.headline,
      bio: "UMKM yang membuka proyek kolaborasi untuk pengembangan digital usahanya.",
    });
  }
  console.log(`  UMKM: ${UMKMS.length} (baru/di-reuse)`);

  // Resolve existing senior/junior ids (from seed-expo) by email — required for
  // the leads + applicants below. Missing ones are skipped gracefully.
  const seniorEmails = ["senior06@edunomad.com", "senior07@edunomad.com", "senior08@edunomad.com"];
  const seniorId: Record<string, string> = {};
  for (const e of seniorEmails) {
    const u = await prisma.user.findUnique({ where: { email: e } });
    if (u) seniorId[e] = u.id;
  }
  const juniorId: string[] = []; // index 0 = junior01
  for (let n = 1; n <= 12; n++) {
    const u = await prisma.user.findUnique({ where: { email: `junior${String(n).padStart(2, "0")}@edunomad.com` } });
    juniorId.push(u?.id ?? "");
  }

  const cats: Record<string, string> = {};
  for (const c of ["Web Development", "Mobile Development", "UI/UX Design", "Data & Analytics", "Digital Marketing"]) {
    const row = await prisma.projectCategory.findUnique({ where: { name: c } });
    if (row) cats[c] = row.id;
  }

  let made = 0;
  for (const p of PROJECTS) {
    const existing = await prisma.project.findFirst({ where: { title: p.title } });
    if (existing) continue;
    if (!cats[p.category]) {
      console.warn(`  ! skip "${p.title}" — category "${p.category}" not found`);
      continue;
    }
    // Only keep a lead if that senior actually exists.
    const leadId = p.lead ? seniorId[p.lead] : undefined;
    const project = await prisma.project.create({
      data: {
        umkmId: umkmId[p.umkm],
        seniorId: leadId ?? null,
        categoryId: cats[p.category],
        title: p.title,
        description: p.description,
        expectedDeliverables: p.deliverables,
        startDate: new Date("2026-07-25"),
        deadline: new Date("2026-11-30"),
        status: "RECRUITING",
      },
    });
    const roleIds: string[] = [];
    for (const r of p.roles) {
      const role = await prisma.projectRole.create({
        data: {
          projectId: project.id,
          roleName: r.name,
          capacity: 1,
          requirements: `Dibutuhkan untuk peran ${r.name} pada proyek ${p.title}.`,
          roleSkills: { create: await Promise.all(r.skills.map(async (n) => ({ skillId: await skillId(n) }))) },
        },
      });
      roleIds.push(role.id);
    }
    if (leadId) {
      await prisma.seniorApplication.create({
        data: { projectId: project.id, seniorId: leadId, message: "Siap membimbing proyek ini.", status: "ACCEPTED" },
      });
    }
    // PENDING applicants → role 0 (only for leads, and only juniors that exist).
    if (leadId && p.applicants?.length) {
      const rows = p.applicants
        .map((n, i) => ({ beginnerId: juniorId[n - 1], motivation: MOTIVATIONS[i % MOTIVATIONS.length] }))
        .filter((r) => r.beginnerId)
        .map((r) => ({ projectId: project.id, projectRoleId: roleIds[0], status: "PENDING" as const, ...r }));
      if (rows.length) await prisma.projectApplication.createMany({ data: rows });
    }
    made++;
  }
  console.log(`  Projects: ${made} created (RECRUITING)`);
  console.log("\nDone. Password semua akun UMKM baru: " + PASSWORD);
  console.log("  UMKM baru: " + UMKMS.map((u) => u.email).join(", "));
  console.log("  4 proyek punya mentor + pelamar PENDING (senior bisa accept); 6 proyek terbuka (senior bisa lamar mentor).");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
