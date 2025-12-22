"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
  dataSettingsSchema,
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
    toast.success("Daten-Einstellungen gespeichert");
  };

  const handleExport = (format: "csv" | "json") => {
    // TODO: Trigger export
    toast.info(`Export als ${format.toUpperCase()} gestartet...`);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("de-DE").format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-1">Datenbank-Statistiken</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Aktuelle Nutzung und Speicherverbrauch
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
                  <p className="text-xs text-muted-foreground">Checks gesamt</p>
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
                  <p className="text-xs text-muted-foreground">Speicherverbrauch</p>
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
                  <p className="text-xs text-muted-foreground">Incidents gesamt</p>
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
                  <p className="text-xs text-muted-foreground">Ältester Eintrag</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Retention Settings */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-1">Datenaufbewahrung</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Wie lange sollen Check-Ergebnisse gespeichert werden?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 max-w-sm space-y-2">
            <Label htmlFor="retentionDays">Aufbewahrungszeitraum</Label>
            <Select
              value={String(currentRetention)}
              onValueChange={(value) => setValue("retentionDays", Number(value), { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Zeitraum wählen" />
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
              Ältere Daten werden automatisch gelöscht (Pruning)
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
                <p className="text-xs text-muted-foreground">Geschätzter Speicherbedarf</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Basierend auf {mockMonitors.length} Monitoren, ~{checksPerDay.toLocaleString("de-DE")} Checks/Tag
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={!isDirty}>
            Speichern
          </Button>
        </div>
      </form>

      {/* Export Section */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-1">Daten-Export</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Exportiere Check-Ergebnisse und Incident-Daten
        </p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleExport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            Export als CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("json")}>
            <Download className="h-4 w-4 mr-2" />
            Export als JSON
          </Button>
        </div>
      </div>
    </div>
  );
}
