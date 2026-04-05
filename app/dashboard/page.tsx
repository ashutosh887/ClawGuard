import { Shield, Activity, Lock, ShieldOff } from "lucide-react";
import { RevokeButton } from "@/components/revoke-button";
import { StatusCard } from "@/components/status-card";
import { AuditDashboard } from "@/components/audit-dashboard";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted mt-1">
            Token Vault exchanges, anomalies, and revocations — live.
          </p>
        </div>
        <RevokeButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatusCard title="Token Vault" status="Active" icon={Shield} color="success" />
        <StatusCard title="Anomaly Shield" status="Monitoring" icon={Lock} color="success" />
        <StatusCard title="CIBA Consent" status="Ready" icon={ShieldOff} color="accent" />
        <StatusCard title="Audit Stream" status="Live" icon={Activity} color="success" />
      </div>

      <AuditDashboard />
    </div>
  );
}
