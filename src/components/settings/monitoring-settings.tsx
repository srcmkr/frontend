"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createMonitoringSettingsSchema,
  type MonitoringSettingsFormData,
} from "@/lib/validations/settings";
import { DEFAULT_MONITORING_SETTINGS, INTERVAL_OPTIONS } from "@/lib/settings-defaults";
import { useMonitoringSettings } from "@/features/settings/api/queries";
import { useUpdateMonitoringSettings } from "@/features/settings/api/mutations";

export function MonitoringSettings() {
  const t = useTranslations("settings");
  const tValidation = useTranslations();

  const monitoringSettingsSchema = createMonitoringSettingsSchema(tValidation as unknown as (key: string) => string);

  // Fetch current settings
  const { data, isLoading, error } = useMonitoringSettings();

  // Mutation for updating settings
  const updateMutation = useUpdateMonitoringSettings();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<MonitoringSettingsFormData>({
    resolver: zodResolver(monitoringSettingsSchema),
    defaultValues: DEFAULT_MONITORING_SETTINGS,
  });

  // Populate form when data loads
  useEffect(() => {
    if (data) {
      reset(data, { keepDirtyValues: true });
    }
  }, [data, reset]);

  const currentInterval = watch("defaultInterval");

  const onSubmit = (formData: MonitoringSettingsFormData) => {
    updateMutation.mutate(formData, {
      onSuccess: () => {
        reset(formData);
        toast.success(t("monitoring.saved"));
      },
      onError: (error: any) => {
        toast.error(`${t("monitoring.saveFailed")}: ${error.message}`);
      },
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
        <div className="grid gap-6 sm:grid-cols-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t("monitoring.title")}</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {t("monitoring.description")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Default Interval */}
        <div className="space-y-2">
          <Label htmlFor="defaultInterval">{t("monitoring.defaultInterval")}</Label>
          <Select
            value={String(currentInterval)}
            onValueChange={(value) => setValue("defaultInterval", Number(value), { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("monitoring.selectInterval")} />
            </SelectTrigger>
            <SelectContent>
              {INTERVAL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.defaultInterval && (
            <p className="text-sm text-destructive">{errors.defaultInterval.message}</p>
          )}
        </div>

        {/* Default Timeout */}
        <div className="space-y-2">
          <Label htmlFor="defaultTimeout">{t("monitoring.defaultTimeout")}</Label>
          <Input
            id="defaultTimeout"
            type="number"
            {...register("defaultTimeout", { valueAsNumber: true })}
          />
          {errors.defaultTimeout && (
            <p className="text-sm text-destructive">{errors.defaultTimeout.message}</p>
          )}
        </div>

        {/* Default Retries */}
        <div className="space-y-2">
          <Label htmlFor="defaultRetries">{t("monitoring.defaultRetries")}</Label>
          <Input
            id="defaultRetries"
            type="number"
            {...register("defaultRetries", { valueAsNumber: true })}
          />
          {errors.defaultRetries && (
            <p className="text-sm text-destructive">{errors.defaultRetries.message}</p>
          )}
        </div>

        {/* Default SLA Target */}
        <div className="space-y-2">
          <Label htmlFor="defaultSlaTarget">{t("monitoring.defaultSlaTarget")}</Label>
          <Input
            id="defaultSlaTarget"
            type="number"
            step="0.01"
            {...register("defaultSlaTarget", { valueAsNumber: true })}
          />
          {errors.defaultSlaTarget && (
            <p className="text-sm text-destructive">{errors.defaultSlaTarget.message}</p>
          )}
        </div>

        {/* Default Max Response Time */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="defaultMaxResponseTime">{t("monitoring.defaultMaxResponseTime")}</Label>
          <Input
            id="defaultMaxResponseTime"
            type="number"
            {...register("defaultMaxResponseTime", { valueAsNumber: true })}
          />
          {errors.defaultMaxResponseTime && (
            <p className="text-sm text-destructive">{errors.defaultMaxResponseTime.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {t("monitoring.maxResponseTimeHint")}
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("monitoring.saving")}
            </>
          ) : (
            t("monitoring.save")
          )}
        </Button>
      </div>
    </form>
  );
}
