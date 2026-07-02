"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Trash2, Plus, Check } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/apiClient";
import {
  projectApi,
  type Category,
  type Milestone,
  type ProjectRole,
} from "@/services/projectApi";
import { fetchSkills, type Skill } from "@/services/skillApi";

const STEPS = ["Info Dasar", "Milestone", "Peran", "Tinjau & Kirim"];

// --- Step 1 schema (mirrors backend createProjectSchema) ---
const basicSchema = z
  .object({
    title: z.string().min(3, "Judul minimal 3 karakter").max(255),
    category_id: z.string().uuid("Pilih kategori"),
    description: z.string().min(1, "Deskripsi wajib diisi"),
    expected_deliverables: z.string().min(1, "Hasil yang diharapkan wajib diisi"),
    image_url: z.string().url().optional().or(z.literal("")),
    start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
    deadline: z.string().min(1, "Deadline wajib diisi"),
  })
  .refine((d) => d.deadline >= d.start_date, {
    path: ["deadline"],
    message: "Deadline harus setelah atau sama dengan tanggal mulai",
  });
type BasicForm = z.infer<typeof basicSchema>;

function Stepper({ step }: { step: number }) {
  return (
    <ol className="app-reveal flex flex-wrap items-center gap-2">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors",
                active
                  ? "bg-[#d8f277] text-[#0b0b0b]"
                  : done
                    ? "bg-[#eef7d6] text-[#5f8c00]"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {done ? <Check className="size-4" /> : n}
            </span>
            <span
              className={cn(
                "text-sm",
                active ? "font-semibold text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {n < STEPS.length && (
              <span className={cn("mx-1 h-px w-6", done ? "bg-[#a3ce00]" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function CreateProjectContent() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [roles, setRoles] = useState<ProjectRole[]>([]);
  const [savingBasic, setSavingBasic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<BasicForm>({ resolver: zodResolver(basicSchema) });
  const categoryId = watch("category_id");
  const imageUrl = watch("image_url");

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 3 MB");
      return;
    }
    setUploadingImage(true);
    try {
      const url = await projectApi.uploadImage(file);
      setValue("image_url", url, { shouldValidate: true });
      toast.success("Gambar diunggah");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengunggah gambar");
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    projectApi
      .categories()
      .then(setCategories)
      .catch(() => toast.error("Gagal memuat kategori"));
    fetchSkills()
      .then(setSkills)
      .catch(() => toast.error("Gagal memuat keahlian"));
  }, []);

  // Step 1: create the DRAFT on first save, update on subsequent saves.
  const saveBasic = async (values: BasicForm) => {
    setSavingBasic(true);
    // Empty image field must be omitted (backend expects a URL or null, not "").
    const payload = { ...values, image_url: values.image_url || null };
    try {
      if (projectId) {
        await projectApi.update(projectId, payload);
      } else {
        const created = await projectApi.create(payload);
        setProjectId(created.id);
      }
      setStep(2);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyimpan proyek");
    } finally {
      setSavingBasic(false);
    }
  };

  const submitForReview = async () => {
    if (!projectId) return;
    setSubmitting(true);
    try {
      await projectApi.submit(projectId);
      toast.success("Proyek dikirim untuk ditinjau admin");
      router.push("/my-projects");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal mengirim proyek");
      setSubmitting(false);
    }
  };

  return (
    <AppShell backHref="/my-projects">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <PageHeader
          title="Buat Proyek"
          subtitle="Susun proyek langkah demi langkah, lalu kirim untuk ditinjau admin."
        />
        <Stepper step={step} />

        {step === 1 && (
          <Card className="app-reveal">
            <CardContent>
              <form onSubmit={handleSubmit(saveBasic)} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="title">Judul Proyek</Label>
                  <Input id="title" placeholder="cth. Website Toko Online" {...register("title")} />
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Gambar Sampul (opsional)</Label>
                  <div className="flex items-center gap-3">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt="Sampul proyek" className="h-16 w-24 rounded-lg border border-border object-cover" />
                    ) : (
                      <div className="grid h-16 w-24 place-items-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                        Belum ada
                      </div>
                    )}
                    <label className="inline-flex cursor-pointer items-center rounded-full border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted">
                      {uploadingImage ? "Mengunggah…" : imageUrl ? "Ganti Gambar" : "Unggah Gambar"}
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onPickImage} disabled={uploadingImage} />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">PNG/JPG/WebP, maks 3 MB. Tampil sebagai sampul di kartu sertifikat.</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    value={categoryId ?? ""}
                    onValueChange={(v) =>
                      setValue("category_id", v ?? "", { shouldValidate: true })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && (
                    <p className="text-sm text-destructive">{errors.category_id.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Jelaskan proyek, tujuan, dan konteksnya"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="deliverables">Hasil yang Diharapkan</Label>
                  <Textarea
                    id="deliverables"
                    rows={3}
                    placeholder="cth. Aplikasi web yang berfungsi, dokumentasi, dll."
                    {...register("expected_deliverables")}
                  />
                  {errors.expected_deliverables && (
                    <p className="text-sm text-destructive">
                      {errors.expected_deliverables.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="start_date">Tanggal Mulai</Label>
                    <Input id="start_date" type="date" {...register("start_date")} />
                    {errors.start_date && (
                      <p className="text-sm text-destructive">{errors.start_date.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input id="deadline" type="date" {...register("deadline")} />
                    {errors.deadline && (
                      <p className="text-sm text-destructive">{errors.deadline.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={savingBasic}>
                    {savingBasic ? "Menyimpan..." : "Simpan & Lanjut"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && projectId && (
          <MilestonesStep
            projectId={projectId}
            milestones={milestones}
            setMilestones={setMilestones}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && projectId && (
          <RolesStep
            projectId={projectId}
            roles={roles}
            setRoles={setRoles}
            skills={skills}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <ReviewStep
            basic={getValues()}
            categoryName={categories.find((c) => c.id === getValues("category_id"))?.name ?? "-"}
            milestones={milestones}
            roles={roles}
            submitting={submitting}
            onBack={() => setStep(3)}
            onSubmit={submitForReview}
          />
        )}
      </div>
    </AppShell>
  );
}

// --- Step 2: Milestones ---
function MilestonesStep({
  projectId,
  milestones,
  setMilestones,
  onBack,
  onNext,
}: {
  projectId: string;
  milestones: Milestone[];
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!title.trim() || !dueDate) {
      toast.error("Judul dan tenggat milestone wajib diisi");
      return;
    }
    setBusy(true);
    try {
      const m = await projectApi.addMilestone(projectId, {
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate,
      });
      setMilestones((prev) => [...prev, m]);
      setTitle("");
      setDescription("");
      setDueDate("");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menambah milestone");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await projectApi.deleteMilestone(id);
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menghapus milestone");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="app-reveal">
        <CardContent className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Tambah Milestone
          </p>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-title">Judul</Label>
            <Input
              id="m-title"
              placeholder="cth. Desain UI selesai"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-desc">Deskripsi (opsional)</Label>
            <Textarea
              id="m-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="m-due">Tenggat</Label>
            <Input
              id="m-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <Button type="button" variant="outline" disabled={busy} onClick={add}>
              <Plus className="size-4" /> Tambah Milestone
            </Button>
          </div>
        </CardContent>
      </Card>

      {milestones.length > 0 && (
        <div className="flex flex-col gap-2">
          {milestones.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.title}</p>
                  {m.description && (
                    <p className="text-sm text-muted-foreground">{m.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Tenggat: {new Date(m.dueDate).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(m.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button onClick={onNext}>Lanjut</Button>
      </div>
    </div>
  );
}

// --- Step 3: Roles + Skills ---
function RolesStep({
  projectId,
  roles,
  setRoles,
  skills,
  onBack,
  onNext,
}: {
  projectId: string;
  roles: ProjectRole[];
  setRoles: React.Dispatch<React.SetStateAction<ProjectRole[]>>;
  skills: Skill[];
  onBack: () => void;
  onNext: () => void;
}) {
  const [roleName, setRoleName] = useState("");
  const [capacity, setCapacity] = useState("1");
  const [requirements, setRequirements] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const toggleSkill = (id: string) =>
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const add = async () => {
    const cap = Number(capacity);
    if (!roleName.trim() || !Number.isInteger(cap) || cap < 1) {
      toast.error("Nama peran dan kapasitas (min 1) wajib diisi");
      return;
    }
    setBusy(true);
    try {
      const r = await projectApi.addRole(projectId, {
        role_name: roleName.trim(),
        capacity: cap,
        requirements: requirements.trim() || undefined,
        skills: selectedSkills,
      });
      setRoles((prev) => [...prev, r]);
      setRoleName("");
      setCapacity("1");
      setRequirements("");
      setSelectedSkills([]);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menambah peran");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await projectApi.deleteRole(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menghapus peran");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="app-reveal">
        <CardContent className="flex flex-col gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Tambah Peran
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="r-name">Nama Peran</Label>
              <Input
                id="r-name"
                placeholder="cth. Frontend Developer"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="r-cap">Kapasitas</Label>
              <Input
                id="r-cap"
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="r-req">Persyaratan (opsional)</Label>
            <Textarea
              id="r-req"
              rows={2}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
          </div>
          {skills.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label>Keahlian yang Dibutuhkan</Label>
              <div className="flex flex-wrap gap-3">
                {skills.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedSkills.includes(s.id)}
                      onCheckedChange={() => toggleSkill(s.id)}
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div>
            <Button type="button" variant="outline" disabled={busy} onClick={add}>
              <Plus className="size-4" /> Tambah Peran
            </Button>
          </div>
        </CardContent>
      </Card>

      {roles.length > 0 && (
        <div className="flex flex-col gap-2">
          {roles.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">
                    {r.roleName}{" "}
                    <span className="text-sm text-muted-foreground">
                      · {r.capacity} orang
                    </span>
                  </p>
                  {r.requirements && (
                    <p className="text-sm text-muted-foreground">{r.requirements}</p>
                  )}
                  {r.roleSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {r.roleSkills.map((rs) => (
                        <Badge key={rs.id} variant="secondary">
                          {rs.skill.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button onClick={onNext}>Lanjut</Button>
      </div>
    </div>
  );
}

// --- Step 4: Review & Submit ---
function ReviewStep({
  basic,
  categoryName,
  milestones,
  roles,
  submitting,
  onBack,
  onSubmit,
}: {
  basic: BasicForm;
  categoryName: string;
  milestones: Milestone[];
  roles: ProjectRole[];
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="app-reveal">
        <CardContent className="flex flex-col gap-3">
          <h2 className="text-lg font-bold tracking-tight text-foreground">{basic.title}</h2>
          <p className="text-sm text-muted-foreground">Kategori: {categoryName}</p>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Deskripsi</p>
            <p className="mt-1 text-sm text-foreground/80 whitespace-pre-wrap">
              {basic.description}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Hasil yang Diharapkan</p>
            <p className="mt-1 text-sm text-foreground/80 whitespace-pre-wrap">
              {basic.expected_deliverables}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(basic.start_date).toLocaleDateString("id-ID")} —{" "}
            {new Date(basic.deadline).toLocaleDateString("id-ID")}
          </p>
        </CardContent>
      </Card>

      <Card className="app-reveal">
        <CardContent className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Milestone ({milestones.length})
          </p>
          {milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada milestone.</p>
          ) : (
            milestones.map((m) => (
              <p key={m.id} className="text-sm text-foreground">
                • {m.title}{" "}
                <span className="text-muted-foreground">
                  ({new Date(m.dueDate).toLocaleDateString("id-ID")})
                </span>
              </p>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="app-reveal">
        <CardContent className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Peran ({roles.length})
          </p>
          {roles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada peran.</p>
          ) : (
            roles.map((r) => (
              <p key={r.id} className="text-sm text-foreground">
                • {r.roleName}{" "}
                <span className="text-muted-foreground">({r.capacity} orang)</span>
              </p>
            ))
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Setelah dikirim, proyek akan berstatus <strong>Menunggu Tinjauan</strong> dan tidak dapat
        diedit hingga admin menyetujui atau menolak.
      </p>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button disabled={submitting} onClick={onSubmit}>
          {submitting ? "Mengirim..." : "Kirim untuk Ditinjau"}
        </Button>
      </div>
    </div>
  );
}

export default function CreateProjectPage() {
  return (
    <AuthGuard allowedRoles={["UMKM"]}>
      <CreateProjectContent />
    </AuthGuard>
  );
}
