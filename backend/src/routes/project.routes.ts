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
import { discussionController } from "../modules/discussion/discussion.controller";
import { deliverableController } from "../modules/deliverable/deliverable.controller";
import { contributionController } from "../modules/contribution/contribution.controller";
import { reviewController } from "../modules/review/review.controller";
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsQuerySchema,
  projectIdParamSchema,
  projectImageUploadSchema,
} from "../validators/project.validator";
import { createMilestoneSchema } from "../validators/milestone.validator";
import { createRoleSchema } from "../validators/projectRole.validator";
import { applyAsMentorSchema } from "../validators/seniorApplication.validator";
import { applyToRoleSchema } from "../validators/projectApplication.validator";
import { createGroupDiscussionSchema } from "../validators/discussion.validator";
import { createDeliverableSchema } from "../validators/deliverable.validator";
import { submitContributionSchema } from "../validators/contribution.validator";
import { reviewBeginnerSchema, reviewSeniorSchema } from "../validators/review.validator";
import { artifactController } from "../modules/artifact/artifact.controller";
import { generateArtifactsSchema } from "../validators/artifact.validator";

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
// Signed upload URL for a project cover image (UMKM).
router.post(
  "/image-upload-url",
  authMiddleware,
  ...umkm,
  requireVerified,
  validateRequest({ body: projectImageUploadSchema }),
  projectController.imageUploadUrl
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

// Group discussions (Workflow 7) — list: participants; create: senior/UMKM owner.
// Access enforced in the service.
router.get(
  "/:id/discussions",
  authMiddleware,
  validateRequest({ params: projectIdParamSchema }),
  discussionController.listForProject
);
router.post(
  "/:id/discussions",
  authMiddleware,
  requireVerified,
  validateRequest({ params: projectIdParamSchema, body: createGroupDiscussionSchema }),
  discussionController.create
);

// Deliverables (Workflow 8) — list: any auth; create: BEGINNER member (service).
router.get(
  "/:id/deliverables",
  authMiddleware,
  validateRequest({ params: projectIdParamSchema }),
  deliverableController.listForProject
);
router.post(
  "/:id/deliverables",
  authMiddleware,
  roleMiddleware(["BEGINNER"]),
  requireVerified,
  validateRequest({ params: projectIdParamSchema, body: createDeliverableSchema }),
  deliverableController.create
);

// Contributions (Workflow 9) — list: any auth (senior review); submit: BEGINNER.
router.get(
  "/:id/contributions",
  authMiddleware,
  validateRequest({ params: projectIdParamSchema }),
  contributionController.listForProject
);
router.post(
  "/:id/contributions",
  authMiddleware,
  roleMiddleware(["BEGINNER"]),
  requireVerified,
  validateRequest({ params: projectIdParamSchema, body: submitContributionSchema }),
  contributionController.submit
);

// Reviews (Workflow 12) — beginner review by SENIOR/UMKM, senior review by UMKM.
// Reviewer ownership + type derivation enforced in the service.
router.get(
  "/:id/reviews",
  authMiddleware,
  validateRequest({ params: projectIdParamSchema }),
  reviewController.listForProject
);
router.post(
  "/:id/reviews/beginner",
  authMiddleware,
  roleMiddleware(["SENIOR", "UMKM"]),
  requireVerified,
  validateRequest({ params: projectIdParamSchema, body: reviewBeginnerSchema }),
  reviewController.reviewBeginner
);
router.post(
  "/:id/reviews/senior",
  authMiddleware,
  ...umkm,
  requireVerified,
  validateRequest({ params: projectIdParamSchema, body: reviewSeniorSchema }),
  reviewController.reviewSenior
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

// Certificates for a project (senior "Sertifikat" tab / beginner view).
router.get(
  "/:id/artifacts",
  authMiddleware,
  validateRequest({ params: projectIdParamSchema }),
  artifactController.listForProject
);

// Artifact generation (Workflow 13) — SENIOR lead, enforced in the service.
router.post(
  "/:id/generate-artifacts",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  requireVerified,
  validateRequest({ params: projectIdParamSchema, body: generateArtifactsSchema }),
  artifactController.generate
);

export default router;
