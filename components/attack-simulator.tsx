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

const riskText = {
  low: "text-success",
  medium: "text-warning",
  high: "text-danger",
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
      <div className="rounded-lg border border-card-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Swords className="h-5 w-5 text-muted" />
            <div>
              <h2 className="text-sm font-medium">Attack Simulation</h2>
              <p className="text-xs text-muted">Red team mode</p>
            </div>
          </div>
          <button
            onClick={loadScenarios}
            className="flex items-center gap-2 rounded-lg border border-card-border px-4 py-2 text-sm font-medium hover:border-foreground/30 transition-colors cursor-pointer"
          >
            <Swords className="h-4 w-4" />
            Enter Red Team Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-card-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
        <div className="flex items-center gap-3">
          <Swords className="h-5 w-5 text-muted" />
          <div>
            <h2 className="text-sm font-medium">Attack Simulation</h2>
            <p className="text-xs text-muted">{scenarios.length} scenarios</p>
          </div>
        </div>
        <button
          onClick={() => runAttack()}
          disabled={running}
          className="flex items-center gap-2 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {running && runAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          Run All
        </button>
      </div>

      <div className="grid gap-px p-px sm:grid-cols-2 lg:grid-cols-3 bg-card-border">
        {scenarios.map((s) => (
          <div key={s.index} className="bg-card p-4">
            <div className="flex items-start justify-between mb-1.5">
              <h3 className="text-sm font-medium">{s.name}</h3>
              <span className={cn("text-[10px] font-medium uppercase tracking-wider", riskText[s.riskLevel])}>
                {s.riskLevel}
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed mb-3">{s.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted font-mono">{s.failSafe}</span>
              <button
                onClick={() => runAttack(s.index)}
                disabled={running}
                className="flex items-center gap-1 rounded border border-card-border px-2 py-1 text-xs hover:border-foreground/30 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Play className="h-3 w-3" /> Run
              </button>
            </div>
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <div className="border-t border-card-border">
          <div className="px-5 py-3 border-b border-card-border">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Results ({results.length})
            </h3>
          </div>
          <div className="divide-y divide-card-border">
            {results.map((r) => {
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
                        <ShieldCheck className="h-4 w-4 text-success shrink-0" />
                      ) : (
                        <ShieldX className="h-4 w-4 text-danger shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{r.attack}</p>
                        <p className="text-xs text-muted">{r.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn(
                        "rounded px-2 py-0.5 text-[11px] font-medium",
                        r.blocked ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                      )}>
                        {r.blocked ? "BLOCKED" : "PASSED"}
                      </span>
                      <span className={cn("text-[10px] font-medium uppercase", riskText[r.riskLevel])}>
                        {r.riskLevel}
                      </span>
                      {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted" /> : <ChevronDown className="h-3.5 w-3.5 text-muted" />}
                    </div>
                  </button>
                  {expanded && (
                    <div className="mt-3 ml-7 rounded-lg border border-card-border bg-background p-3 animate-slide-down">
                      <p className="text-xs leading-relaxed text-muted">{r.details}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] text-muted font-mono">Protected by:</span>
                        <span className="rounded bg-foreground/5 px-2 py-0.5 text-[10px] font-mono">
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
