import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: process.env.PORT ?? 3001,
  nodeEnv: process.env.NODE_ENV ?? "development",
  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  // --- AI (LLM) — SOFT/optional. The app must boot and the core recruitment
  // flow must keep working even when no key is set, so these are deliberately
  // NOT required(). Provider is auto-resolved: Groq preferred, Gemini fallback
  // (D-AI-1). Whichever key is present wins; if none, `aiEnabled` is false.
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  groqModel: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  get aiEnabled(): boolean {
    return (
      (process.env.GROQ_API_KEY ?? "").length > 0 ||
      (process.env.GEMINI_API_KEY ?? "").length > 0
    );
  },
  // DEMO ONLY — when true, "Selesaikan Proyek" skips the Workflow 15 readiness
  // gate (deliverables/contributions/reviews) and issues certificates with
  // placeholder data so an expo demo can complete a project in one click.
  // Leave unset/false in real use so certificates stay backed by real work.
  get demoCompleteBypass(): boolean {
    return (process.env.DEMO_COMPLETE_BYPASS ?? "").toLowerCase() === "true";
  },
};
