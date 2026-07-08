import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// Reset the EXPO projects back to a clean "recruiting" state between test
// rounds: status → RECRUITING, remove any members that were accepted during
// testing, and set every application back to PENDING (so the applicant pool +
// AI ranking look fresh again). The mentor (senior lead) is kept.
// Run: npx tsx src/prisma/reset-expo.ts

const adapter = new PrismaPg({ connectionString: process.env["DIRECT_URL"] });
const prisma = new PrismaClient({ adapter });

const EXPO_TITLES = [
  "Website Pemesanan Makanan Online",
  "Desain Menu & Branding Digital",
  "Aplikasi Katalog Bunga",
  "Kampanye Konten Instagram & Katalog",
  "Sistem Reservasi Pasien Online",
  "Dashboard Analitik Kunjungan Pasien",
  "Toko Online (E-commerce) Distro",
  "Aplikasi Kasir Mobile Distro",
  "Platform Kuis Online Bimbel",
  "Redesain UI Website Bimbel",
];

async function main() {
  const projects = await prisma.project.findMany({
    where: { title: { in: EXPO_TITLES } },
    select: { id: true, title: true },
  });
  const ids = projects.map((p) => p.id);
  if (ids.length === 0) {
    console.log("No expo projects found. Run seed-expo.ts first.");
    return;
  }

  const delMembers = await prisma.projectMember.deleteMany({ where: { projectId: { in: ids } } });
  const resetApps = await prisma.projectApplication.updateMany({
    where: { projectId: { in: ids } },
    data: { status: "PENDING" },
  });
  const resetStatus = await prisma.project.updateMany({
    where: { id: { in: ids } },
    data: { status: "RECRUITING", completedAt: null },
  });

  console.log(`Reset ${ids.length} expo projects → RECRUITING`);
  console.log(`  removed members    : ${delMembers.count}`);
  console.log(`  applications→PENDING: ${resetApps.count}`);
  console.log(`  projects updated   : ${resetStatus.count}`);
  console.log("Applicant pool & AI ranking are fresh again.");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
