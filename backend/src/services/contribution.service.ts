import { contributionRepository } from "../repositories/contribution.repository";
import { projectRepository } from "../repositories/project.repository";
import { projectMemberRepository } from "../repositories/projectMember.repository";
import { BusinessRuleError, ForbiddenError, NotFoundError } from "../utils/errors";
import { ContributionStatus } from "../constants/deliverableStatus";
import { ProjectStatus } from "../constants/projectStatus";

// Contribution reports (Workflow 9): one per beginner per project. Beginners
// document their work; the project's senior lead approves.
export const contributionService = {
  async listForProject(projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    return contributionRepository.listByProject(projectId);
  },

  // POST /projects/:id/contributions (BEGINNER member, project ACTIVE, one each).
  async submit(userId: string, projectId: string, summary: string, skillIds: string[] = []) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.status !== ProjectStatus.ACTIVE) {
      throw new BusinessRuleError("Contributions can only be submitted on an active project");
    }
    const isMember = await projectMemberRepository.isActiveMember(projectId, userId);
    if (!isMember) throw new ForbiddenError("Only active project members can submit a contribution");
    const existing = await contributionRepository.findByBeginnerAndProject(projectId, userId);
    if (existing) {
      throw new BusinessRuleError("You already submitted a contribution report for this project");
    }
    return contributionRepository.create({
      projectId,
      beginnerId: userId,
      contributionSummary: summary,
      skillIds,
    });
  },

  // PUT /contributions/:id (creator; not once approved).
  async update(
    userId: string,
    contributionId: string,
    data: { contributionSummary?: string; skillIds?: string[] }
  ) {
    const c = await contributionRepository.findById(contributionId);
    if (!c) throw new NotFoundError("Contribution not found");
    if (c.beginnerId !== userId) throw new ForbiddenError("You can only edit your own contribution");
    if (c.status === ContributionStatus.APPROVED) {
      throw new BusinessRuleError("Approved contributions can no longer be edited");
    }
    return contributionRepository.update(contributionId, data);
  },

  // POST /contributions/:id/approve (project senior lead; PENDING → APPROVED).
  async approve(seniorId: string, contributionId: string) {
    const c = await contributionRepository.findById(contributionId);
    if (!c) throw new NotFoundError("Contribution not found");
    if (c.project.seniorId !== seniorId) {
      throw new ForbiddenError("Only the project's senior can approve contributions");
    }
    if (c.status !== ContributionStatus.PENDING) {
      throw new BusinessRuleError("Only pending contributions can be approved");
    }
    return contributionRepository.approve(contributionId, seniorId);
  },
};
