import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireVerified } from "../middleware/verificationMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { discussionController } from "../modules/discussion/discussion.controller";
import {
  discussionIdParamSchema,
  sendMessageSchema,
  messagesQuerySchema,
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

export default router;
