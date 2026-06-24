import { discussionRepository } from "../repositories/discussion.repository";
import { userRepository } from "../repositories/user.repository";
import { ForbiddenError, NotFoundError, BusinessRuleError } from "../utils/errors";
import { DiscussionType } from "../constants/discussionType";

// Two users may DM only if they share a project context — i.e. one is the senior
// and the other a member, or both are members/owner of the same project
// (docs/06 Discussion Rules: "DM between project members" / "member and senior").
async function assertCanDirectMessage(userId: string, targetId: string) {
  const [mine, theirs] = await Promise.all([
    discussionRepository.userProjectIds(userId),
    discussionRepository.userProjectIds(targetId),
  ]);
  for (const id of mine) if (theirs.has(id)) return;
  throw new ForbiddenError("You can only message users you share a project with");
}

export const directMessageService = {
  // POST /users/:id/direct-chat — create or fetch the 1:1 DIRECT discussion.
  async createOrGetDirectChat(userId: string, targetId: string) {
    if (userId === targetId) throw new BusinessRuleError("Cannot start a chat with yourself");
    const target = await userRepository.findById(targetId);
    if (!target) throw new NotFoundError("User not found");
    await assertCanDirectMessage(userId, targetId);

    const existing = await discussionRepository.findDirectBetween(userId, targetId);
    if (existing) return existing;
    return discussionRepository.createDirect(userId, targetId);
  },

  // GET /direct-chat/:id/messages — chat participants only.
  async getMessages(userId: string, chatId: string, page: number, limit: number) {
    await assertChatMember(chatId, userId);
    const [data, total] = await Promise.all([
      discussionRepository.listMessages(chatId, page, limit),
      discussionRepository.countMessages(chatId),
    ]);
    return { data, meta: { page, limit, total, lastPage: Math.max(1, Math.ceil(total / limit)) } };
  },

  // POST /direct-chat/:id/messages — chat participants only.
  async sendMessage(userId: string, chatId: string, message: string) {
    await assertChatMember(chatId, userId);
    return discussionRepository.createMessage(chatId, userId, message);
  },
};

async function assertChatMember(chatId: string, userId: string) {
  const chat = await discussionRepository.findById(chatId);
  if (!chat || chat.type !== DiscussionType.DIRECT) throw new NotFoundError("Direct chat not found");
  if (!chat.members.some((m) => m.userId === userId)) {
    throw new ForbiddenError("You are not a participant of this chat");
  }
}
