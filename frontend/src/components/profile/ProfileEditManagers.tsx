"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ApiError } from "@/lib/apiClient";
import { fetchSkills, type Skill } from "@/services/skillApi";
import {
  profileApi,
  SKILL_LEVEL_LABEL,
  LINK_TYPES,
  type ProfileSkill,
  type ProfileExperience,
  type ProfileLink,
  type SkillLevel,
  type LinkType,
} from "@/services/profileApi";

const LEVELS: SkillLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const LINK_TYPE_LABEL: Record<LinkType, string> = {
  GITHUB: "GitHub",
  LINKEDIN: "LinkedIn",
  FIGMA: "Figma",
  BEHANCE: "Behance",
  OTHER: "Website / Lainnya",
};

function err(e: unknown, fallback: string) {
  toast.error(e instanceof ApiError ? e.message : fallback);
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

// ---- Skills ----
export function SkillsManager({ initial }: { initial: ProfileSkill[] }) {
  const [list, setList] = useState<ProfileSkill[]>(initial);
  const [master, setMaster] = useState<Skill[]>([]);
  const [skillId, setSkillId] = useState("");
  const [level, setLevel] = useState<SkillLevel>("INTERMEDIATE");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchSkills().then(setMaster).catch(() => {});
  }, []);

  const available = useMemo(
    () => master.filter((m) => !list.some((s) => s.skill.id === m.id)),
    [master, list]
  );

  const add = async () => {
    if (!skillId) return;
    setBusy(true);
    try {
      const created = await profileApi.skills.add({ skill_id: skillId, level });
      setList((l) => [...l, created]);
      setSkillId("");
    } catch (e) {
      err(e, "Gagal menambah skill");
    } finally {
      setBusy(false);
    }
  };

  const changeLevel = async (id: string, lvl: SkillLevel) => {
    try {
      const updated = await profileApi.skills.updateLevel(id, lvl);
      setList((l) => l.map((s) => (s.id === id ? updated : s)));
    } catch (e) {
      err(e, "Gagal mengubah level");
    }
  };

  const remove = async (id: string) => {
    try {
      await profileApi.skills.remove(id);
      setList((l) => l.filter((s) => s.id !== id));
    } catch (e) {
      err(e, "Gagal menghapus skill");
    }
  };

  return (
    <SectionCard title="Skills" description="Tambahkan keahlian beserta tingkat penguasaanmu.">
      {list.length > 0 && (
        <ul className="flex flex-col gap-2">
          {list.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2"
            >
              <span className="flex-1 text-sm font-medium text-foreground">{s.skill.name}</span>
              <Select value={s.level} onValueChange={(v) => v && changeLevel(s.id, v as SkillLevel)}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue>{(v) => SKILL_LEVEL_LABEL[v as SkillLevel]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((lv) => (
                    <SelectItem key={lv} value={lv}>
                      {SKILL_LEVEL_LABEL[lv]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => remove(s.id)}
                aria-label={`Hapus ${s.skill.name}`}
                className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-error"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
          <Label>Skill</Label>
          <Select value={skillId} onValueChange={(v) => setSkillId(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder={available.length ? "Pilih skill" : "Semua skill ditambahkan"}>
                {(v) => master.find((m) => m.id === v)?.name ?? ""}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {available.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-40 flex-col gap-1.5">
          <Label>Level</Label>
          <Select value={level} onValueChange={(v) => v && setLevel(v as SkillLevel)}>
            <SelectTrigger>
              <SelectValue>{(v) => SKILL_LEVEL_LABEL[v as SkillLevel]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((lv) => (
                <SelectItem key={lv} value={lv}>
                  {SKILL_LEVEL_LABEL[lv]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={add} disabled={busy || !skillId} className="gap-1.5">
          <Plus className="size-4" />
          Tambah
        </Button>
      </div>
    </SectionCard>
  );
}

// ---- Experiences ----
const emptyExp = { title: "", organization: "", description: "", start_date: "", end_date: "" };

export function ExperiencesManager({ initial }: { initial: ProfileExperience[] }) {
  const [list, setList] = useState<ProfileExperience[]>(initial);
  const [form, setForm] = useState({ ...emptyExp });
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const add = async () => {
    if (!form.title.trim() || !form.organization.trim() || !form.start_date) {
      toast.error("Judul, organisasi, dan tanggal mulai wajib diisi");
      return;
    }
    setBusy(true);
    try {
      const created = await profileApi.experiences.add({
        title: form.title.trim(),
        organization: form.organization.trim(),
        description: form.description.trim() || undefined,
        start_date: form.start_date,
        end_date: form.end_date || null,
      });
      setList((l) => [created, ...l]);
      setForm({ ...emptyExp });
    } catch (e) {
      err(e, "Gagal menambah pengalaman");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await profileApi.experiences.remove(id);
      setList((l) => l.filter((x) => x.id !== id));
    } catch (e) {
      err(e, "Gagal menghapus pengalaman");
    }
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { month: "short", year: "numeric" });

  return (
    <SectionCard title="Pengalaman" description="Riwayat kerja, organisasi, atau proyek di luar EduNomad.">
      {list.length > 0 && (
        <ul className="flex flex-col gap-2">
          {list.map((x) => (
            <li
              key={x.id}
              className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{x.title}</p>
                <p className="text-xs text-muted-foreground">
                  {x.organization} · {fmt(x.startDate)} – {x.endDate ? fmt(x.endDate) : "Sekarang"}
                </p>
                {x.description && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/80">{x.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(x.id)}
                aria-label={`Hapus ${x.title}`}
                className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-error"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Judul / Posisi</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Frontend Intern" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Organisasi</Label>
            <Input value={form.organization} onChange={(e) => set("organization", e.target.value)} placeholder="PT Contoh" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Mulai</Label>
            <Input type="month" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Selesai (kosongkan jika masih berjalan)</Label>
            <Input type="month" value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Deskripsi (opsional)</Label>
          <Textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <Button type="button" onClick={add} disabled={busy} className="gap-1.5 self-start">
          <Plus className="size-4" />
          Tambah Pengalaman
        </Button>
      </div>
    </SectionCard>
  );
}

// ---- Portfolio / social links ----
export function LinksManager({ initial }: { initial: ProfileLink[] }) {
  const [list, setList] = useState<ProfileLink[]>(initial);
  const [type, setType] = useState<LinkType>("GITHUB");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!title.trim() || !url.trim()) {
      toast.error("Judul dan URL wajib diisi");
      return;
    }
    setBusy(true);
    try {
      const created = await profileApi.links.add({ title: title.trim(), url: url.trim(), type });
      setList((l) => [...l, created]);
      setTitle("");
      setUrl("");
    } catch (e) {
      err(e, "Gagal menambah tautan (pastikan URL valid)");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await profileApi.links.remove(id);
      setList((l) => l.filter((x) => x.id !== id));
    } catch (e) {
      err(e, "Gagal menghapus tautan");
    }
  };

  return (
    <SectionCard title="Tautan" description="GitHub, LinkedIn, website, atau tautan portofolio lain.">
      {list.length > 0 && (
        <ul className="flex flex-col gap-2">
          {list.map((x) => (
            <li
              key={x.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2"
            >
              <Badge variant="outline" className="shrink-0 text-[11px]">
                {LINK_TYPE_LABEL[(x.type.toUpperCase() as LinkType)] ?? x.type}
              </Badge>
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{x.title}</span>
              <a
                href={x.url}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[40%] truncate text-xs text-[#5f8c00] hover:underline"
              >
                {x.url}
              </a>
              <button
                type="button"
                onClick={() => remove(x.id)}
                aria-label={`Hapus ${x.title}`}
                className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-error"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex w-40 flex-col gap-1.5">
          <Label>Jenis</Label>
          <Select value={type} onValueChange={(v) => v && setType(v as LinkType)}>
            <SelectTrigger>
              <SelectValue>{(v) => LINK_TYPE_LABEL[v as LinkType]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {LINK_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {LINK_TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex min-w-[120px] flex-1 flex-col gap-1.5">
          <Label>Judul</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="GitHub saya" />
        </div>
        <div className="flex min-w-[160px] flex-[2] flex-col gap-1.5">
          <Label>URL</Label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>
        <Button type="button" onClick={add} disabled={busy} className="gap-1.5">
          <Plus className="size-4" />
          Tambah
        </Button>
      </div>
    </SectionCard>
  );
}
