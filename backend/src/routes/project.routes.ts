import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { requireVerified } from "../middleware/verificationMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { projectController } from "../modules/project/project.controller";
import { milestoneController } from "../modules/milestone/milestone.controller";
import { projectRoleController } from "../modules/projectRole/projectRole.controller";
import { seniorApplicationController } from "../modules/seniorApplication/seniorApplication.controller";
import { projectApplicationController } from "../modules/projectApplication/projectApplication.controller";
import { projectMemberController } from "../modules/projectMember/projectMember.controller";
import { projectLifecycleController } from "../modules/projectLifecycle/projectLifecycle.controller";
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
  projectIdParamSchema,
} from "../validators/project.validator";
import { createMilestoneSchema } from "../validators/milestone.validator";
import { createRoleSchema } from "../validators/projectRole.validator";
import { applyAsMentorSchema } from "../validators/seniorApplication.validator";
import { applyToRoleSchema } from "../validators/projectApplication.validator";

const router = Router();
const umkm = [roleMiddleware(["UMKM"])];

// Public discovery
router.get("/", validateRequest({ query: listProjectsQuerySchema }), projectController.list);
router.get("/:id", validateRequest({ params: projectIdParamSchema }), projectController.detail);

// UMKM ownership-gated (ownership enforced in the service)
router.post(
  "/",
  authMiddleware,
  ...umkm,
  requireVerified,
  validateRequest({ body: createProjectSchema }),
  projectController.create
);
router.put(
  "/:id",
  authMiddleware,
  ...umkm,
  validateRequest({ params: projectIdParamSchema, body: updateProjectSchema }),
  projectController.update
);
router.delete(
  "/:id",
  authMiddleware,
  ...umkm,
  validateRequest({ params: projectIdParamSchema }),
  projectController.remove
);
router.post(
  "/:id/submit",
  authMiddleware,
  ...umkm,
  validateRequest({ params: projectIdParamSchema }),
  projectController.submit
);

// Milestones (list: any auth user; create: owner UMKM or assigned senior — checked in service)
router.get(
  "/:id/milestones",
  authMiddleware,
  validateRequest({ params: projectIdParamSchema }),
  milestoneController.list
);
router.post(
  "/:id/milestones",
  authMiddleware,
  validateRequest({ params: projectIdParamSchema, body: createMilestoneSchema }),
  milestoneController.create
);

// Roles (list: any auth user; create: project owner — checked in service)
router.get(
  "/:id/roles",
  authMiddleware,
  validateRequest({ params: projectIdParamSchema }),
  projectRoleController.list
);
router.post(
  "/:id/roles",
  authMiddleware,
  ...umkm,
  validateRequest({ params: projectIdParamSchema, body: createRoleSchema }),
  projectRoleController.create
);

// Senior recruitment (Workflow 3) — SENIOR applies; UMKM owner lists applicants.
router.post(
  "/:id/senior-apply",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  requireVerified,
  validateRequest({ params: projectIdParamSchema, body: applyAsMentorSchema }),
  seniorApplicationController.apply
);
router.get(
  "/:id/senior-applications",
  authMiddleware,
  ...umkm,
  validateRequest({ params: projectIdParamSchema }),
  seniorApplicationController.listForProject
);

// Beginner recruitment (Workflow 4) — BEGINNER applies; SENIOR lead lists applicants.
router.post(
  "/:id/apply",
  authMiddleware,
  roleMiddleware(["BEGINNER"]),
  requireVerified,
  validateRequest({ params: projectIdParamSchema, body: applyToRoleSchema }),
  projectApplicationController.apply
);
router.get(
  "/:id/applications",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  validateRequest({ params: projectIdParamSchema }),
  projectApplicationController.listForProject
);

// Project members (Workflow 5/16/17) — list: any auth user.
router.get(
  "/:id/members",
  authMiddleware,
  validateRequest({ params: projectIdParamSchema }),
  projectMemberController.listForProject
);

// Project lifecycle (Workflow 5/11/15) — ownership/lead enforced in service.
router.post(
  "/:id/start",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  validateRequest({ params: projectIdParamSchema }),
  projectLifecycleController.start
);
router.post(
  "/:id/complete",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  validateRequest({ params: projectIdParamSchema }),
  projectLifecycleController.requestCompletion
);
router.post(
  "/:id/confirm-completion",
  authMiddleware,
  ...umkm,
  validateRequest({ params: projectIdParamSchema }),
  projectLifecycleController.confirmCompletion
);

export default router;
