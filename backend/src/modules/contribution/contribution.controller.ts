import { Request, Response, NextFunction } from "express";
import { contributionService } from "../../services/contribution.service";
import { successResponse } from "../../utils/response";

export const contributionController = {
  // GET /projects/:id/contributions
  async listForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await contributionService.listForProject(req.params.id);
      res.json(successResponse(data, "Contributions retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // POST /projects/:id/contributions
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const c = await contributionService.submit(
        req.user!.id,
        req.params.id,
        req.body.contribution_summary,
        req.body.skills
      );
      res.status(201).json(successResponse(c, "Contribution submitted"));
    } catch (err) {
      next(err);
    }
  },

  // PUT /contributions/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const c = await contributionService.update(req.user!.id, req.params.id, {
        contributionSummary: req.body.contribution_summary,
        skillIds: req.body.skills,
      });
      res.json(successResponse(c, "Contribution updated"));
    } catch (err) {
      next(err);
    }
  },

  // POST /contributions/:id/approve
  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const c = await contributionService.approve(req.user!.id, req.params.id);
      res.json(successResponse(c, "Contribution approved"));
    } catch (err) {
      next(err);
    }
  },
};
