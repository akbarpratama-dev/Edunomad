import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { requireVerified } from "../middleware/verificationMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { artifactController } from "../modules/artifact/artifact.controller";
import {
  artifactIdParamSchema,
  regenerateArtifactSchema,
} from "../validators/artifact.validator";

// Mounted at /artifacts. Absolute-path certificate actions (Workflow 13/14).
const router = Router();

// The caller's own certificates (beginner "Sertifikat Saya").
router.get("/", authMiddleware, artifactController.listMine);

router.get(
  "/:id",
  authMiddleware,
  validateRequest({ params: artifactIdParamSchema }),
  artifactController.detail
);

router.get(
  "/:id/download",
  authMiddleware,
  validateRequest({ params: artifactIdParamSchema }),
  artifactController.download
);

// SENIOR lead (enforced in service): regenerate a new version.
router.post(
  "/:id/regenerate",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  requireVerified,
  validateRequest({ params: artifactIdParamSchema, body: regenerateArtifactSchema }),
  artifactController.regenerate
);

export default router;
