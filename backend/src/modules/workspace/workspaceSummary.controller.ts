import { Request, Response, NextFunction } from "express";
import { workspaceSummaryService } from "../../services/workspaceSummary.service";
import { successResponse } from "../../utils/response";

export const workspaceSummaryController = {
  // GET /projects/:id/workspace-summary — role-aware "needs attention" counts
  // for the workspace tab badges.
  async summary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await workspaceSummaryService.getSummary(req.user!.id, req.params.id);
      res.json(successResponse(data, "Workspace summary"));
    } catch (err) {
      next(err);
    }
  },
};
