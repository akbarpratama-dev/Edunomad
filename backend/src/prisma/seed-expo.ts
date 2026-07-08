import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// -----------------------------------------------------------------------------
// EXPO seed — a "proper", populated environment for repeated user testing:
//   - 5 UMKM, each with open RECRUITING projects (10 projects total)
//   - 8 ready SENIOR accounts (senior01..08) — 5 assigned as project leads, 3 free
//   - 12 ready JUNIOR accounts (junior01..12) with varied skills
//   - Some projects have a mentor + PENDING applicants (for the AI ranking demo);
//     others are open with no mentor (so a senior respondent can apply as mentor)
//
// Respondents log in with the ready accounts (no registration needed).
// Idempotent — re-running reuses users and skips projects that already exist.
// Run: npx tsx src/prisma/seed-expo.ts
// -----------------------------------------------------------------------------

const adapter = new PrismaPg({ connectionString: process.env["DIRECT_URL"] });
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
async function addUserSkills(userId: string, skills: [string, string][]) {
  for (const [name, level] of skills) {
    const sid = await skillId(name);
    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId, skillId: sid } },
      update: { level },
      create: { userId, skillId: sid, level },
    });
  }
}

// --- data -------------------------------------------------------------------

const UMKMS: { email: string; name: string; headline: string }[] = [
  { email: "warungbutini@edunomad.com", name: "Warung Makan Bu Tini", headline: "Warung makan rumahan — Yogyakarta" },
  { email: "tokobungamelati@edunomad.com", name: "Toko Bunga Melati", headline: "Toko bunga & karangan — Bandung" },
  { email: "kliniksehatsentosa@edunomad.com", name: "Klinik Sehat Sentosa", headline: "Klinik pratama — Semarang" },
  { email: "distrokaoslokal@edunomad.com", name: "Distro Kaos Lokal", headline: "Distro & clothing line lokal — Bandung" },
  { email: "bimbelcerdasceria@edunomad.com", name: "Bimbel Cerdas Ceria", headline: "Bimbingan belajar SD–SMA — Solo" },
];

const SENIOR_NAMES = [
  "Andi Wijaya", "Bagus Santoso", "Cahya Purnama", "Dian Kusuma",
  "Eko Prasetyo", "Fitri Handayani", "Gilang Ramadhan", "Hana Safitri",
];
const SENIORS = SENIOR_NAMES.map((name, i) => ({
  email: `senior${String(i + 1).padStart(2, "0")}@edunomad.com`,
  name,
  skills: [
    ["React", "ADVANCED"],
    ["Node.js", "ADVANCED"],
    ["TypeScript", "ADVANCED"],
    ["PostgreSQL", "INTERMEDIATE"],
  ] as [string, string][],
}));

// 12 juniors with varied skill focus (FE / BE / Design / Fullstack).
const JUNIORS: { name: string; skills: [string, string][] }[] = [
  { name: "Rizki Maulana", skills: [["React", "ADVANCED"], ["JavaScript", "ADVANCED"], ["TypeScript", "INTERMEDIATE"]] },
  { name: "Putri Ayu", skills: [["React", "ADVANCED"], ["JavaScript", "ADVANCED"], ["Next.js", "INTERMEDIATE"]] },
  { name: "Dimas Aditya", skills: [["Node.js", "ADVANCED"], ["Express.js", "INTERMEDIATE"], ["PostgreSQL", "INTERMEDIATE"]] },
  { name: "Nabila Zahra", skills: [["Node.js", "ADVANCED"], ["PostgreSQL", "ADVANCED"], ["Express.js", "INTERMEDIATE"]] },
  { name: "Fajar Ramadhan", skills: [["UI Design", "ADVANCED"], ["Figma", "ADVANCED"], ["UX Research", "INTERMEDIATE"]] },
  { name: "Salsa Amelia", skills: [["Figma", "ADVANCED"], ["UI Design", "INTERMEDIATE"], ["UX Research", "ADVANCED"]] },
  { name: "Bayu Nugraha", skills: [["React", "INTERMEDIATE"], ["Node.js", "INTERMEDIATE"], ["JavaScript", "ADVANCED"]] },
  { name: "Intan Permata", skills: [["React", "ADVANCED"], ["TypeScript", "ADVANCED"], ["JavaScript", "ADVANCED"]] },
  { name: "Yoga Pratama", skills: [["Node.js", "INTERMEDIATE"], ["PostgreSQL", "INTERMEDIATE"], ["JavaScript", "INTERMEDIATE"]] },
  { name: "Mega Lestari", skills: [["React", "ADVANCED"], ["JavaScript", "ADVANCED"], ["TypeScript", "ADVANCED"]] },
  { name: "Rangga Saputra Jr", skills: [["UI Design", "ADVANCED"], ["Figma", "ADVANCED"]] },
  { name: "Sinta Dewi", skills: [["Node.js", "ADVANCED"], ["Express.js", "ADVANCED"], ["PostgreSQL", "ADVANCED"]] },
].map((j, i) => ({ ...j, email: `junior${String(i + 1).padStart(2, "0")}@edunomad.com` }));

