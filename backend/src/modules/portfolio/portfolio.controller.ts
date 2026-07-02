import { Request, Response, NextFunction } from "express";
import { portfolioService } from "../../services/portfolio.service";
import { successResponse } from "../../utils/response";

export const portfolioController = {
  // GET /portfolio/:userId (PUBLIC)
  async publicPortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await portfolioService.getPublicPortfolio(req.params.userId);
      res.json(successResponse(data, "Portfolio retrieved"));
    } catch (err) {
      next(err);
    }
  },
};
