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
      <div className="flex items-center gap-2 animate-fade-in">
        <div className="flex items-center gap-1.5 text-xs text-danger">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="font-medium">Revoke all tokens?</span>
        </div>
        <button
          onClick={handleRevoke}
          className="rounded-lg bg-danger px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity cursor-pointer"
        >
          Confirm
        </button>
        <button
          onClick={cancel}
          className="rounded-lg border border-card-border px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
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
        "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
        state === "revoked"
          ? "border border-success/30 text-success"
          : "border border-danger/30 text-danger hover:bg-danger hover:text-white",
        "disabled:opacity-50 disabled:cursor-wait"
      )}
    >
      {state === "revoking" && <Loader2 className="h-4 w-4 animate-spin" />}
      {state === "revoked" && <Check className="h-4 w-4" />}
      {state === "idle" && <ShieldOff className="h-4 w-4" />}
      {state === "revoking" ? "Revoking..." : state === "revoked" ? "Revoked" : "Kill All Tokens"}
    </button>
  );
}
