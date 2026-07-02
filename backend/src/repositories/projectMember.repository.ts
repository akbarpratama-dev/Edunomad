import { prisma } from "../config/database";
import type { Prisma } from "../generated/prisma/client";
import { MemberStatus } from "../constants/applicationStatus";
import { AuditAction, EntityType } from "../constants/auditActions";

const memberInclude = {
  user: { select: { id: true, name: true, email: true } },
  projectRole: { select: { id: true, roleName: true } },
} satisfies Prisma.ProjectMemberInclude;

// Detail include adds the parent project (for ownership / lead / status checks).
const memberDetailInclude = {
  user: { select: { id: true, name: true, email: true } },
  projectRole: { select: { id: true, roleName: true } },
  project: { select: { id: true, title: true, umkmId: true, seniorId: true, status: true } },
} satisfies Prisma.ProjectMemberInclude;

// GET /me/projects — the caller's own memberships with enough project info to
// render the beginner "Proyek Saya" view.
const myMembershipInclude = {
  projectRole: { select: { id: true, roleName: true } },
  project: {
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      deadline: true,
      startDate: true,
      imageUrl: true,
      umkm: { select: { id: true, name: true } },
      senior: { select: { id: true, name: true } },
      category: { select: { id: true, name: true, slug: true } },
      // Active teammates — used for the dashboard project-card avatar cluster.
      projectMembers: {
        where: { status: MemberStatus.ACTIVE },
        select: { user: { select: { id: true, name: true } } },
      },
    },
  },
} satisfies Prisma.ProjectMemberInclude;

export const projectMemberRepository = {
  // BR-001: a beginner may belong to only ONE ACTIVE project at a time.
  countActiveByUser(userId: string) {
    return prisma.projectMember.count({
      where: { userId, status: MemberStatus.ACTIVE },
    });
  },

  // Capacity check: how many ACTIVE members already fill a role slot.
  countActiveByRole(projectRoleId: string) {
    return prisma.projectMember.count({
      where: { projectRoleId, status: MemberStatus.ACTIVE },
    });
  },

  // Team-size check at activation (Workflow 5): how many ACTIVE members a project has.
  countActiveByProject(projectId: string) {
    return prisma.projectMember.count({
      where: { projectId, status: MemberStatus.ACTIVE },
    });
  },

  // A single user's membership in a project (any live/completed status) with role.
  findByUserAndProject(userId: string, projectId: string) {
    return prisma.projectMember.findFirst({
      where: { userId, projectId },
      include: { projectRole: { select: { id: true, roleName: true } } },
    });
  },

  // Is this user an ACTIVE member of the project? (deliverable/contribution gate).
  async isActiveMember(projectId: string, userId: string) {
    const count = await prisma.projectMember.count({
      where: { projectId, userId, status: MemberStatus.ACTIVE },
    });
    return count > 0;
  },

  // GET /me/projects — projects the user is (or was) a member of, newest first.
  // Excludes WITHDRAWN/REMOVED so the view shows only live or completed memberships.
  listByUserWithProject(userId: string) {
    return prisma.projectMember.findMany({
      where: {
        userId,
        status: {
          in: [MemberStatus.ACTIVE, MemberStatus.COMPLETED, MemberStatus.REMOVAL_REQUESTED],
        },
      },
      include: myMembershipInclude,
      orderBy: { joinedAt: "desc" },
    });
  },

  // GET /projects/:id/members.
  listByProject(projectId: string) {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: memberInclude,
      orderBy: { joinedAt: "asc" },
    });
  },

  // Single member with its parent project (ownership/lead/status checks).
  findById(id: string) {
    return prisma.projectMember.findUnique({ where: { id }, include: memberDetailInclude });
  },

  updateStatus(id: string, status: string) {
    return prisma.projectMember.update({ where: { id }, data: { status }, include: memberDetailInclude });
  },

  // Workflow 17 step 1: SENIOR requests removal. Member → REMOVAL_REQUESTED and
  // the request (with reason) is recorded in the audit log for the admin review.
  requestRemoval(args: { memberId: string; seniorId: string; memberUserId: string; reason: string }) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.projectMember.update({
        where: { id: args.memberId },
        data: { status: MemberStatus.REMOVAL_REQUESTED },
        include: memberDetailInclude,
      });
      await tx.auditLog.create({
        data: {
          userId: args.seniorId,
          action: AuditAction.MEMBER_REMOVED,
          entityType: EntityType.PROJECT_MEMBER,
          entityId: args.memberId,
          metadata: { stage: "REQUESTED", reason: args.reason, memberUserId: args.memberUserId },
        },
      });
      return updated;
    });
  },

  // Workflow 17 step 2: ADMIN confirms. Member → REMOVED, finalised in audit log.
  confirmRemoval(args: { memberId: string; adminId: string; memberUserId: string }) {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.projectMember.update({
        where: { id: args.memberId },
        data: { status: MemberStatus.REMOVED },
        include: memberDetailInclude,
      });
      await tx.auditLog.create({
        data: {
          userId: args.adminId,
          action: AuditAction.MEMBER_REMOVED,
          entityType: EntityType.PROJECT_MEMBER,
          entityId: args.memberId,
          metadata: { stage: "CONFIRMED", memberUserId: args.memberUserId },
        },
      });
      return updated;
    });
  },
};
