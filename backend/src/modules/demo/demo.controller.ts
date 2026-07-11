import type { Request, Response } from "express";
import { env } from "../../config/env";
import { resetDemo } from "../../services/demo/demo.service";

// POST /demo/reset — restore the demo baseline. No login: protected by a shared
// token (env DEMO_RESET_TOKEN) sent as `x-demo-token` header or `{ token }` body.
// Only available when DEMO_MODE is on, so it can never fire in real deployments.
export const demoController = {
  async reset(req: Request, res: Response) {
    if (!env.demoMode) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    if (!env.demoResetToken) {
      return res
        .status(503)
        .json({ success: false, message: "DEMO_RESET_TOKEN belum diset di server" });
    }
    const token =
      (req.header("x-demo-token") ?? "").trim() || String(req.body?.token ?? "").trim();
    if (token !== env.demoResetToken) {
      return res.status(401).json({ success: false, message: "Token reset tidak valid" });
    }
    try {
      const result = await resetDemo();
      return res.json({
        success: true,
        message: `Demo di-reset: ${result.projectsDeleted} proyek dihapus, ${result.projectsSeeded} proyek di-seed ulang, ${result.notificationsDeleted} notifikasi dibersihkan.`,
        data: result,
      });
    } catch (err) {
      console.error("[DEMO] reset failed:", err);
      return res
        .status(500)
        .json({ success: false, message: "Gagal mereset demo. Cek log server." });
    }
  },
};
