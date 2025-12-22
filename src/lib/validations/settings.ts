import { z } from "zod";

// Monitoring Settings Schema
export const createMonitoringSettingsSchema = (t: (key: string) => string) =>
  z.object({
    defaultInterval: z
      .number()
      .min(10, t("validations.settings.intervalMin"))
      .max(3600, t("validations.settings.intervalMax")),
    defaultTimeout: z
      .number()
      .min(1, t("validations.settings.timeoutMin"))
      .max(120, t("validations.settings.timeoutMax")),
    defaultRetries: z
      .number()
      .min(0, t("validations.settings.retriesMin"))
      .max(10, t("validations.settings.retriesMax")),
    defaultSlaTarget: z
      .number()
      .min(0, t("validations.settings.slaTargetMin"))
      .max(100, t("validations.settings.slaTargetMax")),
    defaultMaxResponseTime: z
      .number()
      .min(100, t("validations.settings.maxResponseTimeMin"))
      .max(30000, t("validations.settings.maxResponseTimeMax")),
  });

export type MonitoringSettingsFormData = z.infer<
  ReturnType<typeof createMonitoringSettingsSchema>
>;

// Notification Settings Schema
export const createNotificationSettingsSchema = (t: (key: string) => string) =>
  z.object({
    failureThreshold: z
      .number()
      .min(1, t("validations.settings.failureThresholdMin"))
      .max(10, t("validations.settings.failureThresholdMax")),
  });

export type NotificationSettingsFormData = z.infer<
  ReturnType<typeof createNotificationSettingsSchema>
>;

// Data Settings Schema
export const createDataSettingsSchema = () =>
  z.object({
    retentionDays: z.number().min(30).max(3650),
  });

export type DataSettingsFormData = z.infer<ReturnType<typeof createDataSettingsSchema>>;

// API Key Schema
export const createApiKeySchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(1, t("validations.settings.nameRequired"))
      .max(50, t("validations.settings.nameMaxLength")),
  });

export type ApiKeyFormData = z.infer<ReturnType<typeof createApiKeySchema>>;

// Status Page Settings Schema
export const createStatusPageSettingsSchema = (t: (key: string) => string) =>
  z.object({
    defaultLogo: z.string().optional(),
    defaultPrimaryColor: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, t("validations.settings.colorInvalid"))
      .optional(),
    defaultUptimeHistoryDays: z
      .number()
      .min(7, t("validations.settings.uptimeHistoryMin"))
      .max(365, t("validations.settings.uptimeHistoryMax")),
    defaultIncidentHistoryDays: z
      .number()
      .min(7, t("validations.settings.incidentHistoryMin"))
      .max(365, t("validations.settings.incidentHistoryMax")),
  });

export type StatusPageSettingsFormData = z.infer<
  ReturnType<typeof createStatusPageSettingsSchema>
>;

// System Settings Schema
export const createSystemSettingsSchema = (t: (key: string) => string) =>
  z.object({
    timezone: z.string().min(1, t("validations.settings.timezoneRequired")),
  });

export type SystemSettingsFormData = z.infer<ReturnType<typeof createSystemSettingsSchema>>;

// User Schema (for creating new users)
export const createUserSchema = (t: (key: string) => string) =>
  z
    .object({
      name: z
        .string()
        .min(2, t("validations.settings.userNameMin"))
        .max(50, t("validations.settings.userNameMax")),
      email: z.string().email(t("validations.settings.emailInvalid")),
      password: z.string().min(8, t("validations.settings.passwordMin")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validations.settings.passwordMismatch"),
      path: ["confirmPassword"],
    });

export type UserFormData = z.infer<ReturnType<typeof createUserSchema>>;

// User Edit Schema (for editing existing users)
export const createUserEditSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .min(2, t("validations.settings.userNameMin"))
      .max(50, t("validations.settings.userNameMax")),
    email: z.string().email(t("validations.settings.emailInvalid")),
  });

export type UserEditFormData = z.infer<ReturnType<typeof createUserEditSchema>>;

// User Password Change Schema
export const createUserPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      password: z.string().min(8, t("validations.settings.passwordMin")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validations.settings.passwordMismatch"),
      path: ["confirmPassword"],
    });

export type UserPasswordFormData = z.infer<ReturnType<typeof createUserPasswordSchema>>;
