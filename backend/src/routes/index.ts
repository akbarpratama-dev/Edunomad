import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { projectController } from "../modules/project/project.controller";
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
router.use("/admin", adminRoutes);

// Absolute-path routes
router.get(
  "/my-projects",
  authMiddleware,
  roleMiddleware(["UMKM"]),
  validateRequest({ query: myProjectsQuerySchema }),
  projectController.myProjects
);
router.use("/", verificationRoutes);

export default router;
