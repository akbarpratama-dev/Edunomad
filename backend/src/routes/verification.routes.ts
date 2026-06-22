import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { verificationController } from "../modules/verification/verification.controller";
import { submitVerificationSchema } from "../validators/verification.validator";

// User-facing verification endpoints (mounted at /api/v1).
const router = Router();

router.get("/verification-status", authMiddleware, verificationController.getStatus);
router.post(
  "/verification-request",
  authMiddleware,
  validateRequest({ body: submitVerificationSchema }),
  verificationController.submit
);

export default router;
