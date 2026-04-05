import Link from "next/link";
import { Shield, ArrowRight, Lock, Eye, Activity, WifiOff, ShieldOff, Fingerprint } from "lucide-react";
import config from "@/config";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <div className="flex flex-col items-center text-center">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10">
          <Shield className="h-7 w-7 text-accent" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          {config.appName}
        </h1>

        <p className="mt-4 text-xl font-medium text-accent sm:text-2xl">
          {config.appDescription}
        </p>

        <p className="mt-4 max-w-2xl text-base text-muted leading-relaxed">
          Your AI reasons entirely on-device. When it needs to act — book a meeting, send a message,
          push code — every request routes through Auth0 Token Vault. The model never sees a token.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
          >
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/chat"
            className="flex items-center justify-center gap-2 rounded-xl border border-card-border px-6 py-3 text-sm font-semibold hover:bg-card transition-colors"
          >
            Local Chat
          </Link>
        </div>
      </div>

      <div className="mt-20 rounded-xl border border-card-border bg-card px-6 py-5">
        <p className="text-center text-sm text-muted font-mono leading-relaxed">
          Local AI → JSON request → Cloud Intermediary → Permission Preview → Anomaly Shield → Token Vault → CIBA Consent → External API → Audit Log
        </p>
      </div>

      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={ShieldOff}
          title="Instant Revoke"
          description="One-click bulk revocation of all Token Vault tokens. Severs the agent bridge in under 2 seconds."
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
          accent="blue"
        />
        <FeatureCard
          icon={Eye}
          title="Permission Preview"
          description="Dry-run mode validates scopes and shows risk level before any token exchange happens."
          accent="blue"
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
          accent="blue"
        />
      </div>

      <div className="mt-20 text-center">
        <p className="text-sm text-muted">
          Built with Next.js 16, Auth0 AI SDK, LangGraph, and Tailwind CSS v4.
        </p>
      </div>
    </div>
  );
}

const accentStyles = {
  danger: {
    icon: "border-danger/20 bg-danger/10",
    iconColor: "text-danger",
  },
  warning: {
    icon: "border-warning/20 bg-warning/10",
    iconColor: "text-warning",
  },
  success: {
    icon: "border-success/20 bg-success/10",
    iconColor: "text-success",
  },
  blue: {
    icon: "border-accent/20 bg-accent/10",
    iconColor: "text-accent",
  },
} as const;

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent: keyof typeof accentStyles;
}) {
  const styles = accentStyles[accent];

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 transition-colors hover:border-accent/30">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg border ${styles.icon}`}>
        <Icon className={`h-5 w-5 ${styles.iconColor}`} />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
