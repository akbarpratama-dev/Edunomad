import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { projectMemberController } from "../modules/projectMember/projectMember.controller";
import { memberIdParamSchema, requestRemovalSchema } from "../validators/projectMember.validator";

// Mounted at /members. Absolute-path membership actions (Workflow 16 / 17).
const router = Router();

// SENIOR lead (enforced in service): request removal of a member.
router.post(
  "/:id/remove",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  validateRequest({ params: memberIdParamSchema, body: requestRemovalSchema }),
  projectMemberController.requestRemoval
);

// Authenticated member (ownership enforced in service): self-withdraw.
router.post(
  "/:id/withdraw",
  authMiddleware,
  validateRequest({ params: memberIdParamSchema }),
  projectMemberController.withdraw
);

export default router;
