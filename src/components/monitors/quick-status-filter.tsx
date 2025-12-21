"use client";

import { cn } from "@/lib/utils";
import type { Monitor, MonitorStatus } from "@/types";

type FilterValue = MonitorStatus | "all";

interface QuickStatusFilterProps {
  monitors: Monitor[];
  value: FilterValue;
  onChange: (status: FilterValue) => void;
  className?: string;
}

const filterOptions: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "up", label: "Up" },
  { value: "down", label: "Down" },
  { value: "paused", label: "Paused" },
];

export function QuickStatusFilter({
  monitors,
  value,
  onChange,
  className,
}: QuickStatusFilterProps) {
  const getCounts = (status: FilterValue) => {
    if (status === "all") return monitors.length;
    return monitors.filter((m) => m.status === status).length;
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {filterOptions.map((option) => {
        const count = getCounts(option.value);
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isSelected ? "bg-primary-foreground" : "bg-current opacity-50"
              )}
            />
            <span>{option.label}</span>
            <span className={cn("text-xs", isSelected ? "opacity-80" : "opacity-60")}>
              ({count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
