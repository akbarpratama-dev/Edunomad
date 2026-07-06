import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";

const detailInclude = {
  project: {
    select: {
      id: true,
      title: true,
      seniorId: true,
      umkmId: true,
      status: true,
      umkm: { select: { id: true, name: true } },
    },
  },
  beginner: { select: { id: true, name: true, email: true } },
  senior: { select: { id: true, name: true, email: true } },
  versions: { orderBy: { version: "asc" } },
} satisfies Prisma.ArtifactInclude;

export const artifactRepository = {
  // One artifact per (project, beginner) — regenerate adds a version instead.
  findByProjectAndBeginner(projectId: string, beginnerId: string) {
    return prisma.artifact.findFirst({ where: { projectId, beginnerId } });
  },

  findById(id: string) {
    return prisma.artifact.findUnique({ where: { id }, include: detailInclude });
  },

  findByCode(code: string) {
    return prisma.artifact.findUnique({ where: { artifactCode: code }, include: detailInclude });
  },

  listByBeginner(beginnerId: string) {
    return prisma.artifact.findMany({
      where: { beginnerId },
      include: detailInclude,
      orderBy: { issuedAt: "desc" },
    });
  },

  // Rich payload for the PUBLIC portfolio (GET /portfolio/:userId) — an artifact
  // row only exists once a certificate is issued, so every row here is a
  // verified showcase item. Pulls the extra project fields (description, image,
  // dates, category) + the active/completed team the profile card needs, in one
  // query. Technologies + the beginner's own role are composed in the service.
  listPortfolioArtifacts(beginnerId: string) {
    return prisma.artifact.findMany({
      where: { beginnerId },
      orderBy: { issuedAt: "desc" },
      select: {
        id: true,
        artifactCode: true,
        verificationUrl: true,
        currentVersion: true,
        issuedAt: true,
        senior: { select: { id: true, name: true } },
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            status: true,
            startDate: true,
            deadline: true,
            completedAt: true,
            category: { select: { id: true, name: true } },
            umkm: { select: { id: true, name: true } },
            projectMembers: {
              where: { status: { in: ["ACTIVE", "COMPLETED"] } },
              select: {
                userId: true,
                user: { select: { id: true, name: true } },
                projectRole: { select: { roleName: true } },
              },
            },
          },
        },
      },
    });
  },

  // Admin monitoring — all artifacts.
  listAll() {
    return prisma.artifact.findMany({ include: detailInclude, orderBy: { issuedAt: "desc" } });
  },

  // All certificates for a project (senior "Sertifikat" tab / beginner board).
  listByProject(projectId: string) {
    return prisma.artifact.findMany({
      where: { projectId },
      include: detailInclude,
      orderBy: { issuedAt: "desc" },
    });
  },

  // Next sequential code for the year (EDN-2026-000001).
  async nextCode(year: number) {
    const prefix = `EDN-${year}-`;
    const last = await prisma.artifact.findFirst({
      where: { artifactCode: { startsWith: prefix } },
      orderBy: { artifactCode: "desc" },
      select: { artifactCode: true },
    });
    const lastSeq = last ? parseInt(last.artifactCode.slice(prefix.length), 10) || 0 : 0;
    return `${prefix}${String(lastSeq + 1).padStart(6, "0")}`;
  },

  create(args: {
    artifactCode: string;
    projectId: string;
    beginnerId: string;
    seniorId: string;
    verificationUrl: string;
    pdfPath: string;
    issuedAt: Date;
  }) {
    return prisma.artifact.create({
      data: {
        artifactCode: args.artifactCode,
        projectId: args.projectId,
        beginnerId: args.beginnerId,
        seniorId: args.seniorId,
        verificationUrl: args.verificationUrl,
        currentVersion: 1,
        issuedAt: args.issuedAt,
        versions: { create: { version: 1, pdfPath: args.pdfPath, generatedBy: args.seniorId } },
      },
      include: detailInclude,
    });
  },

  // Workflow 14 — regenerate keeps history, bumps currentVersion, adds a version row.
  addVersion(args: {
    artifactId: string;
    version: number;
    pdfPath: string;
    generatedBy: string;
    verificationUrl: string;
  }) {
    return prisma.artifact.update({
      where: { id: args.artifactId },
      data: {
        currentVersion: args.version,
        verificationUrl: args.verificationUrl,
        versions: { create: { version: args.version, pdfPath: args.pdfPath, generatedBy: args.generatedBy } },
      },
      include: detailInclude,
    });
  },
};
