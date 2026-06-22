import { Request, Response, NextFunction } from "express";
import { milestoneService } from "../../services/milestone.service";
import { successResponse } from "../../utils/response";

export const milestoneController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await milestoneService.list(req.params.id);
      res.json(successResponse(data, "Milestones retrieved"));
    } catch (err) {
      next(err);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const m = await milestoneService.create(req.user!.id, req.params.id, req.body);
      res.status(201).json(successResponse(m, "Milestone created"));
    } catch (err) {
      next(err);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const m = await milestoneService.update(req.user!.id, req.params.id, req.body);
      res.json(successResponse(m, "Milestone updated"));
    } catch (err) {
      next(err);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await milestoneService.remove(req.user!.id, req.params.id);
      res.json(successResponse(null, "Milestone deleted"));
    } catch (err) {
      next(err);
    }
  },
};
