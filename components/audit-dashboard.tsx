"use client";

import { useEffect, useState } from "react";
import { Activity, Wifi, WifiOff } from "lucide-react";
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
}

export function AuditDashboard() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource("/api/audit?stream=true");
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (ev) => {
      const entry: AuditEntry = JSON.parse(ev.data);
      setEntries((prev) => [entry, ...prev].slice(0, 100));
    };
    return () => es.close();
  }, []);

  const riskCls = {
    low: "bg-success/10 text-success",
    medium: "bg-warning/10 text-warning",
    high: "bg-danger/10 text-danger",
  };

  return (
    <div className="rounded-xl border border-card-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-card-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Activity className="h-5 w-5 text-accent" />
          <h2 className="text-base font-semibold">Live Audit Trail</h2>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <Wifi className="h-4 w-4 text-success" />
          ) : (
            <WifiOff className="h-4 w-4 text-danger" />
          )}
          <span className={cn("text-xs font-medium", connected ? "text-success" : "text-danger")}>
            {connected ? "Live" : "Disconnected"}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border text-left text-xs font-medium uppercase tracking-wider text-muted">
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Connection</th>
              <th className="px-5 py-3">Scopes</th>
              <th className="px-5 py-3">Risk</th>
              <th className="px-5 py-3">CIBA</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr
                key={e.id}
                className="border-b border-card-border/50 transition-colors hover:bg-accent/5 animate-[fadeIn_0.3s_ease-out]"
              >
                <td className="px-5 py-3 font-mono text-xs text-muted">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-5 py-3 font-medium">{e.action}</td>
                <td className="px-5 py-3 text-muted">{e.connection}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {e.scopes.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-mono text-accent"
                      >
                        {s.split("/").pop() ?? s}
                      </span>
                    ))}
                    {e.scopes.length > 3 && (
                      <span className="text-[10px] text-muted">+{e.scopes.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  {e.riskLevel && (
                    <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest", riskCls[e.riskLevel])}>
                      {e.riskLevel}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-muted">
                  {e.cibaStatus ?? "—"}
                </td>
                <td className="px-5 py-3">
                  {e.revoked ? (
                    <span className="text-xs font-bold text-danger">REVOKED</span>
                  ) : e.error ? (
                    <span className="text-xs font-medium text-danger">Error</span>
                  ) : (
                    <span className="text-xs font-medium text-success">OK</span>
                  )}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted">
                  <Activity className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  <p>No audit entries yet.</p>
                  <p className="text-xs">Actions will appear here in real time.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
