import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { categoryController } from "../modules/category/category.controller";
import { categoryListQuerySchema } from "../validators/category.validator";

// Public categories list (mounted at /categories).
const router = Router();

router.get(
  "/",
  validateRequest({ query: categoryListQuerySchema }),
  categoryController.listPublic
);

export default router;
