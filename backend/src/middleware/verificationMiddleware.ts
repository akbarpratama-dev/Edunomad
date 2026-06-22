import { Request, Response, NextFunction } from "express";
import { SuspendedUserError, UnauthorizedError, UnverifiedUserError } from "../utils/errors";

// docs/06-RBAC_and_Business_Rules.md account status values.
const VERIFIED = "VERIFIED";
const SUSPENDED = "SUSPENDED";
const PENDING = "PENDING_VERIFICATION";

// Rule 1: only VERIFIED users may perform restricted actions (apply, create
// project, generate artifact, review). Use this on those routes.
export function requireVerified(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new UnauthorizedError("Authentication required"));

  if (req.user.status === SUSPENDED) {
    return next(new SuspendedUserError());
  }
  if (req.user.status !== VERIFIED) {
    return next(new UnverifiedUserError("User must be verified to perform this action"));
  }
  next();
}

// Rule 2 + Rule 3: PENDING_VERIFICATION and VERIFIED users may use
// profile-building features (edit profile, add skills/experience). REJECTED and
// SUSPENDED users are blocked from all access. Use this on profile/skills/
// experience/portfolio write routes.
export function requireActiveAccount(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new UnauthorizedError("Authentication required"));

  if (req.user.status === SUSPENDED) {
    return next(new SuspendedUserError());
  }
  if (req.user.status !== VERIFIED && req.user.status !== PENDING) {
    // REJECTED (or any non-active status) → no access.
    return next(new UnverifiedUserError("Account is not active"));
  }
  next();
}
