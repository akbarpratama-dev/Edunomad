import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireVerified } from "../middleware/verificationMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { directMessageController } from "../modules/directMessage/directMessage.controller";
import {
  discussionIdParamSchema,
  sendMessageSchema,
  messagesQuerySchema,
} from "../validators/discussion.validator";

// Mounted at /direct-chat. 1:1 DM message actions (Workflow 7). The chat itself is
// created via POST /users/:id/direct-chat. Participation enforced in the service.
const router = Router();

router.get(
  "/:id/messages",
  authMiddleware,
  validateRequest({ params: discussionIdParamSchema, query: messagesQuerySchema }),
  directMessageController.listMessages
);

router.post(
  "/:id/messages",
  authMiddleware,
  requireVerified,
  validateRequest({ params: discussionIdParamSchema, body: sendMessageSchema }),
  directMessageController.sendMessage
);

export default router;
