import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Keep DB connections warm. The database lives in a remote Supabase region
// (ap-south-1), so a cold connection pays a full TLS handshake (~1.5-2.5s). The
// pg pool's default 10s idle timeout closes connections between clicks, making
// the next request re-handshake — the "gap" users feel after a short pause.
// keepAlive + no idle timeout hold a small warm pool so warm queries stay ~0.5s.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  keepAlive: true,
  idleTimeoutMillis: 0, // never auto-close idle connections while the server runs
  max: 5,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.nodeEnv === "development" ? ["error", "warn"] : ["error"],
  });

if (env.nodeEnv !== "production") {
  globalForPrisma.prisma = prisma;
}
