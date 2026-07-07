import { createHash } from "crypto";
import { z } from "zod";
import type { Prisma } from "../generated/prisma/client";
import { llmService, AiUnavailableError } from "./llm.service";
import { aiInsightRepository } from "../repositories/aiInsight.repository";
import { AiInsightKind } from "../constants/aiInsightKind";
import { userService } from "./user.service";
import { projectRepository } from "../repositories/project.repository";
import { projectApplicationRepository } from "../repositories/projectApplication.repository";
import { ApplicationStatus } from "../constants/applicationStatus";
import { NotFoundError, ForbiddenError } from "../utils/errors";

// AI feature/domain logic (D-AI-1). Gathers data via existing services, builds
// prompts, calls Gemini, validates the JSON, and caches the result. Every path
// degrades gracefully: on missing key / AI failure the caller gets
// { available: false, reason } (HTTP 200) — the core recruitment flow never
// breaks.

// ---- Result envelope -------------------------------------------------------

export type AiResult<T> =
  | { available: true; cached: boolean; generatedAt: string; data: T }
  | { available: false; reason: string };

const UNAVAILABLE = (reason: string): AiResult<never> => ({ available: false, reason });

// ---- Helpers ---------------------------------------------------------------

function sha256(obj: unknown): string {
  return createHash("sha256").update(JSON.stringify(obj)).digest("hex");
}

function clip(s: string | null | undefined, n: number): string {
  return (s ?? "").trim().slice(0, n);
}

// Generic cache-or-generate wrapper. `parse` validates/clamps the model output;
// its failure is treated as "AI unavailable" (never a 5xx).
async function cachedInsight<T>(params: {
  kind: AiInsightKind;
  subjectUserId: string;
  projectId: string | null;
  inputs: unknown;
  prompt: string;
  parse: (raw: unknown) => T;
  regenerate: boolean;
}): Promise<AiResult<T>> {
  const inputHash = sha256(params.inputs);

  if (!params.regenerate) {
    const row = await aiInsightRepository.findFresh(
      params.kind,
      params.subjectUserId,
      params.projectId,
      inputHash
    );
    if (row) {
      try {
        return {
          available: true,
          cached: true,
          generatedAt: row.updatedAt.toISOString(),
          data: params.parse(row.resultJson),
        };
      } catch {
        /* stale/incompatible cache shape → fall through and recompute */
      }
    }
  }

  if (!llmService.isEnabled()) {
    return UNAVAILABLE("Fitur AI belum aktif (API key belum diatur).");
  }

  try {
    const raw = await llmService.generateJson<unknown>(params.prompt);
    const data = params.parse(raw);
    const saved = await aiInsightRepository.upsert({
      kind: params.kind,
      subjectUserId: params.subjectUserId,
      projectId: params.projectId,
      inputHash,
      resultJson: data as unknown as Prisma.InputJsonValue,
      model: llmService.activeModel(),
    });
    return { available: true, cached: false, generatedAt: saved.updatedAt.toISOString(), data };
  } catch (err) {
    if (err instanceof AiUnavailableError) {
      return UNAVAILABLE("Layanan AI sedang tidak tersedia. Coba lagi nanti.");
    }
    throw err; // genuine bug → normal error path
  }
}

// ---- Output schemas (defensive) -------------------------------------------

const portfolioRecSchema = z.object({
  recommendedItems: z
    .array(
      z.object({
        type: z.enum(["SKILL", "CERTIFICATE", "EXPERIENCE"]).catch("SKILL"),
        label: z.string().max(120),
        reason: z.string().max(400),
      })
    )
    .max(12)
    .default([]),
  suggestedHighlights: z.array(z.string().max(160)).max(8).default([]),
  overallAdvice: z.string().max(600).default(""),
});
export type PortfolioRec = z.infer<typeof portfolioRecSchema>;

