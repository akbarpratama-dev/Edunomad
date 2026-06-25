import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireVerified } from "../middleware/verificationMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { reviewController } from "../modules/review/review.controller";
import { reviewIdParamSchema, updateReviewSchema } from "../validators/review.validator";

// Mounted at /reviews. Absolute-path review edit (Workflow 12). Ownership +
// project-closure checks live in the service.
const router = Router();

router.put(
  "/:id",
  authMiddleware,
  requireVerified,
  validateRequest({ params: reviewIdParamSchema, body: updateReviewSchema }),
  reviewController.update
);

export default router;
