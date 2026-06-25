import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { requireVerified } from "../middleware/verificationMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { deliverableController } from "../modules/deliverable/deliverable.controller";
import {
  deliverableIdParamSchema,
  updateDeliverableSchema,
  submitDeliverableSchema,
  requestRevisionSchema,
} from "../validators/deliverable.validator";

// Mounted at /deliverables. Absolute-path deliverable actions (Workflow 8).
// Ownership / senior-lead checks live in the service.
const router = Router();

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["BEGINNER"]),
  requireVerified,
  validateRequest({ params: deliverableIdParamSchema, body: updateDeliverableSchema }),
  deliverableController.update
);

router.post(
  "/:id/submit",
  authMiddleware,
  roleMiddleware(["BEGINNER"]),
  requireVerified,
  validateRequest({ params: deliverableIdParamSchema, body: submitDeliverableSchema }),
  deliverableController.submit
);

router.post(
  "/:id/approve",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  validateRequest({ params: deliverableIdParamSchema }),
  deliverableController.approve
);

router.post(
  "/:id/request-revision",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  validateRequest({ params: deliverableIdParamSchema, body: requestRevisionSchema }),
  deliverableController.requestRevision
);

export default router;
