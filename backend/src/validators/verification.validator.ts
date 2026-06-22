import { z } from "zod";

// POST /verification-request — supporting info (API spec). The DB only has a
// `notes` text column, so these are composed into notes (decisions: same
// map-to-existing-fields approach as registration).
export const submitVerificationSchema = z.object({
  portfolio_url: z.string().url().max(1000).optional(),
  experience_years: z.coerce.number().int().min(0).optional(),
  additional_info: z.string().max(2000).optional(),
});

export const listVerificationsQuerySchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const rejectVerificationSchema = z.object({
  reason: z.string().min(1, "Alasan wajib diisi").max(2000),
});

export const verificationIdParamSchema = z.object({ id: z.string().uuid() });

export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>;
export type ListVerificationsQuery = z.infer<typeof listVerificationsQuerySchema>;
