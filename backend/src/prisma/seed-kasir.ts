import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// -----------------------------------------------------------------------------
// Demo seed: a realistic in-flight project — "Aplikasi Kasir Digital" built for
// the UMKM "Toko Maju Bersama". Populates real-looking users (UMKM owner, senior
// mentor Aldo, frontend junior Muhammad Akbar Pratama [React], backend junior
// Dimas Prasetyo), an ACTIVE project with two roles, ACTIVE memberships,
// milestones (mixed status → realistic progress bar) and reviews (senior→junior,
// umkm→junior, umkm→senior) plus approved contribution reports for portfolio.
//
// Idempotent: re-running reuses existing users (by email) and skips the project
// if it already exists. Run: npx tsx src/prisma/seed-kasir.ts
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
const PROJECT_TITLE = "Aplikasi Kasir Digital — Toko Maju Bersama";

// --- helpers ----------------------------------------------------------------

async function ensureUser(opts: {
  email: string;
  name: string;
  role: "UMKM" | "SENIOR" | "BEGINNER";
  headline: string;
  bio: string;
  phone: string;
}): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { email: opts.email } });
  if (existing) {
    console.log(`  user exists: ${opts.email}`);
    return existing.id;
  }
  // Try to create the Supabase Auth user; if it already exists in auth but not
  // in public.users, look it up so the ids stay in sync.
  let authId: string | undefined;
  const created = await supabaseAdmin.auth.admin.createUser({
    email: opts.email,
    password: PASSWORD,
    email_confirm: true,
  });
  if (created.data.user) {
    authId = created.data.user.id;
  } else {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    authId = data.users.find((u) => u.email === opts.email)?.id;
  }
  if (!authId) throw new Error(`Could not create/find auth user for ${opts.email}: ${created.error?.message}`);

  await prisma.user.create({
    data: {
      id: authId,
      name: opts.name,
      email: opts.email,
      role: opts.role,
      status: "VERIFIED",
      emailVerifiedAt: new Date(),
      profile: {
        create: { headline: opts.headline, bio: opts.bio, phone: opts.phone },
      },
    },
  });
  console.log(`  created user: ${opts.email} (${opts.role})`);
  return authId;
}

async function skillId(name: string): Promise<string> {
  const s = await prisma.skill.findUnique({ where: { name } });
  if (!s) throw new Error(`Skill not found: ${name}`);
  return s.id;
}

async function addUserSkills(userId: string, skills: [string, string][]): Promise<void> {
  for (const [name, level] of skills) {
    const sid = await skillId(name);
    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId, skillId: sid } },
      update: { level },
      create: { userId, skillId: sid, level },
    });
  }
}

