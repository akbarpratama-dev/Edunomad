import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// One-off cleanup — remove the leftover TEST accounts and their projects so the
// environment only contains realistic UMKM data. Scoped strictly to the
// @test.edunomad.com accounts; nothing else is touched. Deleting a test project
// cascades its applications/members/deliverables/reviews/certificates; deleting a
// test user cascades their notifications/skills/etc. Idempotent.
// Run: npx tsx src/prisma/cleanup-test-data.ts

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
  // Every test account uses the @test.edunomad.com domain.
  const testUsers = await prisma.user.findMany({
    where: { email: { endsWith: "@test.edunomad.com" } },
    select: { id: true, email: true, role: true },
  });
  console.log(`Found ${testUsers.length} test accounts:`, testUsers.map((u) => u.email).join(", "));

  // 1) Delete projects owned by test UMKM → cascades roles/applications/members/
  //    deliverables/contributions/reviews/discussions/artifacts/ai_insights.
  const testUmkmIds = testUsers.filter((u) => u.role === "UMKM").map((u) => u.id);
  const delProjects = await prisma.project.deleteMany({ where: { umkmId: { in: testUmkmIds } } });
  console.log(`Deleted ${delProjects.count} test projects (+ cascaded children).`);

  // 2) Delete the test user rows (cascades notifications, skills, experiences,
  //    remaining applications, etc.) and their Supabase Auth entries.
  for (const u of testUsers) {
    try {
      await prisma.user.delete({ where: { id: u.id } });
      if (supabaseAdmin) await supabaseAdmin.auth.admin.deleteUser(u.id).catch(() => {});
      console.log(`  removed ${u.email}`);
    } catch (e) {
      console.warn(`  ! could not remove ${u.email}:`, (e as Error).message);
    }
  }

  const remaining = await prisma.project.count();
  console.log(`\nDone. Projects remaining: ${remaining}. Test accounts removed.`);
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
