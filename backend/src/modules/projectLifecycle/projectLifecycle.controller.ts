import { Request, Response, NextFunction } from "express";
import { projectLifecycleService } from "../../services/projectLifecycle.service";
import { successResponse } from "../../utils/response";

export const projectLifecycleController = {
  // POST /projects/:id/start (SENIOR lead)
  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectLifecycleService.startProject(req.user!.id, req.params.id);
      res.json(successResponse(project, "Project started"));
    } catch (err) {
      next(err);
    }
  },

  // POST /projects/:id/complete (SENIOR lead)
  async requestCompletion(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectLifecycleService.requestCompletion(req.user!.id, req.params.id);
      res.json(successResponse(project, "Completion requested"));
    } catch (err) {
      next(err);
    }
  },

  // POST /projects/:id/confirm-completion (UMKM owner)
  async confirmCompletion(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectLifecycleService.confirmCompletion(req.user!.id, req.params.id);
      res.json(successResponse(project, "Project completed"));
    } catch (err) {
      next(err);
    }
  },
};
