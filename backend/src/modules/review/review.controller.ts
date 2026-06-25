import { Request, Response, NextFunction } from "express";
import { reviewService } from "../../services/review.service";
import { successResponse } from "../../utils/response";

export const reviewController = {
  // POST /projects/:id/reviews/beginner
  async reviewBeginner(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await reviewService.reviewBeginner(
        req.user!.id,
        req.params.id,
        req.body.reviewee_id,
        req.body.rating,
        req.body.comment
      );
      res.status(201).json(successResponse(r, "Review submitted"));
    } catch (err) {
      next(err);
    }
  },

  // POST /projects/:id/reviews/senior
  async reviewSenior(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await reviewService.reviewSenior(
        req.user!.id,
        req.params.id,
        req.body.rating,
        req.body.comment
      );
      res.status(201).json(successResponse(r, "Review submitted"));
    } catch (err) {
      next(err);
    }
  },

  // PUT /reviews/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await reviewService.editReview(req.user!.id, req.params.id, {
        rating: req.body.rating,
        comment: req.body.comment,
      });
      res.json(successResponse(r, "Review updated"));
    } catch (err) {
      next(err);
    }
  },

  // GET /projects/:id/reviews
  async listForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reviewService.getProjectReviews(req.params.id);
      res.json(successResponse(data, "Reviews retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // GET /users/:id/reviews
  async listForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reviewService.getUserReviews(req.params.id);
      res.json(successResponse(data, "Reviews retrieved"));
    } catch (err) {
      next(err);
    }
  },
};
