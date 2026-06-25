"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Award } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  contributionApi,
  CONTRIBUTION_STATUS_META,
  type Contribution,
} from "@/services/contributionApi";
import { projectApi, type ProjectDetail } from "@/services/projectApi";
import { fetchSkills, type Skill } from "@/services/skillApi";

export function ContributionTab({ project }: { project: ProjectDetail }) {
  const appUser = useAuthStore((s) => s.appUser);
  const [items, setItems] = useState<Contribution[] | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isMember, setIsMember] = useState(false);

  const isLeadSenior = appUser?.role === "SENIOR" && project.senior?.id === appUser.id;
  const mine = useMemo(
    () => items?.find((c) => c.beginnerId === appUser?.id) ?? null,
    [items, appUser?.id]
  );

  const load = useCallback(async () => {
    try {
      const [list, members] = await Promise.all([
        contributionApi.listForProject(project.id),
        projectApi.members(project.id),
      ]);
      setItems(list);
      setIsMember(
        appUser?.role === "BEGINNER" &&
          members.some((m) => m.user.id === appUser.id && m.status === "ACTIVE")
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal memuat kontribusi");
      setItems([]);
    }
  }, [project.id, appUser]);

  useEffect(() => {
    load();
    fetchSkills().then(setSkills).catch(() => {});
  }, [load]);

  if (items === null) return <p className="text-sm text-muted-foreground">Memuat kontribusi…</p>;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Laporan Kontribusi</h2>
        <p className="text-sm text-muted-foreground">
          Dokumentasikan kontribusimu di proyek ini untuk diverifikasi mentor.
        </p>
      </div>

      {/* Beginner: own report or submit form */}
      {appUser?.role === "BEGINNER" &&
        (mine ? (
          <ContributionCard contribution={mine} editable skills={skills} onChanged={load} />
        ) : isMember ? (
          <ContributionForm projectId={project.id} skills={skills} onSaved={load} />
        ) : null)}

      {/* Senior lead: review all reports */}
      {isLeadSenior &&
        (items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
            <Award className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Belum ada laporan kontribusi.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((c, i) => (
              <ContributionCard key={c.id} contribution={c} reviewable index={i} onChanged={load} />
            ))}
          </div>
        ))}
    </div>
  );
}

function ContributionCard({
  contribution: c,
  editable,
  reviewable,
  skills,
  onChanged,
  index = 0,
}: {
  contribution: Contribution;
  editable?: boolean;
  reviewable?: boolean;
  skills?: Skill[];
  onChanged: () => void;
  index?: number;
}) {
  const meta = CONTRIBUTION_STATUS_META[c.status];
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  if (editing && skills) {
    return (
      <ContributionForm
        initial={c}
        skills={skills}
        onSaved={() => {
          setEditing(false);
          onChanged();
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  const approve = async () => {
    setBusy(true);
    try {
      await contributionApi.approve(c.id);
      toast.success("Kontribusi disetujui");
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyetujui");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      className="app-reveal rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{c.beginner.name}</p>
        <Badge variant={meta.variant} className={meta.className}>
          {meta.label}
        </Badge>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{c.contributionSummary}</p>
      {c.contributionSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {c.contributionSkills.map((cs) => (
            <Badge key={cs.id} variant="secondary">
              {cs.skill.name}
            </Badge>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {editable && c.status === "PENDING" && (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
        {reviewable && c.status === "PENDING" && (
          <Button size="sm" disabled={busy} onClick={approve}>
            Setujui
          </Button>
        )}
      </div>
    </article>
  );
}

function ContributionForm({
  projectId,
  initial,
  skills,
  onSaved,
  onCancel,
}: {
  projectId?: string;
  initial?: Contribution;
  skills: Skill[];
  onSaved: () => void;
  onCancel?: () => void;
}) {
  const [summary, setSummary] = useState(initial?.contributionSummary ?? "");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initial?.contributionSkills.map((cs) => cs.skill.id) ?? [])
  );
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const save = async () => {
    if (!summary.trim()) return;
    setBusy(true);
    try {
      const skillIds = [...selected];
      if (initial) {
        await contributionApi.update(initial.id, {
          contribution_summary: summary.trim(),
          skills: skillIds,
        });
        toast.success("Laporan diperbarui");
      } else {
        await contributionApi.submit(projectId!, {
          contribution_summary: summary.trim(),
          skills: skillIds,
        });
        toast.success("Laporan dikirim");
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="c-summary">Ringkasan Kontribusi</Label>
        <Textarea
          id="c-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={5}
          placeholder="Jelaskan apa yang kamu kerjakan dan dampaknya…"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Teknologi / Skill yang digunakan</Label>
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => {
            const on = selected.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(s.id)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors duration-200",
                  on
                    ? "border-[#a3ce00] bg-accent text-accent-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                )}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <Button disabled={busy || !summary.trim()} onClick={save}>
          {initial ? "Simpan" : "Kirim Laporan"}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    </div>
  );
}
