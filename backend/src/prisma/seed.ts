import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// Prisma 7 requires an explicit driver adapter for PostgreSQL (no more
// built-in query engine). Using DIRECT_URL here (not DATABASE_URL) because
// the Supavisor pooler connection currently fails with a "tenant/user not
// found" error that hasn't been resolved yet — see decisions.md /
// MEMORY-CLAUDE.md open items. Revisit before Phase 0.3 runtime code needs
// the pooled connection.
const adapter = new PrismaPg({ connectionString: process.env["DIRECT_URL"] });
const prisma = new PrismaClient({ adapter });

const SUPABASE_URL = process.env["SUPABASE_URL"];
const SUPABASE_SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in backend/.env to seed the admin user",
  );
}

// Service role client: bypasses RLS and can create real Supabase Auth users,
// needed because users.id must equal auth.users.id (no separate auth_user_id
// column, per docs/03-Database Schema.md).
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = process.env["SEED_ADMIN_EMAIL"] ?? "admin@edunomad.com";
const ADMIN_PASSWORD = process.env["SEED_ADMIN_PASSWORD"] ?? "EduNomadAdmin123!";
const ADMIN_NAME = "EduNomad Admin";

async function seedAdminUser(): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (existing) {
    console.log(`Admin user already seeded: ${ADMIN_EMAIL}`);
    return;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(`Failed to create Supabase Auth admin user: ${error?.message}`);
  }

  await prisma.user.create({
    data: {
      id: data.user.id,
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: "ADMIN",
      status: "VERIFIED",
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`Seeded admin user: ${ADMIN_EMAIL} (password: ${ADMIN_PASSWORD})`);
}

async function seedProjectCategories(): Promise<void> {
  const categories = [
    { name: "Web Development", slug: "web-development" },
    { name: "Mobile Development", slug: "mobile-development" },
    { name: "UI/UX Design", slug: "ui-ux-design" },
    { name: "Data & Analytics", slug: "data-analytics" },
    { name: "Digital Marketing", slug: "digital-marketing" },
  ];

  for (const category of categories) {
    await prisma.projectCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log(`Seeded ${categories.length} project categories`);
}

async function seedMasterSkills(): Promise<void> {
  const skills = [
    { name: "JavaScript", slug: "javascript", category: "Programming Language" },
    { name: "TypeScript", slug: "typescript", category: "Programming Language" },
    { name: "React", slug: "react", category: "Frontend" },
    { name: "Next.js", slug: "nextjs", category: "Frontend" },
    { name: "Node.js", slug: "nodejs", category: "Backend" },
    { name: "Express.js", slug: "expressjs", category: "Backend" },
    { name: "PostgreSQL", slug: "postgresql", category: "Database" },
    { name: "UI Design", slug: "ui-design", category: "Design" },
    { name: "UX Research", slug: "ux-research", category: "Design" },
    { name: "Figma", slug: "figma", category: "Design" },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: {
        ...skill,
        status: "APPROVED",
        isSystem: true,
      },
    });
  }

  console.log(`Seeded ${skills.length} master skills`);
}

async function main(): Promise<void> {
  await seedAdminUser();
  await seedProjectCategories();
  await seedMasterSkills();
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
