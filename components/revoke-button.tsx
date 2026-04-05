"use client";

import { useState } from "react";
import { ShieldOff, Check, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function RevokeButton() {
  const [state, setState] = useState<"idle" | "confirm" | "revoking" | "revoked">("idle");

  async function handleRevoke() {
    if (state === "idle") {
      setState("confirm");
      return;
    }
    if (state !== "confirm") return;

    setState("revoking");
    try {
      const res = await fetch("/api/revoke", { method: "POST" });
      if (res.ok) {
        setState("revoked");
        setTimeout(() => setState("idle"), 4000);
      } else {
        setState("idle");
      }
    } catch {
      setState("idle");
    }
  }

  function cancel() {
    setState("idle");
  }

  if (state === "confirm") {
    return (
      <div className="flex items-center gap-2 animate-fade-in-scale">
        <div className="flex items-center gap-1.5 text-xs text-danger">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="font-medium">Revoke all tokens?</span>
        </div>
        <button
          onClick={handleRevoke}
          className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white hover:bg-danger/80 transition-all duration-200 cursor-pointer"
        >
          Confirm
        </button>
        <button
          onClick={cancel}
          className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleRevoke}
      disabled={state === "revoking"}
      className={cn(
        "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer",
        state === "revoked"
          ? "bg-success/10 text-success border border-success/30 glow-success"
          : "bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white hover:shadow-lg hover:shadow-danger/20",
        "disabled:opacity-50 disabled:cursor-wait"
      )}
    >
      {state === "revoking" && <Loader2 className="h-4 w-4 animate-spin" />}
      {state === "revoked" && <Check className="h-4 w-4" />}
      {state === "idle" && <ShieldOff className="h-4 w-4" />}
      {state === "revoking" ? "Revoking..." : state === "revoked" ? "All Tokens Revoked" : "Kill All Tokens"}
    </button>
  );
}
