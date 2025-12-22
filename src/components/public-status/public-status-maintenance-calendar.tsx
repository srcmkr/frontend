"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StatusPageMaintenance, StatusPageGroup } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PublicStatusMaintenanceCalendarProps {
  maintenances: StatusPageMaintenance[];
  groups: StatusPageGroup[];
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export function PublicStatusMaintenanceCalendar({
  maintenances,
  groups,
}: PublicStatusMaintenanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calculate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);

    // Get first Monday (start of calendar grid)
    const startOffset = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(calendarStart.getDate() - startOffset);

    const days: Date[] = [];
    const current = new Date(calendarStart);

    // Generate 6 weeks of days
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentMonth, currentYear]);

  // Map maintenances to dates
  const maintenancesByDate = useMemo(() => {
    const map = new Map<string, StatusPageMaintenance[]>();

    maintenances.forEach((m) => {
      const start = new Date(m.scheduledStart);
      const end = new Date(m.scheduledEnd);

      // Add maintenance to each day it spans
      const current = new Date(start);
      current.setHours(0, 0, 0, 0);

      while (current <= end) {
        const key = current.toISOString().split("T")[0];
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(m);
        current.setDate(current.getDate() + 1);
      }
    });

    return map;
  }, [maintenances]);

  const navigateMonth = (delta: number) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + delta);
      return next;
    });
    setSelectedDate(null);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const getGroupNames = (groupIds: string[]) => {
    return groupIds
      .map((id) => groups.find((g) => g.id === id)?.name || id)
      .join(", ");
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const selectedMaintenances = selectedDate
    ? maintenancesByDate.get(selectedDate) || []
    : [];

  if (maintenances.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Wartungskalender
      </h2>

      <div className="rounded-lg border bg-card overflow-hidden">
        {/* Month navigation */}
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-sm font-medium">
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => navigateMonth(1)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Calendar grid */}
        <div className="p-3">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((date, index) => {
              const dateKey = date.toISOString().split("T")[0];
              const dayMaintenances = maintenancesByDate.get(dateKey) || [];
              const hasMaintenance = dayMaintenances.length > 0;
              const hasInProgress = dayMaintenances.some(
                (m) => m.status === "in_progress"
              );
              const isSelected = selectedDate === dateKey;

              return (
                <button
                  key={index}
                  onClick={() =>
                    hasMaintenance
                      ? setSelectedDate(isSelected ? null : dateKey)
                      : undefined
                  }
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center rounded text-xs relative",
                    "transition-colors",
                    isCurrentMonth(date)
                      ? "text-foreground"
                      : "text-muted-foreground/50",
                    isToday(date) && "font-bold",
                    hasMaintenance && "cursor-pointer hover:bg-muted",
                    isSelected && "bg-muted ring-1 ring-primary",
                    !hasMaintenance && "cursor-default"
                  )}
                >
                  <span>{date.getDate()}</span>
                  {hasMaintenance && (
                    <div
                      className={cn(
                        "absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full",
                        hasInProgress ? "bg-blue-500" : "bg-orange-500"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected date details */}
        {selectedDate && selectedMaintenances.length > 0 && (
          <div className="border-t p-3 space-y-2">
            <h3 className="font-medium text-xs text-muted-foreground">
              Wartungen am{" "}
              {new Date(selectedDate).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </h3>
            {selectedMaintenances.map((maintenance) => (
              <div
                key={maintenance.id}
                className="flex items-start gap-2 p-2 rounded bg-muted/50"
              >
                <Wrench
                  className={cn(
                    "h-3.5 w-3.5 mt-0.5 shrink-0",
                    maintenance.status === "in_progress"
                      ? "text-blue-500"
                      : "text-orange-500"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-xs">
                      {maintenance.title}
                    </span>
                    <Badge
                      variant={
                        maintenance.status === "in_progress"
                          ? "default"
                          : "outline"
                      }
                      className={cn(
                        "text-xs px-1 py-0",
                        maintenance.status === "in_progress"
                          ? "bg-blue-500"
                          : "border-orange-300 text-orange-600"
                      )}
                    >
                      {maintenance.status === "in_progress"
                        ? "Läuft"
                        : "Geplant"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatTime(maintenance.scheduledStart)} -{" "}
                    {formatTime(maintenance.scheduledEnd)}
                  </p>
                  {maintenance.affectedGroups.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getGroupNames(maintenance.affectedGroups)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="border-t px-3 py-2 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            <span>Geplant</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>In Bearbeitung</span>
          </div>
        </div>
      </div>
    </div>
  );
}
