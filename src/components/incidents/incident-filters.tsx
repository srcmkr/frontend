"use client";

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
              placeholder="Suchen..."
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
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="ongoing">Aktiv</SelectItem>
              <SelectItem value="resolved">Behoben</SelectItem>
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
            placeholder="Suchen..."
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
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="ongoing">Aktiv</SelectItem>
            <SelectItem value="resolved">Behoben</SelectItem>
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
            <SelectValue placeholder="Schwere" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="critical">Kritisch</SelectItem>
            <SelectItem value="major">Mittel</SelectItem>
            <SelectItem value="minor">Gering</SelectItem>
            <SelectItem value="info">Info</SelectItem>
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
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="incident">Vorfall</SelectItem>
            <SelectItem value="maintenance">Wartung</SelectItem>
            <SelectItem value="announcement">Ankündigung</SelectItem>
          </SelectContent>
        </Select>

        {/* Monitor Filter */}
        <Select
          value={filters.monitorId}
          onValueChange={(value) => updateFilter("monitorId", value)}
        >
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Monitor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Monitore</SelectItem>
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
            <SelectValue placeholder="Sortieren" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="startedAt-desc">Neueste zuerst</SelectItem>
            <SelectItem value="startedAt-asc">Älteste zuerst</SelectItem>
            <SelectItem value="severity-desc">Schwere (hoch)</SelectItem>
            <SelectItem value="severity-asc">Schwere (niedrig)</SelectItem>
            <SelectItem value="duration-desc">Dauer (lang)</SelectItem>
            <SelectItem value="duration-asc">Dauer (kurz)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
