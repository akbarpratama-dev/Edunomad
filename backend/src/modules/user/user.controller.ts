import { Request, Response, NextFunction } from "express";
import { userService } from "../../services/user.service";
import { successResponse } from "../../utils/response";

export const userController = {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await userService.getMyProfile(req.user!.id);
      res.json(successResponse(profile, "Profile retrieved"));
    } catch (err) {
      next(err);
    }
  },

  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await userService.updateMyProfile(req.user!.id, req.body);
      res.json(successResponse(profile, "Profile updated"));
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await userService.getUserProfile(req.params.id);
      res.json(successResponse(profile, "Profile retrieved"));
    } catch (err) {
      next(err);
    }
  },

  async getPortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const portfolio = await userService.getUserPortfolio(req.params.id);
      res.json(successResponse(portfolio, "Portfolio retrieved"));
    } catch (err) {
      next(err);
    }
  },
};
