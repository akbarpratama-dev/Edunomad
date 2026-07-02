"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Award, CheckCircle2, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { artifactApi, type VerifyResult } from "@/services/artifactApi";

// Public certificate verification (Workflow 18). Standalone — no app shell/auth.
// When `initialCode` is given the result is fetched immediately; otherwise the
// visitor types a code to look up.
export function VerifyView({ initialCode }: { initialCode?: string }) {
  const router = useRouter();
  const [code, setCode] = useState(initialCode ?? "");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialCode) return;
    let active = true;
    setLoading(true);
    artifactApi
      .verify(initialCode)
      .then((r) => active && setResult(r))
      .catch(() => active && setResult({ valid: false }))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [initialCode]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim();
    if (c) router.push(`/verify/${encodeURIComponent(c)}`);
  };

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-12">
      <div className="mx-auto w-full max-w-lg">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-[#201f31] text-[#d8f277]">
            <Award className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">EduNomad</span>
        </Link>

        <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-center text-xl font-bold tracking-tight sm:text-2xl">
            Verifikasi Sertifikat
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Masukkan kode sertifikat (mis. EDN-2026-000001) untuk memeriksa keasliannya.
          </p>

          <form onSubmit={submit} className="mt-6 flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="EDN-2026-000001"
              className="font-mono uppercase"
              aria-label="Kode sertifikat"
            />
            <Button type="submit" disabled={loading}>
              <Search className="size-4" /> Cek
            </Button>
          </form>

          {loading && (
            <p className="mt-6 text-center text-sm text-muted-foreground">Memeriksa…</p>
          )}

          {!loading && result && (result.valid ? (
            <div className="mt-6 rounded-[20px] border border-[#cfe89a] bg-[#f6fbe8] p-5">
              <div className="flex items-center gap-2 text-[#3f6b00]">
                <CheckCircle2 className="size-5" />
                <span className="font-semibold">Sertifikat Valid</span>
              </div>
              <dl className="mt-4 grid gap-x-4 gap-y-3 sm:grid-cols-2">
                <Field label="Kode" value={result.artifactCode} mono />
                <Field label="Penerima" value={result.beginnerName} />
                <Field label="Proyek" value={result.projectTitle} />
                <Field label="UMKM" value={result.umkmName ?? "—"} />
                <Field label="Mentor" value={result.seniorName} />
                <Field
                  label="Diterbitkan"
                  value={new Date(result.issuedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                />
              </dl>
            </div>
          ) : (
            <div className="mt-6 rounded-[20px] border border-destructive/30 bg-destructive/5 p-5 text-center">
              <XCircle className="mx-auto size-6 text-destructive" />
              <p className="mt-2 font-semibold text-foreground">Sertifikat Tidak Ditemukan</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Kode tidak dikenali. Periksa kembali ejaan kode (format EDN-YYYY-XXXXXX).
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className={mono ? "font-mono text-sm font-semibold text-foreground" : "text-sm font-medium text-foreground"}>
        {value}
      </dd>
    </div>
  );
}
