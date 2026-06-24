import { z } from "zod";

export const discussionIdParamSchema = z.object({ id: z.string().uuid() });
export const userIdParamSchema = z.object({ id: z.string().uuid() });

// POST /projects/:id/discussions (API spec body: { title, members[] }).
// NOTE: the discussions table has NO `title` column (docs/03 schema wins over the
// API-spec example), so `title` is accepted but NOT persisted. `members` are the
// beginner/participant user ids to add alongside the auto-included project senior.
export const createGroupDiscussionSchema = z.object({
  title: z.string().max(200).optional(),
  members: z.array(z.string().uuid()).max(50).optional(),
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
