import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// One-off cleanup — remove the seed-lowongan filler applicants (junior01..12
// @edunomad.com). These are bulk demo BEGINNER accounts with no artifacts,
// memberships, contributions, or reviews — only spam PENDING applications.
// Deleting each user cascades their applications/profile/skills (FK ON DELETE
// CASCADE), which also clears those PENDING rows so the mentor-led RECRUITING
// projects fall back to 0 applicants — a clean "UMKM buka lowongan belum
// di-apply" scenario for a live beginner-apply demo.
// Scoped strictly to the junior<NN>@edunomad.com pattern; the real-name
// beginners (akbar/dimas/fajar/bima/citra/doni) are left untouched.
// Idempotent. Re-seed with: npx tsx src/prisma/seed-lowongan.ts
// Run: npx tsx src/prisma/cleanup-juniors.ts

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"] ?? process.env["DIRECT_URL"],
});
const prisma = new PrismaClient({ adapter });

const SUPABASE_URL = process.env["SUPABASE_URL"];
const SUPABASE_SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"];
const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

async function main() {
  // junior01@edunomad.com .. junior12@edunomad.com (and any junjob<NN> siblings).
  const juniors = await prisma.user.findMany({
    where: { email: { startsWith: "junior" }, AND: { email: { endsWith: "@edunomad.com" } } },
    select: { id: true, email: true, role: true },
  });
  const targets = juniors.filter((u) => /^junior\d+@edunomad\.com$/.test(u.email) && u.role === "BEGINNER");
  console.log(`Found ${targets.length} filler junior accounts:`, targets.map((u) => u.email).join(", "));

  for (const u of targets) {
    try {
      await prisma.user.delete({ where: { id: u.id } });
      if (supabaseAdmin) await supabaseAdmin.auth.admin.deleteUser(u.id).catch(() => {});
      console.log(`  removed ${u.email}`);
    } catch (e) {
      console.warn(`  ! could not remove ${u.email}:`, (e as Error).message);
    }
  }

  const beginners = await prisma.user.count({ where: { role: "BEGINNER" } });
  console.log(`\nDone. BEGINNER accounts remaining: ${beginners}.`);
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
