import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt";
import { userRepository } from "../repositories/user.repository";
import { UnauthorizedError } from "../utils/errors";

// Short-lived in-memory cache of the app user (role/status) keyed by user id.
// The DB lives in a remote region (~0.25s round-trip), and EVERY authed request
// otherwise does a findById just to read role/status. Caching for a few seconds
// removes that round-trip from back-to-back requests (e.g. a dashboard firing
// several calls at once) while staying fresh enough that a verification/role
// change is reflected within the TTL. Call invalidateUserCache(id) after a
// write that changes a user's role/status to drop staleness immediately.
type CachedUser = { id: string; email: string; role: string; status: string };
const USER_TTL_MS = 15_000;
const userCache = new Map<string, { user: CachedUser; expires: number }>();

export function invalidateUserCache(userId: string): void {
  userCache.delete(userId);
}

async function loadAppUser(id: string): Promise<CachedUser | null> {
  const hit = userCache.get(id);
  if (hit && hit.expires > Date.now()) return hit.user;
  const appUser = await userRepository.findById(id);
  if (!appUser) return null;
  const user: CachedUser = {
    id: appUser.id,
    email: appUser.email,
    role: appUser.role,
    status: appUser.status,
  };
  userCache.set(id, { user, expires: Date.now() + USER_TTL_MS });
  return user;
}

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
    // (no app row yet) — those users can't access protected routes. Served from
    // a short-lived cache to avoid a DB round-trip on every request.
    const appUser = await loadAppUser(claims.id);
    if (!appUser) {
      throw new UnauthorizedError("User account not found");
    }

    req.user = appUser;
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
