"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Wifi, WifiOff, CloudOff, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { PermissionPreview } from "./permission-preview";
import config from "@/config";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  preview?: { tool: string; connection: string; scopes: string[] };
}

interface QueuedReq { toolName: string; params: Record<string, unknown> }

export function LocalChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", role: "system", content: `${config.appName} local AI ready. Reasoning runs on your device. External actions route through the secure cloud intermediary via Token Vault.` },
  ]);
  const [input, setInput] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedReq[]>([]);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function addMsg(role: Message["role"], content: string, preview?: Message["preview"]) {
    setMessages((p) => [...p, { id: `${Date.now()}_${Math.random()}`, role, content, preview }]);
  }

  function toggleOnline() {
    const next = !isOnline;
    setIsOnline(next);
    if (next && queue.length > 0) replayQueue();
  }

  async function replayQueue() {
    addMsg("system", `Reconnected. Replaying ${queue.length} queued request(s)...`);
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queue),
      });
      const data = await res.json();
      const ok = data.results?.filter((r: { status: string }) => r.status === "completed").length ?? 0;
      addMsg("system", `Replayed ${data.replayed} request(s). ${ok} succeeded.`);
      setQueue([]);
    } catch {
      addMsg("system", "Queue replay failed. Will retry on next reconnect.");
    }
  }

  async function handleSend() {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput("");
    addMsg("user", msg);

    if (!isOnline) {
      setQueue((p) => [...p, { toolName: "pending", params: { message: msg } }]);
      addMsg("system", `Offline — queued (${queue.length + 1} pending). Will replay on reconnect.`);
      return;
    }

    setSending(true);
    try {
      const previewRes = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "auto", connection: config.connections.google, scopes: ["calendar.events"] }),
      });
      if (previewRes.ok) {
        const p = await previewRes.json();
        addMsg("assistant", p.message, { tool: p.tool, connection: p.connection, scopes: p.scopes });
      }

      const res = await fetch("/api/tool-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "create_calendar_event",
          params: { summary: msg },
          connection: config.connections.google,
          scopes: ["calendar.events"],
        }),
      });
      const data = await res.json();
      if (data.error === "blocked") {
        addMsg("system", `Agent paused: ${data.reason}`);
      } else if (data.success) {
        addMsg("assistant", typeof data.result === "string" ? data.result : "Action completed successfully.");
      } else {
        addMsg("assistant", `Error: ${data.error}${data.details ? ` — ${data.details}` : ""}`);
      }
    } catch {
      addMsg("system", "Cloud intermediary unreachable. Request queued.");
      setQueue((p) => [...p, { toolName: "create_calendar_event", params: { summary: msg } }]);
    } finally {
      setSending(false);
    }
  }

  const roleCls = {
    user: "bg-accent/10 text-accent ml-auto border-accent/20",
    assistant: "bg-card border-card-border",
    system: "bg-warning/5 text-warning border-warning/20",
  };

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border border-card-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-card-border px-4 py-3">
        <span className="text-sm font-semibold">Local Chat</span>
        <div className="flex items-center gap-3">
          {queue.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-warning">
              <CloudOff className="h-3.5 w-3.5" />
              {queue.length} queued
            </div>
          )}
          <button
            onClick={toggleOnline}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
              isOnline
                ? "border-success/30 bg-success/10 text-success"
                : "border-danger/30 bg-danger/10 text-danger"
            )}
          >
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? "Online" : "Offline"}
          </button>
          {!isOnline && queue.length > 0 && (
            <button
              onClick={() => { setIsOnline(true); replayQueue(); }}
              className="flex items-center gap-1 rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-xs text-accent cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Replay
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={cn("max-w-[85%] rounded-xl border px-4 py-3", roleCls[m.role])}>
            <p className="text-xs font-medium text-muted mb-1">
              {m.role === "user" ? "You" : m.role === "system" ? "System" : config.appName}
            </p>
            <p className="text-sm leading-relaxed">{m.content}</p>
            {m.preview && (
              <div className="mt-3">
                <PermissionPreview
                  tool={m.preview.tool}
                  connection={m.preview.connection}
                  scopes={m.preview.scopes}
                  onApprove={() => {}}
                  onDeny={() => {}}
                />
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="border-t border-card-border p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="e.g. Book a meeting with Sarah at 3pm tomorrow"
            className="flex-1 rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm placeholder:text-muted/50 focus:border-accent focus:outline-none transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent/80 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
