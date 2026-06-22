import { Request, Response, NextFunction } from "express";
import { projectMemberService } from "../../services/projectMember.service";
import { successResponse } from "../../utils/response";

export const projectMemberController = {
  // GET /projects/:id/members
  async listForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await projectMemberService.listMembers(req.params.id);
      res.json(successResponse(data, "Members retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // POST /members/:id/remove (SENIOR lead)
  async requestRemoval(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await projectMemberService.requestRemoval(
        req.user!.id,
        req.params.id,
        req.body.reason
      );
      res.json(successResponse(member, "Member removal requested"));
    } catch (err) {
      next(err);
    }
  },

  // POST /members/:id/withdraw (member)
  async withdraw(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await projectMemberService.withdraw(req.user!.id, req.params.id);
      res.json(successResponse(member, "Withdrawn from project"));
    } catch (err) {
      next(err);
    }
  },

  // POST /admin/members/:id/remove (ADMIN)
  async confirmRemoval(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await projectMemberService.confirmRemoval(req.user!.id, req.params.id);
      res.json(successResponse(member, "Member removed"));
    } catch (err) {
      next(err);
    }
  },
};
