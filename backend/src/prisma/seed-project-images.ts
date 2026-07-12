import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// -----------------------------------------------------------------------------
// PROJECT IMAGES — give every project a real, on-theme cover photo (served from
// frontend/public/projects/<theme>.jpg) instead of the gradient placeholder, so
// the app feels real. Theme is picked from the owning UMKM's name (a laundry
// business → laundry.jpg, a coffee shop → kopi.jpg, …).
// Idempotent: only fills projects whose image_url is NULL. Pass FORCE=1 to
// overwrite every matched project.
// Run: npx tsx src/prisma/seed-project-images.ts   (or FORCE=1 npx tsx …)
// -----------------------------------------------------------------------------

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"] ?? process.env["DIRECT_URL"],
});
const prisma = new PrismaClient({ adapter });

// keyword found in the UMKM name → image theme file in /public/projects.
const THEME_BY_KEYWORD: [RegExp, string][] = [
  [/kopi/i, "kopi"],
  [/laundry/i, "laundry"],
  [/roti|bakery|kue/i, "roti"],
  [/salon/i, "salon"],
  [/klinik|sehat/i, "klinik"],
  [/bunga|melati|florist/i, "bunga"],
  [/distro|kaos|fashion/i, "distro"],
  [/bangunan|material/i, "bangunan"],
  [/warung|makan|resto|kedai makan/i, "warung"],
  [/bengkel|motor/i, "bengkel"],
  [/bimbel|cerdas|belajar|kursus/i, "bimbel"],
];

function themeFor(umkmName: string): string | null {
  for (const [re, theme] of THEME_BY_KEYWORD) if (re.test(umkmName)) return theme;
  return null;
}

async function main() {
  const force = process.env["FORCE"] === "1";
  const projects = await prisma.project.findMany({
    select: { id: true, title: true, imageUrl: true, umkm: { select: { name: true } } },
  });

  let set = 0;
  let skipped = 0;
  for (const p of projects) {
    if (p.imageUrl && !force) { skipped++; continue; }
    const theme = themeFor(p.umkm?.name ?? p.title);
    if (!theme) { console.warn(`  ? no theme for "${p.title}" (umkm ${p.umkm?.name})`); continue; }
    const url = `/projects/${theme}.jpg`;
    await prisma.project.update({ where: { id: p.id }, data: { imageUrl: url } });
    console.log(`  ${p.umkm?.name} → ${url}  (${p.title})`);
    set++;
  }
  console.log(`\nDone. ${set} project images set, ${skipped} left untouched (already had one).`);
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
