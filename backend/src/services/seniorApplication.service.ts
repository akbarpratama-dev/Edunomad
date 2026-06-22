import { seniorApplicationRepository } from "../repositories/seniorApplication.repository";
import { projectRepository } from "../repositories/project.repository";
import { BusinessRuleError, ForbiddenError, NotFoundError } from "../utils/errors";
import { ProjectStatus } from "../constants/projectStatus";
import { ApplicationStatus } from "../constants/applicationStatus";

const SENIOR_MAX_ACTIVE = 5;

// Senior recruitment (Workflow 3 + RBAC Senior Application Flow).
export const seniorApplicationService = {
  // POST /projects/:id/senior-apply (SENIOR, verified).
  async applyAsMentor(seniorId: string, projectId: string, message?: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.status !== ProjectStatus.RECRUITING) {
      throw new BusinessRuleError("Project is not open for senior recruitment");
    }
    // BR-006: one senior per project — block once a mentor is assigned.
    if (project.seniorId) {
      throw new BusinessRuleError("This project already has an assigned senior");
    }
    const existing = await seniorApplicationRepository.findOpenByProjectAndSenior(
      projectId,
      seniorId
    );
    if (existing) throw new BusinessRuleError("You have already applied to this project");

    // BR-002: senior may hold max 5 RECRUITING+ACTIVE projects.
    const activeCount = await projectRepository.countAssignedActiveBySenior(seniorId);
    if (activeCount >= SENIOR_MAX_ACTIVE) {
      throw new BusinessRuleError(
        `Senior has reached the maximum of ${SENIOR_MAX_ACTIVE} active projects`
      );
    }

    return seniorApplicationRepository.create({
      projectId,
      seniorId,
      message: message ?? null,
    });
  },

  // DELETE /senior-applications/:id (SENIOR applicant) — PENDING → WITHDRAWN.
  async withdraw(seniorId: string, applicationId: string) {
    const app = await seniorApplicationRepository.findById(applicationId);
    if (!app) throw new NotFoundError("Application not found");
    if (app.seniorId !== seniorId) throw new ForbiddenError("This is not your application");
    if (app.status !== ApplicationStatus.PENDING) {
      throw new BusinessRuleError("Only pending applications can be withdrawn");
    }
    return seniorApplicationRepository.updateStatus(applicationId, ApplicationStatus.WITHDRAWN);
  },

  // GET /senior-applications (SENIOR) — own applications.
  async listMine(seniorId: string) {
    return seniorApplicationRepository.listBySenior(seniorId);
  },

  // GET /projects/:id/senior-applications (UMKM owner).
  async listForProject(umkmId: string, projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.umkmId !== umkmId) throw new ForbiddenError("You do not own this project");
    return seniorApplicationRepository.listByProject(projectId);
  },

  // POST /senior-applications/:id/accept (UMKM owner) — assign mentor.
  async accept(umkmId: string, applicationId: string) {
    const app = await seniorApplicationRepository.findById(applicationId);
    if (!app) throw new NotFoundError("Application not found");
    if (app.project.umkmId !== umkmId) throw new ForbiddenError("You do not own this project");
    if (app.status !== ApplicationStatus.PENDING) {
      throw new BusinessRuleError("Only pending applications can be accepted");
    }
    if (app.project.status !== ProjectStatus.RECRUITING) {
      throw new BusinessRuleError("Project is not open for senior recruitment");
    }
    if (app.project.seniorId) {
      throw new BusinessRuleError("This project already has an assigned senior");
    }
    // BR-002 re-check at decision time.
    const activeCount = await projectRepository.countAssignedActiveBySenior(app.seniorId);
    if (activeCount >= SENIOR_MAX_ACTIVE) {
      throw new BusinessRuleError(
        `Senior has reached the maximum of ${SENIOR_MAX_ACTIVE} active projects`
      );
    }
    return seniorApplicationRepository.accept(applicationId, app.projectId, app.seniorId);
  },

  // POST /senior-applications/:id/reject (UMKM owner).
  async reject(umkmId: string, applicationId: string) {
    const app = await seniorApplicationRepository.findById(applicationId);
    if (!app) throw new NotFoundError("Application not found");
    if (app.project.umkmId !== umkmId) throw new ForbiddenError("You do not own this project");
    if (app.status !== ApplicationStatus.PENDING) {
      throw new BusinessRuleError("Only pending applications can be rejected");
    }
    return seniorApplicationRepository.updateStatus(applicationId, ApplicationStatus.REJECTED);
  },
};
