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
  status: "pending" | "active" | "complete" | "skipped";
  semantic?: "success" | "danger" | "warning";
}

const initialStages: LifecycleStage[] = [
  { id: "request", label: "Request", description: "Agent requests external API access via tool call", icon: Key, status: "pending" },
  { id: "preview", label: "Preview", description: "Dry-run validates scopes + assesses risk level", icon: Eye, status: "pending" },
  { id: "shield", label: "Shield", description: "Anomaly Shield checks rate limits + patterns", icon: Shield, status: "pending", semantic: "warning" },
  { id: "vault", label: "Token Vault", description: "Auth0 Token Vault exchanges scoped, short-lived token", icon: Key, status: "pending" },
  { id: "consent", label: "CIBA", description: "High-risk: backchannel push for user approval", icon: CheckCircle2, status: "pending", semantic: "success" },
  { id: "api", label: "API Call", description: "Scoped token used for external API call", icon: ArrowRight, status: "pending", semantic: "success" },
  { id: "audit", label: "Audit", description: "Entry logged + streamed via SSE to dashboard", icon: RefreshCw, status: "pending" },
  { id: "revoke", label: "Revocable", description: "Token can be revoked at any time via panic button", icon: Trash2, status: "pending", semantic: "danger" },
];

type SimScenario = "normal" | "blocked" | "ciba_approve" | "ciba_deny" | "revoked";

const scenarioLabels: Record<SimScenario, { label: string; description: string }> = {
  normal: { label: "Normal Flow", description: "Low-risk read operation -no CIBA needed" },
  blocked: { label: "Blocked by Shield", description: "Rate limit exceeded -agent paused" },
  ciba_approve: { label: "CIBA Approved", description: "High-risk action -user approves on phone" },
  ciba_deny: { label: "CIBA Denied", description: "High-risk action -user denies on phone" },
  revoked: { label: "Token Revoked", description: "Panic button pressed -all tokens killed" },
};

function getStagesForScenario(scenario: SimScenario): LifecycleStage[] {
  const stages = initialStages.map((s) => ({ ...s }));

  switch (scenario) {
    case "normal":
      stages.forEach((s) => { s.status = "complete"; });
      stages[4].status = "skipped";
      stages[4].description = "Low-risk action -CIBA step-up not required";
      stages[7].status = "complete";
      stages[7].semantic = "success";
      stages[7].description = "Token active -revocable at any time";
      break;

    case "blocked":
      stages[0].status = "complete";
      stages[1].status = "complete";
      stages[2].status = "complete";
      stages[2].semantic = "danger";
      stages[2].description = "BLOCKED: Rate limit exceeded -agent paused";
      stages.slice(3).forEach((s) => { s.status = "skipped"; });
      break;

    case "ciba_approve":
      stages.forEach((s) => { s.status = "complete"; });
      stages[4].semantic = "success";
      stages[4].description = "User approved high-risk action via push notification";
      stages[4].icon = CheckCircle2;
      break;

    case "ciba_deny":
      stages[0].status = "complete";
      stages[1].status = "complete";
      stages[2].status = "complete";
      stages[3].status = "complete";
      stages[4].status = "complete";
      stages[4].semantic = "danger";
      stages[4].icon = XCircle;
      stages[4].description = "User DENIED the action via push notification";
      stages[5].status = "skipped";
      stages[6].status = "complete"; stages[6].description = "Denial logged in audit trail";
      stages[7].status = "skipped";
      break;

    case "revoked":
      stages.forEach((s) => { s.status = "complete"; });
      stages[7].status = "complete";
      stages[7].semantic = "danger";
      stages[7].description = "ALL tokens revoked -agent access severed in <2 seconds";
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

  const semanticColor = (s?: string) => {
    if (s === "success") return "text-success";
    if (s === "danger") return "text-danger";
    if (s === "warning") return "text-warning";
    return "text-foreground";
  };

  return (
    <div className="rounded-lg border border-card-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
        <div className="flex items-center gap-3">
          <Key className="h-5 w-5 text-muted" />
          <div>
            <h2 className="text-sm font-medium">Token Lifecycle</h2>
            <p className="text-xs text-muted">Token journey through ClawGuard</p>
          </div>
        </div>
        <button
          onClick={playAnimation}
          disabled={animating}
          className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={cn("h-4 w-4", animating && "animate-spin")} />
          {animating ? "Playing..." : "Play Flow"}
        </button>
      </div>

      <div className="flex gap-1.5 px-5 py-3 border-b border-card-border overflow-x-auto">
        {(Object.keys(scenarioLabels) as SimScenario[]).map((s) => (
          <button
            key={s}
            onClick={() => changeScenario(s)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-xs transition-colors cursor-pointer",
              scenario === s
                ? "bg-foreground/5 text-foreground font-medium"
                : "text-muted hover:text-foreground"
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
            const isVisible = activeStep === -1 || i <= activeStep;
            const isActive = i === activeStep;
            const isSkipped = stage.status === "skipped";

            return (
              <div key={stage.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center shrink-0 w-8">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200",
                      !isVisible && "border-card-border bg-card opacity-20",
                      isVisible && !isSkipped && "border-card-border bg-background",
                      isVisible && isSkipped && "border-card-border bg-card opacity-40",
                      isActive && "border-foreground/50 ring-2 ring-foreground/10"
                    )}
                  >
                    <Icon className={cn(
                      "h-3.5 w-3.5 transition-colors duration-200",
                      !isVisible && "text-muted/30",
                      isVisible && !isSkipped && semanticColor(stage.semantic),
                      isVisible && isSkipped && "text-muted/40"
                    )} />
                  </div>
                  {i < stages.length - 1 && (
                    <div
                      className={cn(
                        "w-px h-6 transition-all duration-200",
                        isVisible && !isSkipped ? "bg-card-border" : "bg-card-border/30"
                      )}
                    />
                  )}
                </div>

                <div className={cn(
                  "flex-1 pb-4 transition-opacity duration-200",
                  !isVisible && "opacity-15",
                  isSkipped && "opacity-35"
                )}>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-medium",
                      isSkipped && "line-through text-muted"
                    )}>
                      {stage.label}
                    </span>
                    {isSkipped && (
                      <span className="rounded bg-card-border px-1.5 py-0.5 text-[9px] font-mono text-muted uppercase">
                        skipped
                      </span>
                    )}
                  </div>
                  <p className={cn("text-xs mt-0.5 leading-relaxed", isSkipped ? "text-muted/40" : "text-muted")}>
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
