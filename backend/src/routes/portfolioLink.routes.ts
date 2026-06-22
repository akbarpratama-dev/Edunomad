import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireActiveAccount } from "../middleware/verificationMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { portfolioLinkController } from "../modules/portfolioLink/portfolioLink.controller";
import {
  createPortfolioLinkSchema,
  updatePortfolioLinkSchema,
  portfolioLinkIdParamSchema,
} from "../validators/portfolioLink.validator";

// Mounted at /users/me/portfolio-links.
const router = Router();

router.get("/", authMiddleware, portfolioLinkController.list);

router.post(
  "/",
  authMiddleware,
  requireActiveAccount,
  validateRequest({ body: createPortfolioLinkSchema }),
  portfolioLinkController.create
);

router.put(
  "/:id",
  authMiddleware,
  requireActiveAccount,
  validateRequest({ params: portfolioLinkIdParamSchema, body: updatePortfolioLinkSchema }),
  portfolioLinkController.update
);

router.delete(
  "/:id",
  authMiddleware,
  requireActiveAccount,
  validateRequest({ params: portfolioLinkIdParamSchema }),
  portfolioLinkController.remove
);

export default router;
