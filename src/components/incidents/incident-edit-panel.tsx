"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  Loader2,
  Save,
  X,
  AlertTriangle,
  Wrench,
  Megaphone,
  Info,
  AlertCircle,
  Flame,
  Search,
  FileText,
  Server,
  Settings,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createIncidentFormSchema,
  incidentToFormValues,
  defaultIncidentFormValues,
  type IncidentFormValues,
} from "@/lib/validations/incident";
import type { ExtendedIncident, Monitor, IncidentType, IncidentSeverity } from "@/types";

interface IncidentEditPanelProps {
  incident?: ExtendedIncident;
  monitors: Monitor[];
  onSave: (data: IncidentFormValues) => Promise<void>;
  onCancel: () => void;
  /** Initial type when creating a new incident (only used in create mode) */
  initialType?: IncidentType;
  /** Whether this is a historical entry (resolved from the start) */
  isHistorical?: boolean;
  className?: string;
}

const INCIDENT_TYPE_CONFIG: { value: IncidentType; icon: React.ElementType }[] = [
  { value: "incident", icon: AlertTriangle },
  { value: "maintenance", icon: Wrench },
  { value: "announcement", icon: Megaphone },
];

const SEVERITY_CONFIG: { value: IncidentSeverity; color: string; bgColor: string; icon: React.ElementType }[] = [
  { value: "info", color: "text-blue-600", bgColor: "bg-blue-500", icon: Info },
  { value: "minor", color: "text-yellow-600", bgColor: "bg-yellow-500", icon: AlertCircle },
  { value: "major", color: "text-orange-600", bgColor: "bg-orange-500", icon: AlertTriangle },
  { value: "critical", color: "text-red-600", bgColor: "bg-red-500", icon: Flame },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive mt-1">{message}</p>;
}

interface TabItemProps {
  value: string;
  icon: React.ReactNode;
  label: string;
  hasError?: boolean;
}

function TabItem({ value, icon, label, hasError }: TabItemProps) {
  return (
    <TabsTrigger
      value={value}
      className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {hasError && <span className="text-destructive">*</span>}
    </TabsTrigger>
  );
}

