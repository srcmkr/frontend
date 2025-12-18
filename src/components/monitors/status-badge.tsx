import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MonitorStatus } from "@/types";

interface StatusBadgeProps {
  status: MonitorStatus;
  className?: string;
}

const statusConfig: Record<
  MonitorStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  up: { label: "Up", variant: "default" },
  down: { label: "Down", variant: "destructive" },
  pending: { label: "Pending", variant: "secondary" },
  paused: { label: "Paused", variant: "outline" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        status === "up" && "bg-green-500 hover:bg-green-500/80",
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
