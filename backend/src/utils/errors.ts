export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends AppError {
  errors?: Record<string, unknown>;

  constructor(message = "Validation failed", errors?: Record<string, unknown>) {
    super(message, 400);
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

// 422: request is well-formed but violates a documented business rule
// (e.g. docs/06-RBAC_and_Business_Rules.md), not a validation/auth failure.
export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(message, 422);
  }
}

// 403: authenticated but account is not VERIFIED — blocks the restricted
// actions in docs/06-RBAC_and_Business_Rules.md Rule 1.
export class UnverifiedUserError extends AppError {
  constructor(message = "Account not verified") {
    super(message, 403);
  }
}

// 403: account suspended by admin — blocks all platform features
// (docs/06-RBAC_and_Business_Rules.md Rule 3).
export class SuspendedUserError extends AppError {
  constructor(message = "Account has been suspended") {
    super(message, 403);
  }
}
