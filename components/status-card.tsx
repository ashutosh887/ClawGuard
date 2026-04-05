import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatusCard({
  title,
  status,
  icon: Icon,
  color = "success",
}: {
  title: string;
  status: string;
  icon: LucideIcon;
  color?: "success" | "accent" | "warning" | "danger";
}) {
  const colorMap = {
    success: "bg-success/10 text-success border-success/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
  };

  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted">{title}</p>
          <p className="font-semibold">{status}</p>
        </div>
      </div>
    </div>
  );
}
