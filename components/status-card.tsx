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
    success: {
      icon: "bg-success/10 text-success border-success/20",
      dot: "bg-success",
      glow: "shadow-success/5",
    },
    accent: {
      icon: "bg-accent/10 text-accent border-accent/20",
      dot: "bg-accent",
      glow: "shadow-accent/5",
    },
    warning: {
      icon: "bg-warning/10 text-warning border-warning/20",
      dot: "bg-warning",
      glow: "shadow-warning/5",
    },
    danger: {
      icon: "bg-danger/10 text-danger border-danger/20",
      dot: "bg-danger",
      glow: "shadow-danger/5",
    },
  };

  const c = colorMap[color];

  return (
    <div className={cn(
      "rounded-xl border border-card-border bg-card p-4 transition-all duration-200 hover:shadow-lg",
      c.glow
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", c.icon)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted">{title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse-dot", c.dot)} />
            <p className="text-sm font-semibold truncate">{status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
