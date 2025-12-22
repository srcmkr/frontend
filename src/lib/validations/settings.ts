import { z } from "zod";

// Monitoring Settings Schema
export const monitoringSettingsSchema = z.object({
  defaultInterval: z.number().min(10, "Mindestens 10 Sekunden").max(3600, "Maximal 3600 Sekunden"),
  defaultTimeout: z.number().min(1, "Mindestens 1 Sekunde").max(120, "Maximal 120 Sekunden"),
  defaultRetries: z.number().min(0, "Mindestens 0").max(10, "Maximal 10 Versuche"),
  defaultSlaTarget: z.number().min(0, "Mindestens 0%").max(100, "Maximal 100%"),
  defaultMaxResponseTime: z.number().min(100, "Mindestens 100ms").max(30000, "Maximal 30000ms"),
});

export type MonitoringSettingsFormData = z.infer<typeof monitoringSettingsSchema>;

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  failureThreshold: z.number().min(1, "Mindestens 1").max(10, "Maximal 10"),
});

export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;

// Data Settings Schema
export const dataSettingsSchema = z.object({
  retentionDays: z.number().min(30).max(3650),
});

export type DataSettingsFormData = z.infer<typeof dataSettingsSchema>;

// API Key Schema
export const apiKeySchema = z.object({
  name: z.string().min(1, "Name erforderlich").max(50, "Maximal 50 Zeichen"),
});

export type ApiKeyFormData = z.infer<typeof apiKeySchema>;

// Status Page Settings Schema
export const statusPageSettingsSchema = z.object({
  defaultLogo: z.string().optional(),
  defaultPrimaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Ungültiges Farbformat").optional(),
  defaultUptimeHistoryDays: z.number().min(7, "Mindestens 7 Tage").max(365, "Maximal 365 Tage"),
  defaultIncidentHistoryDays: z.number().min(7, "Mindestens 7 Tage").max(365, "Maximal 365 Tage"),
});

export type StatusPageSettingsFormData = z.infer<typeof statusPageSettingsSchema>;

// System Settings Schema
export const systemSettingsSchema = z.object({
  timezone: z.string().min(1, "Zeitzone erforderlich"),
});

export type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>;
