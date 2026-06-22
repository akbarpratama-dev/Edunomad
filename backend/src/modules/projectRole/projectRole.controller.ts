import { Request, Response, NextFunction } from "express";
import { projectRoleService } from "../../services/projectRole.service";
import { successResponse } from "../../utils/response";

export const projectRoleController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await projectRoleService.list(req.params.id);
      res.json(successResponse(data, "Roles retrieved"));
    } catch (err) {
      next(err);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await projectRoleService.create(req.user!.id, req.params.id, req.body);
      res.status(201).json(successResponse(r, "Role created"));
    } catch (err) {
      next(err);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await projectRoleService.update(req.user!.id, req.params.id, req.body);
      res.json(successResponse(r, "Role updated"));
    } catch (err) {
      next(err);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await projectRoleService.remove(req.user!.id, req.params.id);
      res.json(successResponse(null, "Role deleted"));
    } catch (err) {
      next(err);
    }
  },
};
