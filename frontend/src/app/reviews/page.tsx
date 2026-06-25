"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { ListSkeleton } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { StarRating } from "@/components/review/StarRating";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/apiClient";
import { reviewApi, type UserReview } from "@/services/reviewApi";

function MyReviewsInner() {
  const appUser = useAuthStore((s) => s.appUser);
  const [reviews, setReviews] = useState<UserReview[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appUser?.id) return;
    let active = true;
    reviewApi
      .listForUser(appUser.id)
      .then((r) => active && setReviews(r))
      .catch(
        (err) => active && setError(err instanceof ApiError ? err.message : "Gagal memuat review")
      );
    return () => {
      active = false;
    };
  }, [appUser?.id]);

  if (error) return <ErrorState message={error} />;
  if (reviews === null) return <ListSkeleton />;

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review Saya</h1>
        <p className="text-sm text-muted-foreground">
          Penilaian yang kamu terima dari mentor dan UMKM di seluruh proyek.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Star className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Belum ada review yang kamu terima.</p>
        </div>
      ) : (
        <>
          {avg && (
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tabular-nums">{avg}</span>
                  <span className="text-sm text-muted-foreground">/5</span>
                </div>
                <div>
                  <StarRating value={Math.round(Number(avg))} />
                  <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                    {reviews.length} review
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-3">
            {reviews.map((r, i) => (
              <article
                key={r.id}
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                className="app-reveal rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StarRating value={r.rating} />
                    <span className="text-sm font-medium tabular-nums">{r.rating}/5</span>
                  </div>
                  <Link
                    href={`/projects/${r.project.id}`}
                    className="text-xs font-medium text-[#5f8c00] hover:underline"
                  >
                    {r.project.title}
                  </Link>
                </div>
                {r.comment && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{r.comment}</p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  dari <span className="font-medium text-foreground">{r.reviewer.name}</span>
                  {r.isEdited && " · diedit"}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function MyReviewsPage() {
  return (
    <AuthGuard allowedRoles={["BEGINNER"]}>
      <AppShell>
        <MyReviewsInner />
      </AppShell>
    </AuthGuard>
  );
}
