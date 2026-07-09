import { Request, Response, NextFunction } from "express";
import { projectLifecycleService } from "../../services/projectLifecycle.service";
import { successResponse } from "../../utils/response";

export const projectLifecycleController = {
  // POST /projects/:id/start (SENIOR lead)
  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectLifecycleService.startProject(req.user!.id, req.params.id);
      res.json(successResponse(project, "Project started"));
    } catch (err) {
      next(err);
    }
  },

  // POST /projects/:id/complete (SENIOR lead) — one-click finalize + auto-issue
  // certificates (revised flow D-P14-1). Client sends the verify page base URL.
  async completeProject(req: Request, res: Response, next: NextFunction) {
    try {
      const verificationBase =
        typeof req.body?.verification_url === "string" && req.body.verification_url
          ? req.body.verification_url
          : `${req.protocol}://${req.get("host")}/verify`;
      const project = await projectLifecycleService.completeProject(
        req.user!.id,
        req.params.id,
        verificationBase
      );
      res.json(successResponse(project, "Project completed"));
    } catch (err) {
      next(err);
    }
  },

  // POST /projects/:id/confirm-completion (UMKM owner) — legacy two-step path,
  // kept for back-compat with any project already AWAITING_COMPLETION.
  async confirmCompletion(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectLifecycleService.confirmCompletion(req.user!.id, req.params.id);
      res.json(successResponse(project, "Project completed"));
    } catch (err) {
      next(err);
    }
  },
};
