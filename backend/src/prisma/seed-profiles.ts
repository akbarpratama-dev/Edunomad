import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import {
  DEMO_SCENARIO_UMKM_EMAIL,
  DEMO_SCENARIO_SENIOR_EMAIL,
  DEMO_SCENARIO_JUNIOR_EMAIL,
} from "../services/demo/demoDataset";

// -----------------------------------------------------------------------------
// PROFILE enrichment — make every account look realistic for the expo. Fills:
//   • the 3 dedicated demo accounts (umkm/senior/junior.demo) with hand-crafted
//     headline/bio/phone/linkedin/photo + skills + experiences + portfolio, and
//   • every other SENIOR / BEGINNER with skills (if missing), 2 experiences and
//     portfolio links, plus phone/linkedin where empty — WITHOUT overwriting the
//     good headlines/bios the seeds already wrote.
// Idempotent: experiences/portfolio are only added when the user has none;
// skills are added only for names not already present; existing non-demo
// headline/bio are never clobbered.
// Run: npx tsx src/prisma/seed-profiles.ts
// -----------------------------------------------------------------------------

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"] ?? process.env["DIRECT_URL"],
});
const prisma = new PrismaClient({ adapter });

type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type LinkType = "GITHUB" | "FIGMA" | "BEHANCE" | "LINKEDIN" | "OTHER";
interface ExpSpec { title: string; organization: string; description: string; start: string; end: string | null }
interface LinkSpec { title: string; url: string; type: LinkType }
interface ProfilePatch { headline?: string; bio?: string; phone?: string; linkedinUrl?: string; photo?: string }

const skillIdCache = new Map<string, string>();
async function skillId(name: string): Promise<string | null> {
  if (skillIdCache.has(name)) return skillIdCache.get(name)!;
  const s = await prisma.skill.findUnique({ where: { name } });
  if (s) skillIdCache.set(name, s.id);
  return s?.id ?? null;
}

