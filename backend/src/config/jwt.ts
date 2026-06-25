import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "./env";

// Local Supabase JWT verification (asymmetric ES256 signing keys) — the
// Supabase-recommended server pattern. Avoids a remote auth.getUser() round-trip
// on every request: the JWKS is fetched once and cached (auto-refetched on key
// rotation), and signature + expiry are checked locally.
const ISSUER = `${env.supabaseUrl}/auth/v1`;
const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));

export interface VerifiedToken {
  id: string; // sub claim = public.users.id (== auth.uid)
  email: string;
}

// Throws if the token is invalid, expired, or from another issuer.
export async function verifyAccessToken(token: string): Promise<VerifiedToken> {
  const { payload } = await jwtVerify(token, JWKS, { issuer: ISSUER });
  if (!payload.sub) throw new Error("Token missing sub claim");
  return {
    id: payload.sub,
    email: typeof payload.email === "string" ? payload.email : "",
  };
}
