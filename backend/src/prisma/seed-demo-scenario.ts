import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import {
  DEMO_SCENARIO_UMKM_EMAIL,
  DEMO_SCENARIO_SENIOR_EMAIL,
  DEMO_SCENARIO_JUNIOR_EMAIL,
  DEMO_SCENARIO_PROJECT_TITLE,
} from "../services/demo/demoDataset";

// -----------------------------------------------------------------------------
// DEMO SCENARIO seed — ONE flagship project + THREE dedicated demo accounts so a
// live demo can run the full lifecycle (awal → akhir) without picking between
// projects. Everyone is directed to this single project:
//
//   1. UMKM Demo owns the project (RECRUITING, NO mentor, NO members, NO apps).
//   2. Senior Demo applies as mentor  → UMKM Demo accepts (or demo auto-accept).
//   3. Junior Demo applies to the role → Senior Demo (lead) accepts.
//   4. Senior starts → ACTIVE → deliverables/contributions/reviews → request
//      completion → UMKM confirms → COMPLETED → artifact.
//
// Idempotent: re-running skips users/project that already exist. To fully reset
// for another run, delete the project (cascades apps/members) and re-run.
// Run: npx tsx src/prisma/seed-demo-scenario.ts
// -----------------------------------------------------------------------------

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
const PROJECT_TITLE = DEMO_SCENARIO_PROJECT_TITLE;

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

async function main() {
  console.log("Seeding DEMO SCENARIO (1 flagship project + 3 demo accounts)…");

  // --- 3 dedicated demo accounts ---
  const umkmId = await ensureUser({
    email: DEMO_SCENARIO_UMKM_EMAIL,
    name: "Kopi Nusantara (Demo)",
    role: "UMKM",
    headline: "Coffee shop kekinian — akun demo skenario EduNomad",
    bio: "Akun UMKM khusus demo. Membuka proyek unggulan untuk skenario end-to-end.",
  });
  await ensureUser({
    email: DEMO_SCENARIO_SENIOR_EMAIL,
    name: "Senior Demo",
    role: "SENIOR",
    headline: "Mentor Fullstack — akun demo skenario EduNomad",
    bio: "Akun Senior khusus demo. Melamar sebagai mentor pada proyek unggulan.",
  });
  await ensureUser({
    email: DEMO_SCENARIO_JUNIOR_EMAIL,
    name: "Junior Demo",
    role: "BEGINNER",
    headline: "Aspiring Frontend Developer — akun demo skenario EduNomad",
    bio: "Akun Beginner khusus demo. Melamar peran pada proyek unggulan.",
  });
  console.log("  Akun demo siap: umkm.demo / senior.demo / junior.demo @edunomad.com");

  // --- flagship project: RECRUITING, NO mentor, NO members, NO applications ---
  const existing = await prisma.project.findFirst({ where: { title: PROJECT_TITLE } });
  if (existing) {
    console.log(`  Proyek flagship sudah ada (${existing.id}, status ${existing.status}) — dilewati.`);
  } else {
    const cat = await prisma.projectCategory.findUnique({ where: { name: "Web Development" } });
    if (!cat) throw new Error('Category "Web Development" not found — run the base seed first.');
    const project = await prisma.project.create({
      data: {
        umkmId,
        seniorId: null, // NO mentor yet → Senior Demo applies as mentor
        categoryId: cat.id,
        title: PROJECT_TITLE,
        description:
          "Proyek demo unggulan Kopi Nusantara: membangun website pemesanan kopi online plus kasir sederhana. " +
          "Proyek ini sengaja dibuka tanpa mentor & tanpa anggota agar bisa dipakai untuk demo alur lengkap — " +
          "senior melamar sebagai mentor, lalu junior melamar sebagai anggota.",
        expectedDeliverables:
          "Website pemesanan (katalog menu, keranjang, checkout) + halaman kasir sederhana + API + dokumentasi.",
        startDate: new Date("2026-07-25"),
        deadline: new Date("2026-11-30"),
        status: "RECRUITING",
      },
    });
    // Single, unambiguous role so the junior demo has exactly one thing to apply to.
    await prisma.projectRole.create({
      data: {
        projectId: project.id,
        roleName: "Frontend Developer",
        capacity: 1,
        requirements:
          "Membangun antarmuka website pemesanan (katalog, keranjang, checkout) yang responsif. " +
          "Cocok untuk beginner yang ingin pengalaman proyek nyata dengan bimbingan mentor.",
        roleSkills: {
          create: await Promise.all(
            ["React", "JavaScript", "TypeScript"].map(async (n) => ({ skillId: await skillId(n) })),
          ),
        },
      },
    });
    console.log(`  Proyek flagship dibuat: "${PROJECT_TITLE}" (${project.id}) — RECRUITING, tanpa mentor/anggota.`);
  }

  console.log("\nDone. Password semua akun demo: " + PASSWORD);
  console.log("  UMKM  : umkm.demo@edunomad.com   (pemilik proyek, terima mentor + konfirmasi selesai)");
  console.log("  SENIOR: senior.demo@edunomad.com (lamar sbg mentor → terima junior → jalankan proyek)");
  console.log("  JUNIOR: junior.demo@edunomad.com (lamar peran Frontend Developer)");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
