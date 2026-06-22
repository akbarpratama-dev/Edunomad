import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { adminController } from "../modules/admin/admin.controller";
import { auditLogController } from "../modules/admin/auditLog.controller";
import { projectMemberController } from "../modules/projectMember/projectMember.controller";
import { memberIdParamSchema } from "../validators/projectMember.validator";
import { verificationController } from "../modules/verification/verification.controller";
import { categoryController } from "../modules/category/category.controller";
import {
  listVerificationsQuerySchema,
  rejectVerificationSchema,
  verificationIdParamSchema,
} from "../validators/verification.validator";
import { auditLogQuerySchema } from "../validators/auditLog.validator";
import { userSkillIdParamSchema } from "../validators/skill.validator";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from "../validators/category.validator";
import { projectIdParamSchema, rejectProjectSchema } from "../validators/project.validator";

// All routes mounted at /api/v1/admin — ADMIN only.
const router = Router();
router.use(authMiddleware, roleMiddleware(["ADMIN"]));

// Dashboard
router.get("/dashboard", adminController.dashboard);

// Verifications
router.get(
  "/verifications",
  validateRequest({ query: listVerificationsQuerySchema }),
  verificationController.adminList
);
router.post(
  "/verifications/:id/approve",
  validateRequest({ params: verificationIdParamSchema }),
  verificationController.approve
);
router.post(
  "/verifications/:id/reject",
  validateRequest({ params: verificationIdParamSchema, body: rejectVerificationSchema }),
  verificationController.reject
);

// Skill approval
router.get("/skills/pending", adminController.pendingSkills);
router.post(
  "/skills/:id/approve",
  validateRequest({ params: userSkillIdParamSchema }),
  adminController.approveSkill
);
router.post(
  "/skills/:id/reject",
  validateRequest({ params: userSkillIdParamSchema }),
  adminController.rejectSkill
);

// Categories
router.get("/categories", categoryController.listAll);
router.post(
  "/categories",
  validateRequest({ body: createCategorySchema }),
  categoryController.create
);
router.put(
  "/categories/:id",
  validateRequest({ params: categoryIdParamSchema, body: updateCategorySchema }),
  categoryController.update
);
router.delete(
  "/categories/:id",
  validateRequest({ params: categoryIdParamSchema }),
  categoryController.remove
);

// Project approval
router.get("/projects/pending", adminController.pendingProjects);
router.post(
  "/projects/:id/approve",
  validateRequest({ params: projectIdParamSchema }),
  adminController.approveProject
);
router.post(
  "/projects/:id/reject",
  validateRequest({ params: projectIdParamSchema, body: rejectProjectSchema }),
  adminController.rejectProject
);

// Member removal confirmation (Workflow 17)
router.post(
  "/members/:id/remove",
  validateRequest({ params: memberIdParamSchema }),
  projectMemberController.confirmRemoval
);

// Audit logs
router.get(
  "/audit-logs",
  validateRequest({ query: auditLogQuerySchema }),
  auditLogController.list
);

export default router;
