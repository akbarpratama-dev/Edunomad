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
// RESET the flagship DEMO SCENARIO from the CLI — restores the single [DEMO] Kopi
// Nusantara project to its RECRUITING / no-mentor / no-members baseline so the
// next live demo starts clean. The 3 demo accounts (umkm/senior/junior.demo) are
// kept; only the scenario project + those accounts' notifications are wiped, then
// the flagship project is re-created fresh.
// This is the CLI twin of POST /demo/reset-scenario. Run between demo runs.
// Run: npx tsx src/prisma/reset-demo-scenario.ts
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

async function skillId(name: string): Promise<string> {
  const s = await prisma.skill.findUnique({ where: { name } });
  if (!s) throw new Error(`Skill not found: ${name}`);
  return s.id;
}

async function main() {
  console.log("Resetting DEMO SCENARIO (flagship project → baseline)…");

  // 1) Ensure the 3 demo accounts (never deleted — kept across resets).
  const umkmId = await ensureUser({
    email: DEMO_SCENARIO_UMKM_EMAIL,
    name: "Kopi Nusantara (Demo)",
    role: "UMKM",
    headline: "Coffee shop kekinian — akun demo skenario EduNomad",
    bio: "Akun UMKM khusus demo. Membuka proyek unggulan untuk skenario end-to-end.",
  });
  const seniorId = await ensureUser({
    email: DEMO_SCENARIO_SENIOR_EMAIL,
    name: "Senior Demo",
    role: "SENIOR",
    headline: "Mentor Fullstack — akun demo skenario EduNomad",
    bio: "Akun Senior khusus demo. Melamar sebagai mentor pada proyek unggulan.",
  });
  const juniorId = await ensureUser({
    email: DEMO_SCENARIO_JUNIOR_EMAIL,
    name: "Junior Demo",
    role: "BEGINNER",
    headline: "Aspiring Frontend Developer — akun demo skenario EduNomad",
    bio: "Akun Beginner khusus demo. Melamar peran pada proyek unggulan.",
  });

  // 2) Wipe the scenario UMKM's projects (cascades apps/members/deliverables/
  //    reviews/discussions/artifacts) + participant notifications & AI summaries.
  const del = await prisma.project.deleteMany({ where: { umkmId } });
  const participantIds = [umkmId, seniorId, juniorId];
  const notif = await prisma.notification.deleteMany({ where: { userId: { in: participantIds } } });
  await prisma.aiInsight.deleteMany({ where: { subjectUserId: { in: participantIds } } });

  // 3) Re-create the flagship project fresh: RECRUITING, no mentor, no members.
  const cat = await prisma.projectCategory.findUnique({ where: { name: "Web Development" } });
  if (!cat) throw new Error('Category "Web Development" not found — run the base seed first.');
  const project = await prisma.project.create({
    data: {
      umkmId,
      seniorId: null,
      categoryId: cat.id,
      title: DEMO_SCENARIO_PROJECT_TITLE,
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

  console.log(`  ${del.count} proyek lama dihapus, ${notif.count} notifikasi dibersihkan.`);
  console.log(`  Proyek flagship dibuat ulang: "${DEMO_SCENARIO_PROJECT_TITLE}" (${project.id}) — RECRUITING, tanpa mentor/anggota.`);
  console.log("\nDone. Skenario siap untuk demo berikutnya. Password akun demo: " + PASSWORD);
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
