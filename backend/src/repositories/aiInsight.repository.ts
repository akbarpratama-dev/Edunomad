import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";
import type { AiInsightKind } from "../constants/aiInsightKind";

// Data access only for the ai_insights cache table (D-AI-1). The DB unique index
// on (kind, subject_user_id, project_id) is NULLS NOT DISTINCT so a null
// project_id (SUMMARY) still collapses to one row per user. Prisma's compound
// *where* input doesn't accept null for the nullable projectId, so reads use
// findFirst and writes emulate upsert via find-then-update/create.
export const aiInsightRepository = {
  // Returns the cached row only when its stored input hash still matches — else
  // the caller recomputes (stale invalidation).
  async findFresh(
    kind: AiInsightKind,
    subjectUserId: string,
    projectId: string | null,
    inputHash: string
  ) {
    const row = await prisma.aiInsight.findFirst({
      where: { kind, subjectUserId, projectId },
    });
    return row && row.inputHash === inputHash ? row : null;
  },

  async upsert(args: {
    kind: AiInsightKind;
    subjectUserId: string;
    projectId: string | null;
    inputHash: string;
    resultJson: Prisma.InputJsonValue;
    model: string;
  }) {
    const existing = await prisma.aiInsight.findFirst({
      where: { kind: args.kind, subjectUserId: args.subjectUserId, projectId: args.projectId },
      select: { id: true },
    });
    if (existing) {
      return prisma.aiInsight.update({
        where: { id: existing.id },
        data: { inputHash: args.inputHash, resultJson: args.resultJson, model: args.model },
      });
    }
    return prisma.aiInsight.create({
      data: {
        kind: args.kind,
        subjectUserId: args.subjectUserId,
        projectId: args.projectId,
        inputHash: args.inputHash,
        resultJson: args.resultJson,
        model: args.model,
      },
    });
  },
};
