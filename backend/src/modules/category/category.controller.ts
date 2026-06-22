import { Request, Response, NextFunction } from "express";
import { categoryService } from "../../services/category.service";
import { successResponse, paginatedResponse } from "../../utils/response";
import { categoryListQuerySchema } from "../../validators/category.validator";

export const categoryController = {
  // GET /categories (public, paginated)
  async listPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = categoryListQuerySchema.parse(req.query);
      const { data, total } = await categoryService.list(page, limit);
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

  // GET /admin/categories (ADMIN)
  async listAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await categoryService.listAll();
      res.json(successResponse(data, "Categories retrieved"));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await categoryService.create(req.body);
      res.status(201).json(successResponse(created, "Category created"));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await categoryService.update(req.params.id, req.body);
      res.json(successResponse(updated, "Category updated"));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await categoryService.remove(req.params.id);
      res.json(successResponse(null, "Category deleted"));
    } catch (err) {
      next(err);
    }
  },
};
