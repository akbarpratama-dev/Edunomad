import { Request, Response, NextFunction } from "express";
import { discussionService } from "../../services/discussion.service";
import { successResponse, paginatedResponse } from "../../utils/response";

export const discussionController = {
  // GET /projects/:id/discussions
  async listForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await discussionService.listProjectDiscussions(req.user!.id, req.params.id);
      res.json(successResponse(data, "Discussions retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // POST /projects/:id/discussions
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const discussion = await discussionService.createGroupDiscussion(
        req.user!.id,
        req.params.id,
        { title: req.body.title, category: req.body.category },
        req.body.members
      );
      res.status(201).json(successResponse(discussion, "Discussion created"));
    } catch (err) {
      next(err);
    }
  },

  // POST /discussions/:id/pin
  async pin(req: Request, res: Response, next: NextFunction) {
    try {
      const discussion = await discussionService.pinDiscussion(
        req.user!.id,
        req.params.id,
        req.body.pinned
      );
      res.json(successResponse(discussion, "Discussion updated"));
    } catch (err) {
      next(err);
    }
  },

  // GET /discussions/:id/messages
  async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 20);
      const { data, meta } = await discussionService.getMessages(
        req.user!.id,
        req.params.id,
        page,
        limit
      );
      res.json(paginatedResponse(data, meta));
    } catch (err) {
      next(err);
    }
  },

  // POST /discussions/:id/messages
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const msg = await discussionService.sendMessage(
        req.user!.id,
        req.params.id,
        req.body.message
      );
      res.status(201).json(successResponse(msg, "Message sent"));
    } catch (err) {
      next(err);
    }
  },
};
