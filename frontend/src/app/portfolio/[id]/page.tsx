"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Award, ShieldCheck, Briefcase, LinkIcon, GraduationCap } from "lucide-react";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/apiClient";
import { artifactApi, type PublicPortfolio } from "@/services/artifactApi";

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString("id-ID", { month: "short", year: "numeric" }) : "Sekarang";
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-border bg-card p-5 sm:p-6">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function PortfolioPage() {
  const params = useParams<{ id: string }>();
  const [p, setP] = useState<PublicPortfolio | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    artifactApi
      .portfolio(params.id)
      .then((r) => active && setP(r))
      .catch((err) => active && setError(err instanceof ApiError ? err.message : "Portofolio tidak ditemukan"));
    return () => {
      active = false;
    };
  }, [params.id]);

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted/40 px-4 text-center">
        <div>
          <p className="text-lg font-semibold">Portofolio tidak ditemukan</p>
          <Button variant="outline" className="mt-4" render={<Link href="/" />}>Ke Beranda</Button>
        </div>
      </div>
    );
  }
  if (!p) {
    return <div className="grid min-h-screen place-items-center bg-muted/40 text-muted-foreground">Memuat…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Brand bar */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[#201f31] text-[#d8f277]"><Award className="size-4" /></span>
            <span className="font-bold tracking-tight">EduNomad</span>
          </Link>
          <span className="text-xs text-muted-foreground">Portofolio Publik</span>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-8">
        {/* Hero */}
        <div className="rounded-[24px] bg-[#201f31] p-6 text-[#e8e8ec] sm:p-8">
          <div className="flex items-center gap-4">
            <UserAvatar name={p.user.name} className="size-16 bg-[#d8f277] text-xl font-bold text-[#0b0b0b]" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-white">{p.user.name}</h1>
              {p.user.headline && <p className="text-sm text-[#b8b8c0]">{p.user.headline}</p>}
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-[#9be88e]">
                <GraduationCap className="size-3" /> {p.user.role === "BEGINNER" ? "Mahasiswa" : p.user.role}
              </span>
            </div>
          </div>
          {p.user.bio && <p className="mt-4 max-w-2xl text-sm text-[#c8c8d0]">{p.user.bio}</p>}
        </div>

        {/* Verified artifacts */}
        <Section title={`Artifact Terverifikasi (${p.artifacts.length})`}>
          {p.artifacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada artifact terverifikasi.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {p.artifacts.map((a) => (
                <div key={a.artifactCode} className="rounded-[16px] border border-border p-4">
                  <div className="flex items-center justify-between">
                    <Badge className="border-transparent bg-[#eef7d6] text-[#3f6b00]"><ShieldCheck className="mr-1 size-3" /> Terverifikasi</Badge>
                    <span className="font-mono text-[11px] font-semibold text-[#5f8c00]">{a.artifactCode}</span>
                  </div>
                  <p className="mt-2 font-semibold tracking-tight">{a.projectTitle}</p>
                  <p className="text-xs text-muted-foreground">{a.umkmName ?? "—"} · Mentor {a.seniorName}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground tabular-nums">{new Date(a.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                    <Link href={`/verify/${a.artifactCode}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#5f8c00] hover:underline">
                      Verifikasi
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {p.skills.length > 0 && (
          <Section title="Keahlian">
            <div className="flex flex-wrap gap-2">
              {p.skills.map((s) => (
                <span key={s.id} className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium">
                  {s.name} <span className="text-xs text-muted-foreground">· {s.level}</span>
                </span>
              ))}
            </div>
          </Section>
        )}

        {p.experiences.length > 0 && (
          <Section title="Pengalaman">
            <ul className="flex flex-col gap-4">
              {p.experiences.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"><Briefcase className="size-4" /></span>
                  <div>
                    <p className="text-sm font-semibold">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.organization} · {fmt(e.startDate)} – {fmt(e.endDate)}</p>
                    {e.description && <p className="mt-1 text-sm text-foreground/80">{e.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {p.portfolioLinks.length > 0 && (
          <Section title="Tautan">
            <ul className="flex flex-col gap-2">
              {p.portfolioLinks.map((l) => (
                <li key={l.id}>
                  <Link href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[#5f8c00] hover:underline">
                    <LinkIcon className="size-3.5" /> {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <p className="py-4 text-center text-xs text-muted-foreground">
          Diverifikasi oleh EduNomad · Setiap artifact dapat dicek keasliannya lewat kode verifikasi.
        </p>
      </main>
    </div>
  );
}
