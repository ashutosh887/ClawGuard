import { Shield, Activity, Lock, ShieldOff } from "lucide-react";
import { RevokeButton } from "@/components/revoke-button";
import { StatusCard } from "@/components/status-card";
import { AuditDashboard } from "@/components/audit-dashboard";
import { AttackSimulator } from "@/components/attack-simulator";
import { TokenLifecycle } from "@/components/token-lifecycle";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-xl font-semibold">Security Dashboard</h1>
          <p className="text-sm text-muted mt-1">
            Token Vault exchanges, anomalies, attack simulations, and revocations — live.
          </p>
        </div>
        <RevokeButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="animate-fade-in stagger-1">
          <StatusCard title="Token Vault" status="Active" icon={Shield} color="success" />
        </div>
        <div className="animate-fade-in stagger-2">
          <StatusCard title="Anomaly Shield" status="Monitoring" icon={Lock} color="success" />
        </div>
        <div className="animate-fade-in stagger-3">
          <StatusCard title="CIBA Consent" status="Ready" icon={ShieldOff} color="accent" />
        </div>
        <div className="animate-fade-in stagger-4">
          <StatusCard title="Audit Stream" status="Live" icon={Activity} color="success" />
        </div>
      </div>

      <div className="mb-8 animate-fade-in stagger-5">
        <AttackSimulator />
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mb-8">
        <div className="animate-fade-in stagger-5">
          <TokenLifecycle />
        </div>
        <div className="animate-fade-in stagger-6">
          <AuditDashboard />
        </div>
      </div>
    </div>
  );
}
