import { prisma } from "../../config/database";
import { supabaseAdmin } from "../../config/supabase";
import {
  DEMO_PASSWORD,
  DEMO_UMKMS,
  DEMO_UMKM_EMAILS,
  DEMO_SENIOR_EMAILS,
  DEMO_JUNIOR_EMAILS,
  DEMO_PROJECTS,
  DEMO_MOTIVATIONS,
  DEMO_SCENARIO_UMKM_EMAIL,
  DEMO_SCENARIO_SENIOR_EMAIL,
  DEMO_SCENARIO_JUNIOR_EMAIL,
  type DemoProjectSpec,
} from "./demoDataset";

// Demo environment lifecycle: seed the baseline (idempotent) and reset it back
// to that baseline (wipe respondent-created state → re-seed). Scoped to the demo
// UMKM only, so other data is never touched. Certificates (Artifact), work,
// reviews, discussions and applications are removed automatically by the
// project's onDelete: Cascade, so a reset genuinely starts from zero.

// Idempotent user upsert against both Supabase Auth and the app users table.
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
    password: DEMO_PASSWORD,
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

const ensureUmkm = (email: string, name: string, headline: string): Promise<string> =>
  ensureUser({
    email,
    name,
    role: "UMKM",
    headline,
    bio: "UMKM yang membuka proyek kolaborasi untuk pengembangan digital usahanya.",
  });

// The dedicated scenario senior + junior. The scenario UMKM is created by the
// DEMO_UMKMS loop; these two are looked up (not created) elsewhere, so ensure
// them here so a fresh seed/reset never leaves the flagship scenario unusable.
async function ensureScenarioAccounts(): Promise<void> {
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
}

async function idsByEmail(emails: string[]): Promise<Record<string, string>> {
  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true },
  });
  return Object.fromEntries(users.map((u) => [u.email, u.id]));
}

const skillCache = new Map<string, string>();
async function skillId(name: string): Promise<string> {
  if (skillCache.has(name)) return skillCache.get(name)!;
  const s = await prisma.skill.findUnique({ where: { name } });
  if (!s) throw new Error(`Skill not found: ${name}`);
  skillCache.set(name, s.id);
  return s.id;
}

// Build the lookup context (umkm/senior/junior ids + category ids) that the
// project creator needs. Shared by the full seed and the scoped scenario reset.
async function buildSeedContext() {
  const umkmId = await idsByEmail(DEMO_UMKM_EMAILS);
  const seniorId = await idsByEmail(DEMO_SENIOR_EMAILS);
  const juniorByEmail = await idsByEmail(DEMO_JUNIOR_EMAILS);
  const juniorId = DEMO_JUNIOR_EMAILS.map((e) => juniorByEmail[e] ?? "");
  const cats: Record<string, string> = {};
  for (const c of ["Web Development", "Mobile Development", "UI/UX Design", "Data & Analytics", "Digital Marketing"]) {
    const row = await prisma.projectCategory.findUnique({ where: { name: c } });
    if (row) cats[c] = row.id;
  }
  return { umkmId, seniorId, juniorId, cats };
}

type SeedContext = Awaited<ReturnType<typeof buildSeedContext>>;

// On-theme cover image per demo UMKM (served from frontend/public/projects) so a
// reset re-applies the real photo instead of the gradient placeholder.
const DEMO_PROJECT_IMAGE: Record<string, string> = {
  "umkm.demo@edunomad.com": "/projects/kopi.jpg",
  "kedaikopisenja@edunomad.com": "/projects/kopi.jpg",
  "laundrykilatbersih@edunomad.com": "/projects/laundry.jpg",
  "tokobangunansejahtera@edunomad.com": "/projects/bangunan.jpg",
  "saloncantikayu@edunomad.com": "/projects/salon.jpg",
  "tokorotimanis@edunomad.com": "/projects/roti.jpg",
};

