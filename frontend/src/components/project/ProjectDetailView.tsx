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
          <h2 className="text-h2 text-neutral-dark">{project.title}</h2>
          <p className="text-body-sm text-neutral-gray whitespace-pre-wrap">
            {project.description}
          </p>
          <Separator />
          <div>
            <p className="text-body-sm font-semibold text-neutral-dark">Hasil yang Diharapkan</p>
            <p className="text-body-sm text-neutral-gray whitespace-pre-wrap">
              {project.expectedDeliverables}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-1 text-body-sm">
            <span className="text-neutral-gray">
              Mulai: <span className="text-neutral-dark">{formatDate(project.startDate)}</span>
            </span>
            <span className="text-neutral-gray">
              Deadline: <span className="text-neutral-dark">{formatDate(project.deadline)}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 pt-2">
          <p className="text-body font-semibold text-neutral-dark">UMKM</p>
          <p className="text-body-sm text-neutral-dark">{project.umkm.name}</p>
          {project.senior ? (
            <>
              <Separator />
              <p className="text-body font-semibold text-neutral-dark">Mentor (Senior)</p>
              <p className="text-body-sm text-neutral-dark">{project.senior.name}</p>
            </>
          ) : (
            <p className="text-body-sm text-neutral-gray">Belum ada mentor senior.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2 pt-2">
          <p className="text-body font-semibold text-neutral-dark">
            Milestone ({project.milestones.length})
          </p>
          {project.milestones.length === 0 ? (
            <p className="text-body-sm text-neutral-gray">Belum ada milestone.</p>
          ) : (
            project.milestones.map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-body-sm font-medium text-neutral-dark">{m.title}</p>
                  {m.description && (
                    <p className="text-body-sm text-neutral-gray">{m.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-body-sm text-neutral-gray">
                  {formatDate(m.dueDate)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-2">
          <p className="text-body font-semibold text-neutral-dark">
            Peran Dibutuhkan ({project.projectRoles.length})
          </p>
          {project.projectRoles.length === 0 ? (
            <p className="text-body-sm text-neutral-gray">Belum ada peran.</p>
          ) : (
            project.projectRoles.map((r) => (
              <div key={r.id} className="flex flex-col gap-1">
                <p className="text-body-sm font-medium text-neutral-dark">
                  {r.roleName}{" "}
                  <span className="text-neutral-gray">· {r.capacity} orang</span>
                </p>
                {r.requirements && (
                  <p className="text-body-sm text-neutral-gray">{r.requirements}</p>
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
