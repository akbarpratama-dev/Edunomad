import { projectRepository } from "../repositories/project.repository";
import { categoryRepository } from "../repositories/category.repository";
import { userRepository } from "../repositories/user.repository";
import { auditLogService } from "./auditLog.service";
import { BusinessRuleError, ForbiddenError, NotFoundError } from "../utils/errors";
import { ProjectStatus, PUBLIC_PROJECT_STATUSES } from "../constants/projectStatus";
import { AuditAction, EntityType } from "../constants/auditActions";
import { notificationService } from "./notification.service";
import { NotificationType } from "../constants/notificationType";
import type { Prisma } from "../generated/prisma/client";
import type { CreateProjectInput, ListProjectsQuery, MyProjectsQuery } from "../validators/project.validator";

const UMKM_MAX_ACTIVE = 5;
const SENIOR_MAX_ACTIVE = 5;

function toData(input: CreateProjectInput) {
  return {
    categoryId: input.category_id,
    title: input.title,
    description: input.description,
    expectedDeliverables: input.expected_deliverables,
    imageUrl: input.image_url ?? null,
    startDate: input.start_date,
    deadline: input.deadline,
  };
}

async function getOwnedProject(umkmId: string, projectId: string) {
  const project = await projectRepository.findRawById(projectId);
  if (!project) throw new NotFoundError("Project not found");
  if (project.umkmId !== umkmId) {
    throw new ForbiddenError("You do not own this project");
  }
  return project;
}

