"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IncidentListItem } from "./incident-list-item";
import { SEVERITY_ORDER } from "@/lib/validations/incident";
import type { ExtendedIncident, IncidentFilterState, Monitor } from "@/types";

const ITEMS_PER_PAGE = 10;

const defaultFilters: IncidentFilterState = {
  search: "",
  status: "all",
  severity: "all",
  type: "all",
  monitorId: "all",
  dateRange: { from: null, to: null },
  sortBy: "startedAt",
  sortOrder: "desc",
};

interface IncidentListPanelProps {
  incidents: ExtendedIncident[];
  monitors: Monitor[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  onCreateIncident?: () => void;
  className?: string;
}

function filterAndSortIncidents(
  incidents: ExtendedIncident[],
  filters: IncidentFilterState
): ExtendedIncident[] {
  let result = [...incidents];

  // Search filter
  if (filters.search) {
    const search = filters.search.toLowerCase();
    result = result.filter(
      (i) =>
        i.title.toLowerCase().includes(search) ||
        i.cause.toLowerCase().includes(search) ||
        i.monitorName.toLowerCase().includes(search)
    );
  }

  // Status filter
  if (filters.status !== "all") {
    result = result.filter((i) => i.status === filters.status);
  }

  // Severity filter
  if (filters.severity !== "all") {
    result = result.filter((i) => i.severity === filters.severity);
  }

  // Type filter
  if (filters.type !== "all") {
    result = result.filter((i) => i.type === filters.type);
  }

  // Monitor filter
  if (filters.monitorId !== "all") {
    result = result.filter((i) =>
      i.affectedMonitors.includes(filters.monitorId)
    );
  }

  // Sort
  result.sort((a, b) => {
    let comparison = 0;

    switch (filters.sortBy) {
      case "startedAt":
        comparison =
          new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
        break;
      case "severity":
        comparison = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
        break;
      case "duration":
        comparison = (a.duration || 0) - (b.duration || 0);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
    }

    return filters.sortOrder === "desc" ? -comparison : comparison;
  });

  return result;
}

export function IncidentListPanel({
  incidents,
  monitors,
  selectedIncidentId,
  onSelectIncident,
  onCreateIncident,
  className,
}: IncidentListPanelProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredIncidents = useMemo(() => {
    const filters: IncidentFilterState = { ...defaultFilters, search };
    return filterAndSortIncidents(incidents, filters);
  }, [incidents, search]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE);
  const showPagination = filteredIncidents.length > ITEMS_PER_PAGE;

  // Ensure currentPage is valid
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }

  const paginatedIncidents = useMemo(() => {
    const start = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredIncidents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredIncidents, validCurrentPage]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with Search */}
      <div className="p-3 space-y-2 border-b">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {incidents.length} Vorfälle
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <p className="text-muted-foreground mb-2">Keine Vorfälle gefunden</p>
            {search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearch("")}
              >
                Suche zurücksetzen
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {paginatedIncidents.map((incident) => (
              <IncidentListItem
                key={incident.id}
                incident={incident}
                isSelected={incident.id === selectedIncidentId}
                onSelect={() => onSelectIncident(incident.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-center gap-1 p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validCurrentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {validCurrentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validCurrentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
