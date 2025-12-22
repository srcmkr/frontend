"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  IncidentFilterState,
  IncidentStatus,
  IncidentSeverity,
  IncidentType,
  Monitor,
} from "@/types";

interface IncidentFiltersProps {
  filters: IncidentFilterState;
  onFiltersChange: (filters: IncidentFilterState) => void;
  monitors: Monitor[];
  compact?: boolean;
  className?: string;
}

export function IncidentFilters({
  filters,
  onFiltersChange,
  monitors,
  compact = false,
  className,
}: IncidentFiltersProps) {
  const t = useTranslations("incidents.filters");

  const updateFilter = <K extends keyof IncidentFilterState>(
    key: K,
    value: IncidentFilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  if (compact) {
    return (
      <div className={className}>
        {/* Compact: Only search and status */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              updateFilter("status", value as IncidentStatus | "all")
            }
          >
            <SelectTrigger className="w-[100px] h-9">
              <SelectValue placeholder={t("statusPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              <SelectItem value="ongoing">{t("active")}</SelectItem>
              <SelectItem value="resolved">{t("resolved")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) =>
            updateFilter("status", value as IncidentStatus | "all")
          }
        >
          <SelectTrigger className="w-[100px] h-9">
            <SelectValue placeholder={t("statusPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all")}</SelectItem>
            <SelectItem value="ongoing">{t("active")}</SelectItem>
            <SelectItem value="resolved">{t("resolved")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Severity Filter */}
        <Select
          value={filters.severity}
          onValueChange={(value) =>
            updateFilter("severity", value as IncidentSeverity | "all")
          }
        >
          <SelectTrigger className="w-[110px] h-9">
            <SelectValue placeholder={t("severityLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("severityAll")}</SelectItem>
            <SelectItem value="critical">{t("critical")}</SelectItem>
            <SelectItem value="major">{t("major")}</SelectItem>
            <SelectItem value="minor">{t("minor")}</SelectItem>
            <SelectItem value="info">{t("info")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select
          value={filters.type}
          onValueChange={(value) =>
            updateFilter("type", value as IncidentType | "all")
          }
        >
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder={t("typeLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allTypes")}</SelectItem>
            <SelectItem value="incident">{t("incident")}</SelectItem>
            <SelectItem value="maintenance">{t("maintenance")}</SelectItem>
            <SelectItem value="announcement">{t("announcement")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Monitor Filter */}
        <Select
          value={filters.monitorId}
          onValueChange={(value) => updateFilter("monitorId", value)}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder={t("monitorLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allMonitors")}</SelectItem>
            {monitors.map((monitor) => (
              <SelectItem key={monitor.id} value={monitor.id}>
                {monitor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={(value) => {
            const [sortBy, sortOrder] = value.split("-") as [
              IncidentFilterState["sortBy"],
              IncidentFilterState["sortOrder"]
            ];
            onFiltersChange({ ...filters, sortBy, sortOrder });
          }}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder={t("sortLabel")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="startedAt-desc">{t("sortNewest")}</SelectItem>
            <SelectItem value="startedAt-asc">{t("sortOldest")}</SelectItem>
            <SelectItem value="severity-desc">{t("sortSeverityHigh")}</SelectItem>
            <SelectItem value="severity-asc">{t("sortSeverityLow")}</SelectItem>
            <SelectItem value="duration-desc">{t("sortDurationLong")}</SelectItem>
            <SelectItem value="duration-asc">{t("sortDurationShort")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
