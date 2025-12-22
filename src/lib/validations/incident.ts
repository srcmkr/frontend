import { z } from "zod";
import type {
  ExtendedIncident,
  IncidentFormData,
  IncidentSeverity,
  IncidentType,
  IncidentStatus,
} from "@/types";

// ============================================
// Zod Schema for Incident Form
// ============================================

export const createIncidentFormSchema = (t: (key: string) => string) =>
  z
    .object({
      title: z
        .string()
        .min(1, t("validations.incident.titleRequired"))
        .max(200, t("validations.incident.titleMaxLength")),

      type: z.enum(["incident", "maintenance", "announcement"] as const, {
        message: t("validations.incident.selectType"),
      }),

      severity: z.enum(["info", "minor", "major", "critical"] as const, {
        message: t("validations.incident.selectSeverity"),
      }),

      cause: z
        .string()
        .min(1, t("validations.incident.causeRequired"))
        .max(500, t("validations.incident.causeMaxLength")),

      description: z
        .string()
        .max(2000, t("validations.incident.descriptionMaxLength"))
        .optional(),

      affectedMonitors: z
        .array(z.string())
        .min(1, t("validations.incident.affectedMonitorsMin")),

      status: z.enum(["ongoing", "resolved"] as const),

      startedAt: z.string().min(1, t("validations.incident.startTimeRequired")),

      resolvedAt: z.string().optional(),
    })
    .refine(
      (data) => {
        // If status is resolved and resolvedAt is provided, it must be after startedAt
        if (data.status === "resolved" && data.resolvedAt) {
          return new Date(data.resolvedAt) >= new Date(data.startedAt);
        }
        return true;
      },
      {
        message: t("validations.incident.resolvedAfterStarted"),
        path: ["resolvedAt"],
      }
    );

export type IncidentFormValues = z.infer<ReturnType<typeof createIncidentFormSchema>>;

// ============================================
// Default values
// ============================================

export const defaultIncidentFormValues: IncidentFormValues = {
  title: "",
  type: "incident",
  severity: "major",
  cause: "",
  description: "",
  affectedMonitors: [],
  status: "ongoing",
  startedAt: new Date().toISOString(),
  resolvedAt: undefined,
};

// ============================================
// Helper functions
// ============================================

/**
 * Convert ExtendedIncident to form values
 */
export function incidentToFormValues(
  incident: ExtendedIncident
): IncidentFormValues {
  return {
    title: incident.title,
    type: incident.type,
    severity: incident.severity,
    cause: incident.cause,
    description: incident.description ?? "",
    affectedMonitors: incident.affectedMonitors,
    status: incident.status,
    startedAt: incident.startedAt,
    resolvedAt: incident.resolvedAt ?? undefined,
  };
}

/**
 * Convert form values to incident update format
 */
export function formValuesToIncidentUpdate(
  values: IncidentFormValues
): Partial<ExtendedIncident> {
  return {
    title: values.title,
    type: values.type,
    severity: values.severity,
    cause: values.cause,
    description: values.description || undefined,
    affectedMonitors: values.affectedMonitors,
    status: values.status,
    startedAt: values.startedAt,
    resolvedAt: values.resolvedAt || null,
  };
}

// ============================================
// Severity utilities
// ============================================

export const SEVERITY_ORDER: Record<IncidentSeverity, number> = {
  info: 0,
  minor: 1,
  major: 2,
  critical: 3,
};

export const SEVERITY_LABELS: Record<IncidentSeverity, { de: string; en: string }> = {
  info: { de: "Info", en: "Info" },
  minor: { de: "Gering", en: "Minor" },
  major: { de: "Mittel", en: "Major" },
  critical: { de: "Kritisch", en: "Critical" },
};

export const TYPE_LABELS: Record<IncidentType, { de: string; en: string }> = {
  incident: { de: "Vorfall", en: "Incident" },
  maintenance: { de: "Wartung", en: "Maintenance" },
  announcement: { de: "Ankündigung", en: "Announcement" },
};

export const STATUS_LABELS: Record<IncidentStatus, { de: string; en: string }> = {
  ongoing: { de: "Aktiv", en: "Ongoing" },
  resolved: { de: "Behoben", en: "Resolved" },
};

// ============================================
// Filter utilities
// ============================================

export const defaultIncidentFilters = {
  search: "",
  status: "all" as const,
  severity: "all" as const,
  type: "all" as const,
  monitorId: "all" as const,
  dateRange: { from: null, to: null },
  sortBy: "startedAt" as const,
  sortOrder: "desc" as const,
};
