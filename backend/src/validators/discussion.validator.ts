import { z } from "zod";
import { DISCUSSION_CATEGORIES } from "../constants/discussionCategory";

export const discussionIdParamSchema = z.object({ id: z.string().uuid() });
export const userIdParamSchema = z.object({ id: z.string().uuid() });

// POST /projects/:id/discussions. Phase 10 (docs/03 amended): GROUP discussions
// are forum topics — `title` + `category` are required and persisted. `members`
// are participant user ids added alongside the auto-included project senior.
export const createGroupDiscussionSchema = z.object({
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(255),
  category: z.enum(DISCUSSION_CATEGORIES),
  members: z.array(z.string().uuid()).max(50).optional(),
});

// POST /discussions/:id/pin — senior lead / UMKM owner pins/unpins a topic.
export const pinDiscussionSchema = z.object({
  pinned: z.boolean(),
});

// POST /discussions/:id/messages and POST /direct-chat/:id/messages.
export const sendMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(5000),
});

// GET .../messages pagination.
export const messagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateGroupDiscussionInput = z.infer<typeof createGroupDiscussionSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MessagesQuery = z.infer<typeof messagesQuerySchema>;
