import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";

const listInclude = {
  reviewer: { select: { id: true, name: true, role: true } },
  reviewee: { select: { id: true, name: true, role: true } },
} satisfies Prisma.ReviewInclude;

const detailInclude = {
  reviewer: { select: { id: true, name: true, role: true } },
  reviewee: { select: { id: true, name: true, role: true } },
  project: { select: { id: true, title: true, seniorId: true, umkmId: true, status: true } },
} satisfies Prisma.ReviewInclude;

export const reviewRepository = {
  // One review per (project, reviewer, reviewee) — no duplicate reviews.
  findExisting(projectId: string, reviewerId: string, revieweeId: string) {
    return prisma.review.findFirst({ where: { projectId, reviewerId, revieweeId } });
  },

  findById(id: string) {
    return prisma.review.findUnique({ where: { id }, include: detailInclude });
  },

  create(args: {
    projectId: string;
    reviewerId: string;
    revieweeId: string;
    rating: number;
    comment?: string;
    type: string;
  }) {
    return prisma.review.create({ data: args, include: detailInclude });
  },

  update(id: string, data: { rating?: number; comment?: string }) {
    return prisma.review.update({
      where: { id },
      data: { ...data, isEdited: true, editedAt: new Date() },
      include: detailInclude,
    });
  },

  listByProject(projectId: string) {
    return prisma.review.findMany({
      where: { projectId },
      include: listInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  // Reviews received by a user (public to authenticated viewers).
  listByReviewee(userId: string) {
    return prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: { select: { id: true, name: true, role: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },
};
