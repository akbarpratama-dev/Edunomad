import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// -----------------------------------------------------------------------------
// AI DEMO seed. Sets up a fresh RECRUITING project (UMKM "Bengkel Motor Jaya",
// mentor already assigned) with a Frontend + Backend role, several PENDING
// beginner applicants of varying skill match (so the AI candidate ranking shows
// clear differentiation), and one *un-applied* frontend junior (Fajar) that the
// presenter logs in as to apply LIVE — showing the AI portfolio recommendation.
//
// Demo:
//  - Senior view (Rangga): applicants page → "Urutkan berdasarkan kecocokan AI".
//  - Junior view (Fajar): open project → Apply → AI portfolio recommendation.
//
// Idempotent. Run: npx tsx src/prisma/seed-ai-demo.ts
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
const PROJECT_TITLE = "Aplikasi Absensi & Penggajian — Bengkel Motor Jaya";

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
  if (!authId) throw new Error(`Could not create/find auth user for ${opts.email}: ${created.error?.message}`);

  await prisma.user.create({
    data: {
      id: authId,
      name: opts.name,
      email: opts.email,
      role: opts.role,
      status: "VERIFIED",
      emailVerifiedAt: new Date(),
      profile: { create: { headline: opts.headline, bio: opts.bio, phone: opts.phone } },
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

async function main(): Promise<void> {
  console.log("Seeding AI DEMO scenario…");

  // 1) UMKM + Senior (mentor lead)
  const umkmId = await ensureUser({
    email: "bengkelmotorjaya@edunomad.com",
    name: "Bengkel Motor Jaya",
    role: "UMKM",
    headline: "Bengkel motor & spare part — Sleman",
    bio: "Bengkel yang ingin mendigitalkan absensi dan penggajian mekanik agar lebih rapi dan transparan.",
    phone: "081200000010",
  });
  const seniorId = await ensureUser({
    email: "rangga.saputra@edunomad.com",
    name: "Rangga Saputra",
    role: "SENIOR",
    headline: "Fullstack Engineer & Mentor",
    bio: "Fullstack engineer 7 tahun (React, Node.js, PostgreSQL). Terbiasa membimbing tim junior dari nol.",
    phone: "081200000011",
  });
  await addUserSkills(seniorId, [
    ["React", "ADVANCED"],
    ["Node.js", "ADVANCED"],
    ["TypeScript", "ADVANCED"],
    ["PostgreSQL", "ADVANCED"],
  ]);

  // 2) The un-applied frontend junior (presenter logs in as this to apply LIVE)
  const fajarId = await ensureUser({
    email: "fajar.nugroho@edunomad.com",
    name: "Fajar Nugroho",
    role: "BEGINNER",
    headline: "Frontend Developer (React & TypeScript)",
    bio: "Mahasiswa Informatika yang fokus membangun antarmuka web modern dengan React, TypeScript, dan Next.js. Terbiasa membuat komponen reusable dan tampilan responsif.",
    phone: "081200000012",
  });
  await addUserSkills(fajarId, [
    ["React", "ADVANCED"],
    ["JavaScript", "ADVANCED"],
    ["TypeScript", "ADVANCED"],
    ["Next.js", "INTERMEDIATE"],
  ]);
  const fajarHasExp = await prisma.experience.findFirst({ where: { userId: fajarId } });
  if (!fajarHasExp) {
    await prisma.experience.create({
      data: {
        userId: fajarId,
        title: "Frontend Developer (Proyek Kampus)",
        organization: "UKM Teknologi Kampus",
        description: "Membangun dashboard dan landing page dengan React + TypeScript untuk kegiatan kampus.",
        startDate: new Date("2024-08-01"),
        endDate: new Date("2025-03-31"),
      },
    });
  }

  // 3) Pre-applied PENDING applicants — varied match (for a rich AI ranking)
  const bimaId = await ensureUser({
    email: "bima.sakti@edunomad.com",
    name: "Bima Sakti",
    role: "BEGINNER",
    headline: "Frontend Developer (React)",
    bio: "Senang membangun UI web dengan React dan JavaScript. Terbiasa slicing desain menjadi komponen.",
    phone: "081200000013",
  });
  await addUserSkills(bimaId, [
    ["React", "ADVANCED"],
    ["JavaScript", "ADVANCED"],
    ["TypeScript", "INTERMEDIATE"],
  ]);

  const citraId = await ensureUser({
    email: "citra.kirana@edunomad.com",
    name: "Citra Kirana",
    role: "BEGINNER",
    headline: "UI Designer & Frontend Pemula",
    bio: "Fokus di desain antarmuka (Figma) dan mulai belajar coding frontend dengan JavaScript.",
    phone: "081200000014",
  });
  await addUserSkills(citraId, [
    ["JavaScript", "INTERMEDIATE"],
    ["UI Design", "ADVANCED"],
    ["Figma", "ADVANCED"],
  ]);

  const doniId = await ensureUser({
    email: "doni.pratama@edunomad.com",
    name: "Doni Pratama",
    role: "BEGINNER",
    headline: "Backend Developer (Node.js)",
    bio: "Lebih nyaman di sisi server: merancang API dan database dengan Node.js dan PostgreSQL.",
    phone: "081200000015",
  });
  await addUserSkills(doniId, [
    ["Node.js", "ADVANCED"],
    ["Express.js", "INTERMEDIATE"],
    ["PostgreSQL", "INTERMEDIATE"],
  ]);

  // 4) Project (RECRUITING, mentor already assigned)
  const existingProject = await prisma.project.findFirst({ where: { title: PROJECT_TITLE } });
  if (existingProject) {
    console.log(`Project already exists (${existingProject.id}) — skipping project graph.`);
    printLogin(existingProject.id);
    return;
  }
  const webCategory = await prisma.projectCategory.findUnique({ where: { name: "Web Development" } });
  if (!webCategory) throw new Error("Web Development category missing");

  const project = await prisma.project.create({
    data: {
      umkmId,
      seniorId, // mentor sudah di-hire; tinggal rekrut anggota (junior)
      categoryId: webCategory.id,
      title: PROJECT_TITLE,
      description:
        "Bengkel Motor Jaya masih mencatat absensi mekanik dan penggajian secara manual. Proyek ini " +
        "membangun aplikasi web absensi (check-in/out) dan perhitungan gaji sederhana, dengan dashboard " +
        "rekap kehadiran dan laporan gaji bulanan untuk pemilik bengkel.",
      expectedDeliverables:
        "1) Aplikasi web absensi (check-in/out) responsif. 2) Perhitungan gaji berdasarkan kehadiran. " +
        "3) Dashboard rekap kehadiran & laporan gaji. 4) Dokumentasi penggunaan.",
      startDate: new Date("2026-07-15"),
      deadline: new Date("2026-09-30"),
      status: "RECRUITING",
    },
  });
  console.log(`  created project (RECRUITING): ${project.id}`);

  // 5) Roles + role skills
  const feRole = await prisma.projectRole.create({
    data: {
      projectId: project.id,
      roleName: "Frontend Developer",
      capacity: 1,
      requirements:
        "Membangun antarmuka absensi & dashboard yang cepat dan mudah dipakai memakai React + TypeScript.",
      roleSkills: {
        create: [
          { skillId: await skillId("React") },
          { skillId: await skillId("JavaScript") },
          { skillId: await skillId("TypeScript") },
        ],
      },
    },
  });
  const beRole = await prisma.projectRole.create({
    data: {
      projectId: project.id,
      roleName: "Backend Developer",
      capacity: 1,
      requirements: "Merancang REST API absensi & penggajian dan skema database memakai Node.js, Express, PostgreSQL.",
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

  // 6) Senior application (ACCEPTED) — reflects that the mentor is already hired.
  await prisma.seniorApplication.create({
    data: {
      projectId: project.id,
      seniorId,
      message: "Saya siap membimbing proyek absensi ini; berpengalaman React & Node.js.",
      status: "ACCEPTED",
    },
  });

  // 7) PENDING beginner applications to the FRONTEND role (varied match).
  await prisma.projectApplication.createMany({
    data: [
      {
        projectId: project.id,
        projectRoleId: feRole.id,
        beginnerId: bimaId,
        motivation:
          "Saya terbiasa membangun UI dengan React dan JavaScript. Ingin membuat halaman absensi yang cepat dan rapi.",
        status: "PENDING",
      },
      {
        projectId: project.id,
        projectRoleId: feRole.id,
        beginnerId: citraId,
        motivation:
          "Saya kuat di desain UI (Figma) dan mulai belajar frontend. Ingin memastikan tampilan absensi ramah pengguna.",
        status: "PENDING",
      },
      {
        projectId: project.id,
        projectRoleId: feRole.id,
        beginnerId: doniId,
        motivation:
          "Saya lebih sering di backend (Node.js), tapi tertarik mencoba peran frontend pada proyek ini.",
        status: "PENDING",
      },
    ],
  });
  console.log("  added 3 PENDING applicants to Frontend role (Bima/Citra/Doni)");

  printLogin(project.id);
}

function printLogin(projectId: string): void {
  console.log("\nDone. Login (semua): password " + PASSWORD);
  console.log("  UMKM        : bengkelmotorjaya@edunomad.com");
  console.log("  Senior      : rangga.saputra@edunomad.com   (mentor lead — demo AI Ranking)");
  console.log("  Junior LIVE : fajar.nugroho@edunomad.com    (BELUM apply — demo AI Portfolio Recommendation)");
  console.log("  Pelamar     : bima.sakti@ / citra.kirana@ / doni.pratama@edunomad.com (PENDING)");
  console.log(`  Project     : ${projectId} (RECRUITING)`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
