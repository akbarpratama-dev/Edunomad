import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { seniorApplicationController } from "../modules/seniorApplication/seniorApplication.controller";
import { seniorApplicationIdParamSchema } from "../validators/seniorApplication.validator";

// Mounted at /senior-applications. Absolute-path actions (Workflow 3).
const router = Router();

// SENIOR: own applications list + withdraw.
router.get("/", authMiddleware, roleMiddleware(["SENIOR"]), seniorApplicationController.listMine);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  validateRequest({ params: seniorApplicationIdParamSchema }),
  seniorApplicationController.withdraw
);

// UMKM (project owner — enforced in service): accept / reject.
router.post(
  "/:id/accept",
  authMiddleware,
  roleMiddleware(["UMKM"]),
  validateRequest({ params: seniorApplicationIdParamSchema }),
  seniorApplicationController.accept
);
router.post(
  "/:id/reject",
  authMiddleware,
  roleMiddleware(["UMKM"]),
  validateRequest({ params: seniorApplicationIdParamSchema }),
  seniorApplicationController.reject
);

export default router;
