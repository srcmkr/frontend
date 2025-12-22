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
  const t = useTranslations("monitors");

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
          placeholder={t("filters.search")}
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
          <SelectValue placeholder={t("filters.statusPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
          <SelectItem value="up">{t("status.up")}</SelectItem>
          <SelectItem value="down">{t("status.down")}</SelectItem>
          <SelectItem value="pending">{t("status.pending")}</SelectItem>
          <SelectItem value="paused">{t("status.paused")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select
        value={filters.type}
        onValueChange={(value) => updateFilter("type", value as MonitorType | "all")}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder={t("filters.typePlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
          <SelectItem value="http">{t("types.http")}</SelectItem>
          <SelectItem value="tcp">{t("types.tcp")}</SelectItem>
          <SelectItem value="ping">{t("types.ping")}</SelectItem>
          <SelectItem value="dns">{t("types.dns")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Group By */}
      <Select
        value={filters.groupBy}
        onValueChange={(value) => updateFilter("groupBy", value as GroupBy)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={t("filters.groupBy")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="status">{t("filters.byStatus")}</SelectItem>
          <SelectItem value="type">{t("filters.byType")}</SelectItem>
          <SelectItem value="none">{t("filters.none")}</SelectItem>
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
          <SelectValue placeholder={t("filters.sortBy")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name-asc">{t("filters.nameAsc")}</SelectItem>
          <SelectItem value="name-desc">{t("filters.nameDesc")}</SelectItem>
          <SelectItem value="status-asc">{t("filters.statusAsc")}</SelectItem>
          <SelectItem value="status-desc">{t("filters.statusDesc")}</SelectItem>
          <SelectItem value="uptime-asc">{t("filters.uptimeAsc")}</SelectItem>
          <SelectItem value="uptime-desc">{t("filters.uptimeDesc")}</SelectItem>
          <SelectItem value="responseTime-asc">{t("filters.responseAsc")}</SelectItem>
          <SelectItem value="responseTime-desc">{t("filters.responseDesc")}</SelectItem>
          <SelectItem value="lastCheck-asc">{t("filters.checkAsc")}</SelectItem>
          <SelectItem value="lastCheck-desc">{t("filters.checkDesc")}</SelectItem>
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