export function IncidentEditPanel({
  incident,
  monitors,
  onSave,
  onCancel,
  initialType,
  isHistorical = false,
  className,
}: IncidentEditPanelProps) {
  const t = useTranslations("incidents");
  const tValidation = useTranslations();
  const isEditMode = !!incident;

  const incidentFormSchema = createIncidentFormSchema(tValidation as unknown as (key: string) => string);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: incident
      ? incidentToFormValues(incident)
      : defaultIncidentFormValues,
  });

  const watchedType = watch("type");
  const watchedSeverity = watch("severity");
  const watchedAffectedMonitors = watch("affectedMonitors");
  const watchedStatus = watch("status");

  // Reset form when panel opens or incident changes
  useEffect(() => {
    if (incident) {
      reset(incidentToFormValues(incident));
    } else {
      reset({
        ...defaultIncidentFormValues,
        startedAt: new Date().toISOString().slice(0, 16),
        type: initialType ?? defaultIncidentFormValues.type,
        status: isHistorical ? "resolved" : "ongoing",
      });
    }
  }, [incident, reset, initialType, isHistorical]);

  const onSubmit = async (data: IncidentFormValues) => {
    await onSave(data);
  };

  // Monitor search state
  const [monitorSearch, setMonitorSearch] = useState("");

  // Filter monitors based on search
  const filteredMonitors = useMemo(() => {
    if (!monitorSearch.trim()) return monitors;
    const search = monitorSearch.toLowerCase();
    return monitors.filter(
      (m) =>
        m.name.toLowerCase().includes(search) ||
        m.url.toLowerCase().includes(search) ||
        m.type.toLowerCase().includes(search)
    );
  }, [monitors, monitorSearch]);

  const toggleMonitor = useCallback(
    (monitorId: string) => {
      const current = watchedAffectedMonitors || [];
      if (current.includes(monitorId)) {
        setValue(
          "affectedMonitors",
          current.filter((id) => id !== monitorId),
          { shouldDirty: true }
        );
      } else {
        setValue("affectedMonitors", [...current, monitorId], {
          shouldDirty: true,
        });
      }
    },
    [watchedAffectedMonitors, setValue]
  );

  const selectAllMonitors = useCallback(() => {
    setValue(
      "affectedMonitors",
      monitors.map((m) => m.id),
      { shouldDirty: true }
    );
  }, [monitors, setValue]);

  const deselectAllMonitors = useCallback(() => {
    setValue("affectedMonitors", [], { shouldDirty: true });
  }, [setValue]);

  const selectedCount = (watchedAffectedMonitors || []).length;

  // Get title based on mode
  const getTitle = () => {
    if (isEditMode) return t("headings.editIncident");
    if (isHistorical) return t("headings.createHistorical");
    if (initialType === "maintenance") return t("headings.createMaintenance");
    if (initialType === "announcement") return t("headings.createAnnouncement");
    return t("headings.createIncident");
  };

  const hasGeneralErrors = !!(errors.type || errors.severity);
  const hasMonitorErrors = !!errors.affectedMonitors;
  const hasDetailsErrors = !!(errors.title || errors.cause || errors.description);
  const hasTimeErrors = !!(errors.startedAt || errors.resolvedAt || errors.status);

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel} className="-ml-2">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("detail.back")}
          </Button>
          <div className="h-6 w-px bg-border" />
          <h2 className="text-lg font-semibold">{getTitle()}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            {t("dialogs.cancel")}
          </Button>
          <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={isSubmitting || !isDirty}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            {isEditMode ? t("form.save") : t("form.create")}
          </Button>
        </div>
      </div>

      {/* Content with Tabs */}
      <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b px-4 py-2 shrink-0">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabItem
              value="general"
              icon={<Settings className="h-4 w-4" />}
              label={t("form.tabGeneral")}
              hasError={hasGeneralErrors}
            />
            <TabItem
              value="monitors"
              icon={<Server className="h-4 w-4" />}
              label={t("form.tabMonitors")}
              hasError={hasMonitorErrors}
            />
            <TabItem
              value="details"
              icon={<FileText className="h-4 w-4" />}
              label={t("form.tabDetails")}
              hasError={hasDetailsErrors}
            />
            <TabItem
              value="time"
              icon={<Clock className="h-4 w-4" />}
              label={t("form.tabTime")}
              hasError={hasTimeErrors}
            />
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* General Tab - Type & Severity */}
          <TabsContent value="general" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("form.incidentType")}</CardTitle>
                <CardDescription>
                  {t("form.incidentTypeDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {INCIDENT_TYPE_CONFIG.map((type) => {
                    const Icon = type.icon;
                    const isSelected = watchedType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setValue("type", type.value, { shouldDirty: true })}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-8 w-8",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <div className="text-center">
                          <span className="text-sm font-medium block">{t(`types.${type.value}`)}</span>
                          <span className="text-xs text-muted-foreground">{t(`typeDescriptions.${type.value}`)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <FieldError message={errors.type?.message} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("form.severity")}</CardTitle>
                <CardDescription>
                  {t("form.severityQuestion")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SEVERITY_CONFIG.map((level) => {
                    const Icon = level.icon;
                    const isSelected = watchedSeverity === level.value;
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setValue("severity", level.value, { shouldDirty: true })}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50 hover:bg-accent/50"
                        )}
                      >
                        <div className={cn("p-2 rounded-full", isSelected ? "bg-primary/10" : "bg-muted")}>
                          <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : level.color)} />
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1.5 mb-0.5">
                            <span className={cn("h-2 w-2 rounded-full", level.bgColor)} />
                            <span className="text-sm font-medium">{t(`severity.${level.value}`)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{t(`severity.${level.value}Description`)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <FieldError message={errors.severity?.message} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitors Tab */}
          <TabsContent value="monitors" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("form.affectedMonitors")}</CardTitle>
                <CardDescription>
                  {t("form.affectedMonitorsHint")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and actions */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("form.searchMonitors")}
                      value={monitorSearch}
                      onChange={(e) => setMonitorSearch(e.target.value)}
                      className="pl-8 pr-8"
                    />
                    {monitorSearch && (
                      <button
                        type="button"
                        onClick={() => setMonitorSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={selectAllMonitors}>
                    {t("form.selectAll")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllMonitors}>
                    {t("form.selectNone")}
                  </Button>
                </div>

                {/* Selected count */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("form.selectedCount", { selected: selectedCount, total: monitors.length })}
                  </span>
                  {selectedCount > 0 && (
                    <span className="text-primary font-medium">
                      {t("form.servicesAffected", { count: selectedCount })}
                    </span>
                  )}
                </div>

                {/* Monitor Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto">
                  {filteredMonitors.length === 0 ? (
                    <p className="text-sm text-muted-foreground col-span-full text-center py-8">
                      {t("form.noMonitorsFound")}
                    </p>
                  ) : (
                    filteredMonitors.map((monitor) => {
                      const isChecked = (watchedAffectedMonitors || []).includes(monitor.id);
                      return (
                        <label
                          key={monitor.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                            isChecked
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-accent/50"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleMonitor(monitor.id)}
                            className="h-4 w-4 rounded border-input accent-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{monitor.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{monitor.url}</p>
                          </div>
                          <div
                            className={cn(
                              "h-2.5 w-2.5 rounded-full shrink-0",
                              monitor.status === "up" ? "bg-green-500" :
                              monitor.status === "down" ? "bg-red-500" : "bg-yellow-500"
                            )}
                          />
                        </label>
                      );
                    })
                  )}
                </div>
                <FieldError message={errors.affectedMonitors?.message} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("form.titleAndDescription")}</CardTitle>
                <CardDescription>
                  {t("form.titleAndDescriptionHint")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">{t("form.title")} *</Label>
                  <Input
                    id="title"
                    placeholder={t("form.titlePlaceholder")}
                    {...register("title")}
                    aria-invalid={!!errors.title}
                  />
                  <FieldError message={errors.title?.message} />
                </div>

                {/* Cause */}
                <div className="space-y-2">
                  <Label htmlFor="cause">{t("form.cause")} *</Label>
                  <Textarea
                    id="cause"
                    placeholder={t("form.causePlaceholder")}
                    className="min-h-[100px]"
                    {...register("cause")}
                    aria-invalid={!!errors.cause}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("form.causeHint")}
                  </p>
                  <FieldError message={errors.cause?.message} />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    {t("form.descriptionOptional")}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={t("form.descriptionPlaceholder")}
                    className="min-h-[150px]"
                    {...register("description")}
                  />
                  <FieldError message={errors.description?.message} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Tab */}
          <TabsContent value="time" className="mt-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("form.timePeriod")}</CardTitle>
                <CardDescription>
                  {t("form.timePeriodDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status (only for edit mode or historical) */}
                {(isEditMode || isHistorical) && (
                  <div className="space-y-2">
                    <Label>{t("form.statusLabel")}</Label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setValue("status", "ongoing", { shouldDirty: true })}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all",
                          watchedStatus === "ongoing"
                            ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                            : "border-border hover:border-red-300"
                        )}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-medium">{t("status.ongoing")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue("status", "resolved", { shouldDirty: true })}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all",
                          watchedStatus === "resolved"
                            ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                            : "border-border hover:border-green-300"
                        )}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                        <span className="font-medium">{t("status.resolved")}</span>
                      </button>
                    </div>
                    <FieldError message={errors.status?.message} />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start Time */}
                  <div className="space-y-2">
                    <Label htmlFor="startedAt">{t("form.startTime")} *</Label>
                    <Input
                      id="startedAt"
                      type="datetime-local"
                      {...register("startedAt")}
                      aria-invalid={!!errors.startedAt}
                    />
                    <FieldError message={errors.startedAt?.message} />
                  </div>

                  {/* End Time - only for historical or resolved */}
                  {(isHistorical || watchedStatus === "resolved") && (
                    <div className="space-y-2">
                      <Label htmlFor="resolvedAt">{t("form.endTime")}</Label>
                      <Input
                        id="resolvedAt"
                        type="datetime-local"
                        {...register("resolvedAt")}
                        aria-invalid={!!errors.resolvedAt}
                      />
                      <FieldError message={errors.resolvedAt?.message} />
                    </div>
                  )}
                </div>

                {!isHistorical && watchedStatus === "ongoing" && (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {t("form.ongoingNote")}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
