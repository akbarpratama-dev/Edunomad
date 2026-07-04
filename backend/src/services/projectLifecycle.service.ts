import { projectRepository } from "../repositories/project.repository";
import { projectMemberRepository } from "../repositories/projectMember.repository";
import { deliverableRepository } from "../repositories/deliverable.repository";
import { contributionRepository } from "../repositories/contribution.repository";
import { reviewRepository } from "../repositories/review.repository";
import { artifactRepository } from "../repositories/artifact.repository";
import { BusinessRuleError, ForbiddenError, NotFoundError } from "../utils/errors";
import { ProjectStatus } from "../constants/projectStatus";
import { MemberStatus } from "../constants/applicationStatus";
import { DeliverableStatus, ContributionStatus } from "../constants/deliverableStatus";
import { ReviewType } from "../constants/reviewType";
import { notificationService } from "./notification.service";
import { NotificationType } from "../constants/notificationType";

const SENIOR_MAX_ACTIVE = 5;
const UMKM_MAX_ACTIVE = 5;

// Workflow 15 completion readiness — every requirement must hold before a
// project may leave ACTIVE. Returns the list of unmet requirements (empty = ok).
async function completionBlockers(projectId: string): Promise<string[]> {
  const [members, deliverables, contributions, reviews] = await Promise.all([
    projectMemberRepository.listByProject(projectId),
    deliverableRepository.listByProject(projectId),
    contributionRepository.listByProject(projectId),
    reviewRepository.listByProject(projectId),
  ]);
  const beginners = members.filter((m) => m.status === MemberStatus.ACTIVE);
  const blockers: string[] = [];

  if (beginners.length === 0) {
    blockers.push("Belum ada anggota aktif pada proyek");
    return blockers;
  }

  // Deliverables: none may be left un-approved.
  if (deliverables.some((d) => d.status !== DeliverableStatus.APPROVED)) {
    blockers.push("Masih ada deliverable yang belum disetujui");
  }

  // Per-beginner: approved contribution + artifact + received reviews.
  const approvedContribBeginners = new Set(
    contributions
      .filter((c) => c.status === ContributionStatus.APPROVED)
      .map((c) => c.beginner.id)
  );
  const seniorReviewed = new Set(
    reviews.filter((r) => r.type === ReviewType.SENIOR_TO_BEGINNER).map((r) => r.revieweeId)
  );
  const umkmReviewedBeginner = new Set(
    reviews.filter((r) => r.type === ReviewType.UMKM_TO_BEGINNER).map((r) => r.revieweeId)
  );

  for (const m of beginners) {
    const name = m.user.name;
    if (!approvedContribBeginners.has(m.user.id)) {
      blockers.push(`Kontribusi ${name} belum disetujui`);
    }
    if (!seniorReviewed.has(m.user.id)) {
      blockers.push(`Review mentor untuk ${name} belum ada`);
    }
    if (!umkmReviewedBeginner.has(m.user.id)) {
      blockers.push(`Review UMKM untuk ${name} belum ada`);
    }
    const artifact = await artifactRepository.findByProjectAndBeginner(projectId, m.user.id);
    if (!artifact) {
      blockers.push(`Sertifikat untuk ${name} belum dibuat`);
    }
  }

  // UMKM → Senior review must exist.
  if (!reviews.some((r) => r.type === ReviewType.UMKM_TO_SENIOR)) {
    blockers.push("Review UMKM untuk mentor belum ada");
  }

  return blockers;
}

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

    // Workflow 15 readiness gate (carry-over D-P4.3-3, completed now that
    // artifacts exist): deliverables approved + per-beginner contribution
    // approved + reviews submitted + artifacts generated.
    const blockers = await completionBlockers(projectId);
    if (blockers.length > 0) {
      throw new BusinessRuleError(`Proyek belum siap diselesaikan: ${blockers.join("; ")}`);
    }

    const result = await projectRepository.update(projectId, {
      status: ProjectStatus.AWAITING_COMPLETION,
    });
    await notificationService.notify({
      userId: project.umkmId,
      type: NotificationType.COMPLETION_REQUESTED,
      title: "Konfirmasi penyelesaian",
      message: `Mentor mengajukan penyelesaian proyek "${project.title}". Mohon konfirmasi.`,
      actionUrl: `/my-projects/${projectId}`,
    });
    return result;
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
