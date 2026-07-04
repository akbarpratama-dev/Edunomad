import { projectMemberRepository } from "../repositories/projectMember.repository";
import { projectRepository } from "../repositories/project.repository";
import { BusinessRuleError, ForbiddenError, NotFoundError } from "../utils/errors";
import { MemberStatus } from "../constants/applicationStatus";
import { ProjectStatus } from "../constants/projectStatus";
import { notificationService } from "./notification.service";
import { NotificationType } from "../constants/notificationType";

// Project members & membership lifecycle (Workflow 16 withdrawal / 17 removal).
export const projectMemberService = {
  // GET /projects/:id/members (any authenticated user).
  async listMembers(projectId: string) {
    const project = await projectRepository.findRawById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    return projectMemberRepository.listByProject(projectId);
  },

  // GET /me/projects — the caller's own project memberships (beginner "Proyek Saya").
  listMyProjects(userId: string) {
    return projectMemberRepository.listByUserWithProject(userId);
  },

  // POST /members/:id/remove (SENIOR lead) — Workflow 17 request flow.
  async requestRemoval(seniorId: string, memberId: string, reason: string) {
    const member = await projectMemberRepository.findById(memberId);
    if (!member) throw new NotFoundError("Member not found");
    if (member.project.seniorId !== seniorId) {
      throw new ForbiddenError("Only the project's senior can request member removal");
    }
    if (member.project.status === ProjectStatus.COMPLETED) {
      throw new BusinessRuleError("This project is completed and read-only");
    }
    if (member.status !== MemberStatus.ACTIVE) {
      throw new BusinessRuleError("Only active members can be removed");
    }
    return projectMemberRepository.requestRemoval({
      memberId,
      seniorId,
      memberUserId: member.userId,
      reason,
    });
  },

  // POST /members/:id/withdraw (authenticated member) — Workflow 16. The member
  // voluntarily leaves; their ACTIVE-project slot (BR-001) is freed immediately.
  async withdraw(userId: string, memberId: string) {
    const member = await projectMemberRepository.findById(memberId);
    if (!member) throw new NotFoundError("Member not found");
    if (member.userId !== userId) {
      throw new ForbiddenError("You can only withdraw your own membership");
    }
    if (member.project.status === ProjectStatus.COMPLETED) {
      throw new BusinessRuleError("This project is completed and read-only");
    }
    if (member.status !== MemberStatus.ACTIVE) {
      throw new BusinessRuleError("Only active memberships can be withdrawn");
    }
    return projectMemberRepository.updateStatus(memberId, MemberStatus.WITHDRAWN);
  },

  // POST /admin/members/:id/remove (ADMIN) — Workflow 17 confirm/approve.
  async confirmRemoval(adminId: string, memberId: string) {
    const member = await projectMemberRepository.findById(memberId);
    if (!member) throw new NotFoundError("Member not found");
    if (member.status !== MemberStatus.REMOVAL_REQUESTED) {
      throw new BusinessRuleError("No pending removal request for this member");
    }
    const result = await projectMemberRepository.confirmRemoval({
      memberId,
      adminId,
      memberUserId: member.userId,
    });
    await notificationService.notify({
      userId: member.userId,
      type: NotificationType.MEMBER_REMOVED,
      title: "Dikeluarkan dari proyek",
      message: `Kamu dikeluarkan dari proyek "${member.project.title}".`,
      actionUrl: "/my-projects",
    });
    return result;
  },
};
