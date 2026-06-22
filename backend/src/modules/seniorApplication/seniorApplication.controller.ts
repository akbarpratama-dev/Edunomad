import { Request, Response, NextFunction } from "express";
import { seniorApplicationService } from "../../services/seniorApplication.service";
import { successResponse } from "../../utils/response";

export const seniorApplicationController = {
  // POST /projects/:id/senior-apply
  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await seniorApplicationService.applyAsMentor(
        req.user!.id,
        req.params.id,
        req.body?.message
      );
      res.status(201).json(successResponse(app, "Senior application submitted"));
    } catch (err) {
      next(err);
    }
  },

  // DELETE /senior-applications/:id
  async withdraw(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await seniorApplicationService.withdraw(req.user!.id, req.params.id);
      res.json(successResponse(app, "Senior application withdrawn"));
    } catch (err) {
      next(err);
    }
  },

  // GET /senior-applications (own)
  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await seniorApplicationService.listMine(req.user!.id);
      res.json(successResponse(data, "Senior applications retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // GET /projects/:id/senior-applications
  async listForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await seniorApplicationService.listForProject(req.user!.id, req.params.id);
      res.json(successResponse(data, "Senior applications retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // POST /senior-applications/:id/accept
  async accept(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await seniorApplicationService.accept(req.user!.id, req.params.id);
      res.json(successResponse(app, "Senior application accepted"));
    } catch (err) {
      next(err);
    }
  },

  // POST /senior-applications/:id/reject
  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await seniorApplicationService.reject(req.user!.id, req.params.id);
      res.json(successResponse(app, "Senior application rejected"));
    } catch (err) {
      next(err);
    }
  },
};
