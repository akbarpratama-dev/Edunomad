import { reviewRepository } from "../repositories/review.repository";
import { projectRepository } from "../repositories/project.repository";
import { projectMemberRepository } from "../repositories/projectMember.repository";
import { BusinessRuleError, ForbiddenError, NotFoundError } from "../utils/errors";
import { ReviewType } from "../constants/reviewType";
import { ProjectStatus } from "../constants/projectStatus";
import { notificationService } from "./notification.service";
import { NotificationType } from "../constants/notificationType";

// Reviews (Workflow 12) — mandatory before completion, editable until the project
// is finalised. Allowed pairs (docs/06): SENIOR→BEGINNER, UMKM→BEGINNER, UMKM→SENIOR.
export const reviewService = {
  // POST /projects/:id/reviews/beginner — reviewer is the project senior or UMKM
  // owner; type is derived from which one they are.
  async reviewBeginner(
    reviewerId: string,
    projectId: string,
    revieweeId: string,
    rating: number,
    comment?: string
  ) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.status !== ProjectStatus.ACTIVE) {
      throw new BusinessRuleError("Reviews can only be given on an active project");
    }

    let type: string;
    if (project.seniorId === reviewerId) type = ReviewType.SENIOR_TO_BEGINNER;
    else if (project.umkmId === reviewerId) type = ReviewType.UMKM_TO_BEGINNER;
    else throw new ForbiddenError("Only the project's senior or UMKM owner can review members");

    const isMember = await projectMemberRepository.isActiveMember(projectId, revieweeId);
    if (!isMember) throw new BusinessRuleError("The reviewee must be an active member of this project");

    await this.assertNotDuplicate(projectId, reviewerId, revieweeId);
    const result = await reviewRepository.create({ projectId, reviewerId, revieweeId, rating, comment, type });
    await notificationService.notify({
      userId: revieweeId,
      type: NotificationType.REVIEW_RECEIVED,
      title: "Review baru",
      message: `Kamu menerima review di proyek "${project.title}".`,
      actionUrl: "/profile",
    });
    return result;
  },

  // POST /projects/:id/reviews/senior — UMKM owner reviews the assigned senior.
  async reviewSenior(umkmId: string, projectId: string, rating: number, comment?: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.status !== ProjectStatus.ACTIVE) {
      throw new BusinessRuleError("Reviews can only be given on an active project");
    }
    if (project.umkmId !== umkmId) {
      throw new ForbiddenError("Only the project's UMKM owner can review the senior");
    }
    if (!project.seniorId) throw new BusinessRuleError("This project has no assigned senior to review");

    await this.assertNotDuplicate(projectId, umkmId, project.seniorId);
    const result = await reviewRepository.create({
      projectId,
      reviewerId: umkmId,
      revieweeId: project.seniorId,
      rating,
      comment,
      type: ReviewType.UMKM_TO_SENIOR,
    });
    await notificationService.notify({
      userId: project.seniorId,
      type: NotificationType.REVIEW_RECEIVED,
      title: "Review baru",
      message: `Kamu menerima review di proyek "${project.title}".`,
      actionUrl: "/profile",
    });
    return result;
  },

  // PUT /reviews/:id — reviewer edits, only before the project is finalised.
  async editReview(reviewerId: string, reviewId: string, data: { rating?: number; comment?: string }) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw new NotFoundError("Review not found");
    if (review.reviewerId !== reviewerId) throw new ForbiddenError("You can only edit your own reviews");
    if (review.project.status === ProjectStatus.COMPLETED) {
      throw new BusinessRuleError("Reviews cannot be edited after the project is completed");
    }
    return reviewRepository.update(reviewId, data);
  },

  async getProjectReviews(projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    return reviewRepository.listByProject(projectId);
  },

  // Reviews received by a user (public to authenticated viewers).
  getUserReviews(userId: string) {
    return reviewRepository.listByReviewee(userId);
  },

  async assertNotDuplicate(projectId: string, reviewerId: string, revieweeId: string) {
    const existing = await reviewRepository.findExisting(projectId, reviewerId, revieweeId);
    if (existing) throw new BusinessRuleError("You have already reviewed this person for this project");
  },
};
