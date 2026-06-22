import { Request, Response, NextFunction } from "express";
import { skillService } from "../../services/skill.service";
import { successResponse, paginatedResponse } from "../../utils/response";
import { listSkillsQuerySchema } from "../../validators/skill.validator";

export const skillController = {
  // GET /skills (public, paginated)
  async listMaster(req: Request, res: Response, next: NextFunction) {
    try {
      // query was validated by middleware; re-parse to get coerced values
      // (Express 5 req.query is read-only so validateRequest doesn't mutate it).
      const query = listSkillsQuerySchema.parse(req.query);
      const { data, total, page, limit } = await skillService.listMasterSkills(query);
      res.json(
        paginatedResponse(data, {
          page,
          limit,
          total,
          lastPage: Math.max(1, Math.ceil(total / limit)),
        })
      );
    } catch (err) {
      next(err);
    }
  },

  // GET /users/me/skills
  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const skills = await skillService.listUserSkills(req.user!.id);
      res.json(successResponse(skills, "Skills retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // POST /users/me/skills
  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await skillService.addUserSkill(
        req.user!.id,
        req.body.skill_id,
        req.body.level
      );
      res.status(201).json(successResponse(created, "Skill added"));
    } catch (err) {
      next(err);
    }
  },

  // PUT /users/me/skills/:id
  async updateLevel(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await skillService.updateUserSkillLevel(
        req.user!.id,
        req.params.id,
        req.body.level
      );
      res.json(successResponse(updated, "Skill updated"));
    } catch (err) {
      next(err);
    }
  },

  // DELETE /users/me/skills/:id
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await skillService.removeUserSkill(req.user!.id, req.params.id);
      res.json(successResponse(null, "Skill removed"));
    } catch (err) {
      next(err);
    }
  },
};
