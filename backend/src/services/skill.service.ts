import { skillRepository } from "../repositories/skill.repository";
import { BusinessRuleError, NotFoundError, UnauthorizedError } from "../utils/errors";
import type { Prisma } from "../generated/prisma/client";
import type { ListSkillsQuery } from "../validators/skill.validator";

export const skillService = {
  // GET /skills — master skills with filters + pagination.
  async listMasterSkills(query: ListSkillsQuery) {
    const where: Prisma.SkillWhereInput = {};
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;

    const { data, total } = await skillRepository.findManyPaginated(
      where,
      query.page,
      query.limit
    );
    return { data, total, page: query.page, limit: query.limit };
  },

  // POST /users/me/skills — only APPROVED master skills can be added; the
  // (user_id, skill_id) pair is unique (DB constraint + pre-check for a clean
  // business error). docs/04 User Skills, task 1.2.4.
  async addUserSkill(userId: string, skillId: string, level: string) {
    const skill = await skillRepository.findSkillById(skillId);
    if (!skill) throw new NotFoundError("Skill not found");
    if (skill.status !== "APPROVED") {
      throw new BusinessRuleError("Skill is not approved");
    }

    const existing = await skillRepository.findUserSkill(userId, skillId);
    if (existing) {
      throw new BusinessRuleError("Skill already added to your profile");
    }

    return skillRepository.createUserSkill({ userId, skillId, level });
  },

  async updateUserSkillLevel(userId: string, userSkillId: string, level: string) {
    const userSkill = await skillRepository.findUserSkillById(userSkillId);
    if (!userSkill) throw new NotFoundError("Skill not found on profile");
    if (userSkill.userId !== userId) {
      throw new UnauthorizedError("Can only edit your own skills");
    }
    return skillRepository.updateUserSkill(userSkillId, { level });
  },

  async removeUserSkill(userId: string, userSkillId: string) {
    const userSkill = await skillRepository.findUserSkillById(userSkillId);
    if (!userSkill) throw new NotFoundError("Skill not found on profile");
    if (userSkill.userId !== userId) {
      throw new UnauthorizedError("Can only remove your own skills");
    }
    await skillRepository.deleteUserSkill(userSkillId);
  },

  listUserSkills(userId: string) {
    return skillRepository.listUserSkills(userId);
  },

  // --- Admin skill approval (2.3.3) ---
  async getPendingSkills(page: number, limit: number) {
    const { data, total } = await skillRepository.findPendingPaginated(page, limit);
    return { data, total, page, limit };
  },

  async approveSkill(adminId: string, skillId: string) {
    const skill = await skillRepository.findSkillById(skillId);
    if (!skill) throw new NotFoundError("Skill not found");
    if (skill.status !== "PENDING") {
      throw new BusinessRuleError("Skill already reviewed");
    }
    return skillRepository.setStatusWithAudit(skillId, "APPROVED", adminId);
  },

  async rejectSkill(adminId: string, skillId: string, reason?: string) {
    const skill = await skillRepository.findSkillById(skillId);
    if (!skill) throw new NotFoundError("Skill not found");
    if (skill.status !== "PENDING") {
      throw new BusinessRuleError("Skill already reviewed");
    }
    return skillRepository.setStatusWithAudit(skillId, "REJECTED", adminId, reason);
  },
};
