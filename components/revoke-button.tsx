"use client";

import { useState } from "react";
import { ShieldOff, Check, Loader2 } from "lucide-react";

export function RevokeButton() {
  const [state, setState] = useState<"idle" | "revoking" | "revoked">("idle");

  async function handleRevoke() {
    if (!confirm("REVOKE ALL TOKENS?\n\nThis immediately severs agent access to every external API (Google, Slack, GitHub). This action cannot be undone.")) {
      return;
    }
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

  return (
    <button
      onClick={handleRevoke}
      disabled={state === "revoking"}
      className={`
        flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold
        transition-all duration-200 cursor-pointer
        ${state === "revoked"
          ? "bg-success/10 text-success border border-success/30"
          : "bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white"
        }
        disabled:opacity-50 disabled:cursor-wait
      `}
    >
      {state === "revoking" && <Loader2 className="h-4 w-4 animate-spin" />}
      {state === "revoked" && <Check className="h-4 w-4" />}
      {state === "idle" && <ShieldOff className="h-4 w-4" />}
      {state === "revoking" ? "Revoking..." : state === "revoked" ? "All Tokens Revoked" : "Kill All Tokens"}
    </button>
  );
}
