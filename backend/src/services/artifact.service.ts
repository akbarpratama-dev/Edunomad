import { artifactRepository } from "../repositories/artifact.repository";
import { projectRepository } from "../repositories/project.repository";
import { projectMemberRepository } from "../repositories/projectMember.repository";
import { contributionRepository } from "../repositories/contribution.repository";
import { reviewRepository } from "../repositories/review.repository";
import { deliverableRepository } from "../repositories/deliverable.repository";
import { auditLogRepository } from "../repositories/auditLog.repository";
import { generateArtifactPdf, type ArtifactPdfData } from "./artifactPdf.service";
import { artifactStorageService } from "./artifactStorage.service";
import { AuditAction, EntityType } from "../constants/auditActions";
import { ContributionStatus } from "../constants/deliverableStatus";
import { ReviewType } from "../constants/reviewType";
import { MemberStatus } from "../constants/applicationStatus";
import { ProjectStatus } from "../constants/projectStatus";
import {
  BusinessRuleError,
  ForbiddenError,
  NotFoundError,
} from "../utils/errors";

// Full public verification URL = base + code (base is the verify page, the code
// is only known once generated). Trailing slashes on the base are dropped.
function buildVerificationUrl(base: string, code: string) {
  return `${base.replace(/\/+$/, "")}/${code}`;
}

