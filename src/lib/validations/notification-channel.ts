import { z } from "zod";

// Email configuration schema (Resend API)
const createEmailConfigSchema = (t: (key: string) => string) =>
  z.object({
    apiKey: z.string().min(1, t("validations.notification.apiKeyRequired")),
    fromEmail: z.string().email(t("validations.notification.emailInvalid")),
    toEmails: z
      .array(z.string().email(t("validations.notification.emailInvalid")))
      .min(1, t("validations.notification.emailRecipientMin")),
  });

// Webhook configuration schema
const createWebhookConfigSchema = (t: (key: string) => string) =>
  z.object({
    url: z.string().url(t("validations.notification.urlInvalid")),
    headers: z.record(z.string(), z.string()).optional(),
  });

// Email channel schema
const createEmailChannelSchema = (t: (key: string) => string) =>
  z.object({
    type: z.literal("email"),
    name: z
      .string()
      .min(1, t("validations.notification.nameRequired"))
      .max(50, t("validations.notification.nameMaxLength")),
    enabled: z.boolean(),
    config: createEmailConfigSchema(t),
  });

// Webhook channel schema
const createWebhookChannelSchema = (t: (key: string) => string) =>
  z.object({
    type: z.literal("webhook"),
    name: z
      .string()
      .min(1, t("validations.notification.nameRequired"))
      .max(50, t("validations.notification.nameMaxLength")),
    enabled: z.boolean(),
    config: createWebhookConfigSchema(t),
  });

// Combined notification channel schema using discriminated union
export const createNotificationChannelSchema = (t: (key: string) => string) =>
  z.discriminatedUnion("type", [
    createEmailChannelSchema(t),
    createWebhookChannelSchema(t),
  ]);

export type NotificationChannelFormData = z.infer<
  ReturnType<typeof createNotificationChannelSchema>
>;
export type EmailChannelFormData = z.infer<ReturnType<typeof createEmailChannelSchema>>;
export type WebhookChannelFormData = z.infer<ReturnType<typeof createWebhookChannelSchema>>;

// Type guards
export function isEmailChannel(data: NotificationChannelFormData): data is EmailChannelFormData {
  return data.type === "email";
}

export function isWebhookChannel(data: NotificationChannelFormData): data is WebhookChannelFormData {
  return data.type === "webhook";
}
