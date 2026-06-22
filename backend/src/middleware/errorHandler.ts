import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { AppError, NotFoundError, ValidationError } from "../utils/errors";
import { errorResponse } from "../utils/response";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    const errors = err instanceof ValidationError ? err.errors : undefined;
    res.status(err.statusCode).json(errorResponse(err.message, errors));
    return;
  }

  console.error(err);
  res.status(500).json(errorResponse("Internal server error"));
};
