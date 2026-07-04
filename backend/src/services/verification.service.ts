import { verificationRepository } from "../repositories/verification.repository";
import { userRepository } from "../repositories/user.repository";
import { BusinessRuleError, NotFoundError } from "../utils/errors";
import type { Prisma } from "../generated/prisma/client";
import type { ListVerificationsQuery, SubmitVerificationInput } from "../validators/verification.validator";
import { notificationService } from "./notification.service";
import { NotificationType } from "../constants/notificationType";

function composeNotes(input: SubmitVerificationInput): string {
  const lines: string[] = [];
  if (input.portfolio_url) lines.push(`Portfolio: ${input.portfolio_url}`);
  if (input.experience_years !== undefined)
    lines.push(`Pengalaman: ${input.experience_years} tahun`);
  if (input.additional_info) lines.push(`Info tambahan: ${input.additional_info}`);
  return lines.join("\n");
}

export const verificationService = {
  // GET /verification-status — current user's verification state.
  async getStatus(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    const request = await verificationRepository.findLatestByUser(userId);
    return {
      accountStatus: user.status,
      request: request
        ? { id: request.id, status: request.status, notes: request.notes, createdAt: request.createdAt }
        : null,
    };
  },

  // POST /verification-request — updates the PENDING request created at
  // registration with supporting info, or creates one if none exists.
  async submitRequest(userId: string, input: SubmitVerificationInput) {
    const notes = composeNotes(input);
    const existing = await verificationRepository.findLatestByUser(userId);
    if (existing && existing.status === "PENDING") {
      return verificationRepository.update(existing.id, { notes });
    }
    return verificationRepository.create({ userId, status: "PENDING", notes });
  },

  // GET /admin/verifications — queue, filterable by status.
  async getPending(query: ListVerificationsQuery) {
    const where: Prisma.VerificationRequestWhereInput = {};
    if (query.status) where.status = query.status;
    const { data, total } = await verificationRepository.findManyPaginated(
      where,
      query.page,
      query.limit
    );
    return { data, total, page: query.page, limit: query.limit };
  },

  // POST /admin/verifications/:id/approve
  async approve(adminId: string, requestId: string) {
    const request = await verificationRepository.findById(requestId);
    if (!request) throw new NotFoundError("Verification request not found");
    if (request.status !== "PENDING") {
      throw new BusinessRuleError("Verification request already reviewed");
    }
    const result = await verificationRepository.approve(requestId, request.userId, adminId);
    await notificationService.notify({
      userId: request.userId,
      type: NotificationType.VERIFICATION_APPROVED,
      title: "Akun terverifikasi",
      message: "Selamat! Akunmu telah diverifikasi admin.",
      actionUrl: "/dashboard",
    });
    return result;
  },

  // POST /admin/verifications/:id/reject
  async reject(adminId: string, requestId: string, reason: string) {
    const request = await verificationRepository.findById(requestId);
    if (!request) throw new NotFoundError("Verification request not found");
    if (request.status !== "PENDING") {
      throw new BusinessRuleError("Verification request already reviewed");
    }
    const result = await verificationRepository.reject(requestId, request.userId, adminId, reason);
    await notificationService.notify({
      userId: request.userId,
      type: NotificationType.VERIFICATION_REJECTED,
      title: "Verifikasi ditolak",
      message: `Verifikasi akunmu ditolak. Alasan: ${reason}`,
      actionUrl: "/dashboard",
    });
    return result;
  },
};
