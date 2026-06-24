import { Request, Response, NextFunction } from "express";
import { directMessageService } from "../../services/directMessage.service";
import { successResponse, paginatedResponse } from "../../utils/response";

export const directMessageController = {
  // POST /users/:id/direct-chat  (param id = target user)
  async createOrGet(req: Request, res: Response, next: NextFunction) {
    try {
      const chat = await directMessageService.createOrGetDirectChat(req.user!.id, req.params.id);
      res.json(successResponse(chat, "Direct chat ready"));
    } catch (err) {
      next(err);
    }
  },

  // GET /direct-chat/:id/messages
  async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 20);
      const { data, meta } = await directMessageService.getMessages(
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

  // POST /direct-chat/:id/messages
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const msg = await directMessageService.sendMessage(
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
