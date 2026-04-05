"use client";

import { useState } from "react";
import {
  Swords,
  ShieldCheck,
  ShieldX,
  Play,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Scenario {
  index: number;
  name: string;
  description: string;
  failSafe: string;
  riskLevel: "low" | "medium" | "high";
}

interface SimResult {
  id: string;
  attack: string;
  description: string;
  blocked: boolean;
  failSafe: string;
  riskLevel: "low" | "medium" | "high";
  details: string;
  timestamp: string;
}

const riskColors = {
  low: { bg: "bg-success/10", text: "text-success", border: "border-success/30", glow: "glow-success" },
  medium: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30", glow: "" },
  high: { bg: "bg-danger/10", text: "text-danger", border: "border-danger/30", glow: "glow-danger" },
};

export function AttackSimulator() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [results, setResults] = useState<SimResult[]>([]);
  const [running, setRunning] = useState(false);
  const [runAll, setRunAll] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function loadScenarios() {
    const res = await fetch("/api/simulate");
    if (res.ok) {
      const data = await res.json();
      setScenarios(data.scenarios);
      setLoaded(true);
    }
  }

  async function runAttack(attackIndex?: number) {
    setRunning(true);
    if (attackIndex === undefined) setRunAll(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attackIndex !== undefined ? { attackIndex } : {}),
      });
      if (res.ok) {
        const data = await res.json();
        setResults((prev) => [...data.results, ...prev]);
      }
    } finally {
      setRunning(false);
      setRunAll(false);
    }
  }

  if (!loaded) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-danger/20 bg-danger/10">
              <Swords className="h-5 w-5 text-danger" />
            </div>
            <div>
              <h2 className="font-semibold">Attack Simulation</h2>
              <p className="text-xs text-muted">Red team mode — test ClawGuard&apos;s defenses</p>
            </div>
          </div>
          <button
            onClick={loadScenarios}
            className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm font-semibold text-danger hover:bg-danger hover:text-white transition-all duration-200 cursor-pointer"
          >
            <Swords className="h-4 w-4" />
            Enter Red Team Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-card-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-danger/20 bg-danger/10">
            <Swords className="h-5 w-5 text-danger" />
          </div>
          <div>
            <h2 className="font-semibold">Attack Simulation</h2>
            <p className="text-xs text-muted">{scenarios.length} attack scenarios available</p>
          </div>
        </div>
        <button
          onClick={() => runAttack()}
          disabled={running}
          className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/80 transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          {running && runAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          Run All Attacks
        </button>
      </div>


      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((s) => {
          const rc = riskColors[s.riskLevel];
          return (
            <div
              key={s.index}
              className={cn(
                "rounded-lg border p-4 transition-all duration-200 hover:shadow-md animate-fade-in",
                rc.border, rc.bg
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-semibold">{s.name}</h3>
                <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest", rc.text)}>
                  {s.riskLevel}
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-3">{s.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted font-mono">{s.failSafe}</span>
                <button
                  onClick={() => runAttack(s.index)}
                  disabled={running}
                  className="flex items-center gap-1 rounded-md border border-card-border bg-card px-2 py-1 text-xs font-medium hover:border-danger hover:text-danger transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Play className="h-3 w-3" /> Run
                </button>
              </div>
            </div>
          );
        })}
      </div>


      {results.length > 0 && (
        <div className="border-t border-card-border">
          <div className="px-5 py-3 border-b border-card-border/50">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Simulation Results ({results.length})
            </h3>
          </div>
          <div className="divide-y divide-card-border/50">
            {results.map((r) => {
              const rc = riskColors[r.riskLevel];
              const expanded = expandedId === r.id;
              return (
                <div
                  key={r.id}
                  className={cn(
                    "px-5 py-3 transition-colors animate-fade-in",
                    r.blocked ? "animate-flash-red" : "animate-flash-green"
                  )}
                >
                  <button
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                    className="flex w-full items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {r.blocked ? (
                        <ShieldCheck className="h-5 w-5 text-success shrink-0" />
                      ) : (
                        <ShieldX className="h-5 w-5 text-danger shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{r.attack}</p>
                        <p className="text-xs text-muted">{r.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                        r.blocked ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                      )}>
                        {r.blocked ? "BLOCKED" : "PASSED"}
                      </span>
                      <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase", rc.text, rc.bg)}>
                        {r.riskLevel}
                      </span>
                      {expanded ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
                    </div>
                  </button>
                  {expanded && (
                    <div className="mt-3 ml-8 rounded-lg border border-card-border bg-background p-3 animate-slide-down">
                      <p className="text-xs leading-relaxed text-muted">{r.details}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-muted font-mono">Protected by:</span>
                        <span className="rounded bg-accent/10 px-2 py-0.5 text-[10px] font-mono text-accent">
                          {r.failSafe}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