const rankingSchema = z.object({
  rankings: z
    .array(
      z.object({
        applicationId: z.string(),
        score: z.number().min(0).max(100).catch(0),
        matchedSkills: z.array(z.string().max(60)).max(20).default([]),
        missingSkills: z.array(z.string().max(60)).max(20).default([]),
        reason: z.string().max(400).default(""),
      })
    )
    .default([]),
});
export type ApplicantRanking = z.infer<typeof rankingSchema>;

const summarySchema = z.object({
  summary: z.string().max(1000).default(""),
  strengths: z.array(z.string().max(120)).max(8).default([]),
  suggestedRoles: z.array(z.string().max(80)).max(6).default([]),
});
export type ProfileSummary = z.infer<typeof summarySchema>;

function makeParser<T>(schema: z.ZodType<T>) {
  return (raw: unknown): T => {
    const r = schema.safeParse(raw);
    if (!r.success) throw new AiUnavailableError("AI output shape mismatch");
    return r.data;
  };
}

// ---- Compact input builders (bounded token usage) --------------------------

function candidatePayload(overview: Awaited<ReturnType<typeof userService.getProfileOverview>>) {
  return {
    name: overview.user.name,
    role: overview.user.role,
    headline: clip(overview.profile?.headline, 160),
    bio: clip(overview.profile?.bio, 500),
    skills: overview.skills.map((s) => ({ name: s.skill.name, level: s.level })),
    experiences: overview.experiences
      .slice(0, 10)
      .map((e) => ({ title: clip(e.title, 120), org: clip(e.organization, 120) })),
    certificates: overview.artifacts.slice(0, 10).map((a) => ({
      project: clip(a.project.title, 120),
      role: a.roleName,
      technologies: a.technologies.slice(0, 8),
    })),
    stats: {
      completedProjects: overview.stats.completedProjects,
      verifiedCertificates: overview.stats.verifiedArtifacts,
      avgRating: overview.stats.avgRating,
    },
  };
}

function vacancyPayload(project: NonNullable<Awaited<ReturnType<typeof projectRepository.findById>>>) {
  return {
    title: clip(project.title, 160),
    description: clip(project.description, 500),
    category: project.category?.name ?? null,
    roles: project.projectRoles.map((r) => ({
      roleName: r.roleName,
      requirements: clip(r.requirements, 300),
      requiredSkills: r.roleSkills.map((rs) => rs.skill.name),
    })),
  };
}

// ---- Feature 1: Portfolio Recommendation (beginner → vacancy) --------------

