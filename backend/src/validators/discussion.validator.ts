import { z } from "zod";
import { DISCUSSION_CATEGORIES } from "../constants/discussionCategory";
import { REACTION_EMOJIS } from "../constants/reactionEmoji";
import { ATTACHMENT_TYPES } from "../constants/attachmentType";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB (matches bucket limit)

// Phase 12.4 — POST /discussions/:id/attachments/upload-url
export const uploadUrlSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  fileSize: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

// One attachment on a message: LINK carries `url`, FILE/IMAGE carry `filePath`
// (the storage path returned by the upload-url step).
const attachmentInputSchema = z
  .object({
    type: z.enum(ATTACHMENT_TYPES),
    url: z.string().url().max(2000).optional(),
    filePath: z.string().max(1000).optional(),
    fileName: z.string().max(255).optional(),
    fileSize: z.number().int().nonnegative().max(MAX_UPLOAD_BYTES).optional(),
  })
  .refine((a) => (a.type === "LINK" ? !!a.url : !!a.filePath), {
    message: "LINK butuh url; FILE/IMAGE butuh filePath",
    path: ["type"],
  });

export const discussionIdParamSchema = z.object({ id: z.string().uuid() });
export const userIdParamSchema = z.object({ id: z.string().uuid() });
export const messageIdParamSchema = z.object({ messageId: z.string().uuid() });

// POST /discussions/messages/:messageId/reactions — toggle a curated emoji.
export const toggleReactionSchema = z.object({
  emoji: z.enum(REACTION_EMOJIS),
});

// POST /projects/:id/discussions. Phase 12 (docs/03 amended): GROUP discussions
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
export const sendMessageSchema = z
  .object({
    message: z.string().max(5000).optional().default(""),
    parentId: z.string().uuid().optional(), // Phase 12.2: one-level reply target (group only)
    attachments: z.array(attachmentInputSchema).max(5).optional(), // Phase 12.4 (group only)
  })
  .refine((d) => (d.message?.trim().length ?? 0) > 0 || (d.attachments?.length ?? 0) > 0, {
    message: "Pesan atau lampiran harus diisi",
    path: ["message"],
  });

// GET .../messages pagination.
export const messagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateGroupDiscussionInput = z.infer<typeof createGroupDiscussionSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MessagesQuery = z.infer<typeof messagesQuerySchema>;
