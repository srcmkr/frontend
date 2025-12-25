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
  createStatusPageSettingsSchema,
  type StatusPageSettingsFormData,
} from "@/lib/validations/settings";
import { DEFAULT_STATUS_PAGE_SETTINGS } from "@/lib/settings-defaults";
import { useStatusPageSettings } from "@/features/settings/api/queries";
import { useUpdateStatusPageSettings } from "@/features/settings/api/mutations";

export function StatusPageSettings() {
  const t = useTranslations("settings");
  const tValidation = useTranslations();
  const statusPageSettingsSchema = createStatusPageSettingsSchema(tValidation as unknown as (key: string) => string);

  // Fetch current settings
  const { data, isLoading, error } = useStatusPageSettings();

  // Mutation for updating settings
  const updateMutation = useUpdateStatusPageSettings();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<StatusPageSettingsFormData>({
    resolver: zodResolver(statusPageSettingsSchema),
    defaultValues: DEFAULT_STATUS_PAGE_SETTINGS,
  });

  // Populate form when data loads
  useEffect(() => {
    if (data) {
      reset(data, { keepDirtyValues: true });
    }
  }, [data, reset]);

  const currentColor = watch("defaultPrimaryColor");

  const onSubmit = (formData: StatusPageSettingsFormData) => {
    updateMutation.mutate(formData, {
      onSuccess: () => {
        reset(formData);
        toast.success(t("statusPageSettings.saved"));
      },
      onError: (error: any) => {
        toast.error(`${t("statusPageSettings.saveFailed")}: ${error.message}`);
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
        <h3 className="text-lg font-semibold mb-1">{t("statusPageSettings.title")}</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {t("statusPageSettings.description")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Default Logo (URL Input) */}
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="defaultLogo">{t("statusPageSettings.defaultLogo")}</Label>
          <Input
            id="defaultLogo"
            type="url"
            placeholder="https://example.com/logo.png"
            {...register("defaultLogo")}
          />
          {errors.defaultLogo && (
            <p className="text-sm text-destructive">{errors.defaultLogo.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {t("statusPageSettings.logoHint")}
          </p>
        </div>

        {/* Default Primary Color */}
        <div className="space-y-2">
          <Label htmlFor="defaultPrimaryColor">{t("statusPageSettings.defaultPrimaryColor")}</Label>
          <Input
            id="defaultPrimaryColor"
            placeholder="#10b981"
            {...register("defaultPrimaryColor")}
            className="font-mono"
          />
          {errors.defaultPrimaryColor && (
            <p className="text-sm text-destructive">{errors.defaultPrimaryColor.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {t("statusPageSettings.colorHint")}
          </p>
        </div>

        {/* Color Preview */}
        <div className="space-y-2">
          <Label>{t("statusPageSettings.preview")}</Label>
          <div
            className="h-10 rounded flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: currentColor || "#10b981" }}
          >
            {t("statusPageSettings.exampleButton")}
          </div>
        </div>

        {/* Default Uptime History Days */}
        <div className="space-y-2">
          <Label htmlFor="defaultUptimeHistoryDays">{t("statusPageSettings.uptimeHistoryDays")}</Label>
          <Input
            id="defaultUptimeHistoryDays"
            type="number"
            {...register("defaultUptimeHistoryDays", { valueAsNumber: true })}
          />
          {errors.defaultUptimeHistoryDays && (
            <p className="text-sm text-destructive">{errors.defaultUptimeHistoryDays.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {t("statusPageSettings.uptimeHistoryHint")}
          </p>
        </div>

        {/* Default Incident History Days */}
        <div className="space-y-2">
          <Label htmlFor="defaultIncidentHistoryDays">{t("statusPageSettings.incidentHistoryDays")}</Label>
          <Input
            id="defaultIncidentHistoryDays"
            type="number"
            {...register("defaultIncidentHistoryDays", { valueAsNumber: true })}
          />
          {errors.defaultIncidentHistoryDays && (
            <p className="text-sm text-destructive">{errors.defaultIncidentHistoryDays.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {t("statusPageSettings.incidentHistoryHint")}
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("statusPageSettings.saving")}
            </>
          ) : (
            t("statusPageSettings.save")
          )}
        </Button>
      </div>
    </form>
  );
}
