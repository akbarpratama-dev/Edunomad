import { Request, Response, NextFunction } from "express";
import { projectApplicationService } from "../../services/projectApplication.service";
import { successResponse } from "../../utils/response";

export const projectApplicationController = {
  // POST /projects/:id/apply
  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await projectApplicationService.applyToRole(
        req.user!.id,
        req.params.id,
        req.body.project_role_id,
        req.body?.motivation
      );
      res.status(201).json(successResponse(app, "Application submitted"));
    } catch (err) {
      next(err);
    }
  },

  // DELETE /applications/:id
  async withdraw(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await projectApplicationService.withdraw(req.user!.id, req.params.id);
      res.json(successResponse(app, "Application withdrawn"));
    } catch (err) {
      next(err);
    }
  },

  // GET /applications (own)
  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await projectApplicationService.listMine(req.user!.id);
      res.json(successResponse(data, "Applications retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // GET /projects/:id/applications
  async listForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await projectApplicationService.listForProject(req.user!.id, req.params.id);
      res.json(successResponse(data, "Applications retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // POST /applications/:id/accept
  async accept(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await projectApplicationService.accept(req.user!.id, req.params.id);
      res.json(successResponse(app, "Application accepted"));
    } catch (err) {
      next(err);
    }
  },

  // POST /applications/:id/reject
  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await projectApplicationService.reject(req.user!.id, req.params.id);
      res.json(successResponse(app, "Application rejected"));
    } catch (err) {
      next(err);
    }
  },
};
