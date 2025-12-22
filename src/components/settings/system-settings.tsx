"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
  systemSettingsSchema,
  type SystemSettingsFormData,
} from "@/lib/validations/settings";
import {
  defaultSystemSettings,
  commonTimezones,
  mockSystemInfo,
} from "@/mocks/settings";

export function SystemSettings() {
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
    toast.success("System-Einstellungen gespeichert");
  };

  return (
    <div className="space-y-8">
      {/* Timezone Settings */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Zeitzone</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Zeitzone für alle Zeitangaben im System
          </p>
        </div>

        <div className="max-w-sm space-y-2">
          <Label htmlFor="timezone">System-Zeitzone</Label>
          <Select
            value={currentTimezone}
            onValueChange={(value) => setValue("timezone", value, { shouldDirty: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Zeitzone wählen" />
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
            Beeinflusst alle Zeitangaben in Reports und der Oberfläche
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={!isDirty}>
            Speichern
          </Button>
        </div>
      </form>

      {/* System Information */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">System-Informationen</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Version und Build-Informationen
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
                  <p className="text-xs text-muted-foreground">Version</p>
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
                  <p className="text-xs text-muted-foreground">Build-Datum</p>
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
                  <p className="text-xs text-muted-foreground">Runtime</p>
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
                  <p className="text-xs text-muted-foreground">Lizenz</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* About */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">Über Kiwi Status</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Open-Source Uptime Monitoring & Status Pages
        </p>

        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <p className="text-sm">
            Kiwi Status ist eine selbst gehostete Monitoring-Plattform für
            Uptime-Überwachung, Incident-Management und öffentliche Status-Seiten.
          </p>
          <p className="text-sm text-muted-foreground">
            Entwickelt mit Next.js, ASP.NET Core und TimescaleDB.
          </p>
          <p className="text-sm text-muted-foreground">
            Lizenziert unter der Elastic License 2.0 (ELv2).
          </p>
          <div className="pt-2 flex gap-4">
            <Button variant="link" className="h-auto p-0 text-sm" asChild>
              <a href="https://github.com/AMNAU-GmbH/kiwistatus" target="_blank" rel="noopener noreferrer">
                GitHub →
              </a>
            </Button>
            <Button variant="link" className="h-auto p-0 text-sm" asChild>
              <a href="https://kiwistatus.com" target="_blank" rel="noopener noreferrer">
                Website →
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