export const projectService = {
  // GET /projects (public) — only publicly-visible statuses; optional q/category/status.
  async getProjects(query: ListProjectsQuery) {
    const where: Prisma.ProjectWhereInput = {};
    // Constrain to public statuses (intersect with the requested status if any).
    where.status = query.status
      ? PUBLIC_PROJECT_STATUSES.includes(query.status as never)
        ? query.status
        : "__none__"
      : { in: PUBLIC_PROJECT_STATUSES };
    if (query.category) where.categoryId = query.category;
    // Beginners only see projects that already have a mentor (senior) assigned —
    // recruitment for beginners only opens after a senior joins. Seniors see the
    // inverse: only projects still without a mentor (i.e. still hiring one).
    if (query.hasSenior === "true") where.seniorId = { not: null };
    else if (query.hasSenior === "false") where.seniorId = null;
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
      ];
    }
    const { data, total } = await projectRepository.findManyPaginatedBrowse(
      where,
      query.page,
      query.limit
    );
    return { data, total, page: query.page, limit: query.limit };
  },

  async getProjectDetail(projectId: string) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    return project;
  },

  // POST /projects (UMKM, VERIFIED) — status DRAFT. Block if the UMKM already
  // has the max number of ACTIVE projects (RBAC UMKM constraint).
  async createProject(umkmId: string, input: CreateProjectInput) {
    const category = await categoryRepository.findById(input.category_id);
    if (!category) throw new NotFoundError("Category not found");

    const activeCount = await projectRepository.countActiveByUmkm(umkmId);
    if (activeCount >= UMKM_MAX_ACTIVE) {
      throw new BusinessRuleError(`UMKM has reached the maximum of ${UMKM_MAX_ACTIVE} active projects`);
    }

    return projectRepository.create({
      umkmId,
      status: ProjectStatus.DRAFT,
      ...toData(input),
    });
  },

  // PUT /projects/:id — owner only, DRAFT only.
  async updateProject(umkmId: string, projectId: string, input: CreateProjectInput) {
    const project = await getOwnedProject(umkmId, projectId);
    if (project.status !== ProjectStatus.DRAFT) {
      throw new BusinessRuleError("Only DRAFT projects can be edited");
    }
    const category = await categoryRepository.findById(input.category_id);
    if (!category) throw new NotFoundError("Category not found");
    return projectRepository.update(projectId, toData(input));
  },

  // DELETE /projects/:id — owner only, DRAFT only, soft delete.
  async deleteProject(umkmId: string, projectId: string) {
    const project = await getOwnedProject(umkmId, projectId);
    if (project.status !== ProjectStatus.DRAFT) {
      throw new BusinessRuleError("Only DRAFT projects can be deleted");
    }
    await projectRepository.softDelete(projectId);
  },

  // POST /projects/:id/submit — owner only, DRAFT → PENDING_REVIEW (Workflow 2).
  async submitForReview(umkmId: string, projectId: string) {
    const project = await getOwnedProject(umkmId, projectId);
    if (project.status !== ProjectStatus.DRAFT) {
      throw new BusinessRuleError("Only DRAFT projects can be submitted for review");
    }
    return projectRepository.update(projectId, { status: ProjectStatus.PENDING_REVIEW });
  },

  // GET /my-projects (UMKM) — own projects, any status.
  async getMyProjects(umkmId: string, query: MyProjectsQuery) {
    const where: Prisma.ProjectWhereInput = { umkmId };
    if (query.status) where.status = query.status;
    const { data, total } = await projectRepository.findManyForDashboard(where, query.page, query.limit);
    return { data, total, page: query.page, limit: query.limit };
  },

  // GET /me/mentored-projects (SENIOR) — projects the caller mentors, any status.
  async getMentoredProjects(seniorId: string) {
    const { data } = await projectRepository.findManyForDashboard({ seniorId }, 1, 100);
    return data;
  },

  // --- Admin project approval (3.2) ---
  async getPendingProjects(page: number, limit: number) {
    const { data, total } = await projectRepository.findManyPaginated(
      { status: ProjectStatus.PENDING_REVIEW },
      page,
      limit
    );
    return { data, total, page, limit };
  },

  async approveProject(adminId: string, projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.status !== ProjectStatus.PENDING_REVIEW) {
      throw new BusinessRuleError("Only projects pending review can be approved");
    }
    const result = await projectRepository.setStatusWithAudit(
      projectId,
      ProjectStatus.RECRUITING,
      adminId,
      AuditAction.PROJECT_APPROVED
    );
    await notificationService.notify({
      userId: project.umkmId,
      type: NotificationType.PROJECT_APPROVED,
      title: "Proyek disetujui",
      message: `Proyek "${project.title}" disetujui & masuk tahap rekrutmen.`,
      actionUrl: `/my-projects/${projectId}`,
    });
    return result;
  },

  async rejectProject(adminId: string, projectId: string, reason: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.status !== ProjectStatus.PENDING_REVIEW) {
      throw new BusinessRuleError("Only projects pending review can be rejected");
    }
    const result = await projectRepository.setStatusWithAudit(
      projectId,
      ProjectStatus.REJECTED,
      adminId,
      AuditAction.PROJECT_REJECTED,
      reason
    );
    await notificationService.notify({
      userId: project.umkmId,
      type: NotificationType.PROJECT_REJECTED,
      title: "Proyek ditolak",
      message: `Proyek "${project.title}" ditolak. Alasan: ${reason}`,
      actionUrl: `/my-projects/${projectId}`,
    });
    return result;
  },

  // GET /admin/projects — monitoring list across all statuses (Workflow: Admin
  // Monitoring). Optional status / category / q filters.
  async adminListProjects(query: ListProjectsQuery) {
    const where: Prisma.ProjectWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.category) where.categoryId = query.category;
    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
      ];
    }
    const { data, total } = await projectRepository.adminFindManyPaginated(
      where,
      query.page,
      query.limit
    );
    return { data, total, page: query.page, limit: query.limit };
  },

  // GET /admin/projects/:id/senior-candidates — VERIFIED seniors with spare
  // capacity (<5 active), excluding the project's current mentor.
  async listSeniorCandidates(projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    const seniors = await userRepository.listVerifiedSeniors();
    const eligible = await Promise.all(
      seniors
        .filter((s) => s.id !== project.seniorId)
        .map(async (s) => {
          const activeCount = await projectRepository.countAssignedActiveBySenior(s.id);
          return { ...s, activeCount, eligible: activeCount < SENIOR_MAX_ACTIVE };
        })
    );
    return eligible.filter((s) => s.eligible);
  },

  // POST /admin/projects/:id/replace-senior (Workflow 16). Assign a replacement
  // mentor to a live project without disrupting the team.
  async replaceSenior(adminId: string, projectId: string, newSeniorId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (![ProjectStatus.ACTIVE, ProjectStatus.AWAITING_COMPLETION].includes(project.status as never)) {
      throw new BusinessRuleError("Only active projects can have their mentor replaced");
    }
    if (!project.seniorId) {
      throw new BusinessRuleError("Project has no assigned mentor to replace");
    }
    if (project.seniorId === newSeniorId) {
      throw new BusinessRuleError("The new mentor is already assigned to this project");
    }
    const newSenior = await userRepository.findById(newSeniorId);
    if (!newSenior || newSenior.role !== "SENIOR") {
      throw new BusinessRuleError("Replacement must be a senior mentor");
    }
    if (newSenior.status !== "VERIFIED") {
      throw new BusinessRuleError("Replacement mentor must be verified");
    }
    const activeCount = await projectRepository.countAssignedActiveBySenior(newSeniorId);
    if (activeCount >= SENIOR_MAX_ACTIVE) {
      throw new BusinessRuleError(
        `Replacement mentor has reached the maximum of ${SENIOR_MAX_ACTIVE} active projects`
      );
    }

    const previousSeniorId = project.seniorId;
    const result = await projectRepository.setSenior(projectId, newSeniorId);
    await auditLogService.createAuditLog(adminId, AuditAction.SENIOR_REPLACED, EntityType.PROJECT, projectId, {
      previousSeniorId,
      newSeniorId,
    });
    // Notify both mentors (fire-and-forget).
    await notificationService.notify({
      userId: newSeniorId,
      type: NotificationType.SENIOR_ASSIGNED,
      title: "Kamu ditugaskan sebagai mentor",
      message: `Kamu kini menjadi mentor proyek "${project.title}".`,
      actionUrl: `/my-projects/${projectId}/workspace`,
    });
    await notificationService.notify({
      userId: previousSeniorId,
      type: NotificationType.SENIOR_REMOVED,
      title: "Kamu tidak lagi menjadi mentor",
      message: `Kamu digantikan sebagai mentor proyek "${project.title}".`,
      actionUrl: "/my-projects",
    });
    return result;
  },
};
