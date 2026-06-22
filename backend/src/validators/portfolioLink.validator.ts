import { z } from "zod";

// type ∈ GITHUB|FIGMA|BEHANCE|LINKEDIN|OTHER (docs/04 + DB Portfolio Domain).
const LINK_TYPES = ["GITHUB", "FIGMA", "BEHANCE", "LINKEDIN", "OTHER"] as const;

export const createPortfolioLinkSchema = z.object({
  title: z.string().min(1).max(255),
  url: z.string().url().max(1000),
  type: z.enum(LINK_TYPES),
});

export const updatePortfolioLinkSchema = createPortfolioLinkSchema;

export const portfolioLinkIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreatePortfolioLinkInput = z.infer<typeof createPortfolioLinkSchema>;
export type UpdatePortfolioLinkInput = z.infer<typeof updatePortfolioLinkSchema>;
