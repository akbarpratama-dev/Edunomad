import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { requireVerified } from "../middleware/verificationMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { contributionController } from "../modules/contribution/contribution.controller";
import {
  contributionIdParamSchema,
  updateContributionSchema,
} from "../validators/contribution.validator";

// Mounted at /contributions. Absolute-path contribution actions (Workflow 9).
const router = Router();

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["BEGINNER"]),
  requireVerified,
  validateRequest({ params: contributionIdParamSchema, body: updateContributionSchema }),
  contributionController.update
);

router.post(
  "/:id/approve",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  validateRequest({ params: contributionIdParamSchema }),
  contributionController.approve
);

export default router;
