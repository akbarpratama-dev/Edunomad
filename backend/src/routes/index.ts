import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { projectController } from "../modules/project/project.controller";
import { projectMemberController } from "../modules/projectMember/projectMember.controller";
import { myProjectsQuerySchema } from "../validators/project.validator";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import skillRoutes from "./skill.routes";
import verificationRoutes from "./verification.routes";
import categoryRoutes from "./category.routes";
import adminRoutes from "./admin.routes";
import projectRoutes from "./project.routes";
import milestoneRoutes from "./milestone.routes";
import roleRoutes from "./role.routes";
import seniorApplicationRoutes from "./seniorApplication.routes";
import applicationRoutes from "./application.routes";
import memberRoutes from "./member.routes";
import discussionRoutes from "./discussion.routes";
import directChatRoutes from "./directChat.routes";
import deliverableRoutes from "./deliverable.routes";
import contributionRoutes from "./contribution.routes";
import reviewRoutes from "./review.routes";
import artifactRoutes from "./artifact.routes";
import verifyRoutes from "./verify.routes";
import { artifactController } from "../modules/artifact/artifact.controller";

// Aggregates all feature routes under the /api/v1 base path (API spec).
const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/skills", skillRoutes);
router.use("/categories", categoryRoutes);
router.use("/projects", projectRoutes);
router.use("/milestones", milestoneRoutes);
router.use("/roles", roleRoutes);
router.use("/senior-applications", seniorApplicationRoutes);
router.use("/applications", applicationRoutes);
router.use("/members", memberRoutes);
router.use("/discussions", discussionRoutes);
router.use("/direct-chat", directChatRoutes);
router.use("/deliverables", deliverableRoutes);
router.use("/contributions", contributionRoutes);
router.use("/reviews", reviewRoutes);
router.use("/artifacts", artifactRoutes);
router.use("/verify", verifyRoutes);
router.use("/admin", adminRoutes);

// Absolute-path routes
router.get(
  "/my-projects",
  authMiddleware,
  roleMiddleware(["UMKM"]),
  validateRequest({ query: myProjectsQuerySchema }),
  projectController.myProjects
);
// The caller's own project memberships (beginner "Proyek Saya").
router.get("/me/projects", authMiddleware, projectMemberController.myProjects);
// Derived artifact pipeline for the beginner "Artifact Saya" page.
router.get("/me/artifact-pipeline", authMiddleware, artifactController.pipeline);
router.get("/me/artifact-pipeline/:projectId", authMiddleware, artifactController.pipelineDetail);
// Projects the caller mentors (senior dashboard).
router.get(
  "/me/mentored-projects",
  authMiddleware,
  roleMiddleware(["SENIOR"]),
  projectController.mentoredProjects
);
router.use("/", verificationRoutes);

export default router;
