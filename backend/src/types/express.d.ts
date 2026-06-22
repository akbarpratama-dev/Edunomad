import type { AuthUser } from "./auth";

// Augment Express's Request so req.user is typed everywhere after authMiddleware.
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      // Set by requireSupabaseUser: a validated Supabase identity that may NOT
      // yet have a public.users row (used by registration).
      supabaseUser?: { id: string; email: string };
    }
  }
}

export {};
