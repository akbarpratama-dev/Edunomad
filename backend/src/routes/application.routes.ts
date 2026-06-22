import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { projectApplicationController } from "../modules/projectApplication/projectApplication.controller";
import { projectApplicationIdParamSchema } from "../validators/projectApplication.validator";

// Mounted at /applications. Absolute-path actions (Workflow 4).
const router = Router();

// BEGINNER: own applications list + withdraw.
router.get("/", authMiddleware, roleMiddleware(["BEGINNER"]), projectApplicationController.listMine);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["BEGINNER"]),
  validateRequest({ params: projectApplicationIdParamSchema }),
  projectApplicationController.withdraw
);

// SENIOR (project lead — enforced in service): accept / reject.
router.post(
  "/:id/accept",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  validateRequest({ params: projectApplicationIdParamSchema }),
  projectApplicationController.accept
);
router.post(
  "/:id/reject",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  validateRequest({ params: projectApplicationIdParamSchema }),
  projectApplicationController.reject
);

export default router;
