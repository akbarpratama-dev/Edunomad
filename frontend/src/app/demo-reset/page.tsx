"use client";

import { useEffect, useState } from "react";
import { RotateCcw, CheckCircle2, XCircle, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient, ApiError } from "@/lib/apiClient";

// Facilitator-only page to restore the demo baseline between respondents.
// Protected by a shared token (backend env DEMO_RESET_TOKEN). Not linked in the
// app nav — reach it directly at /demo-reset (optionally /demo-reset?token=...).
export default function DemoResetPage() {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Allow prefilling the token from the URL for a one-click bookmark.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    if (t) setToken(t);
  }, []);

  const reset = async () => {
    if (!token.trim()) {
      setResult({ ok: false, message: "Masukkan token reset terlebih dahulu." });
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const res = await apiClient.post(
        "/demo/reset",
        { token: token.trim() },
        { headers: { "x-demo-token": token.trim() } }
      );
      setResult({ ok: true, message: res.data?.message ?? "Demo berhasil di-reset." });
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Gagal mereset demo. Cek token / server.";
      setResult({ ok: false, message: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-[#201f31] text-[#d8f277]">
            <RotateCcw className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">EduNomad — Reset Demo</span>
        </div>

        <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-center text-xl font-bold tracking-tight">Reset Data Demo</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Kembalikan lingkungan demo ke kondisi awal. Semua yang dilakukan responden
            (lamaran, hasil kerja, review, <strong>sertifikat</strong>) dihapus dan proyek
            lowongan disiapkan ulang. <br />
            <span className="text-xs">Jalankan sebelum setiap responden mulai.</span>
          </p>

          <div className="mt-6 flex flex-col gap-1.5">
            <Label htmlFor="token">Token Reset</Label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Masukkan token demo"
              onKeyDown={(e) => e.key === "Enter" && !busy && reset()}
            />
          </div>

          <Button className="mt-4 w-full" onClick={reset} disabled={busy}>
            <RotateCcw className="size-4" /> {busy ? "Mereset…" : "Reset Demo Sekarang"}
          </Button>

          {result && (
            <div
              className={
                "mt-5 flex items-start gap-2 rounded-[16px] border p-4 text-sm " +
                (result.ok
                  ? "border-[#cfe89a] bg-[#f6fbe8] text-[#3f6b00]"
                  : "border-destructive/30 bg-destructive/5 text-foreground")
              }
            >
              {result.ok ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#5da316]" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              )}
              <span>{result.message}</span>
            </div>
          )}

          <p className="mt-5 flex items-start gap-1.5 text-xs text-muted-foreground">
            <ShieldQuestion className="mt-0.5 size-3.5 shrink-0" />
            Halaman ini butuh token rahasia & hanya aktif saat mode demo. Tidak menghapus
            data di luar proyek UMKM demo.
          </p>
        </div>
      </div>
    </div>
  );
}
