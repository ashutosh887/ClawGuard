"use client";

import { useState } from "react";
import { Eye, CheckCircle2, XCircle, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewResult {
  tool: string;
  connection: string;
  scopes: string[];
  riskLevel: "low" | "medium" | "high";
  permitted: boolean;
  requiresCiba: boolean;
  anomalyWarning: string | null;
  message: string;
}

export function PermissionPreview({
  tool,
  connection,
  scopes,
  onApprove,
  onDeny,
}: {
  tool: string;
  connection: string;
  scopes: string[];
  onApprove: () => void;
  onDeny: () => void;
}) {
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchPreview() {
    setLoading(true);
    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, connection, scopes }),
      });
      if (res.ok) setPreview(await res.json());
    } finally {
      setLoading(false);
    }
  }

  if (!preview) {
    return (
      <button
        onClick={fetchPreview}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-card-border bg-card px-3 py-2 text-xs font-medium text-muted hover:border-accent hover:text-accent transition-colors"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
        {loading ? "Checking..." : "Preview Permissions"}
      </button>
    );
  }

  const riskColors = {
    low: { bg: "bg-success/10", text: "text-success", border: "border-success/30" },
    medium: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
    high: { bg: "bg-danger/10", text: "text-danger", border: "border-danger/30" },
  };
  const rc = riskColors[preview.riskLevel];

  return (
    <div className={cn("rounded-xl border p-4 space-y-3 max-w-sm", rc.border, rc.bg)}>
      <div className="flex items-center gap-2">
        <Shield className={cn("h-4 w-4", rc.text)} />
        <span className="text-sm font-semibold">Permission Preview</span>
      </div>

      <p className="text-xs text-muted">{preview.message}</p>

      <div className="flex flex-wrap gap-1.5">
        {preview.scopes.map((s) => (
          <span key={s} className="rounded-md bg-card px-2 py-0.5 text-[11px] font-mono text-muted border border-card-border">
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className={cn("inline-block h-2.5 w-2.5 rounded-full", rc.text.replace("text-", "bg-"))} />
        <span className={cn("text-xs font-bold uppercase tracking-wider", rc.text)}>
          {preview.riskLevel} risk
        </span>
        {preview.requiresCiba && (
          <span className="text-[10px] text-muted">(CIBA consent required)</span>
        )}
      </div>

      {preview.anomalyWarning && (
        <p className="text-xs text-danger">{preview.anomalyWarning}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onApprove}
          className="flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-white hover:bg-success/80 transition-colors cursor-pointer"
        >
          <CheckCircle2 className="h-3 w-3" /> Approve
        </button>
        <button
          onClick={onDeny}
          className="flex items-center gap-1.5 rounded-lg bg-card border border-card-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <XCircle className="h-3 w-3" /> Deny
        </button>
      </div>
    </div>
  );
}