// --- main -------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("Seeding Kasir UMKM demo scenario…");

  // 1) Users
  const umkmId = await ensureUser({
    email: "tokomajubersama@edunomad.com",
    name: "Toko Maju Bersama",
    role: "UMKM",
    headline: "Toko kelontong & sembako — Bandung",
    bio: "UMKM sembako yang ingin beralih dari pencatatan manual ke aplikasi kasir digital untuk mempercepat transaksi dan memantau stok.",
    phone: "081234500001",
  });
  const seniorId = await ensureUser({
    email: "aldo.firmansyah@edunomad.com",
    name: "Aldo Firmansyah",
    role: "SENIOR",
    headline: "Fullstack Engineer & Mentor",
    bio: "Fullstack engineer 6+ tahun (React, Node.js, PostgreSQL). Mentor yang fokus pada praktik rekayasa yang rapi dan mentoring junior.",
    phone: "081234500002",
  });
  const akbarId = await ensureUser({
    email: "akbar.pratama@edunomad.com",
    name: "Muhammad Akbar Pratama",
    role: "BEGINNER",
    headline: "Frontend Developer (React)",
    bio: "Frontend developer yang antusias membangun antarmuka kasir yang cepat dan mudah dipakai kasir toko. Fokus di React & TypeScript.",
    phone: "081234500003",
  });
  const dimasId = await ensureUser({
    email: "dimas.prasetyo@edunomad.com",
    name: "Dimas Prasetyo",
    role: "BEGINNER",
    headline: "Backend Developer (Node.js)",
    bio: "Backend developer yang senang merancang API dan skema database yang andal. Fokus di Node.js, Express, dan PostgreSQL.",
    phone: "081234500004",
  });

  // 2) User skills
  await addUserSkills(akbarId, [
    ["React", "ADVANCED"],
    ["JavaScript", "ADVANCED"],
    ["TypeScript", "INTERMEDIATE"],
    ["Next.js", "INTERMEDIATE"],
  ]);
  await addUserSkills(dimasId, [
    ["Node.js", "ADVANCED"],
    ["Express.js", "INTERMEDIATE"],
    ["PostgreSQL", "INTERMEDIATE"],
    ["JavaScript", "INTERMEDIATE"],
  ]);
  await addUserSkills(seniorId, [
    ["React", "ADVANCED"],
    ["Node.js", "ADVANCED"],
    ["TypeScript", "ADVANCED"],
    ["PostgreSQL", "ADVANCED"],
  ]);

  // 3) Experiences (juniors) — enriches profile + AI summary
  const akbarHasExp = await prisma.experience.findFirst({ where: { userId: akbarId } });
  if (!akbarHasExp) {
    await prisma.experience.create({
      data: {
        userId: akbarId,
        title: "Frontend Developer (Proyek Kampus)",
        organization: "Himpunan Mahasiswa Informatika",
        description: "Membangun landing page & dashboard internal memakai React dan Tailwind CSS.",
        startDate: new Date("2024-09-01"),
        endDate: new Date("2025-02-28"),
      },
    });
  }
  const dimasHasExp = await prisma.experience.findFirst({ where: { userId: dimasId } });
  if (!dimasHasExp) {
    await prisma.experience.create({
      data: {
        userId: dimasId,
        title: "Backend Intern",
        organization: "Startup Logistik Lokal",
        description: "Merancang REST API pencatatan pengiriman dengan Node.js, Express, dan PostgreSQL.",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-12-31"),
      },
    });
  }

  // 4) Project (skip if it already exists)
  const existingProject = await prisma.project.findFirst({ where: { title: PROJECT_TITLE } });
  if (existingProject) {
    console.log(`Project already exists (${existingProject.id}) — skipping project graph.`);
    console.log("Done.");
    return;
  }

  const webCategory = await prisma.projectCategory.findUnique({ where: { name: "Web Development" } });
  if (!webCategory) throw new Error("Web Development category missing");

  const project = await prisma.project.create({
    data: {
      umkmId,
      seniorId,
      categoryId: webCategory.id,
      title: PROJECT_TITLE,
      description:
        "Toko Maju Bersama, sebuah toko sembako di Bandung, masih mencatat penjualan secara manual di buku. " +
        "Proyek ini membangun aplikasi kasir digital (Point of Sale) berbasis web: pencatatan transaksi cepat, " +
        "manajemen produk & stok, data pelanggan, serta laporan penjualan harian agar pemilik bisa memantau " +
        "kondisi toko secara real-time.",
      expectedDeliverables:
        "1) Aplikasi kasir web responsif (transaksi, keranjang, cetak struk). " +
        "2) Modul manajemen produk & stok dengan peringatan stok menipis. " +
        "3) Data pelanggan & riwayat transaksi. " +
        "4) Dashboard laporan penjualan (harian/mingguan). " +
        "5) Dokumentasi & panduan penggunaan untuk kasir.",
      startDate: new Date("2026-05-01"),
      deadline: new Date("2026-08-31"),
      status: "ACTIVE",
      imageUrl: "/demo/kasir-cover.png",
    },
  });
  console.log(`  created project: ${project.id}`);

  // 5) Roles + role skills
  const feRole = await prisma.projectRole.create({
    data: {
      projectId: project.id,
      roleName: "Frontend Developer",
      capacity: 1,
      requirements:
        "Membangun antarmuka kasir yang cepat & mudah dipakai memakai React + TypeScript. Terbiasa dengan komponen UI dan state management.",
      roleSkills: {
        create: [
          { skillId: await skillId("React") },
          { skillId: await skillId("JavaScript") },
          { skillId: await skillId("TypeScript") },
          { skillId: await skillId("Next.js") },
        ],
      },
    },
  });
  const beRole = await prisma.projectRole.create({
    data: {
      projectId: project.id,
      roleName: "Backend Developer",
      capacity: 1,
      requirements:
        "Merancang REST API transaksi & stok dan skema database yang andal memakai Node.js, Express, dan PostgreSQL.",
      roleSkills: {
        create: [
          { skillId: await skillId("Node.js") },
          { skillId: await skillId("Express.js") },
          { skillId: await skillId("PostgreSQL") },
        ],
      },
    },
  });
  console.log("  created roles: Frontend, Backend");

  // 6) Members (ACTIVE)
  const joined = new Date("2026-05-03");
  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: akbarId, projectRoleId: feRole.id, status: "ACTIVE", joinedAt: joined },
      { projectId: project.id, userId: dimasId, projectRoleId: beRole.id, status: "ACTIVE", joinedAt: joined },
    ],
  });
  console.log("  added members: Akbar (FE), Dimas (BE)");

  // 7) Milestones (3 COMPLETED / 1 IN_PROGRESS / 2 PENDING → 50% progress)
  await prisma.milestone.createMany({
    data: [
      {
        projectId: project.id,
        title: "Setup Proyek & Perancangan UI Kasir",
        description: "Inisialisasi repo, desain wireframe halaman kasir, dan sistem desain dasar.",
        dueDate: new Date("2026-05-15"),
        status: "COMPLETED",
      },
      {
        projectId: project.id,
        title: "Autentikasi & Manajemen Produk",
        description: "Login pegawai/pemilik, CRUD produk beserta harga dan kategori.",
        dueDate: new Date("2026-05-31"),
        status: "COMPLETED",
      },
      {
        projectId: project.id,
        title: "Modul Transaksi & Keranjang",
        description: "Alur transaksi kasir: tambah item, keranjang, pembayaran, dan cetak struk.",
        dueDate: new Date("2026-06-15"),
        status: "COMPLETED",
      },
      {
        projectId: project.id,
        title: "Manajemen Stok & Data Pelanggan",
        description: "Pengurangan stok otomatis, peringatan stok menipis, dan data pelanggan.",
        dueDate: new Date("2026-06-30"),
        status: "IN_PROGRESS",
      },
      {
        projectId: project.id,
        title: "Dashboard & Laporan Penjualan",
        description: "Grafik penjualan, produk terlaris, dan ringkasan harian di dashboard pemilik.",
        dueDate: new Date("2026-07-20"),
        status: "PENDING",
      },
      {
        projectId: project.id,
        title: "Integrasi, Uji Coba (UAT) & Dokumentasi",
        description: "Uji coba end-to-end bersama pemilik toko dan penyusunan panduan pemakaian.",
        dueDate: new Date("2026-08-20"),
        status: "PENDING",
      },
    ],
  });
  console.log("  added 6 milestones (3 selesai / 1 berjalan / 2 belum)");

  // 8) Reviews (project ACTIVE)
  await prisma.review.createMany({
    data: [
      {
        projectId: project.id,
        reviewerId: seniorId,
        revieweeId: akbarId,
        rating: 5,
        comment:
          "Akbar sangat cepat menerjemahkan wireframe jadi UI kasir yang rapi. Komponen React-nya reusable dan alur transaksi terasa mulus. Tinggal tingkatkan penanganan edge case input.",
        type: "SENIOR_TO_BEGINNER",
      },
      {
        projectId: project.id,
        reviewerId: seniorId,
        revieweeId: dimasId,
        rating: 4,
        comment:
          "Dimas merancang API transaksi & skema stok dengan baik. Validasi request sudah solid; perlu tambah pengujian untuk kasus stok bersamaan (race condition).",
        type: "SENIOR_TO_BEGINNER",
      },
      {
        projectId: project.id,
        reviewerId: umkmId,
        revieweeId: akbarId,
        rating: 5,
        comment: "Tampilan kasirnya gampang dipakai pegawai toko saya. Transaksi jadi jauh lebih cepat.",
        type: "UMKM_TO_BEGINNER",
      },
      {
        projectId: project.id,
        reviewerId: umkmId,
        revieweeId: dimasId,
        rating: 4,
        comment: "Data stok dan laporan sudah sesuai kebutuhan toko. Terima kasih responsif saat ada revisi.",
        type: "UMKM_TO_BEGINNER",
      },
      {
        projectId: project.id,
        reviewerId: umkmId,
        revieweeId: seniorId,
        rating: 5,
        comment: "Mas Aldo membimbing tim dengan sabar dan hasilnya sesuai harapan. Komunikasi jelas setiap minggu.",
        type: "UMKM_TO_SENIOR",
      },
    ],
  });
  console.log("  added 5 reviews");

  // 9) Contribution reports (APPROVED) — powers "Kontribusi Saya" in portfolio
  const akbarContrib = await prisma.contributionReport.create({
    data: {
      projectId: project.id,
      beginnerId: akbarId,
      contributionSummary:
        "Membangun seluruh antarmuka kasir dengan React & TypeScript: halaman transaksi, keranjang, manajemen produk, dan dashboard laporan. Menerapkan komponen reusable dan memastikan tampilan responsif di layar kasir.",
      status: "APPROVED",
      reviewedBy: seniorId,
      contributionSkills: {
        create: [
          { skillId: await skillId("React") },
          { skillId: await skillId("TypeScript") },
          { skillId: await skillId("Next.js") },
        ],
      },
    },
  });
  const dimasContrib = await prisma.contributionReport.create({
    data: {
      projectId: project.id,
      beginnerId: dimasId,
      contributionSummary:
        "Merancang REST API dan skema database untuk transaksi, produk, stok, dan pelanggan memakai Node.js, Express, dan PostgreSQL. Membuat logika pengurangan stok otomatis dan endpoint laporan penjualan.",
      status: "APPROVED",
      reviewedBy: seniorId,
      contributionSkills: {
        create: [
          { skillId: await skillId("Node.js") },
          { skillId: await skillId("Express.js") },
          { skillId: await skillId("PostgreSQL") },
        ],
      },
    },
  });
  console.log(`  added contribution reports: ${akbarContrib.id.slice(0, 8)}, ${dimasContrib.id.slice(0, 8)}`);

  // 10) Notifications — real rows so the dashboard "Aktivitas Terbaru" /
  // "Notifikasi" cards (which read the live notification store) show content.
  const now = Date.now();
  const daysAgo = (d: number) => new Date(now - d * 86400000);
  const ws = `/my-projects/${project.id}/workspace`;
  await prisma.notification.createMany({
    data: [
      // Akbar (frontend junior)
      {
        userId: akbarId,
        type: "APPLICATION_ACCEPTED",
        title: "Lamaran diterima",
        message: "Kamu diterima sebagai Frontend Developer di proyek Aplikasi Kasir Digital — Toko Maju Bersama.",
        actionUrl: ws,
        isRead: true,
        createdAt: daysAgo(60),
      },
      {
        userId: akbarId,
        type: "CONTRIBUTION_APPROVED",
        title: "Kontribusi disetujui",
        message: "Aldo Firmansyah menyetujui laporan kontribusimu di proyek Aplikasi Kasir Digital.",
        actionUrl: "/profile",
        isRead: false,
        createdAt: daysAgo(3),
      },
      {
        userId: akbarId,
        type: "REVIEW_RECEIVED",
        title: "Ulasan baru dari mentor",
        message: "Aldo Firmansyah memberimu ulasan bintang 5 untuk kerja frontend kasir.",
        actionUrl: "/reviews",
        isRead: false,
        createdAt: daysAgo(1),
      },
      // Dimas (backend junior)
      {
        userId: dimasId,
        type: "APPLICATION_ACCEPTED",
        title: "Lamaran diterima",
        message: "Kamu diterima sebagai Backend Developer di proyek Aplikasi Kasir Digital — Toko Maju Bersama.",
        actionUrl: ws,
        isRead: true,
        createdAt: daysAgo(60),
      },
      {
        userId: dimasId,
        type: "REVIEW_RECEIVED",
        title: "Ulasan baru dari mentor",
        message: "Aldo Firmansyah memberimu ulasan bintang 4 untuk rancangan API & stok.",
        actionUrl: "/reviews",
        isRead: false,
        createdAt: daysAgo(1),
      },
      // Aldo (senior mentor)
      {
        userId: seniorId,
        type: "SENIOR_ASSIGNED",
        title: "Kamu ditugaskan sebagai mentor",
        message: "Kamu kini menjadi mentor proyek Aplikasi Kasir Digital — Toko Maju Bersama.",
        actionUrl: ws,
        isRead: true,
        createdAt: daysAgo(62),
      },
      {
        userId: seniorId,
        type: "REVIEW_RECEIVED",
        title: "Ulasan baru dari UMKM",
        message: "Toko Maju Bersama memberimu ulasan bintang 5 atas bimbingan tim.",
        actionUrl: "/reviews",
        isRead: false,
        createdAt: daysAgo(2),
      },
      // UMKM (Toko Maju Bersama)
      {
        userId: umkmId,
        type: "PROJECT_APPROVED",
        title: "Proyek disetujui",
        message: 'Proyek "Aplikasi Kasir Digital" disetujui & masuk tahap rekrutmen.',
        actionUrl: `/my-projects/${project.id}`,
        isRead: true,
        createdAt: daysAgo(65),
      },
      {
        userId: umkmId,
        type: "SENIOR_ASSIGNED",
        title: "Mentor ditugaskan",
        message: "Aldo Firmansyah ditugaskan sebagai mentor untuk proyekmu.",
        actionUrl: `/my-projects/${project.id}`,
        isRead: false,
        createdAt: daysAgo(62),
      },
    ],
  });
  console.log("  added notifications for all 4 users");

  console.log("\nDone. Login (semua): password " + PASSWORD);
  console.log("  UMKM   : tokomajubersama@edunomad.com");
  console.log("  Senior : aldo.firmansyah@edunomad.com");
  console.log("  Junior : akbar.pratama@edunomad.com (Frontend)");
  console.log("  Junior : dimas.prasetyo@edunomad.com (Backend)");
  console.log(`  Project: ${project.id}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
