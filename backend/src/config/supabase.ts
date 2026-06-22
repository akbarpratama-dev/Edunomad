import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Server-side Supabase client using the service role key. The backend is
// trusted server code: this client bypasses RLS and is used for
// (1) validating bearer tokens via auth.getUser(token) in authMiddleware, and
// (2) admin auth operations (createUser, etc.) in later phases.
// Never expose the service role key to the frontend.
export const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
