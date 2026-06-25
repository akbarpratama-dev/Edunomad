import { Request, Response, NextFunction } from "express";
import { deliverableService } from "../../services/deliverable.service";
import { successResponse } from "../../utils/response";

export const deliverableController = {
  // GET /projects/:id/deliverables
  async listForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await deliverableService.listForProject(req.params.id);
      res.json(successResponse(data, "Deliverables retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // POST /projects/:id/deliverables
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await deliverableService.create(
        req.user!.id,
        req.params.id,
        req.body.title,
        req.body.description
      );
      res.status(201).json(successResponse(d, "Deliverable created"));
    } catch (err) {
      next(err);
    }
  },

  // PUT /deliverables/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await deliverableService.update(req.user!.id, req.params.id, {
        title: req.body.title,
        description: req.body.description,
      });
      res.json(successResponse(d, "Deliverable updated"));
    } catch (err) {
      next(err);
    }
  },

  // POST /deliverables/:id/submit
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await deliverableService.submit(req.user!.id, req.params.id, req.body.evidences);
      res.json(successResponse(d, "Deliverable submitted"));
    } catch (err) {
      next(err);
    }
  },

  // POST /deliverables/:id/approve
  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await deliverableService.approve(req.user!.id, req.params.id);
      res.json(successResponse(d, "Deliverable approved"));
    } catch (err) {
      next(err);
    }
  },

  // POST /deliverables/:id/request-revision
  async requestRevision(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await deliverableService.requestRevision(
        req.user!.id,
        req.params.id,
        req.body.feedback
      );
      res.json(successResponse(d, "Revision requested"));
    } catch (err) {
      next(err);
    }
  },
};
