import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { z } from "zod";
import { portfolioController } from "../modules/portfolio/portfolio.controller";

// Mounted at /portfolio. PUBLIC portfolio pages (D-P8-5) — no auth.
const router = Router();

router.get(
  "/:userId",
  validateRequest({ params: z.object({ userId: z.string().uuid() }) }),
  portfolioController.publicPortfolio
);

export default router;
