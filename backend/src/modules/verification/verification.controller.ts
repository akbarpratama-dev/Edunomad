import { Request, Response, NextFunction } from "express";
import { verificationService } from "../../services/verification.service";
import { successResponse, paginatedResponse } from "../../utils/response";
import { listVerificationsQuerySchema } from "../../validators/verification.validator";

export const verificationController = {
  // GET /verification-status (authenticated)
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await verificationService.getStatus(req.user!.id);
      res.json(successResponse(status, "Verification status retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // POST /verification-request (authenticated)
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await verificationService.submitRequest(req.user!.id, req.body);
      res.status(201).json(successResponse(request, "Verification request submitted"));
    } catch (err) {
      next(err);
    }
  },

  // GET /admin/verifications (ADMIN)
  async adminList(req: Request, res: Response, next: NextFunction) {
    try {
      const q = listVerificationsQuerySchema.parse(req.query);
      const { data, total, page, limit } = await verificationService.getPending(q);
      res.json(
        paginatedResponse(data, {
          page,
          limit,
          total,
          lastPage: Math.max(1, Math.ceil(total / limit)),
        })
      );
    } catch (err) {
      next(err);
    }
  },

  // POST /admin/verifications/:id/approve (ADMIN)
  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await verificationService.approve(req.user!.id, req.params.id);
      res.json(successResponse(result, "Verification approved"));
    } catch (err) {
      next(err);
    }
  },

  // POST /admin/verifications/:id/reject (ADMIN)
  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await verificationService.reject(req.user!.id, req.params.id, req.body.reason);
      res.json(successResponse(result, "Verification rejected"));
    } catch (err) {
      next(err);
    }
  },
};
