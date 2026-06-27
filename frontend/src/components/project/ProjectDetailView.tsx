import { CalendarDays, CalendarClock, Building2, GraduationCap, Flag, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  PROJECT_STATUS_META,
  type ProjectDetail,
  type ProjectStatus,
} from "@/services/projectApi";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const meta = PROJECT_STATUS_META[status];
  return (
    <Badge variant={meta.variant} className={meta.className}>
      {meta.label}
    </Badge>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

// Shared read-only project detail used by the public detail page and the
// admin review dialog. Renders overview, UMKM/senior, milestones, and roles.
export function ProjectDetailView({ project }: { project: ProjectDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <Card className="app-reveal">
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{project.category.name}</Badge>
            <ProjectStatusBadge status={project.status} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">{project.title}</h2>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{project.description}</p>
          <Separator />
          <div>
            <SectionLabel>Hasil yang Diharapkan</SectionLabel>
            <p className="mt-1.5 text-sm text-foreground/80 whitespace-pre-wrap">
              {project.expectedDeliverables}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MetaRow icon={CalendarDays} label="Mulai" value={formatDate(project.startDate)} />
            <MetaRow icon={CalendarClock} label="Deadline" value={formatDate(project.deadline)} />
          </div>
        </CardContent>
      </Card>

      <Card className="app-reveal">
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <MetaRow icon={Building2} label="UMKM" value={project.umkm.name} />
          <MetaRow
            icon={GraduationCap}
            label="Mentor (Senior)"
            value={project.senior?.name ?? "Belum ada mentor"}
          />
        </CardContent>
      </Card>

      <Card className="app-reveal">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Flag className="size-4 text-[#5f8c00]" aria-hidden="true" />
            <SectionLabel>Milestone ({project.milestones.length})</SectionLabel>
          </div>
          {project.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada milestone.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {project.milestones.map((m) => (
                <li
                  key={m.id}
                  className="flex items-start justify-between gap-3 rounded-xl bg-muted/40 px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{m.title}</p>
                    {m.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{m.description}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDate(m.dueDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="app-reveal">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-[#5f8c00]" aria-hidden="true" />
            <SectionLabel>Peran Dibutuhkan ({project.projectRoles.length})</SectionLabel>
          </div>
          {project.projectRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada peran.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {project.projectRoles.map((r) => (
                <li key={r.id} className="rounded-xl bg-muted/40 px-3.5 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {r.roleName} <span className="text-muted-foreground">· {r.capacity} orang</span>
                  </p>
                  {r.requirements && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{r.requirements}</p>
                  )}
                  {r.roleSkills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.roleSkills.map((rs) => (
                        <span
                          key={rs.id}
                          className="rounded-md bg-card px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border"
                        >
                          {rs.skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
