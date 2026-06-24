import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireActiveAccount, requireVerified } from "../middleware/verificationMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { userController } from "../modules/user/user.controller";
import { directMessageController } from "../modules/directMessage/directMessage.controller";
import { updateProfileSchema, userIdParamSchema } from "../validators/user.validator";
import userSkillRoutes from "./userSkill.routes";
import experienceRoutes from "./experience.routes";
import portfolioLinkRoutes from "./portfolioLink.routes";

const router = Router();

// --- Own profile (must be declared before the dynamic /:id routes) ---
router.get("/me", authMiddleware, userController.getMe);
router.put(
  "/me",
  authMiddleware,
  requireActiveAccount,
  validateRequest({ body: updateProfileSchema }),
  userController.updateMe
);

// --- Own sub-resources ---
router.use("/me/skills", userSkillRoutes);
router.use("/me/experiences", experienceRoutes);
router.use("/me/portfolio-links", portfolioLinkRoutes);

// --- Direct messages (Workflow 7) — create/get the 1:1 chat with another user.
// Eligibility (shared project context) enforced in the service.
router.post(
  "/:id/direct-chat",
  authMiddleware,
  requireVerified,
  validateRequest({ params: userIdParamSchema }),
  directMessageController.createOrGet
);

// --- Other users (authenticated only; portfolio visible to logged-in users) ---
router.get(
  "/:id/portfolio",
  authMiddleware,
  validateRequest({ params: userIdParamSchema }),
  userController.getPortfolio
);
router.get(
  "/:id",
  authMiddleware,
  validateRequest({ params: userIdParamSchema }),
  userController.getById
);

export default router;
