// The authenticated user attached to req.user by authMiddleware.
// role/status are the app-level values from public.users (ADMIN/UMKM/SENIOR/
// BEGINNER and PENDING_VERIFICATION/VERIFIED/REJECTED/SUSPENDED), NOT Supabase
// Auth's built-in claims.
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  status: string;
}
