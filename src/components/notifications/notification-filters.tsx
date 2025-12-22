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
import type { NotificationFilterState } from "@/types";

interface NotificationFiltersProps {
  filters: NotificationFilterState;
  onFiltersChange: (filters: NotificationFilterState) => void;
}

export function NotificationFilters({
  filters,
  onFiltersChange,
}: NotificationFiltersProps) {
  const t = useTranslations("notifications");

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Read status filter */}
      <Select
        value={filters.readStatus}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            readStatus: value as NotificationFilterState["readStatus"],
          })
        }
      >
        <SelectTrigger className="w-full sm:w-[140px]">
          <SelectValue placeholder={t("filters.statusPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.statusAll")}</SelectItem>
          <SelectItem value="unread">{t("filters.statusUnread")}</SelectItem>
          <SelectItem value="read">{t("filters.statusRead")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Type filter */}
      <Select
        value={filters.type}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            type: value as NotificationFilterState["type"],
          })
        }
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder={t("filters.typePlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("filters.typeAll")}</SelectItem>
          <SelectItem value="monitor">{t("filters.typeMonitor")}</SelectItem>
          <SelectItem value="incident">{t("filters.typeIncident")}</SelectItem>
          <SelectItem value="maintenance">{t("filters.typeMaintenance")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("filters.searchPlaceholder")}
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
          className="pl-9"
        />
      </div>
    </div>
  );
}
