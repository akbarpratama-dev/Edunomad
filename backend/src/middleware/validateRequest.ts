import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ValidationError } from "../utils/errors";

interface ValidationSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

const formatIssues = (issues: { path: PropertyKey[]; message: string }[]) =>
  issues.reduce<Record<string, string>>((acc, issue) => {
    acc[issue.path.join(".") || "_"] = issue.message;
    return acc;
  }, {});

export const validateRequest = (schemas: ValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        return next(new ValidationError("Validation failed", formatIssues(result.error.issues)));
      }
      req.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        return next(new ValidationError("Validation failed", formatIssues(result.error.issues)));
      }
      req.params = result.data as typeof req.params;
    }

    if (schemas.query) {
      // req.query is a getter-only property in Express 5 — validate it but
      // don't reassign; controllers read the original req.query as usual.
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        return next(new ValidationError("Validation failed", formatIssues(result.error.issues)));
      }
    }

    next();
  };
};
