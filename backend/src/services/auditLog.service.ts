import { auditLogRepository } from "../repositories/auditLog.repository";
import type { Prisma } from "../generated/prisma/client";
import type { AuditActionType } from "../constants/auditActions";

interface AuditLogQuery {
  userId?: string;
  action?: string;
  entityType?: string;
  page: number;
  limit: number;
}

export const auditLogService = {
  // actorId = the user who performed the action. Optional tx to write inside the
  // action's own transaction.
  createAuditLog(
    actorId: string,
    action: AuditActionType,
    entityType: string,
    entityId: string,
    metadata?: Prisma.InputJsonValue,
    tx?: Prisma.TransactionClient
  ) {
    return auditLogRepository.create(
      { userId: actorId, action, entityType, entityId, ...(metadata ? { metadata } : {}) },
      tx
    );
  },

  async getAuditLogs(query: AuditLogQuery) {
    const where: Prisma.AuditLogWhereInput = {};
    if (query.userId) where.userId = query.userId;
    if (query.action) where.action = query.action;
    if (query.entityType) where.entityType = query.entityType;

    const { data, total } = await auditLogRepository.findManyPaginated(
      where,
      query.page,
      query.limit
    );
    return { data, total, page: query.page, limit: query.limit };
  },
};
