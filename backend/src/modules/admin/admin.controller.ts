import { Request, Response, NextFunction } from "express";
import { adminDashboardService } from "../../services/adminDashboard.service";
import { skillService } from "../../services/skill.service";
import { projectService } from "../../services/project.service";
import { successResponse, paginatedResponse } from "../../utils/response";
import { listSkillsQuerySchema } from "../../validators/skill.validator";
import { listProjectsQuerySchema } from "../../validators/project.validator";

const paginate = (data: unknown[], page: number, limit: number, total: number) =>
  paginatedResponse(data, { page, limit, total, lastPage: Math.max(1, Math.ceil(total / limit)) });

export const adminController = {
  // GET /admin/dashboard
  async dashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminDashboardService.getStats();
      res.json(successResponse(stats, "Dashboard stats retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // GET /admin/skills/pending
  async pendingSkills(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = listSkillsQuerySchema.parse(req.query);
      const { data, total } = await skillService.getPendingSkills(page, limit);
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

  // POST /admin/skills/:id/approve
  async approveSkill(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await skillService.approveSkill(req.user!.id, req.params.id);
      res.json(successResponse(updated, "Skill approved"));
    } catch (err) {
      next(err);
    }
  },

  // POST /admin/skills/:id/reject
  async rejectSkill(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await skillService.rejectSkill(req.user!.id, req.params.id, req.body?.reason);
      res.json(successResponse(updated, "Skill rejected"));
    } catch (err) {
      next(err);
    }
  },

  // GET /admin/projects/pending
  async pendingProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = listProjectsQuerySchema.parse(req.query);
      const { data, total } = await projectService.getPendingProjects(page, limit);
      res.json(paginate(data, page, limit, total));
    } catch (err) {
      next(err);
    }
  },

  // POST /admin/projects/:id/approve
  async approveProject(req: Request, res: Response, next: NextFunction) {
    try {
      const p = await projectService.approveProject(req.user!.id, req.params.id);
      res.json(successResponse(p, "Project approved"));
    } catch (err) {
      next(err);
    }
  },

  // POST /admin/projects/:id/reject
  async rejectProject(req: Request, res: Response, next: NextFunction) {
    try {
      const p = await projectService.rejectProject(req.user!.id, req.params.id, req.body.reason);
      res.json(successResponse(p, "Project rejected"));
    } catch (err) {
      next(err);
    }
  },
};
