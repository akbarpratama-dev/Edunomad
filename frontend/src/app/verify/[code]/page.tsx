"use client";

import { useParams } from "next/navigation";
import { VerifyView } from "@/components/artifact/VerifyView";

// Public verification result for a specific code (Workflow 18) — no auth.
export default function VerifyCodePage() {
  const params = useParams<{ code: string }>();
  const code = decodeURIComponent(params.code);
  return <VerifyView initialCode={code} />;
}
