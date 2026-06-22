import { projectApplicationRepository } from "../repositories/projectApplication.repository";
import { projectMemberRepository } from "../repositories/projectMember.repository";
import { projectRoleRepository } from "../repositories/projectRole.repository";
import { projectRepository } from "../repositories/project.repository";
import {
  BusinessRuleError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";
import { ProjectStatus } from "../constants/projectStatus";
import { ApplicationStatus } from "../constants/applicationStatus";

// Beginner recruitment (Workflow 4 + RBAC Beginner Application Flow + BR-001/004/005).
export const projectApplicationService = {
  // POST /projects/:id/apply (BEGINNER, verified).
  async applyToRole(
    beginnerId: string,
    projectId: string,
    projectRoleId: string,
    motivation?: string
  ) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.status !== ProjectStatus.RECRUITING) {
      throw new BusinessRuleError("Project is not open for recruitment");
    }
    // BR-004 (Senior First): beginners may only apply once a senior is assigned.
    if (!project.seniorId) {
      throw new BusinessRuleError("This project does not have a senior mentor yet");
    }

    const role = await projectRoleRepository.findById(projectRoleId);
    if (!role) throw new NotFoundError("Role not found");
    if (role.projectId !== projectId) {
      throw new ValidationError("Role does not belong to this project");
    }

    // BR-001: beginner may not apply while already in an ACTIVE project.
    const activeMemberships = await projectMemberRepository.countActiveByUser(beginnerId);
    if (activeMemberships > 0) {
      throw new BusinessRuleError("You already belong to an active project");
    }

    const existing = await projectApplicationRepository.findOpenByProjectAndBeginner(
      projectId,
      beginnerId
    );
    if (existing) throw new BusinessRuleError("You have already applied to this project");

    return projectApplicationRepository.create({
      projectId,
      projectRoleId,
      beginnerId,
      motivation: motivation ?? null,
    });
  },

  // DELETE /applications/:id (BEGINNER applicant) — PENDING → WITHDRAWN.
  async withdraw(beginnerId: string, applicationId: string) {
    const app = await projectApplicationRepository.findById(applicationId);
    if (!app) throw new NotFoundError("Application not found");
    if (app.beginnerId !== beginnerId) throw new ForbiddenError("This is not your application");
    if (app.status !== ApplicationStatus.PENDING) {
      throw new BusinessRuleError("Only pending applications can be withdrawn");
    }
    return projectApplicationRepository.updateStatus(applicationId, ApplicationStatus.WITHDRAWN);
  },

  // GET /applications (BEGINNER) — own applications.
  async listMine(beginnerId: string) {
    return projectApplicationRepository.listByBeginner(beginnerId);
  },

  // GET /projects/:id/applications (SENIOR lead).
  async listForProject(seniorId: string, projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    if (project.seniorId !== seniorId) {
      throw new ForbiddenError("Only the project's senior can view applicants");
    }
    return projectApplicationRepository.listByProject(projectId);
  },

  // POST /applications/:id/accept (SENIOR lead) — beginner becomes ACTIVE member.
  async accept(seniorId: string, applicationId: string) {
    const app = await projectApplicationRepository.findById(applicationId);
    if (!app) throw new NotFoundError("Application not found");
    if (app.project.seniorId !== seniorId) {
      throw new ForbiddenError("Only the project's senior can decide applications");
    }
    if (app.status !== ApplicationStatus.PENDING) {
      throw new BusinessRuleError("Only pending applications can be accepted");
    }
    if (app.project.status !== ProjectStatus.RECRUITING) {
      throw new BusinessRuleError("Project is not open for recruitment");
    }
    // BR-001 re-check at decision time.
    const activeMemberships = await projectMemberRepository.countActiveByUser(app.beginnerId);
    if (activeMemberships > 0) {
      throw new BusinessRuleError("Beginner already belongs to an active project");
    }
    // Capacity: role slot must not already be full.
    const role = await projectRoleRepository.findById(app.projectRoleId);
    if (!role) throw new NotFoundError("Role not found");
    const filled = await projectMemberRepository.countActiveByRole(app.projectRoleId);
    if (filled >= role.capacity) {
      throw new BusinessRuleError("This role slot is already full");
    }
    return projectApplicationRepository.accept({
      id: app.id,
      projectId: app.projectId,
      projectRoleId: app.projectRoleId,
      beginnerId: app.beginnerId,
    });
  },

  // POST /applications/:id/reject (SENIOR lead).
  async reject(seniorId: string, applicationId: string) {
    const app = await projectApplicationRepository.findById(applicationId);
    if (!app) throw new NotFoundError("Application not found");
    if (app.project.seniorId !== seniorId) {
      throw new ForbiddenError("Only the project's senior can decide applications");
    }
    if (app.status !== ApplicationStatus.PENDING) {
      throw new BusinessRuleError("Only pending applications can be rejected");
    }
    return projectApplicationRepository.updateStatus(applicationId, ApplicationStatus.REJECTED);
  },
};
