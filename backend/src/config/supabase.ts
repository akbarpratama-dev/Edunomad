import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Server-side Supabase client using the service role key. The backend is
// trusted server code: this client bypasses RLS and is used for admin auth
// operations (signup/createUser, etc.). Bearer-token validation no longer goes
// through here — authMiddleware verifies JWTs locally against the JWKS
// (config/jwt.ts) to avoid a remote round-trip per request.
// Never expose the service role key to the frontend.
export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
