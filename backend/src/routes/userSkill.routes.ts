import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireActiveAccount } from "../middleware/verificationMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { skillController } from "../modules/skill/skill.controller";
import {
  addUserSkillSchema,
  updateUserSkillSchema,
  userSkillIdParamSchema,
} from "../validators/skill.validator";

// Mounted at /users/me/skills. Reads need only auth; writes need an active
// account (PENDING_VERIFICATION may add skills per RBAC Rule 2).
const router = Router();

router.get("/", authMiddleware, skillController.listMine);

router.post(
  "/",
  authMiddleware,
  requireActiveAccount,
  validateRequest({ body: addUserSkillSchema }),
  skillController.add
);

router.put(
  "/:id",
  authMiddleware,
  requireActiveAccount,
  validateRequest({ params: userSkillIdParamSchema, body: updateUserSkillSchema }),
  skillController.updateLevel
);

router.delete(
  "/:id",
  authMiddleware,
  requireActiveAccount,
  validateRequest({ params: userSkillIdParamSchema }),
  skillController.remove
);

export default router;
