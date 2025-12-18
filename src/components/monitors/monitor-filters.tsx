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
import type { MonitorStatus, MonitorType } from "@/types";

export type GroupBy = "status" | "type" | "none";
export type SortBy = "name" | "status" | "uptime" | "responseTime" | "lastCheck";
export type SortOrder = "asc" | "desc";

export interface MonitorFilterState {
  search: string;
  status: MonitorStatus | "all";
  type: MonitorType | "all";
  groupBy: GroupBy;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

interface MonitorFiltersProps {
  filters: MonitorFilterState;
  onFiltersChange: (filters: MonitorFilterState) => void;
}

export function MonitorFilters({ filters, onFiltersChange }: MonitorFiltersProps) {
  const updateFilter = <K extends keyof MonitorFilterState>(
    key: K,
    value: MonitorFilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suchen..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => updateFilter("status", value as MonitorStatus | "all")}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Status</SelectItem>
          <SelectItem value="up">Up</SelectItem>
          <SelectItem value="down">Down</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="paused">Paused</SelectItem>
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select
        value={filters.type}
        onValueChange={(value) => updateFilter("type", value as MonitorType | "all")}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Typ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Typen</SelectItem>
          <SelectItem value="http">HTTP</SelectItem>
          <SelectItem value="tcp">TCP</SelectItem>
          <SelectItem value="ping">Ping</SelectItem>
          <SelectItem value="dns">DNS</SelectItem>
        </SelectContent>
      </Select>

      {/* Group By */}
      <Select
        value={filters.groupBy}
        onValueChange={(value) => updateFilter("groupBy", value as GroupBy)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Gruppieren" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="status">Nach Status</SelectItem>
          <SelectItem value="type">Nach Typ</SelectItem>
          <SelectItem value="none">Keine</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort By */}
      <Select
        value={`${filters.sortBy}-${filters.sortOrder}`}
        onValueChange={(value) => {
          const [sortBy, sortOrder] = value.split("-") as [SortBy, SortOrder];
          onFiltersChange({ ...filters, sortBy, sortOrder });
        }}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sortieren" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name-asc">Name A-Z</SelectItem>
          <SelectItem value="name-desc">Name Z-A</SelectItem>
          <SelectItem value="status-asc">Status (Up zuerst)</SelectItem>
          <SelectItem value="status-desc">Status (Down zuerst)</SelectItem>
          <SelectItem value="uptime-asc">Uptime (niedrigste)</SelectItem>
          <SelectItem value="uptime-desc">Uptime (höchste)</SelectItem>
          <SelectItem value="responseTime-asc">Response (schnellste)</SelectItem>
          <SelectItem value="responseTime-desc">Response (langsamste)</SelectItem>
          <SelectItem value="lastCheck-asc">Check (älteste)</SelectItem>
          <SelectItem value="lastCheck-desc">Check (neueste)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export const defaultFilters: MonitorFilterState = {
  search: "",
  status: "all",
  type: "all",
  groupBy: "status",
  sortBy: "status",
  sortOrder: "desc",
};
