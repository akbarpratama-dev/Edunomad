import { z } from "zod";

export const artifactIdParamSchema = z.object({ id: z.string().uuid() });

// Public verification — code format EDN-YYYY-NNNNNN (kept lenient on length).
export const artifactCodeParamSchema = z.object({
  artifactCode: z.string().min(3).max(50),
});

// POST /projects/:id/generate-artifacts — one artifact per listed beginner.
// verification_url is the PUBLIC verify-page base (e.g. https://app/verify);
// the service appends the generated code to form the final QR/verification URL.
export const generateArtifactsSchema = z.object({
  beginner_ids: z.array(z.string().uuid()).min(1, "Pilih minimal satu beginner").max(50),
  verification_url: z.string().url("URL verifikasi tidak valid").max(1000),
});

// POST /artifacts/:id/regenerate — new version, same code.
export const regenerateArtifactSchema = z.object({
  verification_url: z.string().url("URL verifikasi tidak valid").max(1000),
});

export type GenerateArtifactsInput = z.infer<typeof generateArtifactsSchema>;
export type RegenerateArtifactInput = z.infer<typeof regenerateArtifactSchema>;
