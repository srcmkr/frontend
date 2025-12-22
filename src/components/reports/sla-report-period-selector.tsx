"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateReportPeriods } from "@/mocks/monitors";
import type { ReportPeriod, ReportPeriodType } from "@/types";

interface SLAReportPeriodSelectorProps {
  periodType: ReportPeriodType;
  onPeriodTypeChange: (type: ReportPeriodType) => void;
  selectedPeriod: ReportPeriod | null;
  onPeriodChange: (period: ReportPeriod) => void;
}

export function SLAReportPeriodSelector({
  periodType,
  onPeriodTypeChange,
  selectedPeriod,
  onPeriodChange,
}: SLAReportPeriodSelectorProps) {
  const t = useTranslations("reports.periodSelector");
  // Generate available periods based on selected type
  const availablePeriods = useMemo(
    () => generateReportPeriods(periodType),
    [periodType]
  );

  // Handle period type change
  const handleTypeChange = (value: string) => {
    const newType = value as ReportPeriodType;
    onPeriodTypeChange(newType);
    // Auto-select first period of new type
    const newPeriods = generateReportPeriods(newType);
    if (newPeriods.length > 0) {
      onPeriodChange(newPeriods[0]);
    }
  };

  // Handle specific period change
  const handlePeriodChange = (value: string) => {
    const period = availablePeriods.find(
      (p) => `${p.year}-${p.value}` === value
    );
    if (period) {
      onPeriodChange(period);
    }
  };

  const PERIOD_TYPE_LABELS: Record<ReportPeriodType, string> = {
    year: t("types.year"),
    "half-year": t("types.halfYear"),
    quarter: t("types.quarter"),
    month: t("types.month"),
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("periodType")}</span>
        <Select value={periodType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["year", "half-year", "quarter", "month"] as ReportPeriodType[]).map(
              (type) => (
                <SelectItem key={type} value={type}>
                  {PERIOD_TYPE_LABELS[type]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("period")}</span>
        <Select
          value={selectedPeriod ? `${selectedPeriod.year}-${selectedPeriod.value}` : ""}
          onValueChange={handlePeriodChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("selectPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {availablePeriods.map((period) => (
              <SelectItem
                key={`${period.year}-${period.value}`}
                value={`${period.year}-${period.value}`}
              >
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
