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
import type { NotificationFilterState } from "@/types";

interface NotificationFiltersProps {
  filters: NotificationFilterState;
  onFiltersChange: (filters: NotificationFilterState) => void;
}

export function NotificationFilters({
  filters,
  onFiltersChange,
}: NotificationFiltersProps) {
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
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle</SelectItem>
          <SelectItem value="unread">Ungelesen</SelectItem>
          <SelectItem value="read">Gelesen</SelectItem>
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
          <SelectValue placeholder="Typ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Typen</SelectItem>
          <SelectItem value="monitor">Monitor</SelectItem>
          <SelectItem value="incident">Incidents</SelectItem>
          <SelectItem value="maintenance">Wartung</SelectItem>
        </SelectContent>
      </Select>

      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Benachrichtigungen suchen..."
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
