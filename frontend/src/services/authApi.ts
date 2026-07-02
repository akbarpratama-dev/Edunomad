import { apiClient, ApiError } from "@/lib/apiClient";
import type { AppUser } from "@/types/user";

// Backend envelope: { success, message, data }.
interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface RegisterPayload {
  name: string;
  role: "BEGINNER" | "SENIOR" | "UMKM";
  profile: {
    bio?: string;
    headline?: string;
    phone?: string;
    linkedin_url?: string;
    photo?: string;
  };
  skills: { skill_id: string; level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }[];
  experiences: {
    title: string;
    organization: string;
    description?: string;
    start_date: string;
    end_date?: string | null;
  }[];
  portfolio_links: { title: string; url: string; type: string }[];
}

// GET /auth/me — returns the app user, or null ONLY when the account doesn't
// exist yet (signed up but registration not completed → backend 404 "User not
// found"). Any other failure (401 invalid token, 429 rate limit, 5xx, network)
// is propagated: a transient error must never be mistaken for "unregistered",
// which would bounce a real, registered user into the registration wizard.
export async function fetchMe(): Promise<AppUser | null> {
  try {
    const res = await apiClient.get<Envelope<AppUser>>("/auth/me");
    return res.data.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

// POST /auth/signup — creates the email-confirmed Supabase Auth user (Step 1).
export async function signupAccount(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ id: string; email: string }> {
  const res = await apiClient.post<Envelope<{ id: string; email: string }>>(
    "/auth/signup",
    input
  );
  return res.data.data;
}

export async function registerUser(payload: RegisterPayload): Promise<AppUser> {
  const res = await apiClient.post<Envelope<AppUser>>("/auth/register", payload);
  return res.data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout").catch(() => undefined);
}