function slugify(name: string): string {
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function avatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=201f31&color=d8f277&size=256&bold=true`;
}

// --- write helpers (idempotent) ---------------------------------------------

async function setProfile(userId: string, patch: ProfilePatch, overwrite: boolean) {
  const cur = await prisma.userProfile.findUnique({ where: { userId } });
  const empty = (v: string | null | undefined) => !v || v.trim() === "";
  const pick = (next: string | undefined, prev: string | null | undefined) =>
    next !== undefined && (overwrite || empty(prev)) ? next : undefined;
  const data = {
    headline: pick(patch.headline, cur?.headline),
    bio: pick(patch.bio, cur?.bio),
    phone: pick(patch.phone, cur?.phone),
    linkedinUrl: pick(patch.linkedinUrl, cur?.linkedinUrl),
    photo: pick(patch.photo, cur?.photo),
  };
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  if (Object.keys(clean).length === 0) return;
  await prisma.userProfile.upsert({
    where: { userId },
    create: { userId, ...clean },
    update: clean,
  });
}

async function ensureSkills(userId: string, list: { name: string; level: Level }[]) {
  const existing = new Set(
    (await prisma.userSkill.findMany({ where: { userId }, select: { skillId: true } })).map((r) => r.skillId)
  );
  for (const { name, level } of list) {
    const sid = await skillId(name);
    if (!sid || existing.has(sid)) continue;
    await prisma.userSkill.create({ data: { userId, skillId: sid, level } });
    existing.add(sid);
  }
}

async function ensureExperiences(userId: string, exps: ExpSpec[]) {
  if ((await prisma.experience.count({ where: { userId } })) > 0) return;
  for (const e of exps) {
    await prisma.experience.create({
      data: {
        userId,
        title: e.title,
        organization: e.organization,
        description: e.description,
        startDate: new Date(e.start),
        endDate: e.end ? new Date(e.end) : null,
      },
    });
  }
}

async function ensurePortfolio(userId: string, links: LinkSpec[]) {
  if ((await prisma.portfolioLink.count({ where: { userId } })) > 0) return;
  for (const l of links) {
    await prisma.portfolioLink.create({ data: { userId, title: l.title, url: l.url, type: l.type } });
  }
}

// --- curated data for the 3 demo accounts -----------------------------------

const DEMO: Record<string, {
  profile: ProfilePatch;
  skills?: { name: string; level: Level }[];
  experiences?: ExpSpec[];
  portfolio?: LinkSpec[];
}> = {
  [DEMO_SCENARIO_SENIOR_EMAIL]: {
    profile: {
      headline: "Fullstack Web Developer & Mentor · 6+ tahun pengalaman",
      bio: "Fullstack developer yang terbiasa membangun aplikasi web untuk UMKM dan startup — dari antarmuka sampai API dan basis data. Fokus di React, Node.js, dan kode yang mudah dirawat. Senang membimbing developer pemula lewat proyek nyata; sudah mementori lebih dari 20 junior.",
      phone: "+62 812-3456-7801",
      linkedinUrl: "https://www.linkedin.com/in/senior-demo-edunomad",
      photo: avatar("Senior Demo"),
    },
    skills: [
      { name: "React", level: "ADVANCED" },
      { name: "Next.js", level: "ADVANCED" },
      { name: "Node.js", level: "ADVANCED" },
      { name: "Express.js", level: "ADVANCED" },
      { name: "TypeScript", level: "ADVANCED" },
      { name: "PostgreSQL", level: "INTERMEDIATE" },
    ],
    experiences: [
      {
        title: "Senior Fullstack Developer",
        organization: "PT Nusantara Digital",
        description: "Memimpin tim kecil membangun aplikasi web pemesanan & dashboard untuk klien UMKM dan retail. Menyiapkan arsitektur, review kode, dan mentoring engineer junior.",
        start: "2021-01-01",
        end: null,
      },
      {
        title: "Web Developer (Freelance)",
        organization: "Mandiri / Proyek Lepas",
        description: "Mengerjakan berbagai proyek website dan aplikasi untuk usaha lokal: company profile, katalog produk, hingga sistem kasir sederhana.",
        start: "2018-06-01",
        end: "2020-12-31",
      },
    ],
    portfolio: [
      { title: "GitHub", url: "https://github.com/senior-demo", type: "GITHUB" },
      { title: "LinkedIn", url: "https://www.linkedin.com/in/senior-demo-edunomad", type: "LINKEDIN" },
      { title: "Website Portfolio", url: "https://senior-demo.vercel.app", type: "OTHER" },
    ],
  },

  [DEMO_SCENARIO_JUNIOR_EMAIL]: {
    profile: {
      headline: "Aspiring Frontend Developer · Mahasiswa Informatika",
      bio: "Mahasiswa Teknik Informatika semester 5 yang sedang serius mendalami frontend development. Terbiasa membangun antarmuka dengan React & Tailwind CSS lewat proyek kuliah dan latihan mandiri. Sedang mencari pengalaman proyek nyata untuk mengasah skill dan belajar langsung dari mentor.",
      phone: "+62 813-9876-5402",
      linkedinUrl: "https://www.linkedin.com/in/junior-demo-edunomad",
      photo: avatar("Junior Demo"),
    },
    skills: [
      { name: "React", level: "INTERMEDIATE" },
      { name: "JavaScript", level: "INTERMEDIATE" },
      { name: "TypeScript", level: "BEGINNER" },
      { name: "Figma", level: "BEGINNER" },
      { name: "UI Design", level: "BEGINNER" },
    ],
    experiences: [
      {
        title: "Frontend Developer — Proyek Kuliah",
        organization: "Universitas Teknologi Nusantara",
        description: "Membangun aplikasi web tugas akhir mata kuliah Pemrograman Web menggunakan React, React Router, dan Tailwind CSS.",
        start: "2024-09-01",
        end: "2025-01-31",
      },
      {
        title: "Peserta Bootcamp Front-End",
        organization: "Dicoding Indonesia",
        description: "Menyelesaikan learning path Front-End Web Developer dan membangun beberapa mini project responsif.",
        start: "2024-02-01",
        end: "2024-06-30",
      },
    ],
    portfolio: [
      { title: "GitHub", url: "https://github.com/junior-demo", type: "GITHUB" },
      { title: "Portfolio", url: "https://junior-demo.vercel.app", type: "OTHER" },
    ],
  },

  [DEMO_SCENARIO_UMKM_EMAIL]: {
    profile: {
      headline: "Kedai Kopi Specialty & Roastery — Bandung",
      bio: "Kopi Nusantara adalah kedai kopi specialty yang menyajikan biji kopi pilihan dari berbagai daerah di Indonesia. Kami sedang melakukan transformasi digital — membangun website pemesanan online dan sistem kasir agar pelanggan lebih mudah memesan dan operasional lebih efisien. Kami membuka kolaborasi dengan mentor dan talenta muda untuk mewujudkannya.",
      phone: "+62 811-2233-4455",
      linkedinUrl: "https://www.linkedin.com/company/kopi-nusantara-demo",
      photo: avatar("Kopi Nusantara"),
    },
    portfolio: [
      { title: "Instagram", url: "https://instagram.com/kopinusantara.demo", type: "OTHER" },
    ],
  },
};

// --- generic pools for the remaining SENIOR / BEGINNER accounts --------------

const SENIOR_EXP: ExpSpec[] = [
  { title: "Senior Frontend Engineer", organization: "PT Solusi Digital Nusantara", description: "Memimpin pengembangan antarmuka aplikasi web produk dan internal dengan React & Next.js, serta mementori engineer junior.", start: "2021-03-01", end: null },
  { title: "Fullstack Developer", organization: "Startup Teknologi Lokal", description: "Membangun fitur end-to-end (frontend + REST API) dan integrasi layanan pihak ketiga.", start: "2019-01-01", end: "2021-02-28" },
  { title: "Backend Engineer", organization: "Agensi Pengembangan Software", description: "Mengembangkan REST API Node.js/Express dengan PostgreSQL untuk berbagai proyek klien.", start: "2017-06-01", end: "2018-12-31" },
];

const BEGINNER_EXP: ExpSpec[] = [
  { title: "Frontend Developer — Proyek Kuliah", organization: "Program Studi Informatika", description: "Membangun aplikasi web tugas mata kuliah menggunakan React & Tailwind CSS.", start: "2024-09-01", end: "2025-01-31" },
  { title: "Peserta Bootcamp Web Development", organization: "Dicoding Indonesia", description: "Menyelesaikan kelas fundamental frontend dan membangun beberapa mini project.", start: "2024-02-01", end: "2024-06-30" },
  { title: "Anggota UKM Riset Teknologi", organization: "Kampus", description: "Berkolaborasi membuat prototipe aplikasi untuk lomba internal dan kegiatan komunitas.", start: "2023-09-01", end: "2024-05-31" },
];

const SENIOR_DEFAULT_SKILLS: { name: string; level: Level }[] = [
  { name: "React", level: "ADVANCED" },
  { name: "Node.js", level: "ADVANCED" },
  { name: "TypeScript", level: "INTERMEDIATE" },
  { name: "PostgreSQL", level: "INTERMEDIATE" },
];
const BEGINNER_DEFAULT_SKILLS: { name: string; level: Level }[] = [
  { name: "React", level: "INTERMEDIATE" },
  { name: "JavaScript", level: "INTERMEDIATE" },
  { name: "Figma", level: "BEGINNER" },
];

// --- main -------------------------------------------------------------------

async function main() {
  console.log("Enriching profiles (skills / experiences / portfolio)…");

  const users = await prisma.user.findMany({
    where: { role: { in: ["SENIOR", "BEGINNER", "UMKM"] } },
    select: { id: true, email: true, name: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  let demoDone = 0;
  let genericDone = 0;

  // 1) Curated demo accounts.
  for (const u of users) {
    const spec = DEMO[u.email];
    if (!spec) continue;
    await setProfile(u.id, spec.profile, true);
    if (spec.skills) await ensureSkills(u.id, spec.skills);
    if (spec.experiences) await ensureExperiences(u.id, spec.experiences);
    if (spec.portfolio) await ensurePortfolio(u.id, spec.portfolio);
    demoDone++;
    console.log(`  ★ demo: ${u.email} enriched`);
  }

  // 2) Everyone else — templated, fill-if-empty. UMKM only get phone/linkedin.
  let si = 0; // senior index (for experience rotation)
  let bi = 0; // beginner index
  for (const u of users) {
    if (DEMO[u.email]) continue;
    const s = slugify(u.name || u.email.split("@")[0]);
    if (u.role === "UMKM") {
      await setProfile(
        u.id,
        {
          phone: `+62 811-${String(4000 + (si + bi + 7)).padStart(4, "0")}-${String(1000 + si + bi).padStart(4, "0")}`,
          linkedinUrl: `https://www.linkedin.com/company/${s}`,
        },
        false,
      );
      genericDone++;
      continue;
    }
    const isSenior = u.role === "SENIOR";
    await setProfile(
      u.id,
      {
        phone: `+62 8${isSenior ? "12" : "13"}-${String(3000 + (isSenior ? si : bi)).padStart(4, "0")}-${String(6000 + (isSenior ? si : bi)).padStart(4, "0")}`,
        linkedinUrl: `https://www.linkedin.com/in/${s}`,
      },
      false,
    );
    await ensureSkills(u.id, isSenior ? SENIOR_DEFAULT_SKILLS : BEGINNER_DEFAULT_SKILLS);
    if (isSenior) {
      await ensureExperiences(u.id, [SENIOR_EXP[0], SENIOR_EXP[1 + (si % 2)]]);
      await ensurePortfolio(u.id, [
        { title: "GitHub", url: `https://github.com/${s}`, type: "GITHUB" },
        { title: "LinkedIn", url: `https://www.linkedin.com/in/${s}`, type: "LINKEDIN" },
        { title: "Website Portfolio", url: `https://${s}.vercel.app`, type: "OTHER" },
      ]);
      si++;
    } else {
      await ensureExperiences(u.id, [BEGINNER_EXP[bi % 3], BEGINNER_EXP[(bi + 1) % 3]]);
      await ensurePortfolio(u.id, [
        { title: "GitHub", url: `https://github.com/${s}`, type: "GITHUB" },
        { title: "Portfolio", url: `https://${s}.vercel.app`, type: "OTHER" },
      ]);
      bi++;
    }
    genericDone++;
    console.log(`  · ${u.role.toLowerCase()}: ${u.email} enriched`);
  }

  console.log(`\nDone. ${demoDone} demo accounts + ${genericDone} other accounts enriched.`);
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
