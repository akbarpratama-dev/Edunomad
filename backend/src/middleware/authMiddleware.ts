import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase";
import { userRepository } from "../repositories/user.repository";
import { UnauthorizedError } from "../utils/errors";

// Extracts and validates the Supabase JWT from `Authorization: Bearer <token>`,
// then loads the app user (role/status) from public.users and attaches it to
// req.user. Token validation uses supabase.auth.getUser(token), which works
// regardless of symmetric/asymmetric signing keys (confirmed via Supabase docs).
// ARCH Authentication Rules: never implement custom JWT logic.
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

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    // The Supabase Auth user is valid, but app-level role/status live in
    // public.users. A token can be valid before registration is completed
    // (no app row yet) — those users can't access protected routes.
    const appUser = await userRepository.findById(data.user.id);
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

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    req.supabaseUser = { id: data.user.id, email: data.user.email ?? "" };
    next();
  } catch (err) {
    next(err);
  }
}
