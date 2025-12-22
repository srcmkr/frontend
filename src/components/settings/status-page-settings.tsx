"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
    toast.success("Status-Seiten-Einstellungen gespeichert");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Upload file and get URL
      const mockUrl = URL.createObjectURL(file);
      setValue("defaultLogo", mockUrl, { shouldDirty: true });
      toast.success("Logo hochgeladen");
    }
  };

  const handleRemoveLogo = () => {
    setValue("defaultLogo", undefined, { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Status-Seiten Defaults</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Standardwerte für neu erstellte Status-Seiten
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Default Logo */}
        <div className="sm:col-span-2 space-y-2">
          <Label>Standard-Logo</Label>
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
                Kein Logo
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
                Logo hochladen
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG oder SVG, max. 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Default Primary Color */}
        <div className="space-y-2">
          <Label htmlFor="defaultPrimaryColor">Standard-Primärfarbe</Label>
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
            Wird für Buttons und Akzente verwendet
          </p>
        </div>

        {/* Color Preview */}
        <div className="space-y-2">
          <Label>Vorschau</Label>
          <div
            className="h-10 rounded flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: currentColor || "#10b981" }}
          >
            Beispiel-Button
          </div>
        </div>

        {/* Default Uptime History Days */}
        <div className="space-y-2">
          <Label htmlFor="defaultUptimeHistoryDays">Uptime-Historie (Tage)</Label>
          <Input
            id="defaultUptimeHistoryDays"
            type="number"
            {...register("defaultUptimeHistoryDays", { valueAsNumber: true })}
          />
          {errors.defaultUptimeHistoryDays && (
            <p className="text-sm text-destructive">{errors.defaultUptimeHistoryDays.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Anzahl der Tage für die Uptime-Balkendarstellung
          </p>
        </div>

        {/* Default Incident History Days */}
        <div className="space-y-2">
          <Label htmlFor="defaultIncidentHistoryDays">Incident-Historie (Tage)</Label>
          <Input
            id="defaultIncidentHistoryDays"
            type="number"
            {...register("defaultIncidentHistoryDays", { valueAsNumber: true })}
          />
          {errors.defaultIncidentHistoryDays && (
            <p className="text-sm text-destructive">{errors.defaultIncidentHistoryDays.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Anzahl der Tage für die Incident-Übersicht
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={!isDirty}>
          Speichern
        </Button>
      </div>
    </form>
  );
}
