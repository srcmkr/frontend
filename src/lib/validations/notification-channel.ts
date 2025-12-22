import { z } from "zod";

// Email configuration schema (Resend API)
const emailConfigSchema = z.object({
  apiKey: z.string().min(1, "API-Key erforderlich"),
  fromEmail: z.string().email("Ungültige E-Mail-Adresse"),
  toEmails: z.array(z.string().email("Ungültige E-Mail-Adresse")).min(1, "Mindestens ein Empfänger erforderlich"),
});

// Webhook configuration schema
const webhookConfigSchema = z.object({
  url: z.string().url("Ungültige URL"),
  headers: z.record(z.string(), z.string()).optional(),
});

// Email channel schema
const emailChannelSchema = z.object({
  type: z.literal("email"),
  name: z.string().min(1, "Name erforderlich").max(50, "Maximal 50 Zeichen"),
  enabled: z.boolean(),
  config: emailConfigSchema,
});

// Webhook channel schema
const webhookChannelSchema = z.object({
  type: z.literal("webhook"),
  name: z.string().min(1, "Name erforderlich").max(50, "Maximal 50 Zeichen"),
  enabled: z.boolean(),
  config: webhookConfigSchema,
});

// Combined notification channel schema using discriminated union
export const notificationChannelSchema = z.discriminatedUnion("type", [
  emailChannelSchema,
  webhookChannelSchema,
]);

export type NotificationChannelFormData = z.infer<typeof notificationChannelSchema>;
export type EmailChannelFormData = z.infer<typeof emailChannelSchema>;
export type WebhookChannelFormData = z.infer<typeof webhookChannelSchema>;

// Type guards
export function isEmailChannel(data: NotificationChannelFormData): data is EmailChannelFormData {
  return data.type === "email";
}

export function isWebhookChannel(data: NotificationChannelFormData): data is WebhookChannelFormData {
  return data.type === "webhook";
}