export const artifactService = {
  // POST /projects/:id/generate-artifacts (SENIOR lead). Workflow 13 — one
  // artifact per beginner. Prerequisites per beginner: ACTIVE member, APPROVED
  // contribution, and a senior review (feedback source). Skips beginners that
  // already have an artifact (regenerate is the path to refresh those).
  async generateArtifacts(
    seniorId: string,
    projectId: string,
    beginnerIds: string[],
    verificationBase: string
  ) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Proyek tidak ditemukan");
    if (project.seniorId !== seniorId) {
      throw new ForbiddenError("Hanya mentor proyek yang dapat membuat sertifikat");
    }
    if (
      project.status !== ProjectStatus.ACTIVE &&
      project.status !== ProjectStatus.AWAITING_COMPLETION
    ) {
      throw new BusinessRuleError(
        "Sertifikat hanya bisa dibuat saat proyek aktif atau menunggu penyelesaian"
      );
    }

    const [members, contributions, reviews] = await Promise.all([
      projectMemberRepository.listByProject(projectId),
      contributionRepository.listByProject(projectId),
      reviewRepository.listByProject(projectId),
    ]);
    const activeIds = new Set(
      members.filter((m) => m.status === MemberStatus.ACTIVE).map((m) => m.user.id)
    );

    const created = [];
    for (const beginnerId of beginnerIds) {
      if (!activeIds.has(beginnerId)) {
        throw new BusinessRuleError("Beginner bukan anggota aktif proyek ini");
      }
      const member = members.find((m) => m.user.id === beginnerId)!;
      const contribution = contributions.find(
        (c) => c.beginner.id === beginnerId && c.status === ContributionStatus.APPROVED
      );
      if (!contribution) {
        throw new BusinessRuleError(
          `Kontribusi ${member.user.name} belum disetujui — tidak bisa membuat sertifikat`
        );
      }
      const seniorReview = reviews.find(
        (r) => r.revieweeId === beginnerId && r.type === ReviewType.SENIOR_TO_BEGINNER
      );
      if (!seniorReview) {
        throw new BusinessRuleError(
          `Review mentor untuk ${member.user.name} belum ada — tidak bisa membuat sertifikat`
        );
      }
      if (await artifactRepository.findByProjectAndBeginner(projectId, beginnerId)) {
        throw new BusinessRuleError(
          `${member.user.name} sudah memiliki sertifikat — gunakan Terbitkan Ulang`
        );
      }

      const code = await artifactRepository.nextCode(new Date().getFullYear());
      const verificationUrl = buildVerificationUrl(verificationBase, code);
      const issuedAt = new Date();
      const pdf = await generateArtifactPdf(
        this.toPdfData({
          code,
          verificationUrl,
          issuedAt,
          projectTitle: project.title,
          umkmName: project.umkm.name,
          seniorName: project.senior?.name ?? "—",
          beginnerName: member.user.name,
          summary: contribution.contributionSummary,
          technologies: contribution.contributionSkills.map((cs) => cs.skill.name),
          feedback: seniorReview.comment ?? null,
        })
      );
      const pdfPath = await artifactStorageService.uploadPdf(code, 1, pdf);
      const artifact = await artifactRepository.create({
        artifactCode: code,
        projectId,
        beginnerId,
        seniorId,
        verificationUrl,
        pdfPath,
        issuedAt,
      });
      await auditLogRepository.create({
        userId: seniorId,
        action: AuditAction.ARTIFACT_GENERATED,
        entityType: EntityType.ARTIFACT,
        entityId: artifact.id,
      });
      created.push(artifact);
    }
    return created;
  },

  // POST /artifacts/:id/regenerate (SENIOR lead). Workflow 14 — new version,
  // same code; previous version stays stored.
  async regenerateArtifact(seniorId: string, artifactId: string, verificationBase: string) {
    const artifact = await artifactRepository.findById(artifactId);
    if (!artifact) throw new NotFoundError("Sertifikat tidak ditemukan");
    if (artifact.senior.id !== seniorId) {
      throw new ForbiddenError("Hanya mentor proyek yang dapat menerbitkan ulang");
    }

    const [contribution, reviews] = await Promise.all([
      contributionRepository.findByBeginnerAndProject(
        artifact.project.id,
        artifact.beginner.id
      ),
      reviewRepository.listByProject(artifact.project.id),
    ]);
    const full = contribution
      ? await contributionRepository.findById(contribution.id)
      : null;
    const seniorReview = reviews.find(
      (r) => r.revieweeId === artifact.beginner.id && r.type === ReviewType.SENIOR_TO_BEGINNER
    );

    const nextVersion = artifact.currentVersion + 1;
    const verificationUrl = buildVerificationUrl(verificationBase, artifact.artifactCode);
    const pdf = await generateArtifactPdf(
      this.toPdfData({
        code: artifact.artifactCode,
        verificationUrl,
        issuedAt: artifact.issuedAt,
        projectTitle: artifact.project.title,
        umkmName: artifact.project.umkm.name,
        seniorName: artifact.senior.name,
        beginnerName: artifact.beginner.name,
        summary: full?.contributionSummary ?? "—",
        technologies: full?.contributionSkills.map((cs) => cs.skill.name) ?? [],
        feedback: seniorReview?.comment ?? null,
      })
    );
    const pdfPath = await artifactStorageService.uploadPdf(
      artifact.artifactCode,
      nextVersion,
      pdf
    );
    const updated = await artifactRepository.addVersion({
      artifactId,
      version: nextVersion,
      pdfPath,
      generatedBy: seniorId,
      verificationUrl,
    });
    await auditLogRepository.create({
      userId: seniorId,
      action: AuditAction.ARTIFACT_REGENERATED,
      entityType: EntityType.ARTIFACT,
      entityId: artifactId,
    });
    return updated;
  },

  // GET /artifacts/:id — detail with version history.
  async getArtifactDetail(id: string) {
    const artifact = await artifactRepository.findById(id);
    if (!artifact) throw new NotFoundError("Sertifikat tidak ditemukan");
    return artifact;
  },

  // GET /artifacts — the caller's own certificates (beginner "Sertifikat Saya").
  listMine(beginnerId: string) {
    return artifactRepository.listByBeginner(beginnerId);
  },

  // GET /me/artifact-pipeline — derived per-project artifact pipeline for the
  // "Artifact Saya" page. No stored artifact status: state is computed from the
  // existing contribution / review / artifact data (D-P8-4).
  //   VERIFIED  = artifact issued
  //   READY     = contribution approved + senior & UMKM reviews done, not issued
  //   IN_PROGRESS = anything earlier
  async beginnerPipeline(beginnerId: string) {
    const memberships = await projectMemberRepository.listByUserWithProject(beginnerId);
    return Promise.all(
      memberships.map(async (m) => {
        const projectId = m.project.id;
        const [contributionRow, reviews, artifact] = await Promise.all([
          contributionRepository.findByBeginnerAndProject(projectId, beginnerId),
          reviewRepository.listByProject(projectId),
          artifactRepository.findByProjectAndBeginner(projectId, beginnerId),
        ]);
        const contribution = contributionRow
          ? await contributionRepository.findById(contributionRow.id)
          : null;
        const artifactDetail = artifact ? await artifactRepository.findById(artifact.id) : null;

        const contributionApproved = contribution?.status === ContributionStatus.APPROVED;
        const hasSeniorReview = reviews.some(
          (r) => r.revieweeId === beginnerId && r.type === ReviewType.SENIOR_TO_BEGINNER
        );
        const hasUmkmReview = reviews.some(
          (r) => r.revieweeId === beginnerId && r.type === ReviewType.UMKM_TO_BEGINNER
        );
        const issued = !!artifactDetail;

        const status = issued
          ? "VERIFIED"
          : contributionApproved && hasSeniorReview && hasUmkmReview
            ? "READY"
            : "IN_PROGRESS";

        const stages = [
          { key: "contribution", label: "Kontribusi Tercatat", done: contributionApproved },
          { key: "senior_review", label: "Review Mentor", done: hasSeniorReview },
          { key: "umkm_review", label: "Persetujuan UMKM", done: hasUmkmReview },
          { key: "verification", label: "Verifikasi Sertifikat", done: issued },
          { key: "published", label: "Sertifikat Terbit", done: issued },
        ];

        return {
          projectId,
          projectTitle: m.project.title,
          projectDescription: m.project.description,
          projectImageUrl: m.project.imageUrl ?? null,
          umkm: m.project.umkm,
          senior: m.project.senior,
          roleName: m.projectRole?.roleName ?? null,
          team: m.project.projectMembers.map((pm) => pm.user),
          technologies: contribution?.contributionSkills.map((cs) => cs.skill.name) ?? [],
          contributionApproved,
          hasSeniorReview,
          hasUmkmReview,
          status,
          stages,
          artifact: artifactDetail
            ? {
                id: artifactDetail.id,
                artifactCode: artifactDetail.artifactCode,
                currentVersion: artifactDetail.currentVersion,
                issuedAt: artifactDetail.issuedAt,
                verifiedBy: artifactDetail.senior?.name ?? null,
              }
            : null,
        };
      })
    );
  },

  // GET /projects/:id/artifacts — all certificates for a project (senior tab).
  listForProject(projectId: string) {
    return artifactRepository.listByProject(projectId);
  },

  // GET /me/artifact-pipeline/:projectId — full composed detail for the
  // "Artifact Saya" detail page (about, achievements, deliverables, verification
  // timeline, mentor feedback, team). Derived; scoped to the calling beginner.
  async beginnerProjectDetail(beginnerId: string, projectId: string) {
    type Deliverable = Awaited<ReturnType<typeof deliverableRepository.listByProject>>[number];
    type Member = Awaited<ReturnType<typeof projectMemberRepository.listByProject>>[number];
    const membership = await projectMemberRepository.findByUserAndProject(beginnerId, projectId);
    if (!membership) throw new NotFoundError("Proyek tidak ditemukan untuk Anda");

    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Proyek tidak ditemukan");

    const [contributionRow, reviews, artifact, deliverables, members] = await Promise.all([
      contributionRepository.findByBeginnerAndProject(projectId, beginnerId),
      reviewRepository.listByProject(projectId),
      artifactRepository.findByProjectAndBeginner(projectId, beginnerId),
      deliverableRepository.listByProject(projectId),
      projectMemberRepository.listByProject(projectId),
    ]);
    const contribution = contributionRow
      ? await contributionRepository.findById(contributionRow.id)
      : null;
    const artifactDetail = artifact ? await artifactRepository.findById(artifact.id) : null;

    const seniorReview =
      reviews.find(
        (r) => r.revieweeId === beginnerId && r.type === ReviewType.SENIOR_TO_BEGINNER
      ) ?? null;
    const umkmReview =
      reviews.find(
        (r) => r.revieweeId === beginnerId && r.type === ReviewType.UMKM_TO_BEGINNER
      ) ?? null;

    const contributionApproved = contribution?.status === ContributionStatus.APPROVED;
    const issued = !!artifactDetail;
    const status = issued
      ? "VERIFIED"
      : contributionApproved && !!seniorReview && !!umkmReview
        ? "READY"
        : "IN_PROGRESS";

    // Achievements = the contribution summary split into lines/sentences.
    const achievements = (contribution?.contributionSummary ?? "")
      .split(/\r?\n|(?<=\.)\s+(?=[A-Z0-9])/)
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      projectId,
      status,
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl ?? null,
        status: project.status,
        startDate: project.startDate,
        deadline: project.deadline,
        completedAt: project.completedAt,
      },
      umkm: project.umkm ? { id: project.umkm.id, name: project.umkm.name } : null,
      senior: project.senior ? { id: project.senior.id, name: project.senior.name } : null,
      roleName: membership.projectRole?.roleName ?? null,
      technologies: contribution?.contributionSkills.map((cs) => cs.skill.name) ?? [],
      contributionSummary: contribution?.contributionSummary ?? null,
      achievements,
      contributionApproved,
      seniorReview: seniorReview
        ? {
            reviewerName: seniorReview.reviewer.name,
            rating: seniorReview.rating,
            comment: seniorReview.comment,
            createdAt: seniorReview.createdAt,
          }
        : null,
      umkmReview: umkmReview
        ? {
            reviewerName: umkmReview.reviewer.name,
            rating: umkmReview.rating,
            comment: umkmReview.comment,
            createdAt: umkmReview.createdAt,
          }
        : null,
      deliverables: (deliverables as Deliverable[])
        .filter((d) => d.submitter.id === beginnerId)
        .map((d) => ({
          id: d.id,
          title: d.title,
          status: d.status,
          evidences: d.evidences.map((e) => ({ type: e.type, url: e.url, filePath: e.filePath })),
        })),
      team: (members as Member[])
        .filter((m) => m.status === MemberStatus.ACTIVE || m.status === MemberStatus.COMPLETED)
        .map((m) => ({ id: m.user.id, name: m.user.name, roleName: m.projectRole?.roleName ?? null })),
      timeline: [
        {
          key: "contribution",
          label: "Kontribusi Tercatat",
          done: contributionApproved,
          at: contribution?.createdAt ?? null,
          by: null,
        },
        {
          key: "senior_review",
          label: "Review Mentor",
          done: !!seniorReview,
          at: seniorReview?.createdAt ?? null,
          by: seniorReview?.reviewer.name ?? project.senior?.name ?? null,
        },
        {
          key: "umkm_review",
          label: "Persetujuan UMKM",
          done: !!umkmReview,
          at: umkmReview?.createdAt ?? null,
          by: umkmReview?.reviewer.name ?? project.umkm?.name ?? null,
        },
        {
          key: "verification",
          label: "Verifikasi Sertifikat",
          done: issued,
          at: artifactDetail?.issuedAt ?? null,
          by: issued ? "Tim EduNomad" : null,
        },
      ],
      artifact: artifactDetail
        ? {
            id: artifactDetail.id,
            artifactCode: artifactDetail.artifactCode,
            currentVersion: artifactDetail.currentVersion,
            issuedAt: artifactDetail.issuedAt,
          }
        : null,
    };
  },

  // GET /admin/artifacts — all certificates (admin monitoring).
  listAll() {
    return artifactRepository.listAll();
  },

  // GET /artifacts/:id/download — current-version PDF bytes + filename.
  async downloadPdf(id: string) {
    const artifact = await artifactRepository.findById(id);
    if (!artifact) throw new NotFoundError("Sertifikat tidak ditemukan");
    const current = artifact.versions.find((v) => v.version === artifact.currentVersion);
    if (!current) throw new NotFoundError("Versi sertifikat tidak ditemukan");
    const buffer = await artifactStorageService.downloadPdf(current.pdfPath);
    return { buffer, filename: `${artifact.artifactCode}.pdf` };
  },

  // GET /verify/:artifactCode — PUBLIC. Returns a safe verification view; never
  // exposes storage paths or ids.
  async verify(code: string) {
    const artifact = await artifactRepository.findByCode(code);
    if (!artifact) {
      return { valid: false as const };
    }
    return {
      valid: true as const,
      artifactCode: artifact.artifactCode,
      beginnerName: artifact.beginner.name,
      projectTitle: artifact.project.title,
      umkmName: artifact.project.umkm?.name ?? null,
      seniorName: artifact.senior.name,
      issuedAt: artifact.issuedAt,
      currentVersion: artifact.currentVersion,
    };
  },

  toPdfData(args: {
    code: string;
    verificationUrl: string;
    issuedAt: Date;
    projectTitle: string;
    umkmName: string;
    seniorName: string;
    beginnerName: string;
    summary: string;
    technologies: string[];
    feedback: string | null;
  }): ArtifactPdfData {
    return {
      artifactCode: args.code,
      beginnerName: args.beginnerName,
      umkmName: args.umkmName,
      seniorName: args.seniorName,
      projectTitle: args.projectTitle,
      contributionSummary: args.summary,
      technologies: args.technologies,
      feedback: args.feedback,
      issuedAt: args.issuedAt,
      verificationUrl: args.verificationUrl,
    };
  },
};