export const aiInsightService = {
  async recommendPortfolio(
    beginnerId: string,
    projectId: string,
    regenerate = false
  ): Promise<AiResult<PortfolioRec>> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Proyek tidak ditemukan");
    const overview = await userService.getProfileOverview(beginnerId);

    const candidate = candidatePayload(overview);
    const vacancy = vacancyPayload(project);
    const inputs = { v: 1, candidate, vacancy };

    const prompt = [
      "Anda asisten karier untuk platform kolaborasi proyek EduNomad.",
      "Bantu seorang BEGINNER memilih bagian portofolio (skill, sertifikat, pengalaman) yang paling relevan untuk DITONJOLKAN saat melamar lowongan proyek berikut.",
      "Gunakan HANYA data yang ada. Jawab dalam Bahasa Indonesia, ringkas, jujur (jangan mengarang item yang tidak ada).",
      "",
      `PROFIL PELAMAR:\n${JSON.stringify(candidate)}`,
      `LOWONGAN:\n${JSON.stringify(vacancy)}`,
      "",
      "Balas HANYA JSON dengan bentuk persis:",
      '{"recommendedItems":[{"type":"SKILL|CERTIFICATE|EXPERIENCE","label":"...","reason":"kenapa relevan utk lowongan ini"}],"suggestedHighlights":["poin singkat utk ditulis di motivasi"],"overallAdvice":"1-2 kalimat saran"}',
    ].join("\n");

    return cachedInsight({
      kind: AiInsightKind.PORTFOLIO_REC,
      subjectUserId: beginnerId,
      projectId,
      inputs,
      prompt,
      parse: makeParser(portfolioRecSchema),
      regenerate,
    });
  },

  // ---- Feature 2: Candidate Matching & Ranking (senior selecting) ----------
  async rankApplicants(
    seniorId: string,
    projectId: string,
    regenerate = false
  ): Promise<AiResult<ApplicantRanking>> {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Proyek tidak ditemukan");
    if (project.seniorId !== seniorId) {
      throw new ForbiddenError("Hanya mentor proyek ini yang bisa melihat peringkat pelamar");
    }

    const applications = (await projectApplicationRepository.listByProject(projectId)).filter(
      (a) => a.status === ApplicationStatus.PENDING
    );

    // Nothing to rank — return an empty (but available) result without calling AI.
    if (applications.length === 0) {
      return { available: true, cached: false, generatedAt: new Date().toISOString(), data: { rankings: [] } };
    }

    const vacancy = vacancyPayload(project);
    const applicants = applications.map((a) => ({
      applicationId: a.id,
      name: a.beginner.name,
      appliedRole: a.projectRole.roleName,
      headline: clip(a.beginner.profile?.headline, 160),
      skills: a.beginner.userSkills.map((s) => ({ name: s.skill.name, level: s.level })),
      motivation: clip(a.motivation, 300),
    }));
    const inputs = { v: 1, vacancy, applicants };

    const prompt = [
      "Anda asisten rekrutmen untuk platform EduNomad. Seorang MENTOR (senior) menyeleksi pelamar BEGINNER untuk sebuah proyek.",
      "Nilai kecocokan SETIAP pelamar terhadap peran yang dilamar dan kebutuhan proyek, berdasarkan skill (+levelnya), motivasi, dan headline.",
      "Objektif & jujur. Jawab dalam Bahasa Indonesia. WAJIB kembalikan applicationId PERSIS seperti input untuk setiap pelamar.",
      "",
      `LOWONGAN:\n${JSON.stringify(vacancy)}`,
      `PELAMAR:\n${JSON.stringify(applicants)}`,
      "",
      "Balas HANYA JSON dengan bentuk persis:",
      '{"rankings":[{"applicationId":"<sama dgn input>","score":0-100,"matchedSkills":["..."],"missingSkills":["..."],"reason":"1 kalimat alasan skor"}]}',
    ].join("\n");

    return cachedInsight({
      kind: AiInsightKind.MATCH,
      subjectUserId: project.seniorId!,
      projectId,
      inputs,
      prompt,
      parse: makeParser(rankingSchema),
      regenerate,
    });
  },

  // ---- Feature 3: Professional Summary -------------------------------------
  async summarizeProfile(userId: string, regenerate = false): Promise<AiResult<ProfileSummary>> {
    const overview = await userService.getProfileOverview(userId);
    // UMKM has no professional/contributor data — summary doesn't apply (D-P10-2).
    if (overview.user.role === "UMKM") {
      return UNAVAILABLE("Ringkasan AI tidak tersedia untuk peran UMKM.");
    }

    const candidate = candidatePayload(overview);
    const inputs = { v: 1, candidate };

    const prompt = [
      "Anda menulis ringkasan profesional singkat untuk profil pengguna platform EduNomad, agar mentor/UMKM bisa menilai cepat.",
      "Gunakan HANYA data yang ada, jujur, tanpa mengarang. Jawab dalam Bahasa Indonesia.",
      "",
      `PROFIL:\n${JSON.stringify(candidate)}`,
      "",
      "Balas HANYA JSON dengan bentuk persis:",
      '{"summary":"2-3 kalimat ringkasan profesional","strengths":["kekuatan utama"],"suggestedRoles":["peran yang cocok"]}',
    ].join("\n");

    return cachedInsight({
      kind: AiInsightKind.SUMMARY,
      subjectUserId: userId,
      projectId: null,
      inputs,
      prompt,
      parse: makeParser(summarySchema),
      regenerate,
    });
  },
};