const FE: [string, number][] = [["React", 0], ["JavaScript", 0], ["TypeScript", 0]];
const BE: [string, number][] = [["Node.js", 0], ["Express.js", 0], ["PostgreSQL", 0]];
const DS: [string, number][] = [["UI Design", 0], ["Figma", 0], ["UX Research", 0]];

// Projects: lead = senior email (null = open, no mentor). applicants = junior emails
// (indexes 1..12 → junior01..). All apply to role index 0.
interface ProjSpec {
  umkm: string;
  title: string;
  category: string;
  description: string;
  deliverables: string;
  roles: { name: string; skills: [string, number][] }[];
  lead?: string;
  applicants?: number[]; // junior numbers (1-based)
}

const PROJECTS: ProjSpec[] = [
  {
    umkm: "warungbutini@edunomad.com",
    title: "Website Pemesanan Makanan Online",
    category: "Web Development",
    description: "Website pemesanan makanan online untuk Warung Bu Tini: daftar menu, keranjang, dan konfirmasi pesanan via WhatsApp.",
    deliverables: "Website responsif (menu, keranjang, checkout) + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
    lead: "senior01@edunomad.com",
    applicants: [1, 3, 5],
  },
  {
    umkm: "warungbutini@edunomad.com",
    title: "Desain Menu & Branding Digital",
    category: "UI/UX Design",
    description: "Perancangan ulang identitas visual dan desain menu digital Warung Bu Tini.",
    deliverables: "Desain menu, logo, dan panduan brand sederhana.",
    roles: [{ name: "UI/UX Designer", skills: DS }],
  },
  {
    umkm: "tokobungamelati@edunomad.com",
    title: "Aplikasi Katalog Bunga",
    category: "Mobile Development",
    description: "Katalog produk bunga & karangan Toko Melati dengan pemesanan sederhana.",
    deliverables: "Aplikasi katalog (daftar produk, detail, pesan) + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }],
    lead: "senior02@edunomad.com",
    applicants: [2, 4, 6],
  },
  {
    umkm: "tokobungamelati@edunomad.com",
    title: "Kampanye Konten Instagram & Katalog",
    category: "Digital Marketing",
    description: "Pembuatan konten visual dan katalog digital untuk kampanye Instagram Toko Melati.",
    deliverables: "Template konten, katalog digital, dan jadwal posting.",
    roles: [{ name: "Content Designer", skills: DS }],
  },
  {
    umkm: "kliniksehatsentosa@edunomad.com",
    title: "Sistem Reservasi Pasien Online",
    category: "Web Development",
    description: "Sistem reservasi pasien online untuk Klinik Sehat Sentosa: pilih dokter, jadwal, dan konfirmasi.",
    deliverables: "Web reservasi (jadwal, booking, admin) + API + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
    lead: "senior03@edunomad.com",
    applicants: [7, 8, 9],
  },
  {
    umkm: "kliniksehatsentosa@edunomad.com",
    title: "Dashboard Analitik Kunjungan Pasien",
    category: "Data & Analytics",
    description: "Dashboard rekap dan analitik kunjungan pasien untuk manajemen klinik.",
    deliverables: "Dashboard grafik kunjungan + laporan bulanan.",
    roles: [{ name: "Backend / Data", skills: BE }],
  },
  {
    umkm: "distrokaoslokal@edunomad.com",
    title: "Toko Online (E-commerce) Distro",
    category: "Web Development",
    description: "Toko online untuk Distro Kaos Lokal: katalog produk, keranjang, dan checkout.",
    deliverables: "Web e-commerce (katalog, keranjang, checkout) + API + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
    lead: "senior04@edunomad.com",
    applicants: [1, 2, 3],
  },
  {
    umkm: "distrokaoslokal@edunomad.com",
    title: "Aplikasi Kasir Mobile Distro",
    category: "Mobile Development",
    description: "Aplikasi kasir sederhana untuk transaksi di toko fisik distro.",
    deliverables: "Aplikasi kasir mobile (transaksi, stok) + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }],
  },
  {
    umkm: "bimbelcerdasceria@edunomad.com",
    title: "Platform Kuis Online Bimbel",
    category: "Web Development",
    description: "Platform kuis/latihan soal online untuk siswa Bimbel Cerdas Ceria.",
    deliverables: "Web kuis (bank soal, pengerjaan, skor) + API + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
    lead: "senior05@edunomad.com",
    applicants: [4, 8, 10],
  },
  {
    umkm: "bimbelcerdasceria@edunomad.com",
    title: "Redesain UI Website Bimbel",
    category: "UI/UX Design",
    description: "Perancangan ulang tampilan website Bimbel Cerdas Ceria agar lebih modern & ramah pengguna.",
    deliverables: "Wireframe + desain UI halaman utama & pendaftaran.",
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
  console.log("Seeding EXPO environment…");

  const umkmId: Record<string, string> = {};
  for (const u of UMKMS) {
    umkmId[u.email] = await ensureUser({
      email: u.email, name: u.name, role: "UMKM", headline: u.headline,
      bio: "UMKM yang membuka proyek kolaborasi untuk pengembangan digital usahanya.",
    });
  }
  console.log(`  UMKM: ${UMKMS.length}`);

  const seniorId: Record<string, string> = {};
  for (const s of SENIORS) {
    const id = await ensureUser({
      email: s.email, name: s.name, role: "SENIOR",
      headline: "Mentor & praktisi teknologi",
      bio: "Profesional yang siap membimbing mahasiswa lewat proyek nyata.",
    });
    seniorId[s.email] = id;
    await addUserSkills(id, s.skills);
  }
  console.log(`  Senior: ${SENIORS.length}`);

  const juniorId: string[] = []; // index 0 = junior01
  for (const j of JUNIORS) {
    const id = await ensureUser({
      email: j.email, name: j.name, role: "BEGINNER",
      headline: "Mahasiswa yang membangun pengalaman & portofolio",
      bio: "Mahasiswa yang ingin mendapatkan pengalaman proyek nyata bersama mentor.",
    });
    juniorId.push(id);
    await addUserSkills(id, j.skills);
  }
  console.log(`  Junior: ${JUNIORS.length}`);

  const cats: Record<string, string> = {};
  for (const c of ["Web Development", "Mobile Development", "UI/UX Design", "Data & Analytics", "Digital Marketing"]) {
    const row = await prisma.projectCategory.findUnique({ where: { name: c } });
    if (row) cats[c] = row.id;
  }

  let made = 0;
  for (const p of PROJECTS) {
    const existing = await prisma.project.findFirst({ where: { title: p.title } });
    if (existing) continue;
    const project = await prisma.project.create({
      data: {
        umkmId: umkmId[p.umkm],
        seniorId: p.lead ? seniorId[p.lead] : null,
        categoryId: cats[p.category],
        title: p.title,
        description: p.description,
        expectedDeliverables: p.deliverables,
        startDate: new Date("2026-07-20"),
        deadline: new Date("2026-10-31"),
        status: "RECRUITING",
      },
    });
    // roles + role skills
    const roleIds: string[] = [];
    for (const r of p.roles) {
      const role = await prisma.projectRole.create({
        data: {
          projectId: project.id,
          roleName: r.name,
          capacity: 1,
          requirements: `Dibutuhkan untuk peran ${r.name} pada proyek ${p.title}.`,
          roleSkills: { create: await Promise.all(r.skills.map(async ([n]) => ({ skillId: await skillId(n) }))) },
        },
      });
      roleIds.push(role.id);
    }
    // mentor already hired?
    if (p.lead) {
      await prisma.seniorApplication.create({
        data: { projectId: project.id, seniorId: seniorId[p.lead], message: "Siap membimbing proyek ini.", status: "ACCEPTED" },
      });
    }
    // pending applicants → role 0
    if (p.applicants?.length) {
      await prisma.projectApplication.createMany({
        data: p.applicants.map((n, i) => ({
          projectId: project.id,
          projectRoleId: roleIds[0],
          beginnerId: juniorId[n - 1],
          motivation: MOTIVATIONS[i % MOTIVATIONS.length],
          status: "PENDING",
        })),
      });
    }
    made++;
  }
  console.log(`  Projects: ${made} created (RECRUITING)`);

  console.log("\nDone. Password semua akun: " + PASSWORD);
  console.log("  UMKM   : " + UMKMS.map((u) => u.email).join(", "));
  console.log("  Senior : senior01..08@edunomad.com  (senior01–05 = mentor lead + punya pelamar; 06–08 bebas melamar)");
  console.log("  Junior : junior01..12@edunomad.com  (junior10–12 belum melamar; siap uji 'lamar' + AI rekomendasi)");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
