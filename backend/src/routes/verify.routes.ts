import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { artifactController } from "../modules/artifact/artifact.controller";
import { artifactCodeParamSchema } from "../validators/artifact.validator";

// Mounted at /verify. PUBLIC certificate verification (Workflow 18) — no auth.
const router = Router();

router.get(
  "/:artifactCode",
  validateRequest({ params: artifactCodeParamSchema }),
  artifactController.verify
);

export default router;
