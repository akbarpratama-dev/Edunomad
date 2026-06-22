import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import type { AppUser } from "@/types/user";

interface AuthState {
  user: User | null; // Supabase Auth user
  appUser: AppUser | null; // public.users row (role/status) from GET /auth/me
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setAppUser: (appUser: AppUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  appUser: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  setSession: (session) =>
    set({ session, user: session?.user ?? null, isAuthenticated: !!session }),
  setAppUser: (appUser) => set({ appUser }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ user: null, appUser: null, session: null, isAuthenticated: false }),
}));
