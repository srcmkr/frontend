"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Server, Code, FileText, Calendar } from "lucide-react";
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
  createSystemSettingsSchema,
  type SystemSettingsFormData,
} from "@/lib/validations/settings";
import {
  defaultSystemSettings,
  commonTimezones,
  mockSystemInfo,
} from "@/mocks/settings";

export function SystemSettings() {
  const t = useTranslations("settings");
  const tValidation = useTranslations();
  const systemSettingsSchema = createSystemSettingsSchema(tValidation as unknown as (key: string) => string);
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { isDirty },
  } = useForm<SystemSettingsFormData>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: defaultSystemSettings,
  });

  const currentTimezone = watch("timezone");

  const onSubmit = (data: SystemSettingsFormData) => {
    // TODO: API call
    console.log("Saving system settings:", data);
    toast.success(t("system.saved"));
  };

  return (
    <div className="space-y-8">
      {/* Timezone Settings */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">{t("system.timezoneTitle")}</h3>
          <p className="text-sm text-muted-foreground mb-6">
            {t("system.timezoneDescription")}
          </p>
        </div>

        <div className="max-w-sm space-y-2">
          <Label htmlFor="timezone">{t("system.systemTimezone")}</Label>
          <Select
            value={currentTimezone}
            onValueChange={(value) => setValue("timezone", value, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("system.selectTimezone")} />
            </SelectTrigger>
            <SelectContent>
              {commonTimezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {t("system.timezoneHint")}
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={!isDirty}>
            {t("system.save")}
          </Button>
        </div>
      </form>

      {/* System Information */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">{t("system.infoTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("system.infoDescription")}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{mockSystemInfo.version}</p>
                  <p className="text-xs text-muted-foreground">{t("system.version")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-lg font-bold">{mockSystemInfo.buildDate}</p>
                  <p className="text-xs text-muted-foreground">{t("system.buildDate")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Code className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-bold">Node {mockSystemInfo.nodeVersion}</p>
                  <p className="text-xs text-muted-foreground">{t("system.runtime")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-lg font-bold">{mockSystemInfo.license}</p>
                  <p className="text-xs text-muted-foreground">{t("system.license")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* About */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">{t("system.aboutTitle")}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("system.aboutSubtitle")}
        </p>

        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <p className="text-sm">
            {t("system.aboutDescription")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("system.aboutTech")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("system.aboutLicense")}
          </p>
          <div className="pt-2 flex gap-4">
            <a
              href="https://github.com/AMNAU-GmbH/kiwistatus"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline underline-offset-4 transition-colors"
            >
              {t("system.github")} →
            </a>
            <a
              href="https://kiwistatus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline underline-offset-4 transition-colors"
            >
              {t("system.website")} →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
