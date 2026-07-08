import { projectRepository } from "../repositories/project.repository";
import { projectMemberRepository } from "../repositories/projectMember.repository";
import { deliverableRepository } from "../repositories/deliverable.repository";
import { contributionRepository } from "../repositories/contribution.repository";
import { reviewRepository } from "../repositories/review.repository";
import { artifactRepository } from "../repositories/artifact.repository";
import { milestoneRepository } from "../repositories/milestone.repository";
import { NotFoundError } from "../utils/errors";
import { MemberStatus } from "../constants/applicationStatus";
import { DeliverableStatus, ContributionStatus } from "../constants/deliverableStatus";
import { ReviewType } from "../constants/reviewType";

// Per-tab "needs your attention" counts for the workspace, role-aware. Each
// number is meant to be shown as a badge on the matching tab so members notice
// pending work (new deliverables to review, contributions to submit, people
// left to review, milestones still open, etc.). Zero = nothing to do.
export interface WorkspaceSummary {
  milestones: number;
  deliverables: number;
  contributions: number;
  reviews: number;
  artifacts: number;
}

export const workspaceSummaryService = {
  async getSummary(userId: string, projectId: string): Promise<WorkspaceSummary> {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");

    const [members, deliverables, contributions, reviews, milestones] = await Promise.all([
      projectMemberRepository.listByProject(projectId),
      deliverableRepository.listByProject(projectId),
      contributionRepository.listByProject(projectId),
      reviewRepository.listByProject(projectId),
      milestoneRepository.listByProject(projectId),
    ]);

    const activeBeginners = members.filter((m) => m.status === MemberStatus.ACTIVE);
    const isLead = project.seniorId === userId;
    const isOwner = project.umkmId === userId;
    const isBeginner = activeBeginners.some((m) => m.user.id === userId);

    const summary: WorkspaceSummary = {
      milestones: 0,
      deliverables: 0,
      contributions: 0,
      reviews: 0,
      artifacts: 0,
    };

    // Milestones — the manager (lead senior / owner) sees how many are still open.
    if (isLead || isOwner) {
      summary.milestones = milestones.filter((m) => m.status !== "COMPLETED").length;
    }

    // Deliverables — senior: awaiting review; beginner: my drafts / revisions to act on.
    if (isLead) {
      summary.deliverables = deliverables.filter(
        (d) => d.status === DeliverableStatus.SUBMITTED
      ).length;
    } else if (isBeginner) {
      summary.deliverables = deliverables.filter(
        (d) =>
          d.submitter.id === userId &&
          (d.status === DeliverableStatus.DRAFT ||
            d.status === DeliverableStatus.REVISION_REQUESTED)
      ).length;
    }

    // Contributions — senior: pending to approve; beginner: 1 if not yet submitted.
    if (isLead) {
      summary.contributions = contributions.filter(
        (c) => c.status === ContributionStatus.PENDING
      ).length;
    } else if (isBeginner) {
      summary.contributions = contributions.some((c) => c.beginner.id === userId) ? 0 : 1;
    }

    // Reviews — how many targets the viewer still needs to review.
    if (isLead) {
      const reviewedByMe = new Set(
        reviews
          .filter((r) => r.reviewerId === userId && r.type === ReviewType.SENIOR_TO_BEGINNER)
          .map((r) => r.revieweeId)
      );
      summary.reviews = activeBeginners.filter((m) => !reviewedByMe.has(m.user.id)).length;
    } else if (isOwner) {
      const reviewedByMe = new Set(
        reviews.filter((r) => r.reviewerId === userId).map((r) => r.revieweeId)
      );
      const beginnersLeft = activeBeginners.filter((m) => !reviewedByMe.has(m.user.id)).length;
      const seniorLeft = project.seniorId && !reviewedByMe.has(project.seniorId) ? 1 : 0;
      summary.reviews = beginnersLeft + seniorLeft;
    }

    // Certificates — senior: active beginners still without one (their action).
    if (isLead) {
      let missing = 0;
      for (const m of activeBeginners) {
        if (!(await artifactRepository.findByProjectAndBeginner(projectId, m.user.id))) {
          missing += 1;
        }
      }
      summary.artifacts = missing;
    }

    return summary;
  },
};
