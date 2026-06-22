import { projectRoleRepository } from "../repositories/projectRole.repository";
import { projectRepository } from "../repositories/project.repository";
import { skillRepository } from "../repositories/skill.repository";
import { ForbiddenError, NotFoundError, ValidationError } from "../utils/errors";
import type { CreateRoleInput } from "../validators/projectRole.validator";

async function assertOwner(umkmId: string, projectId: string) {
  const project = await projectRepository.findRawById(projectId);
  if (!project) throw new NotFoundError("Project not found");
  if (project.umkmId !== umkmId) throw new ForbiddenError("You do not own this project");
  return project;
}

async function validateSkills(skillIds: string[]) {
  if (skillIds.length === 0) return;
  const found = await skillRepository.findManyByIds(skillIds);
  const approved = new Set(found.filter((s) => s.status === "APPROVED").map((s) => s.id));
  const invalid = skillIds.filter((id) => !approved.has(id));
  if (invalid.length > 0) {
    throw new ValidationError("One or more skills are invalid or not approved", { skills: invalid });
  }
}

function toData(input: CreateRoleInput) {
  return {
    roleName: input.role_name,
    capacity: input.capacity,
    requirements: input.requirements ?? null,
    skillIds: input.skills,
  };
}

export const projectRoleService = {
  // GET /projects/:id/roles (any authenticated user).
  async list(projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    return projectRoleRepository.listByProject(projectId);
  },

  async create(umkmId: string, projectId: string, input: CreateRoleInput) {
    await assertOwner(umkmId, projectId);
    await validateSkills(input.skills);
    return projectRoleRepository.createWithSkills(projectId, toData(input));
  },

  async update(umkmId: string, roleId: string, input: CreateRoleInput) {
    const role = await projectRoleRepository.findById(roleId);
    if (!role) throw new NotFoundError("Role not found");
    await assertOwner(umkmId, role.projectId);
    await validateSkills(input.skills);
    return projectRoleRepository.updateWithSkills(roleId, toData(input));
  },

  async remove(umkmId: string, roleId: string) {
    const role = await projectRoleRepository.findById(roleId);
    if (!role) throw new NotFoundError("Role not found");
    await assertOwner(umkmId, role.projectId);
    await projectRoleRepository.delete(roleId);
  },
};
