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
  const dotColor = {
    success: "bg-success",
    accent: "bg-foreground",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  return (
    <div className="rounded-lg border border-card-border bg-card p-4 hover:border-foreground/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-card-border bg-background">
          <Icon className="h-4 w-4 text-muted" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted">{title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse-dot", dotColor[color])} />
            <p className="text-sm font-medium truncate">{status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
