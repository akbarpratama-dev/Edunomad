import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireVerified } from "../middleware/verificationMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { discussionController } from "../modules/discussion/discussion.controller";
import {
  discussionIdParamSchema,
  sendMessageSchema,
  messagesQuerySchema,
  pinDiscussionSchema,
  messageIdParamSchema,
  toggleReactionSchema,
  uploadUrlSchema,
} from "../validators/discussion.validator";

// Mounted at /discussions. Absolute-path group-discussion message actions
// (Workflow 7). Membership is enforced in the service.
const router = Router();

router.get(
  "/:id/messages",
  authMiddleware,
  validateRequest({ params: discussionIdParamSchema, query: messagesQuerySchema }),
  discussionController.listMessages
);

router.post(
  "/:id/messages",
  authMiddleware,
  requireVerified,
  validateRequest({ params: discussionIdParamSchema, body: sendMessageSchema }),
  discussionController.sendMessage
);

// Phase 12: pin/unpin a forum topic (senior lead / UMKM owner — enforced in service).
router.post(
  "/:id/pin",
  authMiddleware,
  requireVerified,
  validateRequest({ params: discussionIdParamSchema, body: pinDiscussionSchema }),
  discussionController.pin
);

// Phase 12.5: record a unique view (members only — enforced in service).
router.post(
  "/:id/view",
  authMiddleware,
  validateRequest({ params: discussionIdParamSchema }),
  discussionController.recordView
);

// Phase 12.4: signed upload URL for an attachment (members only — enforced in service).
router.post(
  "/:id/attachments/upload-url",
  authMiddleware,
  requireVerified,
  validateRequest({ params: discussionIdParamSchema, body: uploadUrlSchema }),
  discussionController.createUploadUrl
);

// Phase 12.3: toggle an emoji reaction on a message (members only — enforced in service).
router.post(
  "/messages/:messageId/reactions",
  authMiddleware,
  requireVerified,
  validateRequest({ params: messageIdParamSchema, body: toggleReactionSchema }),
  discussionController.toggleReaction
);

export default router;
