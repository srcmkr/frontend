"use client";

import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { Download, Database, Activity, AlertTriangle, Calendar, HardDrive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  DEFAULT_DATA_SETTINGS,
  RETENTION_OPTIONS,
} from "@/lib/settings-defaults";
import { useDataSettings } from "@/features/settings/api/queries";
import { useUpdateDataSettings } from "@/features/settings/api/mutations";

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

  // Fetch current settings
  const { data, isLoading, error } = useDataSettings();

  // Mutation for updating settings
  const updateMutation = useUpdateDataSettings();

  const {
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<DataSettingsFormData>({
    resolver: zodResolver(dataSettingsSchema),
    defaultValues: DEFAULT_DATA_SETTINGS,
  });

  // Populate form when data loads
  useEffect(() => {
    if (data) {
      reset(data, { keepDirtyValues: true });
    }
  }, [data, reset]);

  const currentRetention = watch("retentionDays");

  // Calculate estimated storage based on retention period
  // TODO: Fetch actual monitor count and intervals from API
  const { estimatedStorage, checksPerDay } = useMemo(() => {
    // Estimate based on average of 6 monitors with 60s interval
    const avgMonitors = 6;
    const avgInterval = 60;
    const totalChecksPerDay = (avgMonitors * 24 * 60 * 60) / avgInterval;

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

  const onSubmit = (formData: DataSettingsFormData) => {
    updateMutation.mutate(formData, {
      onSuccess: () => {
        reset(formData);
        toast.success(t("data.saved"));
      },
      onError: (error: any) => {
        toast.error(`${t("data.saveFailed")}: ${error.message}`);
      },
    });
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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="border-t pt-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 border border-destructive/50 rounded-lg bg-destructive/10">
        <h3 className="font-semibold text-destructive mb-2">
          {t("errors.loadFailed")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {error.message}
        </p>
      </div>
    );
  }

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
                  <p className="text-2xl font-bold">TODO</p>
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
                  <p className="text-2xl font-bold">TODO</p>
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
                  <p className="text-2xl font-bold">TODO</p>
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
                  <p className="text-2xl font-bold">TODO</p>
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
                {RETENTION_OPTIONS.map((option) => (
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
              {t("data.estimatedStorageHint", { monitors: 6, checks: checksPerDay.toLocaleString(locale) })}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("data.saving")}
              </>
            ) : (
              t("data.save")
            )}
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
