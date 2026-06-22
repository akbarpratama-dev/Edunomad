import { Router } from "express";
import { validateRequest } from "../middleware/validateRequest";
import { skillController } from "../modules/skill/skill.controller";
import { listSkillsQuerySchema } from "../validators/skill.validator";

// Mounted at /skills. Master skills list is public (API spec: Access Public).
const router = Router();

router.get("/", validateRequest({ query: listSkillsQuerySchema }), skillController.listMaster);

export default router;
