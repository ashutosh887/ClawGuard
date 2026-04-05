"use client";

import { useState } from "react";
import {
  Key,
  ArrowRight,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LifecycleStage {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "accent" | "success" | "warning" | "danger" | "muted";
  status: "pending" | "active" | "complete" | "skipped";
}

const colorMap = {
  accent: { bg: "bg-accent/10", border: "border-accent/30", text: "text-accent", dot: "bg-accent" },
  success: { bg: "bg-success/10", border: "border-success/30", text: "text-success", dot: "bg-success" },
  warning: { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning", dot: "bg-warning" },
  danger: { bg: "bg-danger/10", border: "border-danger/30", text: "text-danger", dot: "bg-danger" },
  muted: { bg: "bg-card", border: "border-card-border", text: "text-muted", dot: "bg-muted" },
};

const initialStages: LifecycleStage[] = [
  { id: "request", label: "Request", description: "Agent requests external API access via tool call", icon: Key, color: "accent", status: "pending" },
  { id: "preview", label: "Preview", description: "Dry-run validates scopes + assesses risk level", icon: Eye, color: "accent", status: "pending" },
  { id: "shield", label: "Shield", description: "Anomaly Shield checks rate limits + patterns", icon: Shield, color: "warning", status: "pending" },
  { id: "vault", label: "Token Vault", description: "Auth0 Token Vault exchanges scoped, short-lived token", icon: Key, color: "accent", status: "pending" },
  { id: "consent", label: "CIBA", description: "High-risk: backchannel push for user approval", icon: CheckCircle2, color: "success", status: "pending" },
  { id: "api", label: "API Call", description: "Scoped token used for external API call", icon: ArrowRight, color: "success", status: "pending" },
  { id: "audit", label: "Audit", description: "Entry logged + streamed via SSE to dashboard", icon: RefreshCw, color: "success", status: "pending" },
  { id: "revoke", label: "Revocable", description: "Token can be revoked at any time via panic button", icon: Trash2, color: "danger", status: "pending" },
];

type SimScenario = "normal" | "blocked" | "ciba_approve" | "ciba_deny" | "revoked";

const scenarioLabels: Record<SimScenario, { label: string; description: string }> = {
  normal: { label: "Normal Flow", description: "Low-risk read operation — no CIBA needed" },
  blocked: { label: "Blocked by Shield", description: "Rate limit exceeded — agent paused" },
  ciba_approve: { label: "CIBA Approved", description: "High-risk action — user approves on phone" },
  ciba_deny: { label: "CIBA Denied", description: "High-risk action — user denies on phone" },
  revoked: { label: "Token Revoked", description: "Panic button pressed — all tokens killed" },
};

function getStagesForScenario(scenario: SimScenario): LifecycleStage[] {
  const stages = initialStages.map((s) => ({ ...s }));

  switch (scenario) {
    case "normal":
      stages.forEach((s) => { s.status = "complete"; });
      stages[4].status = "skipped"; // No CIBA needed
      stages[4].description = "Low-risk action — CIBA step-up not required";
      stages[7].status = "complete";
      stages[7].color = "success";
      stages[7].description = "Token active — revocable at any time";
      break;

    case "blocked":
      stages[0].status = "complete";
      stages[1].status = "complete";
      stages[2].status = "complete";
      stages[2].color = "danger";
      stages[2].description = "BLOCKED: Rate limit exceeded — agent paused";
      stages.slice(3).forEach((s) => { s.status = "skipped"; s.color = "muted"; });
      break;

    case "ciba_approve":
      stages.forEach((s) => { s.status = "complete"; });
      stages[4].color = "success";
      stages[4].description = "User approved high-risk action via push notification";
      stages[4].icon = CheckCircle2;
      break;

    case "ciba_deny":
      stages[0].status = "complete";
      stages[1].status = "complete";
      stages[2].status = "complete";
      stages[3].status = "complete";
      stages[4].status = "complete";
      stages[4].color = "danger";
      stages[4].icon = XCircle;
      stages[4].description = "User DENIED the action via push notification";
      stages[5].status = "skipped"; stages[5].color = "muted";
      stages[6].status = "complete"; stages[6].description = "Denial logged in audit trail";
      stages[7].status = "skipped"; stages[7].color = "muted";
      break;

    case "revoked":
      stages.forEach((s) => { s.status = "complete"; });
      stages[7].status = "complete";
      stages[7].color = "danger";
      stages[7].description = "ALL tokens revoked — agent access severed in <2 seconds";
      stages[7].icon = Trash2;
      break;
  }

  return stages;
}

export function TokenLifecycle() {
  const [scenario, setScenario] = useState<SimScenario>("normal");
  const [animating, setAnimating] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const stages = getStagesForScenario(scenario);

  function playAnimation() {
    setAnimating(true);
    setActiveStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= stages.length) {
        clearInterval(interval);
        setAnimating(false);
        setActiveStep(stages.length);
        return;
      }
      setActiveStep(step);
    }, 500);
  }

  function changeScenario(s: SimScenario) {
    setScenario(s);
    setActiveStep(-1);
    setAnimating(false);
  }

  return (
    <div className="rounded-xl border border-card-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
            <Key className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold">Token Lifecycle</h2>
            <p className="text-xs text-muted">Visualize a token&apos;s journey through ClawGuard</p>
          </div>
        </div>
        <button
          onClick={playAnimation}
          disabled={animating}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent/80 transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={cn("h-4 w-4", animating && "animate-spin")} />
          {animating ? "Playing..." : "Play Flow"}
        </button>
      </div>


      <div className="flex gap-2 px-5 py-3 border-b border-card-border/50 overflow-x-auto">
        {(Object.keys(scenarioLabels) as SimScenario[]).map((s) => (
          <button
            key={s}
            onClick={() => changeScenario(s)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer",
              scenario === s
                ? "bg-accent/10 text-accent border border-accent/30"
                : "text-muted hover:text-foreground border border-transparent"
            )}
          >
            {scenarioLabels[s].label}
          </button>
        ))}
      </div>

      <div className="px-5 py-2">
        <p className="text-xs text-muted">{scenarioLabels[scenario].description}</p>
      </div>


      <div className="px-5 py-4">
        <div className="relative flex flex-col gap-1">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const c = colorMap[stage.color];
            const isVisible = activeStep === -1 || i <= activeStep;
            const isActive = i === activeStep;
            const isSkipped = stage.status === "skipped";

            return (
              <div key={stage.id} className="flex items-start gap-4">

                <div className="flex flex-col items-center shrink-0 w-8">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                      !isVisible && "border-card-border bg-card opacity-30",
                      isVisible && !isSkipped && cn(c.border, c.bg),
                      isVisible && isSkipped && "border-card-border bg-card opacity-50",
                      isActive && "animate-pulse-glow scale-110"
                    )}
                  >
                    <Icon className={cn(
                      "h-3.5 w-3.5 transition-colors duration-300",
                      isVisible && !isSkipped ? c.text : "text-muted/50"
                    )} />
                  </div>
                  {i < stages.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 h-6 transition-all duration-300",
                        isVisible ? c.dot : "bg-card-border",
                        isSkipped && "bg-card-border opacity-30",
                        isVisible && !isSkipped && "opacity-40"
                      )}
                    />
                  )}
                </div>


                <div className={cn(
                  "flex-1 pb-4 transition-all duration-300",
                  !isVisible && "opacity-20",
                  isSkipped && "opacity-40"
                )}>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-semibold",
                      isSkipped && "line-through text-muted"
                    )}>
                      {stage.label}
                    </span>
                    {isSkipped && (
                      <span className="rounded bg-card-border px-1.5 py-0.5 text-[9px] font-mono text-muted uppercase">
                        skipped
                      </span>
                    )}
                    {stage.status === "complete" && !isSkipped && isVisible && (
                      <CheckCircle2 className={cn("h-3.5 w-3.5", c.text)} />
                    )}
                  </div>
                  <p className={cn("text-xs mt-0.5 leading-relaxed", isSkipped ? "text-muted/50" : "text-muted")}>
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
