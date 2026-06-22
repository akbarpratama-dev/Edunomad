import { Request, Response, NextFunction } from "express";
import { portfolioLinkService } from "../../services/portfolioLink.service";
import { successResponse } from "../../utils/response";

export const portfolioLinkController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await portfolioLinkService.list(req.user!.id);
      res.json(successResponse(items, "Portfolio links retrieved"));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await portfolioLinkService.create(req.user!.id, req.body);
      res.status(201).json(successResponse(created, "Portfolio link created"));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await portfolioLinkService.update(req.user!.id, req.params.id, req.body);
      res.json(successResponse(updated, "Portfolio link updated"));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await portfolioLinkService.remove(req.user!.id, req.params.id);
      res.json(successResponse(null, "Portfolio link deleted"));
    } catch (err) {
      next(err);
    }
  },
};
