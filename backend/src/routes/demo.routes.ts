import { Router } from "express";
import { demoController } from "../modules/demo/demo.controller";

// Mounted at /demo. PUBLIC but token-gated (see demo.controller). Demo-only.
const router = Router();

router.post("/reset", demoController.reset);

export default router;
