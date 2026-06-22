// App-level user (public.users + profile), returned by GET /api/v1/auth/me.
// Distinct from the Supabase Auth user.
export type Role = "ADMIN" | "UMKM" | "SENIOR" | "BEGINNER";
export type AccountStatus =
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED";

export interface AppUserProfile {
  headline: string | null;
  bio: string | null;
  phone: string | null;
  photo: string | null;
  linkedinUrl: string | null;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  profile?: AppUserProfile | null;
}
