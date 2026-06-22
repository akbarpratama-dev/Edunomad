import { Request, Response, NextFunction } from "express";
import { experienceService } from "../../services/experience.service";
import { successResponse } from "../../utils/response";

export const experienceController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await experienceService.list(req.user!.id);
      res.json(successResponse(items, "Experiences retrieved"));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await experienceService.create(req.user!.id, req.body);
      res.status(201).json(successResponse(created, "Experience created"));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await experienceService.update(req.user!.id, req.params.id, req.body);
      res.json(successResponse(updated, "Experience updated"));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await experienceService.remove(req.user!.id, req.params.id);
      res.json(successResponse(null, "Experience deleted"));
    } catch (err) {
      next(err);
    }
  },
};
