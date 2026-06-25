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

// Shared read-only project detail used by the public detail page and the
// admin review dialog. Renders overview, UMKM/senior, milestones, and roles.
export function ProjectDetailView({ project }: { project: ProjectDetail }) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{project.category.name}</Badge>
            <ProjectStatusBadge status={project.status} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">{project.title}</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {project.description}
          </p>
          <Separator />
          <div>
            <p className="text-sm font-semibold text-foreground">Hasil yang Diharapkan</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {project.expectedDeliverables}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
            <span className="text-muted-foreground">
              Mulai: <span className="text-foreground">{formatDate(project.startDate)}</span>
            </span>
            <span className="text-muted-foreground">
              Deadline: <span className="text-foreground">{formatDate(project.deadline)}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 pt-2">
          <p className="text-sm font-semibold text-foreground">UMKM</p>
          <p className="text-sm text-foreground">{project.umkm.name}</p>
          {project.senior ? (
            <>
              <Separator />
              <p className="text-sm font-semibold text-foreground">Mentor (Senior)</p>
              <p className="text-sm text-foreground">{project.senior.name}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada mentor senior.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 pt-2">
          <p className="text-sm font-semibold text-foreground">
            Milestone ({project.milestones.length})
          </p>
          {project.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada milestone.</p>
          ) : (
            project.milestones.map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.title}</p>
                  {m.description && (
                    <p className="text-sm text-muted-foreground">{m.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {formatDate(m.dueDate)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-2">
          <p className="text-sm font-semibold text-foreground">
            Peran Dibutuhkan ({project.projectRoles.length})
          </p>
          {project.projectRoles.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada peran.</p>
          ) : (
            project.projectRoles.map((r) => (
              <div key={r.id} className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  {r.roleName}{" "}
                  <span className="text-muted-foreground">· {r.capacity} orang</span>
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
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
