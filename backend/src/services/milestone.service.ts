import { milestoneRepository } from "../repositories/milestone.repository";
import { projectRepository } from "../repositories/project.repository";
import { ForbiddenError, NotFoundError } from "../utils/errors";
import type { CreateMilestoneInput } from "../validators/milestone.validator";

// Milestone management is allowed for the project owner (UMKM) or the assigned
// senior (project lead) — merges API spec (SENIOR) + task 3.1.4 (UMKM at create).
async function assertManager(userId: string, projectId: string) {
  const project = await projectRepository.findRawById(projectId);
  if (!project) throw new NotFoundError("Project not found");
  if (project.umkmId !== userId && project.seniorId !== userId) {
    throw new ForbiddenError("Only the project owner or assigned senior can manage milestones");
  }
  return project;
}

export const milestoneService = {
  // GET /projects/:id/milestones (any authenticated user).
  async list(projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    return milestoneRepository.listByProject(projectId);
  },

  async create(userId: string, projectId: string, input: CreateMilestoneInput) {
    await assertManager(userId, projectId);
    return milestoneRepository.create({
      projectId,
      title: input.title,
      description: input.description ?? null,
      dueDate: input.due_date,
      status: "PENDING",
    });
  },

  async update(userId: string, milestoneId: string, input: CreateMilestoneInput) {
    const milestone = await milestoneRepository.findById(milestoneId);
    if (!milestone) throw new NotFoundError("Milestone not found");
    await assertManager(userId, milestone.projectId);
    return milestoneRepository.update(milestoneId, {
      title: input.title,
      description: input.description ?? null,
      dueDate: input.due_date,
    });
  },

  async remove(userId: string, milestoneId: string) {
    const milestone = await milestoneRepository.findById(milestoneId);
    if (!milestone) throw new NotFoundError("Milestone not found");
    await assertManager(userId, milestone.projectId);
    await milestoneRepository.delete(milestoneId);
  },
};
