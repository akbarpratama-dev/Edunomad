import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { milestoneController } from "../modules/milestone/milestone.controller";
import { updateMilestoneSchema, milestoneIdParamSchema } from "../validators/milestone.validator";

// Mounted at /milestones. Owner UMKM or assigned senior (checked in service).
const router = Router();

router.put(
  "/:id",
  authMiddleware,
  validateRequest({ params: milestoneIdParamSchema, body: updateMilestoneSchema }),
  milestoneController.update
);
router.delete(
  "/:id",
  authMiddleware,
  validateRequest({ params: milestoneIdParamSchema }),
  milestoneController.remove
);

export default router;
