import { experienceRepository } from "../repositories/experience.repository";
import { NotFoundError, UnauthorizedError } from "../utils/errors";
import type { CreateExperienceInput, UpdateExperienceInput } from "../validators/experience.validator";

// Maps the API's snake_case date fields to the camelCase Prisma columns.
function toData(input: CreateExperienceInput | UpdateExperienceInput) {
  return {
    title: input.title,
    organization: input.organization,
    description: input.description ?? null,
    startDate: input.start_date,
    endDate: input.end_date ?? null,
  };
}

async function assertOwnership(userId: string, experienceId: string) {
  const experience = await experienceRepository.findById(experienceId);
  if (!experience) throw new NotFoundError("Experience not found");
  if (experience.userId !== userId) {
    throw new UnauthorizedError("Can only modify your own experiences");
  }
  return experience;
}

export const experienceService = {
  list(userId: string) {
    return experienceRepository.listByUser(userId);
  },

  create(userId: string, input: CreateExperienceInput) {
    return experienceRepository.create({ userId, ...toData(input) });
  },

  async update(userId: string, experienceId: string, input: UpdateExperienceInput) {
    await assertOwnership(userId, experienceId);
    return experienceRepository.update(experienceId, toData(input));
  },

  async remove(userId: string, experienceId: string) {
    await assertOwnership(userId, experienceId);
    await experienceRepository.delete(experienceId);
  },
};
