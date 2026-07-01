import { discussionRepository, type AttachmentInput } from "../repositories/discussion.repository";
import { projectRepository } from "../repositories/project.repository";
import { projectMemberRepository } from "../repositories/projectMember.repository";
import { ForbiddenError, NotFoundError, BusinessRuleError } from "../utils/errors";
import { MemberStatus } from "../constants/applicationStatus";
import { DiscussionType } from "../constants/discussionType";
import { storageService } from "./storage.service";

// Phase 12.4 — replace each stored attachment's filePath with a fresh signed
// download URL (LINK attachments keep their own url). Mutates the plain objects
// returned by Prisma.
type WithAttachments = { attachments?: { url: string | null; filePath: string | null }[] };
async function signAttachments(items: WithAttachments[]) {
  const all = items.flatMap((m) => m.attachments ?? []);
  await Promise.all(
    all.map(async (a) => {
      if (a.filePath) a.url = await storageService.signDownload(a.filePath);
    })
  );
}

// The set of users allowed in a project's communication (docs/06 Discussion Rules):
// the assigned senior, the UMKM owner, and ACTIVE members (accepted beginners).
async function getProjectParticipantIds(projectId: string) {
  const members = await projectMemberRepository.listByProject(projectId);
  const ids = new Set<string>();
  for (const m of members) if (m.status === MemberStatus.ACTIVE) ids.add(m.userId);
  return ids;
}

// Group discussions & messages (Workflow 7). Membership is the access boundary:
// only rows in discussion_members may read/post (enforced here, mirrored by RLS).
export const discussionService = {
  // GET /projects/:id/discussions — project participants only.
  async listProjectDiscussions(userId: string, projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    await assertParticipant(project, userId);
    return discussionRepository.listGroupForUser(projectId, userId);
  },

  // POST /projects/:id/discussions — only the assigned senior or the UMKM owner
  // may create (docs/06: Senior/UMKM "Create discussions"; beginners "join").
  // Phase 12: persists title + category. Membership = creator + senior + members.
  async createGroupDiscussion(
    userId: string,
    projectId: string,
    meta: { title: string; category: string },
    memberIds: string[] = []
  ) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");

    const isSenior = project.seniorId === userId;
    const isOwner = project.umkmId === userId;
    if (!isSenior && !isOwner) {
      throw new ForbiddenError("Only the project's senior or UMKM owner can create a discussion");
    }

    const participantIds = await getProjectParticipantIds(projectId);
    if (project.seniorId) participantIds.add(project.seniorId);
    participantIds.add(project.umkmId);

    // Requested members must themselves be project participants.
    for (const id of memberIds) {
      if (!participantIds.has(id)) {
        throw new BusinessRuleError("All members must be participants of this project");
      }
    }

    const memberSet = new Set<string>([userId]);
    if (project.seniorId) memberSet.add(project.seniorId); // senior auto-included
    for (const id of memberIds) memberSet.add(id);

    return discussionRepository.createGroup(projectId, [...memberSet], meta);
  },

  // POST /discussions/:id/pin — only the project's senior lead or UMKM owner.
  async pinDiscussion(userId: string, discussionId: string, pinned: boolean) {
    const discussion = await discussionRepository.findById(discussionId);
    if (!discussion || discussion.type !== DiscussionType.GROUP || !discussion.projectId) {
      throw new NotFoundError("Discussion not found");
    }
    const project = await projectRepository.findRawById(discussion.projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.seniorId !== userId && project.umkmId !== userId) {
      throw new ForbiddenError("Only the project's senior or UMKM owner can pin a discussion");
    }
    return discussionRepository.updatePin(discussionId, pinned);
  },

  // GET /discussions/:id/messages — discussion members only.
  async getMessages(userId: string, discussionId: string, page: number, limit: number) {
    await assertDiscussionMember(discussionId, userId);
    const [data, total] = await Promise.all([
      discussionRepository.listMessages(discussionId, page, limit),
      discussionRepository.countMessages(discussionId),
    ]);
    await signAttachments([...data, ...data.flatMap((m) => m.replies ?? [])]);
    return { data, meta: { page, limit, total, lastPage: Math.max(1, Math.ceil(total / limit)) } };
  },

  // Phase 12.5 — POST /discussions/:id/view (members only). Idempotent.
  async recordView(userId: string, discussionId: string) {
    await assertDiscussionMember(discussionId, userId);
    await discussionRepository.recordView(discussionId, userId);
    return { ok: true };
  },

  // Phase 12.4 — POST /discussions/:id/attachments/upload-url (members only).
  async getUploadUrl(userId: string, discussionId: string, fileName: string) {
    await assertDiscussionMember(discussionId, userId);
    return storageService.createUploadUrl(discussionId, fileName);
  },

  // POST /discussions/:id/messages — discussion members only. `parentId` (Phase
  // 12.2) makes this a one-level reply: the parent must belong to this discussion
  // and itself be top-level (no reply-to-a-reply). `attachments` (Phase 12.4).
  async sendMessage(
    userId: string,
    discussionId: string,
    message: string,
    parentId?: string | null,
    attachments?: AttachmentInput[]
  ) {
    await assertDiscussionMember(discussionId, userId);
    if (parentId) {
      const parent = await discussionRepository.findMessageById(parentId);
      if (!parent || parent.discussionId !== discussionId) {
        throw new NotFoundError("Pesan yang dibalas tidak ditemukan");
      }
      if (parent.parentId !== null) {
        throw new BusinessRuleError("Balasan hanya satu tingkat");
      }
    }
    const created = await discussionRepository.createMessage(
      discussionId,
      userId,
      message,
      parentId ?? null,
      attachments
    );
    await signAttachments([created]);
    return created;
  },

  // POST /discussions/messages/:messageId/reactions — toggle, members only.
  async toggleReaction(userId: string, messageId: string, emoji: string) {
    const msg = await discussionRepository.findMessageById(messageId);
    if (!msg) throw new NotFoundError("Pesan tidak ditemukan");
    await assertDiscussionMember(msg.discussionId, userId);
    return discussionRepository.toggleReaction(messageId, msg.discussionId, userId, emoji);
  },
};

async function assertParticipant(
  project: { id: string; seniorId: string | null; umkmId: string },
  userId: string
) {
  if (project.seniorId === userId || project.umkmId === userId) return;
  const isMember = await discussionRepository.isActiveProjectMember(project.id, userId);
  if (!isMember) throw new ForbiddenError("Not a participant of this project");
}

// Shared access guard: the user must be a member of the discussion. Rejects DIRECT
// chats here so group endpoints can't be used to read DMs (and vice-versa upstream).
async function assertDiscussionMember(discussionId: string, userId: string) {
  const discussion = await discussionRepository.findById(discussionId);
  if (!discussion || discussion.type !== DiscussionType.GROUP) {
    throw new NotFoundError("Discussion not found");
  }
  if (!discussion.members.some((m) => m.userId === userId)) {
    throw new ForbiddenError("You are not a member of this discussion");
  }
}
