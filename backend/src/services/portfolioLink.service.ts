import { portfolioLinkRepository } from "../repositories/portfolioLink.repository";
import { NotFoundError, UnauthorizedError } from "../utils/errors";
import type {
  CreatePortfolioLinkInput,
  UpdatePortfolioLinkInput,
} from "../validators/portfolioLink.validator";

async function assertOwnership(userId: string, linkId: string) {
  const link = await portfolioLinkRepository.findById(linkId);
  if (!link) throw new NotFoundError("Portfolio link not found");
  if (link.userId !== userId) {
    throw new UnauthorizedError("Can only modify your own portfolio links");
  }
  return link;
}

export const portfolioLinkService = {
  list(userId: string) {
    return portfolioLinkRepository.listByUser(userId);
  },

  create(userId: string, input: CreatePortfolioLinkInput) {
    return portfolioLinkRepository.create({ userId, ...input });
  },

  async update(userId: string, linkId: string, input: UpdatePortfolioLinkInput) {
    await assertOwnership(userId, linkId);
    return portfolioLinkRepository.update(linkId, input);
  },

  async remove(userId: string, linkId: string) {
    await assertOwnership(userId, linkId);
    await portfolioLinkRepository.delete(linkId);
  },
};
