import { supabase } from "@/lib/supabase/client";

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password });

export const signUp = (email: string, password: string) =>
  supabase.auth.signUp({ email, password });

export const signOut = () => supabase.auth.signOut();

export const getSession = () => supabase.auth.getSession();

// Sends a password-reset email. The link returns the user to /auth/reset-password
// with a recovery session, where they set a new password.
export const sendPasswordReset = (email: string) =>
  supabase.auth.resetPasswordForEmail(email, {
    redirectTo:
      typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined,
  });

// Updates the signed-in (recovery) user's password.
export const updatePassword = (password: string) => supabase.auth.updateUser({ password });
