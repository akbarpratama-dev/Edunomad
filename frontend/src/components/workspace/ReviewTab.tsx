"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/review/StarRating";
import { reviewApi, type ProjectReview } from "@/services/reviewApi";
import { projectApi, type ProjectDetail, type ProjectMember } from "@/services/projectApi";

interface ReviewTarget {
  userId: string;
  name: string;
  kind: "beginner" | "senior";
}

export function ReviewTab({ project }: { project: ProjectDetail }) {
  const appUser = useAuthStore((s) => s.appUser);
  const [reviews, setReviews] = useState<ProjectReview[] | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);

  const isLeadSenior = appUser?.role === "SENIOR" && project.senior?.id === appUser.id;
  const isOwnerUmkm = appUser?.role === "UMKM" && project.umkm.id === appUser.id;
  const isReviewer = isLeadSenior || isOwnerUmkm;
  const canSubmit = project.status === "ACTIVE"; // backend only accepts reviews on ACTIVE projects

  const load = useCallback(async () => {
    try {
      const [list, mem] = await Promise.all([
        reviewApi.listForProject(project.id),
        projectApi.members(project.id),
      ]);
      setReviews(list);
      setMembers(mem);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal memuat review");
      setReviews([]);
    }
  }, [project.id]);

  useEffect(() => {
    load();
  }, [load]);

  // Who the current reviewer can review: active beginner members (+ the senior, for UMKM).
  const targets = useMemo<ReviewTarget[]>(() => {
    if (!isReviewer) return [];
    const list: ReviewTarget[] = members
      .filter((m) => m.status === "ACTIVE")
      .map((m) => ({ userId: m.user.id, name: m.user.name, kind: "beginner" as const }));
    if (isOwnerUmkm && project.senior) {
      list.push({ userId: project.senior.id, name: project.senior.name, kind: "senior" });
    }
    return list;
  }, [isReviewer, isOwnerUmkm, members, project.senior]);

  // Reviews received by the current user in this project (beginner / senior view).
  const received = useMemo(
    () => reviews?.filter((r) => r.revieweeId === appUser?.id) ?? [],
    [reviews, appUser?.id]
  );

  if (reviews === null) return <p className="text-sm text-muted-foreground">Memuat review…</p>;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Review &amp; Rating</h2>
        <p className="text-sm text-muted-foreground">
          {isReviewer
            ? "Beri penilaian untuk tiap anggota tim. Review wajib sebelum proyek diselesaikan."
            : "Penilaian yang kamu terima di proyek ini."}
        </p>
      </div>

      {/* Reviewer (senior lead / UMKM owner): one card per review target */}
      {isReviewer && (
        <>
          {!canSubmit && (
            <p className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              Review hanya bisa diberikan selagi proyek berstatus Aktif.
            </p>
          )}
          {targets.length === 0 ? (
            <EmptyReviews label="Belum ada anggota tim untuk dinilai." />
          ) : (
            <div className="flex flex-col gap-3">
              {targets.map((t, i) => (
                <ReviewTargetCard
                  key={t.userId}
                  project={project}
                  target={t}
                  existing={reviews.find(
                    (r) => r.reviewerId === appUser?.id && r.revieweeId === t.userId
                  )}
                  canSubmit={canSubmit}
                  index={i}
                  onChanged={load}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Reviewee (beginner / senior being reviewed): reviews received in this project */}
      {!isReviewer && (
        <>
          {received.length === 0 ? (
            <EmptyReviews label="Belum ada review yang kamu terima di proyek ini." />
          ) : (
            <div className="flex flex-col gap-3">
              {received.map((r, i) => (
                <ReceivedReviewCard key={r.id} review={r} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyReviews({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
      <Star className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ReviewTargetCard({
  project,
  target,
  existing,
  canSubmit,
  index,
  onChanged,
}: {
  project: ProjectDetail;
  target: ReviewTarget;
  existing?: ProjectReview;
  canSubmit: boolean;
  index: number;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [busy, setBusy] = useState(false);

  // Keep local form in sync when the underlying review changes.
  useEffect(() => {
    setRating(existing?.rating ?? 0);
    setComment(existing?.comment ?? "");
  }, [existing?.id, existing?.rating, existing?.comment]);

  const showForm = !existing || editing;

  const submit = async () => {
    if (rating < 1) {
      toast.error("Pilih rating bintang dulu");
      return;
    }
    setBusy(true);
    try {
      const trimmed = comment.trim() || undefined;
      if (existing) {
        await reviewApi.update(existing.id, { rating, comment: trimmed });
        toast.success("Review diperbarui");
      } else if (target.kind === "senior") {
        await reviewApi.reviewSenior(project.id, { rating, comment: trimmed });
        toast.success("Review terkirim");
      } else {
        await reviewApi.reviewBeginner(project.id, {
          reviewee_id: target.userId,
          rating,
          comment: trimmed,
        });
        toast.success("Review terkirim");
      }
      setEditing(false);
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Gagal menyimpan review");
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
        <div>
          <p className="text-sm font-semibold text-foreground">{target.name}</p>
          <p className="text-xs text-muted-foreground">
            {target.kind === "senior" ? "Mentor" : "Mahasiswa"}
          </p>
        </div>
        {existing && (
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
            Sudah dinilai
          </Badge>
        )}
      </div>

      {showForm ? (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Rating</Label>
            <StarRating value={rating} onChange={setRating} size="lg" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`comment-${target.userId}`}>Komentar (opsional)</Label>
            <Textarea
              id={`comment-${target.userId}`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Apa yang dilakukan dengan baik, dan apa yang bisa ditingkatkan…"
            />
          </div>
          <div className="flex gap-2">
            <Button disabled={busy || !canSubmit} onClick={submit}>
              {existing ? "Simpan" : "Kirim Review"}
            </Button>
            {existing && editing && (
              <Button variant="outline" onClick={() => setEditing(false)}>
                Batal
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <StarRating value={existing!.rating} />
            <span className="text-sm font-medium tabular-nums">{existing!.rating}/5</span>
          </div>
          {existing!.comment && (
            <p className="whitespace-pre-wrap text-sm text-foreground/90">{existing!.comment}</p>
          )}
          {existing!.isEdited && <p className="text-xs text-muted-foreground">Diedit</p>}
          <div>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={!canSubmit}>
              Edit
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}

function ReceivedReviewCard({ review, index }: { review: ProjectReview; index: number }) {
  return (
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      className="app-reveal rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} />
          <span className="text-sm font-medium tabular-nums">{review.rating}/5</span>
        </div>
        <p className="text-xs text-muted-foreground">
          dari <span className="font-medium text-foreground">{review.reviewer.name}</span>
        </p>
      </div>
      {review.comment && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{review.comment}</p>
      )}
      {review.isEdited && <p className="mt-1 text-xs text-muted-foreground">Diedit</p>}
    </article>
  );
}
