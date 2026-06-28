import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";
import { DiscussionType } from "../constants/discussionType";
import { MemberStatus } from "../constants/applicationStatus";

const memberUserSelect = {
  user: { select: { id: true, name: true, email: true, role: true } },
} satisfies Prisma.DiscussionMemberInclude;

const messageSenderSelect = {
  sender: { select: { id: true, name: true, role: true } },
} satisfies Prisma.DiscussionMessageInclude;

export const discussionRepository = {
  // Is this user an ACTIVE project member (BR participant set, alongside senior/UMKM owner)?
  async isActiveProjectMember(projectId: string, userId: string) {
    const count = await prisma.projectMember.count({
      where: { projectId, userId, status: MemberStatus.ACTIVE },
    });
    return count > 0;
  },

  // GROUP discussions of a project that the user participates in.
  listGroupForUser(projectId: string, userId: string) {
    return prisma.discussion.findMany({
      where: {
        projectId,
        type: DiscussionType.GROUP,
        members: { some: { userId } },
      },
      include: {
        members: { include: memberUserSelect },
        _count: { select: { messages: true } },
      },
      // Pinned topics float to the top, then most-recent activity.
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    });
  },

  findById(id: string) {
    return prisma.discussion.findUnique({
      where: { id },
      include: { members: { select: { userId: true } } },
    });
  },

  isMember(discussionId: string, userId: string) {
    return prisma.discussionMember
      .count({ where: { discussionId, userId } })
      .then((c) => c > 0);
  },

  // Create a GROUP discussion (forum topic) + its members in one transaction
  // (Workflow 7). Phase 12: persists title + category.
  createGroup(
    projectId: string,
    memberUserIds: string[],
    meta: { title: string; category: string }
  ) {
    return prisma.$transaction(async (tx) => {
      const discussion = await tx.discussion.create({
        data: { projectId, type: DiscussionType.GROUP, title: meta.title, category: meta.category },
      });
      await tx.discussionMember.createMany({
        data: memberUserIds.map((userId) => ({ discussionId: discussion.id, userId })),
        skipDuplicates: true,
      });
      return tx.discussion.findUnique({
        where: { id: discussion.id },
        include: { members: { include: memberUserSelect }, _count: { select: { messages: true } } },
      });
    });
  },

  // Phase 12: pin/unpin a forum topic.
  updatePin(id: string, isPinned: boolean) {
    return prisma.discussion.update({
      where: { id },
      data: { isPinned },
      include: { members: { include: memberUserSelect }, _count: { select: { messages: true } } },
    });
  },

  // Project ids where the user participates (assigned senior, UMKM owner, or
  // ACTIVE member). Used to gate DM eligibility (docs/06: member ↔ senior).
  async userProjectIds(userId: string) {
    const [owned, asMember] = await Promise.all([
      prisma.project.findMany({
        where: { deletedAt: null, OR: [{ seniorId: userId }, { umkmId: userId }] },
        select: { id: true },
      }),
      prisma.projectMember.findMany({
        where: { userId, status: MemberStatus.ACTIVE },
        select: { projectId: true },
      }),
    ]);
    const ids = new Set<string>();
    for (const p of owned) ids.add(p.id);
    for (const m of asMember) ids.add(m.projectId);
    return ids;
  },

  // Existing 1:1 DIRECT discussion between exactly these two users, if any.
  async findDirectBetween(userA: string, userB: string) {
    const candidates = await prisma.discussion.findMany({
      where: {
        type: DiscussionType.DIRECT,
        AND: [{ members: { some: { userId: userA } } }, { members: { some: { userId: userB } } }],
      },
      include: { members: { select: { userId: true } } },
    });
    return candidates.find((d) => d.members.length === 2) ?? null;
  },

  createDirect(userA: string, userB: string) {
    return prisma.$transaction(async (tx) => {
      const discussion = await tx.discussion.create({
        data: { type: DiscussionType.DIRECT, projectId: null },
      });
      await tx.discussionMember.createMany({
        data: [
          { discussionId: discussion.id, userId: userA },
          { discussionId: discussion.id, userId: userB },
        ],
      });
      return tx.discussion.findUnique({
        where: { id: discussion.id },
        include: { members: { include: memberUserSelect } },
      });
    });
  },

  countMessages(discussionId: string) {
    return prisma.discussionMessage.count({ where: { discussionId } });
  },

  listMessages(discussionId: string, page: number, limit: number) {
    return prisma.discussionMessage.findMany({
      where: { discussionId },
      include: messageSenderSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  },

  // Insert a message and bump the discussion's updatedAt (recency ordering).
  createMessage(discussionId: string, senderId: string, message: string) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.discussionMessage.create({
        data: { discussionId, senderId, message },
        include: messageSenderSelect,
      });
      await tx.discussion.update({ where: { id: discussionId }, data: { updatedAt: new Date() } });
      return created;
    });
  },
};
