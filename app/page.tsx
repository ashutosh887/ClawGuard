import Link from "next/link";
import {
  Shield,
  ArrowRight,
  Lock,
  Eye,
  Activity,
  WifiOff,
  ShieldOff,
  Fingerprint,
  Swords,
  Key,
  Zap,
  ChevronRight,
} from "lucide-react";
import config from "@/config";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">

      <div className="flex flex-col items-center text-center animate-fade-in">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 animate-pulse-glow">
          <Shield className="h-8 w-8 text-accent" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="gradient-text">{config.appName}</span>
        </h1>

        <p className="mt-4 text-lg font-medium text-accent/80 sm:text-xl max-w-xl">
          Local AI that safely touches the world — with zero token exposure.
        </p>

        <p className="mt-4 max-w-2xl text-base text-muted leading-relaxed">
          Your AI reasons entirely on-device. When it needs to act — book a meeting, send a message,
          push code — every request routes through Auth0 Token Vault. The model never sees a token.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/dashboard"
            className="group flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white hover:bg-accent/90 transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/30"
          >
            Open Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/chat"
            className="group flex items-center justify-center gap-2 rounded-xl border border-card-border bg-card px-6 py-3.5 text-sm font-semibold hover:border-accent/30 hover:bg-accent/5 transition-all duration-200"
          >
            Try Local Chat
            <ChevronRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
          </Link>
        </div>
      </div>


      <div className="mt-20 animate-fade-in stagger-2">
        <div className="rounded-xl border border-accent/20 bg-accent/5 px-6 py-5 overflow-x-auto">
          <div className="flex items-center justify-center gap-2 text-sm font-mono text-muted whitespace-nowrap">
            <span className="rounded-md bg-accent/10 px-2 py-1 text-accent font-semibold">Local AI</span>
            <ChevronRight className="h-4 w-4 text-accent/50 shrink-0" />
            <span className="rounded-md bg-card px-2 py-1 border border-card-border">Preview</span>
            <ChevronRight className="h-4 w-4 text-accent/50 shrink-0" />
            <span className="rounded-md bg-warning/10 px-2 py-1 text-warning">Shield</span>
            <ChevronRight className="h-4 w-4 text-accent/50 shrink-0" />
            <span className="rounded-md bg-accent/10 px-2 py-1 text-accent font-semibold">Token Vault</span>
            <ChevronRight className="h-4 w-4 text-accent/50 shrink-0" />
            <span className="rounded-md bg-success/10 px-2 py-1 text-success">CIBA</span>
            <ChevronRight className="h-4 w-4 text-accent/50 shrink-0" />
            <span className="rounded-md bg-success/10 px-2 py-1 text-success">API</span>
            <ChevronRight className="h-4 w-4 text-accent/50 shrink-0" />
            <span className="rounded-md bg-card px-2 py-1 border border-card-border">Audit</span>
          </div>
        </div>
      </div>


      <div className="mt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold">Five Fail-Safes + Two Power Features</h2>
          <p className="text-sm text-muted mt-2">Every layer between your AI agent and the outside world</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={ShieldOff}
            title="Instant Revoke"
            description="One-click bulk revocation of all Token Vault tokens. Severs agent access in under 2 seconds."
            accent="danger"
          />
          <FeatureCard
            icon={Lock}
            title="Anomaly Shield"
            description="Rate limiting, suspicious hour detection, and auto-CIBA step-up for high-risk actions."
            accent="warning"
          />
          <FeatureCard
            icon={WifiOff}
            title="Offline Queue"
            description="Requests queue locally during outages and replay through the full Token Vault flow on reconnect."
            accent="muted"
          />
          <FeatureCard
            icon={Eye}
            title="Permission Preview"
            description="Dry-run mode validates scopes and shows risk level before any token exchange happens."
            accent="accent"
          />
          <FeatureCard
            icon={Activity}
            title="Live Audit Trail"
            description="Real-time SSE dashboard of every Token Vault exchange, CIBA consent, and revocation event."
            accent="success"
          />
          <FeatureCard
            icon={Fingerprint}
            title="CIBA Consent"
            description="High-risk actions require second-device push approval. The agent waits — it can't bypass what it can't see."
            accent="accent"
          />
          <FeatureCard
            icon={Swords}
            title="Attack Simulator"
            description="Built-in red team mode. Simulate token replay, scope escalation, and rate limit breach — watch ClawGuard block each one."
            accent="danger"
            badge="New"
          />
          <FeatureCard
            icon={Key}
            title="Token Lifecycle"
            description="Visual birth-to-death token flow: creation, scoping, use, refresh, and revocation — animated and interactive."
            accent="accent"
            badge="New"
          />
        </div>
      </div>


      <div className="mt-16 rounded-xl border border-accent/20 bg-accent/5 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 border border-accent/30 shrink-0">
            <Zap className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Deep Auth0 Integration</h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Token Vault (<code className="text-accent text-xs">Auth0AI.withTokenVault</code>) for scoped token exchange.
              CIBA (<code className="text-accent text-xs">withAsyncAuthorization</code>) for backchannel consent.
              Management API for bulk revocation. NextJS SDK for session management.
              Per-tool minimum scopes — calendar gets only <code className="text-accent text-xs">calendar.events</code>, never broad access.
            </p>
          </div>
        </div>
      </div>


      <div className="mt-20 text-center">
        <p className="text-sm text-muted">
          Built with Next.js 16, Auth0 AI SDK 6.0, LangGraph, and Tailwind CSS v4.
        </p>
        <p className="text-xs text-muted/60 mt-1">
          Auth0 &quot;Authorized to Act&quot; Hackathon &mdash; by Ashutosh Jha
        </p>
      </div>
    </div>
  );
}

const accentStyles = {
  danger: {
    icon: "border-danger/20 bg-danger/10",
    iconColor: "text-danger",
    hover: "hover:border-danger/30 hover:shadow-lg hover:shadow-danger/5",
  },
  warning: {
    icon: "border-warning/20 bg-warning/10",
    iconColor: "text-warning",
    hover: "hover:border-warning/30 hover:shadow-lg hover:shadow-warning/5",
  },
  success: {
    icon: "border-success/20 bg-success/10",
    iconColor: "text-success",
    hover: "hover:border-success/30 hover:shadow-lg hover:shadow-success/5",
  },
  accent: {
    icon: "border-accent/20 bg-accent/10",
    iconColor: "text-accent",
    hover: "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5",
  },
  muted: {
    icon: "border-card-border bg-card",
    iconColor: "text-muted",
    hover: "hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5",
  },
} as const;

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
  badge,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent: keyof typeof accentStyles;
  badge?: string;
}) {
  const styles = accentStyles[accent];

  return (
    <div className={`group relative rounded-xl border border-card-border bg-card p-5 transition-all duration-200 ${styles.hover}`}>
      {badge && (
        <span className="absolute top-3 right-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
          {badge}
        </span>
      )}
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg border ${styles.icon} transition-transform duration-200 group-hover:scale-105`}>
        <Icon className={`h-4.5 w-4.5 ${styles.iconColor}`} />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted">{description}</p>
    </div>
  );
}
