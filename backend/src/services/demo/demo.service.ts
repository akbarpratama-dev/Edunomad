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
} from "./demoDataset";

// Demo environment lifecycle: seed the baseline (idempotent) and reset it back
// to that baseline (wipe respondent-created state → re-seed). Scoped to the demo
// UMKM only, so other data is never touched. Certificates (Artifact), work,
// reviews, discussions and applications are removed automatically by the
// project's onDelete: Cascade, so a reset genuinely starts from zero.

async function ensureUmkm(email: string, name: string, headline: string): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing.id;
  let authId: string | undefined;
  const created = await supabaseAdmin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (created.data.user) authId = created.data.user.id;
  else {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    authId = data.users.find((u) => u.email === email)?.id;
  }
  if (!authId) throw new Error(`Auth user failed for ${email}: ${created.error?.message}`);
  await prisma.user.create({
    data: {
      id: authId,
      name,
      email,
      role: "UMKM",
      status: "VERIFIED",
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          headline,
          bio: "UMKM yang membuka proyek kolaborasi untuk pengembangan digital usahanya.",
        },
      },
    },
  });
  return authId;
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

// Create the demo UMKM + their RECRUITING projects (idempotent — skips by title).
export async function seedDemo(): Promise<{ umkm: number; projects: number }> {
  const umkmId: Record<string, string> = {};
  for (const u of DEMO_UMKMS) umkmId[u.email] = await ensureUmkm(u.email, u.name, u.headline);

  const seniorId = await idsByEmail(DEMO_SENIOR_EMAILS);
  const juniorByEmail = await idsByEmail(DEMO_JUNIOR_EMAILS);
  const juniorId = DEMO_JUNIOR_EMAILS.map((e) => juniorByEmail[e] ?? "");

  const cats: Record<string, string> = {};
  for (const c of ["Web Development", "Mobile Development", "UI/UX Design", "Data & Analytics", "Digital Marketing"]) {
    const row = await prisma.projectCategory.findUnique({ where: { name: c } });
    if (row) cats[c] = row.id;
  }

  let made = 0;
  for (const p of DEMO_PROJECTS) {
    if (await prisma.project.findFirst({ where: { title: p.title } })) continue;
    if (!cats[p.category]) continue;
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
    if (leadId && p.applicants?.length) {
      const rows = p.applicants
        .map((n, i) => ({ beginnerId: juniorId[n - 1], motivation: DEMO_MOTIVATIONS[i % DEMO_MOTIVATIONS.length] }))
        .filter((r) => r.beginnerId)
        .map((r) => ({ projectId: project.id, projectRoleId: roleIds[0], status: "PENDING" as const, ...r }));
      if (rows.length) await prisma.projectApplication.createMany({ data: rows });
    }
    made++;
  }
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
