import { Request, Response, NextFunction } from "express";
import { projectService } from "../../services/project.service";
import { successResponse, paginatedResponse } from "../../utils/response";
import { listProjectsQuerySchema, myProjectsQuerySchema } from "../../validators/project.validator";

const paginate = (data: unknown[], page: number, limit: number, total: number) =>
  paginatedResponse(data, { page, limit, total, lastPage: Math.max(1, Math.ceil(total / limit)) });

export const projectController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const q = listProjectsQuerySchema.parse(req.query);
      const { data, total, page, limit } = await projectService.getProjects(q);
      res.json(paginate(data, page, limit, total));
    } catch (err) {
      next(err);
    }
  },

  async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const p = await projectService.getProjectDetail(req.params.id);
      res.json(successResponse(p, "Project retrieved"));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const p = await projectService.createProject(req.user!.id, req.body);
      res.status(201).json(successResponse(p, "Project created"));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const p = await projectService.updateProject(req.user!.id, req.params.id, req.body);
      res.json(successResponse(p, "Project updated"));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await projectService.deleteProject(req.user!.id, req.params.id);
      res.json(successResponse(null, "Project deleted"));
    } catch (err) {
      next(err);
    }
  },

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const p = await projectService.submitForReview(req.user!.id, req.params.id);
      res.json(successResponse(p, "Project submitted for review"));
    } catch (err) {
      next(err);
    }
  },

  async myProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const q = myProjectsQuerySchema.parse(req.query);
      const { data, total, page, limit } = await projectService.getMyProjects(req.user!.id, q);
      res.json(paginate(data, page, limit, total));
    } catch (err) {
      next(err);
    }
  },

  // GET /me/mentored-projects (SENIOR) — projects where the caller is the mentor.
  async mentoredProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await projectService.getMentoredProjects(req.user!.id);
      res.json(successResponse(data, "Mentored projects retrieved"));
    } catch (err) {
      next(err);
    }
  },
};
