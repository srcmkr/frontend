"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  statusPageSettingsSchema,
  type StatusPageSettingsFormData,
} from "@/lib/validations/settings";
import { defaultStatusPageSettings } from "@/mocks/settings";

export function StatusPageSettings() {
  const t = useTranslations("settings");
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<StatusPageSettingsFormData>({
    resolver: zodResolver(statusPageSettingsSchema),
    defaultValues: defaultStatusPageSettings,
  });

  const currentColor = watch("defaultPrimaryColor");
  const currentLogo = watch("defaultLogo");

  const onSubmit = (data: StatusPageSettingsFormData) => {
    // TODO: API call
    console.log("Saving status page settings:", data);
    toast.success(t("statusPageSettings.saved"));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Upload file and get URL
      const mockUrl = URL.createObjectURL(file);
      setValue("defaultLogo", mockUrl, { shouldDirty: true });
      toast.success(t("statusPageSettings.logoUploaded"));
    }
  };

  const handleRemoveLogo = () => {
    setValue("defaultLogo", undefined, { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">{t("statusPageSettings.title")}</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {t("statusPageSettings.description")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Default Logo */}
        <div className="sm:col-span-2 space-y-2">
          <Label>{t("statusPageSettings.defaultLogo")}</Label>
          <div className="flex items-start gap-4">
            {currentLogo ? (
              <div className="relative">
                <img
                  src={currentLogo}
                  alt="Logo Preview"
                  className="h-16 w-auto object-contain rounded border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={handleRemoveLogo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="h-16 w-32 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground">
                {t("statusPageSettings.noLogo")}
              </div>
            )}
            <div>
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("logo-upload")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {t("statusPageSettings.uploadLogo")}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                {t("statusPageSettings.logoHint")}
              </p>
            </div>
          </div>
        </div>

        {/* Default Primary Color */}
        <div className="space-y-2">
          <Label htmlFor="defaultPrimaryColor">{t("statusPageSettings.defaultPrimaryColor")}</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              id="color-picker"
              value={currentColor || "#10b981"}
              onChange={(e) => setValue("defaultPrimaryColor", e.target.value, { shouldDirty: true })}
              className="h-10 w-14 rounded border cursor-pointer"
            />
            <Input
              id="defaultPrimaryColor"
              placeholder="#10b981"
              {...register("defaultPrimaryColor")}
              className="flex-1 font-mono"
            />
          </div>
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
        <Button type="submit" disabled={!isDirty}>
          {t("statusPageSettings.save")}
        </Button>
      </div>
    </form>
  );
}
