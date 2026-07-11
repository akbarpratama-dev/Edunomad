import type { Request, Response } from "express";
import { env } from "../../config/env";
import { resetDemo, resetDemoScenario } from "../../services/demo/demo.service";

// Shared gate for every demo endpoint: demo mode must be on, a reset token must
// be configured, and the caller must present it (as `x-demo-token` header or
// `{ token }` body). Returns the failing response, or null when authorised.
// Only available when DEMO_MODE is on, so it can never fire in real deployments.
function guard(req: Request, res: Response): Response | null {
  if (!env.demoMode) return res.status(404).json({ success: false, message: "Not found" });
  if (!env.demoResetToken) {
    return res.status(503).json({ success: false, message: "DEMO_RESET_TOKEN belum diset di server" });
  }
  const token = (req.header("x-demo-token") ?? "").trim() || String(req.body?.token ?? "").trim();
  if (token !== env.demoResetToken) {
    return res.status(401).json({ success: false, message: "Token reset tidak valid" });
  }
  return null;
}

export const demoController = {
  // POST /demo/reset — restore the FULL demo baseline (all demo UMKM projects).
  async reset(req: Request, res: Response) {
    const blocked = guard(req, res);
    if (blocked) return blocked;
    try {
      const result = await resetDemo();
      return res.json({
        success: true,
        message: `Demo di-reset: ${result.projectsDeleted} proyek dihapus, ${result.projectsSeeded} proyek di-seed ulang, ${result.notificationsDeleted} notifikasi dibersihkan.`,
        data: result,
      });
    } catch (err) {
      console.error("[DEMO] reset failed:", err);
      return res.status(500).json({ success: false, message: "Gagal mereset demo. Cek log server." });
    }
  },

  // POST /demo/reset-scenario — restore ONLY the flagship [DEMO] Kopi Nusantara
  // project to its RECRUITING / no-mentor / no-members baseline. Fast reset
  // between demo runs; leaves the other showcase projects untouched.
  async resetScenario(req: Request, res: Response) {
    const blocked = guard(req, res);
    if (blocked) return blocked;
    try {
      const result = await resetDemoScenario();
      return res.json({
        success: true,
        message: `Proyek skenario di-reset: ${result.projectsDeleted} dihapus, ${result.projectsSeeded} disiapkan ulang, ${result.notificationsDeleted} notifikasi dibersihkan.`,
        data: result,
      });
    } catch (err) {
      console.error("[DEMO] reset-scenario failed:", err);
      return res.status(500).json({ success: false, message: "Gagal mereset proyek skenario. Cek log server." });
    }
  },
};
