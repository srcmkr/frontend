"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { Download, Database, Activity, AlertTriangle, Calendar, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDataSettingsSchema,
  type DataSettingsFormData,
} from "@/lib/validations/settings";
import {
  defaultDataSettings,
  retentionOptions,
  mockDatabaseStats,
} from "@/mocks/settings";
import { mockMonitors } from "@/mocks/monitors";

// Estimated bytes per check record in PostgreSQL/TimescaleDB:
// - id (UUID): 16 bytes
// - monitorId (UUID): 16 bytes
// - status (enum): 1 byte
// - responseTime (int): 4 bytes
// - statusCode (smallint): 2 bytes
// - message (avg 20 chars): 20 bytes
// - checkedAt (timestamp): 8 bytes
// - indexes overhead: ~40 bytes
// - row overhead: ~23 bytes
// Total: ~130 bytes per row
const BYTES_PER_CHECK = 130;

export function DataSettings() {
  const t = useTranslations("settings");
  const locale = useLocale();

  const dataSettingsSchema = createDataSettingsSchema();

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { isDirty },
  } = useForm<DataSettingsFormData>({
    resolver: zodResolver(dataSettingsSchema),
    defaultValues: defaultDataSettings,
  });

  const currentRetention = watch("retentionDays");

  // Calculate estimated storage based on actual monitors and their intervals
  const { estimatedStorage, checksPerDay } = useMemo(() => {
    // Calculate checks per day based on actual monitor intervals
    let totalChecksPerDay = 0;
    mockMonitors.forEach((monitor) => {
      const checksPerDayForMonitor = (24 * 60 * 60) / monitor.interval;
      totalChecksPerDay += checksPerDayForMonitor;
    });

    const totalChecks = totalChecksPerDay * currentRetention;
    const bytes = totalChecks * BYTES_PER_CHECK;

    // Format to appropriate unit
    let formatted: string;
    if (bytes >= 1024 * 1024 * 1024) {
      formatted = `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else if (bytes >= 1024 * 1024) {
      formatted = `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
    } else {
      formatted = `${(bytes / 1024).toFixed(0)} KB`;
    }

    return {
      estimatedStorage: formatted,
      checksPerDay: Math.round(totalChecksPerDay),
    };
  }, [currentRetention]);

  const onSubmit = (data: DataSettingsFormData) => {
    // TODO: API call
    console.log("Saving data settings:", data);
    toast.success(t("data.saved"));
  };

  const handleExport = (format: "csv" | "json") => {
    // TODO: Trigger export
    toast.info(t("data.exportStarted", { format: format.toUpperCase() }));
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-1">{t("data.statsTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("data.statsDescription")}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatNumber(mockDatabaseStats.totalChecks)}</p>
                  <p className="text-xs text-muted-foreground">{t("data.totalChecks")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockDatabaseStats.databaseSize}</p>
                  <p className="text-xs text-muted-foreground">{t("data.storageUsage")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockDatabaseStats.totalIncidents}</p>
                  <p className="text-xs text-muted-foreground">{t("data.totalIncidents")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatDate(mockDatabaseStats.oldestRecord)}</p>
                  <p className="text-xs text-muted-foreground">{t("data.oldestRecord")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Retention Settings */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-1">{t("data.retentionTitle")}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t("data.retentionDescription")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 max-w-sm space-y-2">
            <Label htmlFor="retentionDays">{t("data.retentionPeriod")}</Label>
            <Select
              value={String(currentRetention)}
              onValueChange={(value) => setValue("retentionDays", Number(value), { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("data.selectPeriod")} />
              </SelectTrigger>
              <SelectContent>
                {retentionOptions.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("data.retentionHint")}
            </p>
          </div>

          {/* Storage Estimation */}
          <div className="flex-1 max-w-sm p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <HardDrive className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-lg font-semibold">~{estimatedStorage}</p>
                <p className="text-xs text-muted-foreground">{t("data.estimatedStorage")}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {t("data.estimatedStorageHint", { monitors: mockMonitors.length, checks: checksPerDay.toLocaleString(locale) })}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={!isDirty}>
            {t("data.save")}
          </Button>
        </div>
      </form>

      {/* Export Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">{t("data.exportTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("data.exportDescription")}
        </p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            {t("data.exportCsv")}
          </Button>
          <Button variant="outline" onClick={() => handleExport("json")}>
            <Download className="h-4 w-4 mr-2" />
            {t("data.exportJson")}
          </Button>
        </div>
      </div>
    </div>
  );
}
