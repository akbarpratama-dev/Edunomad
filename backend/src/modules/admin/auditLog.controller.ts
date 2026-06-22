import { Request, Response, NextFunction } from "express";
import { auditLogService } from "../../services/auditLog.service";
import { paginatedResponse } from "../../utils/response";
import { auditLogQuerySchema } from "../../validators/auditLog.validator";

export const auditLogController = {
  // GET /admin/audit-logs (ADMIN)
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const q = auditLogQuerySchema.parse(req.query);
      const { data, total, page, limit } = await auditLogService.getAuditLogs({
        userId: q.user_id,
        action: q.action,
        entityType: q.entity_type,
        page: q.page,
        limit: q.limit,
      });
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
};
