import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireActiveAccount } from "../middleware/verificationMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { experienceController } from "../modules/experience/experience.controller";
import {
  createExperienceSchema,
  updateExperienceSchema,
  experienceIdParamSchema,
} from "../validators/experience.validator";

// Mounted at /users/me/experiences.
const router = Router();

router.get("/", authMiddleware, experienceController.list);

router.post(
  "/",
  authMiddleware,
  requireActiveAccount,
  validateRequest({ body: createExperienceSchema }),
  experienceController.create
);

router.put(
  "/:id",
  authMiddleware,
  requireActiveAccount,
  validateRequest({ params: experienceIdParamSchema, body: updateExperienceSchema }),
  experienceController.update
);

router.delete(
  "/:id",
  authMiddleware,
  requireActiveAccount,
  validateRequest({ params: experienceIdParamSchema }),
  experienceController.remove
);

export default router;
