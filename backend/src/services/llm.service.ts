import { env } from "../config/env";

// Provider-agnostic LLM transport (D-AI-1). Auto-resolves the provider from the
// env keys — Groq preferred (generous free tier), Gemini fallback. Both are
// called over plain fetch (no SDK). Every failure mode (no key, non-200,
// timeout, empty, bad JSON) collapses into AiUnavailableError so callers degrade
// gracefully and the core app never breaks.

export class AiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiUnavailableError";
  }
}

type Provider = "groq" | "gemini";

function resolveProvider(): Provider | null {
  if (env.groqApiKey) return "groq";
  if (env.geminiApiKey) return "gemini";
  return null;
}

interface GenerateJsonOptions {
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// Groq — OpenAI-compatible chat completions with JSON mode.
async function callGroq(prompt: string, opts: GenerateJsonOptions, signal: AbortSignal): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.groqApiKey}`,
    },
    body: JSON.stringify({
      model: env.groqModel,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxOutputTokens ?? 2048,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new AiUnavailableError(`Groq HTTP ${res.status} ${detail.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = json?.choices?.[0]?.message?.content;
  if (!text) throw new AiUnavailableError("Groq returned an empty response");
  return text;
}

// Gemini — v1beta generateContent with forced JSON.
async function callGemini(prompt: string, opts: GenerateJsonOptions, signal: AbortSignal): Promise<string> {
  const res = await fetch(`${GEMINI_BASE}/${env.geminiModel}:generateContent`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": env.geminiApiKey,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: opts.temperature ?? 0.2,
        maxOutputTokens: opts.maxOutputTokens ?? 2048,
        // Gemini 2.5 models "think" by default, consuming output tokens and
        // truncating the JSON. Disable it — these are structured-output tasks.
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new AiUnavailableError(`Gemini HTTP ${res.status} ${detail.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new AiUnavailableError("Gemini returned an empty response");
  return text;
}

export const llmService = {
  isEnabled(): boolean {
    return resolveProvider() !== null;
  },

  // The model string recorded alongside cached results (for provenance).
  activeModel(): string {
    const p = resolveProvider();
    return p === "groq" ? env.groqModel : p === "gemini" ? env.geminiModel : "none";
  },

  async generateJson<T>(prompt: string, opts: GenerateJsonOptions = {}): Promise<T> {
    const provider = resolveProvider();
    if (!provider) throw new AiUnavailableError("No AI provider configured");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15_000);
    try {
      const text =
        provider === "groq"
          ? await callGroq(prompt, opts, controller.signal)
          : await callGemini(prompt, opts, controller.signal);
      // Strip stray markdown code fences some models add despite JSON mode.
      const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
      try {
        return JSON.parse(cleaned) as T;
      } catch {
        throw new AiUnavailableError(`${provider} returned non-JSON output`);
      }
    } catch (err) {
      const wrapped =
        err instanceof AiUnavailableError
          ? err
          : new AiUnavailableError(err instanceof Error ? err.message : String(err));
      // Server-side only (never sent to the client) — diagnoses key/model/quota
      // issues without leaking details in the API response.
      console.warn("[AI] LLM call failed:", wrapped.message);
      throw wrapped;
    } finally {
      clearTimeout(timeout);
    }
  },
};
