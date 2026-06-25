import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";
import { DeliverableStatus } from "../constants/deliverableStatus";
import { AuditAction, EntityType } from "../constants/auditActions";

const detailInclude = {
  evidences: true,
  submitter: { select: { id: true, name: true, email: true } },
  project: { select: { id: true, title: true, seniorId: true, umkmId: true, status: true } },
} satisfies Prisma.DeliverableInclude;

type EvidenceInput = { type: string; url?: string; file_path?: string };

export const deliverableRepository = {
  listByProject(projectId: string) {
    return prisma.deliverable.findMany({
      where: { projectId },
      include: {
        evidences: true,
        submitter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.deliverable.findUnique({ where: { id }, include: detailInclude });
  },

  create(args: { projectId: string; submittedBy: string; title: string; description?: string }) {
    return prisma.deliverable.create({
      data: {
        projectId: args.projectId,
        submittedBy: args.submittedBy,
        title: args.title,
        description: args.description,
        status: DeliverableStatus.DRAFT,
      },
      include: detailInclude,
    });
  },

  update(id: string, data: { title?: string; description?: string }) {
    return prisma.deliverable.update({ where: { id }, data, include: detailInclude });
  },

  // Submit/resubmit: replace the evidence set and move to SUBMITTED in one txn.
  submitWithEvidences(id: string, evidences: EvidenceInput[]) {
    return prisma.$transaction(async (tx) => {
      await tx.deliverableEvidence.deleteMany({ where: { deliverableId: id } });
      await tx.deliverableEvidence.createMany({
        data: evidences.map((e) => ({
          deliverableId: id,
          type: e.type,
          url: e.url ?? null,
          filePath: e.file_path ?? null,
        })),
      });
      return tx.deliverable.update({
        where: { id },
        data: { status: DeliverableStatus.SUBMITTED },
        include: detailInclude,
      });
    });
  },

  approve(id: string, seniorId: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.deliverable.update({
        where: { id },
        data: { status: DeliverableStatus.APPROVED },
        include: detailInclude,
      });
      await tx.auditLog.create({
        data: {
          userId: seniorId,
          action: AuditAction.DELIVERABLE_APPROVED,
          entityType: EntityType.DELIVERABLE,
          entityId: id,
        },
      });
      return updated;
    });
  },

  // Senior requests a revision; the feedback lives in the audit metadata (no
  // feedback column in docs/03), retrievable via latestRevisionFeedback().
  requestRevision(id: string, seniorId: string, feedback: string) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.deliverable.update({
        where: { id },
        data: { status: DeliverableStatus.REVISION_REQUESTED },
        include: detailInclude,
      });
      await tx.auditLog.create({
        data: {
          userId: seniorId,
          action: AuditAction.DELIVERABLE_REVISION_REQUESTED,
          entityType: EntityType.DELIVERABLE,
          entityId: id,
          metadata: { feedback },
        },
      });
      return updated;
    });
  },

  // Latest revision feedback per deliverable id (for display to the beginner).
  async latestRevisionFeedback(deliverableIds: string[]) {
    if (deliverableIds.length === 0) return new Map<string, string>();
    const rows = await prisma.auditLog.findMany({
      where: {
        action: AuditAction.DELIVERABLE_REVISION_REQUESTED,
        entityType: EntityType.DELIVERABLE,
        entityId: { in: deliverableIds },
      },
      orderBy: { createdAt: "desc" },
      select: { entityId: true, metadata: true },
    });
    const map = new Map<string, string>();
    for (const r of rows) {
      if (r.entityId && !map.has(r.entityId)) {
        const fb = (r.metadata as { feedback?: string } | null)?.feedback;
        if (fb) map.set(r.entityId, fb);
      }
    }
    return map;
  },
};
