"use client";

import { useEffect, useCallback, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2, AlertTriangle, Wrench, Megaphone, Info, AlertCircle, Flame, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createIncidentFormSchema,
  incidentToFormValues,
  defaultIncidentFormValues,
  type IncidentFormValues,
} from "@/lib/validations/incident";
import type { ExtendedIncident, Monitor, IncidentType, IncidentSeverity } from "@/types";

interface IncidentEditDialogProps {
  incident?: ExtendedIncident;
  monitors: Monitor[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: IncidentFormValues) => Promise<void>;
  /** Initial type when creating a new incident (only used in create mode) */
  initialType?: IncidentType;
  /** Whether this is a historical entry (resolved from the start) */
  isHistorical?: boolean;
}

const INCIDENT_TYPES: { value: IncidentType; icon: React.ElementType }[] = [
  { value: "incident", icon: AlertTriangle },
  { value: "maintenance", icon: Wrench },
  { value: "announcement", icon: Megaphone },
];

const SEVERITY_LEVELS: { value: IncidentSeverity; color: string; icon: React.ElementType }[] = [
  { value: "info", color: "bg-blue-500", icon: Info },
  { value: "minor", color: "bg-yellow-500", icon: AlertCircle },
  { value: "major", color: "bg-orange-500", icon: AlertTriangle },
  { value: "critical", color: "bg-red-500", icon: Flame },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive mt-1">{message}</p>;
}

