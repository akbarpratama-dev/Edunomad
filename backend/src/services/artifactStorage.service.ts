import { supabaseAdmin } from "../config/supabase";
import { BusinessRuleError, NotFoundError } from "../utils/errors";

// Phase 8 — Supabase Storage for artifact certificate PDFs. Private bucket;
// only the path is persisted (FILE STORAGE rule). PDFs are written and read
// server-side with the service role; the authenticated download endpoint
// streams the bytes so certificates are never exposed via a public URL.
const BUCKET = "artifacts";

export const artifactStorageService = {
  // Store a freshly generated PDF and return its storage path. One object per
  // version so regeneration never overwrites history.
  async uploadPdf(
    artifactCode: string,
    version: number,
    pdf: Buffer
  ): Promise<string> {
    const path = `${artifactCode}/v${version}.pdf`;
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, pdf, { contentType: "application/pdf", upsert: true });
    if (error) {
      throw new BusinessRuleError(error.message ?? "Gagal menyimpan berkas sertifikat");
    }
    return path;
  },

  // Read a stored PDF back into a Buffer for the download stream.
  async downloadPdf(path: string): Promise<Buffer> {
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(path);
    if (error || !data) {
      throw new NotFoundError("Berkas sertifikat tidak ditemukan");
    }
    return Buffer.from(await data.arrayBuffer());
  },
};
