import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt";
import { userRepository } from "../repositories/user.repository";
import { UnauthorizedError } from "../utils/errors";

// Extracts and validates the Supabase JWT from `Authorization: Bearer <token>`,
// then loads the app user (role/status) from public.users and attaches it to
// req.user. Token validation is done LOCALLY against Supabase's JWKS (asymmetric
// ES256 keys) — the Supabase-recommended server pattern — instead of a remote
// auth.getUser() round-trip on every request. ARCH Authentication Rules: still
// Supabase JWT verification (their published keys), no custom signing logic.
export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed Authorization header");
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw new UnauthorizedError("Missing access token");
    }

    let claims;
    try {
      claims = await verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }

    // The Supabase token is valid, but app-level role/status live in
    // public.users. A token can be valid before registration is completed
    // (no app row yet) — those users can't access protected routes.
    const appUser = await userRepository.findById(claims.id);
    if (!appUser) {
      throw new UnauthorizedError("User account not found");
    }

    req.user = {
      id: appUser.id,
      email: appUser.email,
      role: appUser.role,
      status: appUser.status,
    };
    next();
  } catch (err) {
    next(err);
  }
}

// Lenient variant: validates the Supabase JWT but does NOT require a
// public.users row. Used by POST /auth/register, where the app account is
// about to be created. Attaches req.supabaseUser = { id, email }.
export async function requireSupabaseUser(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed Authorization header");
    }
    const token = header.slice("Bearer ".length).trim();
    if (!token) throw new UnauthorizedError("Missing access token");

    let claims;
    try {
      claims = await verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }

    req.supabaseUser = { id: claims.id, email: claims.email };
    next();
  } catch (err) {
    next(err);
  }
}
