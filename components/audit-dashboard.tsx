"use client";

import { useEffect, useState } from "react";
import { Activity, Wifi, WifiOff, Filter, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  connection: string;
  scopes: string[];
  riskLevel?: "low" | "medium" | "high";
  cibaStatus?: string;
  revoked?: boolean;
  error?: string;
  meta?: Record<string, unknown>;
}

type RiskFilter = "all" | "low" | "medium" | "high";

export function AuditDashboard() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("all");

  useEffect(() => {
    const es = new EventSource("/api/audit?stream=true");
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (ev) => {
      if (paused) return;
      const entry: AuditEntry = JSON.parse(ev.data);
      setEntries((prev) => [entry, ...prev].slice(0, 100));
    };
    return () => es.close();
  }, [paused]);

  const filteredEntries = riskFilter === "all"
    ? entries
    : entries.filter((e) => e.riskLevel === riskFilter);

  const riskCls = {
    low: "bg-success/10 text-success",
    medium: "bg-warning/10 text-warning",
    high: "bg-danger/10 text-danger",
  };

  const statusIcon = (e: AuditEntry) => {
    if (e.meta?.simulation) return { label: "SIM", cls: "bg-accent/10 text-accent" };
    if (e.revoked) return { label: "REVOKED", cls: "bg-danger/10 text-danger font-bold" };
    if (e.error) return { label: "BLOCKED", cls: "bg-danger/10 text-danger" };
    return { label: "OK", cls: "bg-success/10 text-success" };
  };

  return (
    <div className="rounded-xl border border-card-border bg-card overflow-hidden">

      <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
            <Activity className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Live Audit Trail</h2>
            <p className="text-[10px] text-muted">{entries.length} events captured</p>
          </div>
        </div>
        <div className="flex items-center gap-2">

          <button
            onClick={() => setPaused(!paused)}
            className={cn(
              "flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium transition-colors cursor-pointer",
              paused ? "border-warning/30 bg-warning/10 text-warning" : "border-card-border text-muted hover:text-foreground"
            )}
          >
            {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            {paused ? "Resume" : "Pause"}
          </button>


          <div className="flex items-center gap-1 rounded-lg border border-card-border px-2 py-1">
            <Filter className="h-3 w-3 text-muted" />
            {(["all", "low", "medium", "high"] as RiskFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer capitalize",
                  riskFilter === f ? "bg-accent/10 text-accent" : "text-muted hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>


          <div className="flex items-center gap-1.5">
            {connected ? (
              <Wifi className="h-3.5 w-3.5 text-success" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-danger" />
            )}
            <span className={cn("text-[10px] font-medium", connected ? "text-success" : "text-danger")}>
              {connected ? "Live" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>


      <div className="overflow-x-auto max-h-100 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b border-card-border text-left text-[10px] font-medium uppercase tracking-wider text-muted">
              <th className="px-4 py-2.5">Time</th>
              <th className="px-4 py-2.5">Action</th>
              <th className="px-4 py-2.5">Connection</th>
              <th className="px-4 py-2.5">Scopes</th>
              <th className="px-4 py-2.5">Risk</th>
              <th className="px-4 py-2.5">CIBA</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((e) => {
              const status = statusIcon(e);
              return (
                <tr
                  key={e.id}
                  className={cn(
                    "border-b border-card-border/50 transition-colors hover:bg-accent/5 animate-fade-in",
                    e.error && "animate-flash-red",
                    e.meta?.simulation ? "bg-accent/2" : ""
                  )}
                >
                  <td className="px-4 py-2.5 font-mono text-[11px] text-muted whitespace-nowrap">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-medium">{e.action}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted">{e.connection}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {e.scopes.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="rounded bg-accent/10 px-1.5 py-0.5 text-[9px] font-mono text-accent"
                        >
                          {s.split("/").pop() ?? s}
                        </span>
                      ))}
                      {e.scopes.length > 2 && (
                        <span className="text-[9px] text-muted">+{e.scopes.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    {e.riskLevel && (
                      <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest", riskCls[e.riskLevel])}>
                        {e.riskLevel}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-[11px] text-muted">
                    {e.cibaStatus ? (
                      <span className={cn(
                        "rounded px-1.5 py-0.5 text-[9px] font-medium",
                        e.cibaStatus === "approved" && "bg-success/10 text-success",
                        e.cibaStatus === "denied" && "bg-danger/10 text-danger",
                        e.cibaStatus === "pending" && "bg-warning/10 text-warning"
                      )}>
                        {e.cibaStatus}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", status.cls)}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredEntries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted">
                  <Activity className="mx-auto mb-2 h-8 w-8 opacity-20" />
                  <p className="text-sm">No audit entries yet.</p>
                  <p className="text-xs text-muted/60 mt-1">Try the Attack Simulator or send a chat message.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
