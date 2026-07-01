import { randomUUID } from "crypto";
import { supabaseAdmin } from "../config/supabase";
import { BusinessRuleError } from "../utils/errors";

// Phase 12.4 — Supabase Storage for discussion attachments. Private bucket;
// clients upload via a signed upload URL and read via short-lived signed URLs
// (both minted here with the service role). Only path/metadata is persisted.
const BUCKET = "discussion-attachments";
const DOWNLOAD_TTL = 60 * 60; // 1 hour

export const storageService = {
  // Mint a one-off signed upload URL + token for a new object under a discussion.
  async createUploadUrl(discussionId: string, fileName: string) {
    const safe = fileName.replace(/[^\w.\-]+/g, "_").slice(-100);
    const path = `${discussionId}/${randomUUID()}-${safe}`;
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      throw new BusinessRuleError(error?.message ?? "Gagal membuat URL unggah");
    }
    return { path: data.path, token: data.token, signedUrl: data.signedUrl };
  },

  // Short-lived signed download URL for a stored object (null-safe).
  async signDownload(filePath: string | null): Promise<string | null> {
    if (!filePath) return null;
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(filePath, DOWNLOAD_TTL);
    if (error || !data) return null;
    return data.signedUrl;
  },
};
