"use client";

import { useEffect, useState } from "react";
import { Sparkles, Award, Briefcase, Code2, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AiUnavailable } from "./AiUnavailable";
import { aiApi, type AiResult, type PortfolioRec } from "@/services/aiApi";

const TYPE_ICON = { SKILL: Code2, CERTIFICATE: Award, EXPERIENCE: Briefcase } as const;

// AI Portfolio Recommendation panel (D-AI-1). Lazy-fetched when the apply dialog
// opens; purely advisory so it never blocks the application. `enabled` lets the
// caller defer the fetch until the panel is actually shown.
export function PortfolioRecPanel({ projectId, enabled = true }: { projectId: string; enabled?: boolean }) {
  const [state, setState] = useState<AiResult<PortfolioRec> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setLoading(true);
    aiApi
      .portfolioRecommendation(projectId)
      .then((r) => active && setState(r))
      .catch(() => active && setState({ available: false, reason: "Gagal memuat rekomendasi AI." }))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [projectId, enabled]);

  return (
    <div className="rounded-[16px] border border-[#cfe89a] bg-[#f6fbe8]/60 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="size-4 text-[#5f8c00]" />
        <h3 className="text-sm font-bold tracking-tight text-[#3f6b00]">Rekomendasi Portofolio AI</h3>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Bagian portofoliomu yang paling relevan untuk ditonjolkan di lamaran ini.
      </p>

      {loading && state === null ? (
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        </div>
      ) : state && state.available ? (
        <div className="flex flex-col gap-3">
          {state.data.recommendedItems.length > 0 && (
            <ul className="flex flex-col gap-2">
              {state.data.recommendedItems.map((item, i) => {
                const Icon = TYPE_ICON[item.type] ?? Code2;
                return (
                  <li key={i} className="flex gap-2.5 rounded-xl bg-card/70 p-2.5">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#eef7d6] text-[#5f8c00]">
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.reason}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {state.data.suggestedHighlights.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Sebutkan di motivasimu</p>
              <div className="flex flex-wrap gap-1.5">
                {state.data.suggestedHighlights.map((h, i) => (
                  <Badge key={i} variant="outline" className="bg-card">
                    {h}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {state.data.overallAdvice && (
            <p className="flex items-start gap-1.5 text-xs text-foreground/80">
              <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
              {state.data.overallAdvice}
            </p>
          )}
        </div>
      ) : (
        <AiUnavailable compact reason={state && !state.available ? state.reason : undefined} />
      )}
    </div>
  );
}
