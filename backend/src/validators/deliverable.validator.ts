import { z } from "zod";

export const deliverableIdParamSchema = z.object({ id: z.string().uuid() });

// POST /projects/:id/deliverables — title required, description optional.
export const createDeliverableSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(255),
  description: z.string().max(5000).optional(),
});

// PUT /deliverables/:id — same shape; both optional so partial edits work.
export const updateDeliverableSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
});

// One evidence: LINK carries a url, FILE carries a Supabase Storage file_path.
const evidenceSchema = z
  .object({
    type: z.enum(["LINK", "FILE"]),
    url: z.string().url().max(1000).optional(),
    file_path: z.string().max(1000).optional(),
  })
  .refine((e) => (e.type === "LINK" ? !!e.url : !!e.file_path), {
    message: "LINK butuh url, FILE butuh file_path",
  });

// POST /deliverables/:id/submit — attach the evidence set being submitted.
export const submitDeliverableSchema = z.object({
  evidences: z.array(evidenceSchema).min(1, "Lampirkan minimal satu bukti").max(20),
});

// POST /deliverables/:id/request-revision — senior's feedback (stored in audit).
export const requestRevisionSchema = z.object({
  feedback: z.string().min(1, "Feedback wajib diisi").max(2000),
});

export type CreateDeliverableInput = z.infer<typeof createDeliverableSchema>;
export type SubmitDeliverableInput = z.infer<typeof submitDeliverableSchema>;
