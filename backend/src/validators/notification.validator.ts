import { z } from "zod";

export const notificationIdParamSchema = z.object({ id: z.string().uuid() });

export const listNotificationsQuerySchema = z.object({
  is_read: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
