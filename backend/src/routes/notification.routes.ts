import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { notificationController } from "../modules/notification/notification.controller";
import { notificationIdParamSchema } from "../validators/notification.validator";

// Mounted at /notifications. Each user sees only their own (userId = req.user).
const router = Router();

router.get("/", authMiddleware, notificationController.list);
router.post("/read-all", authMiddleware, notificationController.markAllRead);
router.post(
  "/:id/read",
  authMiddleware,
  validateRequest({ params: notificationIdParamSchema }),
  notificationController.markRead
);

export default router;