export function IncidentEditDialog({
  incident,
  monitors,
  open,
  onOpenChange,
  onSave,
  initialType,
  isHistorical = false,
}: IncidentEditDialogProps) {
  const isEditMode = !!incident;
  const t = useTranslations("incidents");
  const tTypes = useTranslations("incidents.typeLabelsWithDescriptions");
  const tSeverity = useTranslations("incidents.severityLabels");
  const tForm = useTranslations("incidents.formLabels");
  const tActions = useTranslations("incidents.dialogActions");
  const tHeadings = useTranslations("incidents.headings");
  const tDescriptions = useTranslations("incidents.editDescriptions");
  const tValidation = useTranslations();
  const tCommon = useTranslations("common.form");

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

  // Reset form when dialog opens/closes or incident changes
  useEffect(() => {
    if (open) {
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
    }
  }, [incident, open, reset, initialType, isHistorical]);

  const onSubmit = async (data: IncidentFormValues) => {
    await onSave(data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Monitor search state
  const [monitorSearch, setMonitorSearch] = useState("");

  // Reset monitor search when dialog closes
  useEffect(() => {
    if (!open) {
      setMonitorSearch("");
    }
  }, [open]);

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

  const selectedCount = (watchedAffectedMonitors || []).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? tHeadings("editIncident")
              : isHistorical
                ? tHeadings("createHistorical")
                : initialType === "maintenance"
                  ? tHeadings("createMaintenance")
                  : initialType === "announcement"
                    ? tHeadings("createAnnouncement")
                    : tHeadings("createIncident")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? tDescriptions("editIncident", { title: incident.title })
              : isHistorical
                ? tDescriptions("createHistorical")
                : initialType === "maintenance"
                  ? tDescriptions("createMaintenance")
                  : initialType === "announcement"
                    ? tDescriptions("createAnnouncement")
                    : tDescriptions("createIncident")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Two-column layout on large screens */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - General Info */}
            <div className="space-y-5">
              {/* Type Selection */}
              <div className="space-y-2">
                <Label>{tForm("type")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {INCIDENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = watchedType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setValue("type", type.value, { shouldDirty: true })
                        }
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                        <span className="text-sm font-medium">{tTypes(type.value)}</span>
                      </button>
                    );
                  })}
                </div>
                <FieldError message={errors.type?.message} />
              </div>

              {/* Severity Selection */}
              <div className="space-y-2">
                <Label>{tForm("severity")}</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {SEVERITY_LEVELS.map((level) => {
                    const isSelected = watchedSeverity === level.value;
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() =>
                          setValue("severity", level.value, { shouldDirty: true })
                        }
                        className={cn(
                          "flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border-2 transition-colors",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <span
                          className={cn("h-2.5 w-2.5 rounded-full shrink-0", level.color)}
                        />
                        <span className="text-sm font-medium">{tSeverity(level.value)}</span>
                      </button>
                    );
                  })}
                </div>
                <FieldError message={errors.severity?.message} />
              </div>

              {/* Time Fields - only shown on mobile, moved to right column on lg */}
              <div className="grid grid-cols-2 gap-3 lg:hidden">
                <div className="space-y-2">
                  <Label htmlFor="startedAt-mobile">{tForm("startTime")}</Label>
                  <Input
                    id="startedAt-mobile"
                    type="datetime-local"
                    {...register("startedAt")}
                    aria-invalid={!!errors.startedAt}
                  />
                  <FieldError message={errors.startedAt?.message} />
                </div>

                {/* End Time - only for historical entries or when editing resolved incidents */}
                {(isHistorical || (isEditMode && incident?.status === "resolved")) && (
                  <div className="space-y-2">
                    <Label htmlFor="resolvedAt-mobile">{tForm("endTime")}</Label>
                    <Input
                      id="resolvedAt-mobile"
                      type="datetime-local"
                      {...register("resolvedAt")}
                      aria-invalid={!!errors.resolvedAt}
                    />
                    <FieldError message={errors.resolvedAt?.message} />
                  </div>
                )}
              </div>

              {/* Affected Monitors with Search */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{tForm("affectedMonitors")}</Label>
                  {selectedCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {tForm("selectedCount", { selected: selectedCount })}
                    </span>
                  )}
                </div>
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={tForm("searchMonitors")}
                    value={monitorSearch}
                    onChange={(e) => setMonitorSearch(e.target.value)}
                    className="pl-8 pr-8 h-9"
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
                {/* Monitor List */}
                <div className="border rounded-lg divide-y max-h-[180px] overflow-y-auto">
                  {filteredMonitors.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-3 text-center">
                      {tForm("noMonitorsFound")}
                    </p>
                  ) : (
                    filteredMonitors.map((monitor) => {
                      const isChecked = (watchedAffectedMonitors || []).includes(
                        monitor.id
                      );
                      return (
                        <label
                          key={monitor.id}
                          className={cn(
                            "flex items-center gap-3 p-2.5 hover:bg-accent/50 cursor-pointer",
                            isChecked && "bg-primary/5"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleMonitor(monitor.id)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{monitor.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {monitor.url}
                            </p>
                          </div>
                          <span className="text-xs uppercase tracking-wide text-muted-foreground shrink-0">
                            {monitor.type}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
                <FieldError message={errors.affectedMonitors?.message} />
              </div>
            </div>

            {/* Right Column - Time, Title, Cause, Description */}
            <div className="space-y-5">
              {/* Time Fields - only shown on lg, hidden on mobile (shown in left column) */}
              <div className="hidden lg:grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="startedAt-desktop">{tForm("startTime")}</Label>
                  <Input
                    id="startedAt-desktop"
                    type="datetime-local"
                    {...register("startedAt")}
                    aria-invalid={!!errors.startedAt}
                  />
                  <FieldError message={errors.startedAt?.message} />
                </div>

                {/* End Time - only for historical entries or when editing resolved incidents */}
                {(isHistorical || (isEditMode && incident?.status === "resolved")) && (
                  <div className="space-y-2">
                    <Label htmlFor="resolvedAt-desktop">{tForm("endTime")}</Label>
                    <Input
                      id="resolvedAt-desktop"
                      type="datetime-local"
                      {...register("resolvedAt")}
                      aria-invalid={!!errors.resolvedAt}
                    />
                    <FieldError message={errors.resolvedAt?.message} />
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">{tForm("title")}</Label>
                <Input
                  id="title"
                  placeholder={tForm("titlePlaceholder")}
                  {...register("title")}
                  aria-invalid={!!errors.title}
                />
                <FieldError message={errors.title?.message} />
              </div>

              {/* Cause */}
              <div className="space-y-2">
                <Label htmlFor="cause">{tForm("cause")}</Label>
                <Textarea
                  id="cause"
                  placeholder={tForm("causePlaceholder")}
                  className="min-h-[100px] lg:min-h-[120px]"
                  {...register("cause")}
                  aria-invalid={!!errors.cause}
                />
                <FieldError message={errors.cause?.message} />
              </div>

              {/* Description (optional) */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {tForm("descriptionOptional")}{" "}
                  <span className="text-muted-foreground font-normal">
                    ({tCommon("optional")})
                  </span>
                </Label>
                <Textarea
                  id="description"
                  placeholder={tForm("descriptionPlaceholderOptional")}
                  className="min-h-[120px] lg:min-h-[180px]"
                  {...register("description")}
                />
                <FieldError message={errors.description?.message} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {tActions("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || !isDirty}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {tActions("saving")}
                </>
              ) : isEditMode ? (
                tActions("save")
              ) : (
                tActions("create")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
