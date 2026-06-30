import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";
import { DiscussionType } from "../constants/discussionType";
import { MemberStatus } from "../constants/applicationStatus";

const memberUserSelect = {
  user: { select: { id: true, name: true, email: true, role: true } },
} satisfies Prisma.DiscussionMemberInclude;

// Phase 12.3: lightweight reaction rows (emoji + who) for client-side grouping.
// Phase 12.4: attachment rows (filePath signed to a url at read time in the service).
const reactionSelect = {
  reactions: { select: { emoji: true, userId: true } },
  attachments: {
    select: { id: true, type: true, url: true, filePath: true, fileName: true, fileSize: true },
  },
} satisfies Prisma.DiscussionMessageInclude;

// Phase 12.2/12.3/12.4: a top-level message carries its one-level replies +
// reactions + attachments (each reply too).
const messageWithRepliesInclude = {
  sender: { select: { id: true, name: true, role: true } },
  ...reactionSelect,
  replies: {
    include: { sender: { select: { id: true, name: true, role: true } }, ...reactionSelect },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.DiscussionMessageInclude;

interface AttachmentInput {
  type: string;
  url?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
}

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

  // Top-level messages only (replies are nested under their parent).
  countMessages(discussionId: string) {
    return prisma.discussionMessage.count({ where: { discussionId, parentId: null } });
  },

  // Top-level messages with their replies (Phase 12.2).
  listMessages(discussionId: string, page: number, limit: number) {
    return prisma.discussionMessage.findMany({
      where: { discussionId, parentId: null },
      include: messageWithRepliesInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  },

  // Minimal lookup to validate a reply's parent (same discussion, top-level).
  findMessageById(id: string) {
    return prisma.discussionMessage.findUnique({
      where: { id },
      select: { id: true, discussionId: true, parentId: true },
    });
  },

  // Phase 12.3: toggle an emoji reaction (add if absent, remove if present).
  async toggleReaction(messageId: string, discussionId: string, userId: string, emoji: string) {
    const existing = await prisma.messageReaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
      select: { id: true },
    });
    if (existing) {
      await prisma.messageReaction.delete({ where: { id: existing.id } });
      return { reacted: false };
    }
    await prisma.messageReaction.create({ data: { messageId, discussionId, userId, emoji } });
    return { reacted: true };
  },

  // Insert a message (or reply when parentId set) with optional attachments
  // (Phase 12.4) and bump the discussion's updatedAt (recency ordering).
  createMessage(
    discussionId: string,
    senderId: string,
    message: string,
    parentId?: string | null,
    attachments?: AttachmentInput[]
  ) {
    return prisma.$transaction(async (tx) => {
      const created = await tx.discussionMessage.create({
        data: {
          discussionId,
          senderId,
          message,
          parentId: parentId ?? null,
          attachments:
            attachments && attachments.length
              ? {
                  create: attachments.map((a) => ({
                    type: a.type,
                    url: a.url ?? null,
                    filePath: a.filePath ?? null,
                    fileName: a.fileName ?? null,
                    fileSize: a.fileSize ?? null,
                  })),
                }
              : undefined,
        },
        include: messageWithRepliesInclude,
      });
      await tx.discussion.update({ where: { id: discussionId }, data: { updatedAt: new Date() } });
      return created;
    });
  },
};

export type { AttachmentInput };