// Create ONE demo project from its spec (idempotent — skips if title exists).
// Returns true if it created the project, false if it was skipped.
async function createDemoProject(p: DemoProjectSpec, ctx: SeedContext): Promise<boolean> {
  if (await prisma.project.findFirst({ where: { title: p.title } })) return false;
  if (!ctx.cats[p.category] || !ctx.umkmId[p.umkm]) return false;
  const leadId = p.lead ? ctx.seniorId[p.lead] : undefined;
  const project = await prisma.project.create({
    data: {
      umkmId: ctx.umkmId[p.umkm],
      seniorId: leadId ?? null,
      categoryId: ctx.cats[p.category],
      title: p.title,
      description: p.description,
      expectedDeliverables: p.deliverables,
      imageUrl: DEMO_PROJECT_IMAGE[p.umkm] ?? null,
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
  if (leadId && p.applicants?.length) {
    const rows = p.applicants
      .map((n, i) => ({ beginnerId: ctx.juniorId[n - 1], motivation: DEMO_MOTIVATIONS[i % DEMO_MOTIVATIONS.length] }))
      .filter((r) => r.beginnerId)
      .map((r) => ({ projectId: project.id, projectRoleId: roleIds[0], status: "PENDING" as const, ...r }));
    if (rows.length) await prisma.projectApplication.createMany({ data: rows });
  }
  return true;
}

// Create the demo accounts + their RECRUITING projects (idempotent — skips by title).
export async function seedDemo(): Promise<{ umkm: number; projects: number }> {
  for (const u of DEMO_UMKMS) await ensureUmkm(u.email, u.name, u.headline);
  await ensureScenarioAccounts();

  const ctx = await buildSeedContext();
  let made = 0;
  for (const p of DEMO_PROJECTS) if (await createDemoProject(p, ctx)) made++;
  return { umkm: DEMO_UMKMS.length, projects: made };
}

// Wipe everything a respondent could have changed, then rebuild the baseline.
export async function resetDemo(): Promise<{
  projectsDeleted: number;
  notificationsDeleted: number;
  projectsSeeded: number;
}> {
  const umkmIds = Object.values(await idsByEmail(DEMO_UMKM_EMAILS));

  // Everyone whose per-user state (notifications) should be cleared: the demo
  // UMKM plus the seniors/juniors that participate in the demo projects.
  const participantIds = Object.values(
    await idsByEmail([...DEMO_UMKM_EMAILS, ...DEMO_SENIOR_EMAILS, ...DEMO_JUNIOR_EMAILS])
  );

  // Deleting the projects cascades to roles, applications, members, deliverables,
  // contributions, reviews, discussions/messages, artifacts (certificates) and
  // ai_insights tied to those projects.
  const del = await prisma.project.deleteMany({ where: { umkmId: { in: umkmIds } } });

  // Notifications and profile-scoped AI summaries aren't project-cascaded.
  const notif = await prisma.notification.deleteMany({ where: { userId: { in: participantIds } } });
  await prisma.aiInsight.deleteMany({ where: { subjectUserId: { in: participantIds } } });

  skillCache.clear();
  const seeded = await seedDemo();

  return {
    projectsDeleted: del.count,
    notificationsDeleted: notif.count,
    projectsSeeded: seeded.projects,
  };
}

// Scoped reset for the flagship SCENARIO only — restores the single [DEMO] Kopi
// Nusantara project to its RECRUITING / no-mentor / no-members baseline without
// touching the other demo (showcase) projects. Use this between demo runs.
export async function resetDemoScenario(): Promise<{
  projectsDeleted: number;
  notificationsDeleted: number;
  projectsSeeded: number;
}> {
  await ensureScenarioAccounts();

  const scenarioIds = Object.values(
    await idsByEmail([
      DEMO_SCENARIO_UMKM_EMAIL,
      DEMO_SCENARIO_SENIOR_EMAIL,
      DEMO_SCENARIO_JUNIOR_EMAIL,
    ])
  );
  const umkmId = (await idsByEmail([DEMO_SCENARIO_UMKM_EMAIL]))[DEMO_SCENARIO_UMKM_EMAIL];

  // Delete only the scenario UMKM's projects (cascades roles/apps/members/
  // deliverables/reviews/discussions/artifacts/ai_insights).
  const del = umkmId
    ? await prisma.project.deleteMany({ where: { umkmId } })
    : { count: 0 };

  // Clear the 3 participants' notifications + profile AI summaries.
  const notif = await prisma.notification.deleteMany({ where: { userId: { in: scenarioIds } } });
  await prisma.aiInsight.deleteMany({ where: { subjectUserId: { in: scenarioIds } } });

  // Re-seed just the flagship project.
  skillCache.clear();
  const ctx = await buildSeedContext();
  let seeded = 0;
  for (const p of DEMO_PROJECTS) {
    if (p.umkm !== DEMO_SCENARIO_UMKM_EMAIL) continue;
    if (await createDemoProject(p, ctx)) seeded++;
  }

  return { projectsDeleted: del.count, notificationsDeleted: notif.count, projectsSeeded: seeded };
}
