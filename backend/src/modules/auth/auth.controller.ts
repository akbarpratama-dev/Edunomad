import { Request, Response, NextFunction } from "express";
import { authService } from "../../services/auth.service";
import { supabaseAdmin } from "../../config/supabase";
import { successResponse } from "../../utils/response";

export const authController = {
  // POST /api/v1/auth/signup (public)
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body);
      res.status(201).json(successResponse(result, "Account created"));
    } catch (err) {
      next(err);
    }
  },

  // GET /api/v1/auth/me
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(req.user!.id);
      res.json(successResponse(user, "Current user retrieved"));
    } catch (err) {
      next(err);
    }
  },

  // POST /api/v1/auth/register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.register(req.supabaseUser!, req.body);
      res.status(201).json(successResponse(user, "Registration completed"));
    } catch (err) {
      next(err);
    }
  },

  // POST /api/v1/auth/logout
  // JWTs are stateless; the frontend clears its own session via
  // supabase.auth.signOut(). Here we best-effort revoke the refresh token
  // server-side so the session can't be silently refreshed.
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const header = req.headers.authorization;
      if (header?.startsWith("Bearer ")) {
        const token = header.slice("Bearer ".length).trim();
        await supabaseAdmin.auth.admin.signOut(token).catch(() => undefined);
      }
      res.json(successResponse(null, "Logged out"));
    } catch (err) {
      next(err);
    }
  },
};
