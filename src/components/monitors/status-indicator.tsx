import { cn } from "@/lib/utils";
import type { MonitorStatus } from "@/types";

interface StatusIndicatorProps {
  status: MonitorStatus;
  size?: "sm" | "md" | "lg";
  showPulse?: boolean;
}

const sizeClasses = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

const statusColors: Record<MonitorStatus, string> = {
  up: "bg-green-500",
  down: "bg-red-500",
  pending: "bg-yellow-500",
  paused: "bg-gray-400",
};

export function StatusIndicator({
  status,
  size = "md",
  showPulse = true,
}: StatusIndicatorProps) {
  return (
    <span className="relative flex items-center justify-center">
      <span
        className={cn(
          "rounded-full",
          sizeClasses[size],
          statusColors[status]
        )}
      />
      {showPulse && status === "up" && (
        <span
          className={cn(
            "absolute rounded-full animate-ping opacity-75",
            sizeClasses[size],
            "bg-green-500"
          )}
          style={{ animationDuration: "2s" }}
        />
      )}
      {showPulse && status === "down" && (
        <span
          className={cn(
            "absolute rounded-full animate-ping opacity-75",
            sizeClasses[size],
            "bg-red-500"
          )}
          style={{ animationDuration: "1s" }}
        />
      )}
    </span>
  );
}
