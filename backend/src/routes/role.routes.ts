import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { projectRoleController } from "../modules/projectRole/projectRole.controller";
import { updateRoleSchema, roleIdParamSchema } from "../validators/projectRole.validator";

// Mounted at /roles. Project owner UMKM (checked in service).
const router = Router();

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["UMKM"]),
  validateRequest({ params: roleIdParamSchema, body: updateRoleSchema }),
  projectRoleController.update
);
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["UMKM"]),
  validateRequest({ params: roleIdParamSchema }),
  projectRoleController.remove
);

export default router;
