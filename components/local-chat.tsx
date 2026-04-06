"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Wifi, WifiOff, CloudOff, RotateCcw, Bot, User, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { PermissionPreview } from "./permission-preview";
import config from "@/config";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  preview?: { tool: string; connection: string; scopes: string[] };
  toolCall?: { name: string; status: "running" | "success" | "error"; result?: string };
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

  function addMsg(role: Message["role"], content: string, extra?: Partial<Message>) {
    setMessages((p) => [...p, { id: `${Date.now()}_${Math.random()}`, role, content, ...extra }]);
  }

  function updateLastAssistant(update: Partial<Message>) {
    setMessages((prev) => {
      const idx = prev.findLastIndex((m) => m.role === "assistant");
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], ...update };
      return updated;
    });
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
      addMsg("system", `Offline -queued (${queue.length + 1} pending). Will replay on reconnect.`);
      return;
    }

    setSending(true);
    try {
      addMsg("assistant", "", { toolCall: { name: "Analyzing request...", status: "running" } });

      const previewRes = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: "auto", connection: config.connections.google, scopes: ["calendar.events"] }),
      });
      if (previewRes.ok) {
        const p = await previewRes.json();
        updateLastAssistant({
          content: p.message,
          preview: { tool: p.tool, connection: p.connection, scopes: p.scopes },
          toolCall: { name: "Permission Preview", status: "success", result: `Risk: ${p.riskLevel}` },
        });
      }

      addMsg("assistant", "", { toolCall: { name: "create_calendar_event", status: "running" } });

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
        updateLastAssistant({
          content: `Agent paused: ${data.reason}`,
          toolCall: { name: "create_calendar_event", status: "error", result: data.reason },
        });
      } else if (data.success) {
        const result = typeof data.result === "string" ? data.result : "Action completed successfully.";
        updateLastAssistant({
          content: result,
          toolCall: { name: "create_calendar_event", status: "success", result },
        });
      } else {
        updateLastAssistant({
          content: `Error: ${data.error}${data.details ? ` -${data.details}` : ""}`,
          toolCall: { name: "create_calendar_event", status: "error", result: data.error },
        });
      }
    } catch {
      addMsg("system", "Cloud intermediary unreachable. Request queued.");
      setQueue((p) => [...p, { toolName: "create_calendar_event", params: { summary: msg } }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[75vh] flex-col rounded-lg border border-card-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-card-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
          <span className="text-sm font-medium">Sovereign Chat</span>
          <span className="text-[10px] text-muted font-mono">on-device</span>
        </div>
        <div className="flex items-center gap-3">
          {queue.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-warning animate-fade-in">
              <CloudOff className="h-3.5 w-3.5" />
              {queue.length} queued
            </div>
          )}
          <button
            onClick={toggleOnline}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors cursor-pointer",
              isOnline
                ? "border-success/30 text-success"
                : "border-danger/30 text-danger"
            )}
          >
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? "Online" : "Offline"}
          </button>
          {!isOnline && queue.length > 0 && (
            <button
              onClick={() => { setIsOnline(true); replayQueue(); }}
              className="flex items-center gap-1 rounded-lg border border-card-border px-2 py-1 text-xs hover:border-foreground/30 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" /> Replay
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {sending && (
          <div className="flex items-center gap-2 px-4 py-3 animate-fade-in">
            <div className="flex gap-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
            <span className="text-xs text-muted">Processing...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-card-border p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="e.g. Book a meeting with Sarah at 3pm tomorrow"
            className="flex-1 rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm placeholder:text-muted/50 focus:border-foreground/30 focus:outline-none transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity disabled:opacity-30 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted/50 mt-2 text-center">
          Enter to send. Reasoning happens locally -only tool calls route through Token Vault.
        </p>
      </div>
    </div>
  );
}

function ChatMessage({ message: m }: { message: Message }) {
  const [expanded, setExpanded] = useState(false);

  if (m.role === "system") {
    return (
      <div className="flex justify-center animate-fade-in">
        <div className="flex items-center gap-2 rounded-lg border border-card-border px-3 py-2 max-w-[90%]">
          <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
          <p className="text-xs text-muted leading-relaxed">{m.content}</p>
        </div>
      </div>
    );
  }

  const isUser = m.role === "user";

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-card-border bg-background shrink-0 mt-0.5">
          <Bot className="h-3.5 w-3.5 text-muted" />
        </div>
      )}
      <div className={cn(
        "max-w-[80%] rounded-lg px-4 py-3",
        isUser
          ? "bg-foreground text-background rounded-br-sm"
          : "bg-card border border-card-border rounded-bl-sm"
      )}>
        {m.content && (
          <p className={cn("text-sm leading-relaxed", !isUser && !m.content && "hidden")}>
            {m.content}
          </p>
        )}

        {m.toolCall && (
          <div className={cn("mt-2 rounded-lg border p-2.5", isUser ? "border-background/20 bg-background/10" : "border-card-border bg-background")}>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {m.toolCall.status === "running" && (
                  <div className="flex gap-0.5">
                    <span className="typing-dot" style={{ width: 4, height: 4 }} />
                    <span className="typing-dot" style={{ width: 4, height: 4 }} />
                    <span className="typing-dot" style={{ width: 4, height: 4 }} />
                  </div>
                )}
                {m.toolCall.status === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                {m.toolCall.status === "error" && <AlertTriangle className="h-3.5 w-3.5 text-danger" />}
                <span className={cn("text-xs font-mono", isUser ? "text-background/70" : "text-muted")}>
                  {m.toolCall.name}
                </span>
              </div>
              {m.toolCall.result && (
                expanded
                  ? <ChevronUp className={cn("h-3 w-3", isUser ? "text-background/50" : "text-muted/60")} />
                  : <ChevronDown className={cn("h-3 w-3", isUser ? "text-background/50" : "text-muted/60")} />
              )}
            </button>
            {expanded && m.toolCall.result && (
              <p className={cn("mt-2 text-[11px] leading-relaxed animate-slide-down", isUser ? "text-background/60" : "text-muted")}>
                {m.toolCall.result}
              </p>
            )}
          </div>
        )}

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
      {isUser && (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-card-border bg-background shrink-0 mt-0.5">
          <User className="h-3.5 w-3.5 text-muted" />
        </div>
      )}
    </div>
  );
}
