import { artifactRepository } from "../repositories/artifact.repository";
import { contributionRepository } from "../repositories/contribution.repository";
import { reviewRepository } from "../repositories/review.repository";
import { ContributionStatus } from "../constants/deliverableStatus";
import { ReviewType } from "../constants/reviewType";

// Builds the rich certificate ("portfolio") list for a user — the same verified
// showcase items the profile's "Sertifikat" tab renders and the
// "Preview di Portofolio" modal reads. An Artifact row only exists once a
// certificate is issued, so every item here is verified. Composed here (not a
// standalone public page/endpoint) and folded into the profile overview so the
// portfolio lives INSIDE the profile as a sub-section (D-P13-2).
export async function buildPortfolioArtifacts(userId: string) {
  const artifacts = await artifactRepository.listPortfolioArtifacts(userId);

  return Promise.all(
    artifacts.map(async (a) => {
      const [contributionRow, reviews] = await Promise.all([
        contributionRepository.findByBeginnerAndProject(a.project.id, userId),
        reviewRepository.listByProject(a.project.id),
      ]);
      const contribution = contributionRow
        ? await contributionRepository.findById(contributionRow.id)
        : null;

      // The mentor's endorsement of this beginner's work — the same review that
      // gated certificate issuance (its comment is printed on the certificate as
      // "Catatan Mentor"). Public-safe: rating + comment + mentor name.
      const seniorReview = reviews.find(
        (r) => r.revieweeId === userId && r.type === ReviewType.SENIOR_TO_BEGINNER
      );

      const myMember = a.project.projectMembers.find((m) => m.userId === userId);

      return {
        id: a.id,
        artifactCode: a.artifactCode,
        verificationUrl: a.verificationUrl,
        currentVersion: a.currentVersion,
        issuedAt: a.issuedAt,
        roleName: myMember?.projectRole?.roleName ?? null,
        technologies: contribution?.contributionSkills.map((cs) => cs.skill.name) ?? [],
        contributionSummary: contribution?.contributionSummary ?? null,
        contributionApproved: contribution?.status === ContributionStatus.APPROVED,
        project: {
          id: a.project.id,
          title: a.project.title,
          description: a.project.description,
          imageUrl: a.project.imageUrl ?? null,
          status: a.project.status,
          startDate: a.project.startDate,
          deadline: a.project.deadline,
          completedAt: a.project.completedAt,
          category: a.project.category,
        },
        umkm: a.project.umkm ? { id: a.project.umkm.id, name: a.project.umkm.name } : null,
        // The verifying mentor (artifact.senior) — the certificate's authority.
        senior: a.senior ? { id: a.senior.id, name: a.senior.name } : null,
        seniorReview: seniorReview
          ? {
              reviewerName: seniorReview.reviewer.name,
              rating: seniorReview.rating,
              comment: seniorReview.comment,
            }
          : null,
        team: a.project.projectMembers.map((m) => ({
          id: m.user.id,
          name: m.user.name,
          roleName: m.projectRole?.roleName ?? null,
        })),
      };
    })
  );
}
