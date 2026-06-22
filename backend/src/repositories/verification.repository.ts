import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";
import { AuditAction, EntityType } from "../constants/auditActions";

export const verificationRepository = {
  // Latest verification request for a user (registration creates one as PENDING).
  findLatestByUser(userId: string) {
    return prisma.verificationRequest.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.verificationRequest.findUnique({ where: { id } });
  },

  create(data: Prisma.VerificationRequestUncheckedCreateInput) {
    return prisma.verificationRequest.create({ data });
  },

  update(id: string, data: Prisma.VerificationRequestUpdateInput) {
    return prisma.verificationRequest.update({ where: { id }, data });
  },

  // Admin queue, with the requesting user + profile for review.
  async findManyPaginated(where: Prisma.VerificationRequestWhereInput, page: number, limit: number) {
    const [data, total] = await Promise.all([
      prisma.verificationRequest.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, status: true, profile: true },
          },
        },
      }),
      prisma.verificationRequest.count({ where }),
    ]);
    return { data, total };
  },

  // Approve: request → APPROVED, user → VERIFIED, + audit log (one transaction).
  approve(requestId: string, userId: string, adminId: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.verificationRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED", reviewedBy: adminId },
      });
      await tx.user.update({ where: { id: userId }, data: { status: "VERIFIED" } });
      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: AuditAction.VERIFICATION_APPROVED,
          entityType: EntityType.VERIFICATION_REQUEST,
          entityId: requestId,
          metadata: { targetUserId: userId },
        },
      });
      return updated;
    });
  },

  // Reject: request → REJECTED (+reason note), user → REJECTED, + audit log.
  reject(requestId: string, userId: string, adminId: string, reason: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.verificationRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED", reviewedBy: adminId, notes: reason },
      });
      await tx.user.update({ where: { id: userId }, data: { status: "REJECTED" } });
      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: AuditAction.VERIFICATION_REJECTED,
          entityType: EntityType.VERIFICATION_REQUEST,
          entityId: requestId,
          metadata: { targetUserId: userId, reason },
        },
      });
      return updated;
    });
  },
};
