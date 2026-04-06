import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Lock,
  Eye,
  Activity,
  WifiOff,
  ShieldOff,
  Fingerprint,
  Swords,
  Key,
  ChevronRight,
} from "lucide-react";
import config from "@/config";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">

      <div className="flex flex-col items-center text-center animate-fade-in">
        <Image
          src="/logo.png"
          alt="ClawGuard"
          width={56}
          height={56}
          className="mb-6 dark:invert"
        />

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {config.appName}
        </h1>

        <p className="mt-3 text-lg text-muted max-w-lg">
          Local AI that safely touches the world - with zero token exposure.
        </p>

        <p className="mt-4 max-w-xl text-sm text-muted leading-relaxed">
          Your AI reasons on-device. When it needs to act, every request routes
          through Auth0 Token Vault. The model never sees a token.
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
          >
            Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-2 rounded-lg border border-card-border px-5 py-2.5 text-sm font-medium hover:border-foreground/30 transition-colors"
          >
            Chat
            <ChevronRight className="h-4 w-4 text-muted" />
          </Link>
        </div>
      </div>

      {/* Flow */}
      <div className="mt-16 animate-fade-in stagger-2">
        <div className="rounded-lg border border-card-border px-5 py-3.5 overflow-x-auto">
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-muted whitespace-nowrap">
            <span className="rounded bg-foreground/5 px-2 py-1 font-medium text-foreground">Local AI</span>
            <ChevronRight className="h-3.5 w-3.5 text-card-border shrink-0" />
            <span className="rounded bg-foreground/5 px-2 py-1">Preview</span>
            <ChevronRight className="h-3.5 w-3.5 text-card-border shrink-0" />
            <span className="rounded bg-warning/10 px-2 py-1 text-warning">Shield</span>
            <ChevronRight className="h-3.5 w-3.5 text-card-border shrink-0" />
            <span className="rounded bg-foreground/5 px-2 py-1 font-medium text-foreground">Token Vault</span>
            <ChevronRight className="h-3.5 w-3.5 text-card-border shrink-0" />
            <span className="rounded bg-success/10 px-2 py-1 text-success">CIBA</span>
            <ChevronRight className="h-3.5 w-3.5 text-card-border shrink-0" />
            <span className="rounded bg-success/10 px-2 py-1 text-success">API</span>
            <ChevronRight className="h-3.5 w-3.5 text-card-border shrink-0" />
            <span className="rounded bg-foreground/5 px-2 py-1">Audit</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-16">
        <h2 className="text-lg font-semibold text-center mb-8">Five fail-safes, every layer</h2>
        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4 border border-card-border rounded-lg overflow-hidden bg-card-border">
          <FeatureCard icon={ShieldOff} title="Instant Revoke" description="Bulk revocation of all Token Vault tokens. Severs agent access in under 2 seconds." />
          <FeatureCard icon={Lock} title="Anomaly Shield" description="Rate limiting, suspicious hour detection, auto-CIBA step-up for high-risk actions." />
          <FeatureCard icon={WifiOff} title="Offline Queue" description="Requests queue locally during outages and replay through Token Vault on reconnect." />
          <FeatureCard icon={Eye} title="Permission Preview" description="Dry-run mode validates scopes and shows risk before any token exchange." />
          <FeatureCard icon={Activity} title="Live Audit Trail" description="Real-time SSE dashboard of every exchange, consent, and revocation." />
          <FeatureCard icon={Fingerprint} title="CIBA Consent" description="High-risk actions require second-device approval. The agent can't bypass what it can't see." />
          <FeatureCard icon={Swords} title="Attack Simulator" description="Red team mode. Simulate token replay, scope escalation, rate limit breach." />
          <FeatureCard icon={Key} title="Token Lifecycle" description="Visual token flow: creation, scoping, use, refresh, and revocation." />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center space-y-2">
        <p className="text-xs text-muted">
          {config.stack.map((s) => `${s.name} ${s.version}`).join(" / ")}
        </p>
        <p className="text-xs text-muted/60">
          <a href={config.hackathon.url} className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">
            {config.hackathon.name}
          </a>
          {" - "}
          <a href={config.author.github} className="hover:text-foreground transition-colors" target="_blank" rel="noopener noreferrer">
            {config.author.name}
          </a>
        </p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card p-5">
      <Icon className="h-4 w-4 text-muted mb-3" />
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
    </div>
  );
}
