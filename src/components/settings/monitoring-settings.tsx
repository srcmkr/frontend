"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  monitoringSettingsSchema,
  type MonitoringSettingsFormData,
} from "@/lib/validations/settings";
import { defaultMonitoringSettings, intervalOptions } from "@/mocks/settings";

export function MonitoringSettings() {
  const t = useTranslations("settings");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<MonitoringSettingsFormData>({
    resolver: zodResolver(monitoringSettingsSchema),
    defaultValues: defaultMonitoringSettings,
  });

  const currentInterval = watch("defaultInterval");

  const onSubmit = (data: MonitoringSettingsFormData) => {
    // TODO: API call
    console.log("Saving monitoring settings:", data);
    toast.success(t("monitoring.saved"));
  };

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
              {intervalOptions.map((option) => (
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
        <Button type="submit" disabled={!isDirty}>
          {t("monitoring.save")}
        </Button>
      </div>
    </form>
  );
}
