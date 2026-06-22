import { projectRepository } from "../repositories/project.repository";
import { projectMemberRepository } from "../repositories/projectMember.repository";
import { BusinessRuleError, ForbiddenError, NotFoundError } from "../utils/errors";
import { ProjectStatus } from "../constants/projectStatus";

const SENIOR_MAX_ACTIVE = 5;
const UMKM_MAX_ACTIVE = 5;

// Project lifecycle transitions (Workflow 5 start / 11 + 15 completion).
export const projectLifecycleService = {
  // POST /projects/:id/start (SENIOR lead) — RECRUITING → ACTIVE (Workflow 5).
  async startProject(seniorId: string, projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.seniorId !== seniorId) {
      throw new ForbiddenError("Only the project's senior can start this project");
    }
    if (project.status !== ProjectStatus.RECRUITING) {
      throw new BusinessRuleError("Only recruiting projects can be started");
    }

    // Prerequisites for ACTIVE (Workflow 5): senior assigned (the caller) + at
    // least one accepted beginner. Filling every slot is encouraged but the
    // senior's explicit start acts as approval to begin with a partial team.
    const activeMembers = await projectMemberRepository.countActiveByProject(projectId);
    if (activeMembers < 1) {
      throw new BusinessRuleError("At least one beginner must join before starting the project");
    }

    // RBAC activation constraints — both counted on ACTIVE projects only.
    const seniorActive = await projectRepository.countActiveAssignedBySenior(seniorId);
    if (seniorActive >= SENIOR_MAX_ACTIVE) {
      throw new BusinessRuleError(`Senior has reached the maximum of ${SENIOR_MAX_ACTIVE} active projects`);
    }
    const umkmActive = await projectRepository.countActiveByUmkm(project.umkmId);
    if (umkmActive >= UMKM_MAX_ACTIVE) {
      throw new BusinessRuleError(`UMKM has reached the maximum of ${UMKM_MAX_ACTIVE} active projects`);
    }

    return projectRepository.update(projectId, { status: ProjectStatus.ACTIVE });
  },

  // POST /projects/:id/complete (SENIOR lead) — ACTIVE → AWAITING_COMPLETION
  // (Workflow 11). Deliverable/contribution/review/artifact readiness gates are
  // owned by their later phases and are layered on then (next-tasks.md).
  async requestCompletion(seniorId: string, projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.seniorId !== seniorId) {
      throw new ForbiddenError("Only the project's senior can request completion");
    }
    if (project.status !== ProjectStatus.ACTIVE) {
      throw new BusinessRuleError("Only active projects can request completion");
    }
    return projectRepository.update(projectId, { status: ProjectStatus.AWAITING_COMPLETION });
  },

  // POST /projects/:id/confirm-completion (UMKM owner) — AWAITING_COMPLETION →
  // COMPLETED read-only (Workflow 15) + PROJECT_COMPLETED audit.
  async confirmCompletion(umkmId: string, projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.umkmId !== umkmId) {
      throw new ForbiddenError("Only the project owner can confirm completion");
    }
    if (project.status !== ProjectStatus.AWAITING_COMPLETION) {
      throw new BusinessRuleError("Project is not awaiting completion confirmation");
    }
    return projectRepository.completeWithAudit(projectId, umkmId);
  },
};
