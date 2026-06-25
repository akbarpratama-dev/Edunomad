import { deliverableRepository } from "../repositories/deliverable.repository";
import { projectRepository } from "../repositories/project.repository";
import { projectMemberRepository } from "../repositories/projectMember.repository";
import { BusinessRuleError, ForbiddenError, NotFoundError } from "../utils/errors";
import { DeliverableStatus } from "../constants/deliverableStatus";
import { ProjectStatus } from "../constants/projectStatus";

type EvidenceInput = { type: string; url?: string; file_path?: string };

// Deliverable lifecycle (Workflow 8): DRAFT → SUBMITTED → APPROVED, with a
// REVISION_REQUESTED loop. Beginners own their deliverables; the project's
// senior lead reviews.
export const deliverableService = {
  // GET /projects/:id/deliverables — list + each one's latest revision feedback.
  async listForProject(projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    const items = await deliverableRepository.listByProject(projectId);
    const feedback = await deliverableRepository.latestRevisionFeedback(items.map((d) => d.id));
    return items.map((d) => ({ ...d, revisionFeedback: feedback.get(d.id) ?? null }));
  },

  // POST /projects/:id/deliverables (BEGINNER member, project ACTIVE).
  async create(userId: string, projectId: string, title: string, description?: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.status !== ProjectStatus.ACTIVE) {
      throw new BusinessRuleError("Deliverables can only be added to an active project");
    }
    const isMember = await projectMemberRepository.isActiveMember(projectId, userId);
    if (!isMember) throw new ForbiddenError("Only active project members can add deliverables");
    return deliverableRepository.create({ projectId, submittedBy: userId, title, description });
  },

  // PUT /deliverables/:id (creator; not once approved).
  async update(userId: string, deliverableId: string, data: { title?: string; description?: string }) {
    const d = await this.ownedEditable(userId, deliverableId);
    if (d.status === DeliverableStatus.APPROVED) {
      throw new BusinessRuleError("Approved deliverables can no longer be edited");
    }
    return deliverableRepository.update(deliverableId, data);
  },

  // POST /deliverables/:id/submit (creator; DRAFT or REVISION_REQUESTED → SUBMITTED).
  async submit(userId: string, deliverableId: string, evidences: EvidenceInput[]) {
    const d = await this.ownedEditable(userId, deliverableId);
    if (d.status !== DeliverableStatus.DRAFT && d.status !== DeliverableStatus.REVISION_REQUESTED) {
      throw new BusinessRuleError("Only draft or revision-requested deliverables can be submitted");
    }
    return deliverableRepository.submitWithEvidences(deliverableId, evidences);
  },

  // POST /deliverables/:id/approve (project senior lead; SUBMITTED → APPROVED).
  async approve(seniorId: string, deliverableId: string) {
    await this.reviewable(seniorId, deliverableId);
    return deliverableRepository.approve(deliverableId, seniorId);
  },

  // POST /deliverables/:id/request-revision (senior lead; SUBMITTED → REVISION_REQUESTED).
  async requestRevision(seniorId: string, deliverableId: string, feedback: string) {
    await this.reviewable(seniorId, deliverableId);
    return deliverableRepository.requestRevision(deliverableId, seniorId, feedback);
  },

  // --- guards ---
  async ownedEditable(userId: string, deliverableId: string) {
    const d = await deliverableRepository.findById(deliverableId);
    if (!d) throw new NotFoundError("Deliverable not found");
    if (d.submittedBy !== userId) throw new ForbiddenError("You can only edit your own deliverables");
    return d;
  },

  async reviewable(seniorId: string, deliverableId: string) {
    const d = await deliverableRepository.findById(deliverableId);
    if (!d) throw new NotFoundError("Deliverable not found");
    if (d.project.seniorId !== seniorId) {
      throw new ForbiddenError("Only the project's senior can review deliverables");
    }
    if (d.status !== DeliverableStatus.SUBMITTED) {
      throw new BusinessRuleError("Only submitted deliverables can be reviewed");
    }
    return d;
  },
};
