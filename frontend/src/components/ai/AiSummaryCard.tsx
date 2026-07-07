"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiUnavailable } from "./AiUnavailable";
import { aiApi, type AiResult, type ProfileSummary } from "@/services/aiApi";

// AI Professional Summary card (D-AI-1). Lazy-fetches on mount; degrades to a
// fallback banner if AI is unavailable. Never blocks the rest of the profile.
export function AiSummaryCard({ userId }: { userId: string }) {
  const [state, setState] = useState<AiResult<ProfileSummary> | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    (regenerate?: boolean) => {
      setLoading(true);
      aiApi
        .userSummary(userId, regenerate)
        .then(setState)
        .catch(() => setState({ available: false, reason: "Gagal memuat ringkasan AI." }))
        .finally(() => setLoading(false));
    },
    [userId]
  );

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="rounded-[20px] border border-border bg-gradient-to-br from-[#eef7d6]/50 via-card to-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-[#d8f277] text-[#0b0b0b]">
          <Sparkles className="size-4" />
        </span>
        <h2 className="flex-1 text-sm font-bold tracking-tight">Ringkasan AI</h2>
        {state?.available && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={() => load(true)}
            disabled={loading}
          >
            <RefreshCw className={"size-3.5 " + (loading ? "animate-spin" : "")} /> Perbarui
          </Button>
        )}
      </div>

      {loading && state === null ? (
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      ) : state && state.available ? (
        <div className="flex flex-col gap-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
            {state.data.summary}
          </p>
          {state.data.strengths.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Kekuatan</p>
              <div className="flex flex-wrap gap-1.5">
                {state.data.strengths.map((s, i) => (
                  <Badge key={i} variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {state.data.suggestedRoles.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Cocok untuk peran</p>
              <div className="flex flex-wrap gap-1.5">
                {state.data.suggestedRoles.map((r, i) => (
                  <Badge key={i} variant="outline">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            Dihasilkan AI · {new Date(state.generatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      ) : (
        <AiUnavailable reason={state && !state.available ? state.reason : undefined} onRetry={() => load(true)} />
      )}
    </section>
  );
}
