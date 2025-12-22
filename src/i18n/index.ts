// Re-export types and utilities for i18n
export { locales, defaultLocale, type Locale } from "./request";

// Type-safe message keys
import type commonEn from "../../messages/en/common.json";
import type monitorsEn from "../../messages/en/monitors.json";
import type incidentsEn from "../../messages/en/incidents.json";
import type statusPagesEn from "../../messages/en/status-pages.json";
import type notificationsEn from "../../messages/en/notifications.json";
import type settingsEn from "../../messages/en/settings.json";
import type loginEn from "../../messages/en/login.json";
import type errorsEn from "../../messages/en/errors.json";

// Combine all message types
export type Messages = {
  common: typeof commonEn;
  monitors: typeof monitorsEn;
  incidents: typeof incidentsEn;
  statusPages: typeof statusPagesEn;
  notifications: typeof notificationsEn;
  settings: typeof settingsEn;
  login: typeof loginEn;
  errors: typeof errorsEn;
};

// Namespace keys for type-safe access
export type Namespace = keyof Messages;

// Declare module augmentation for next-intl
declare module "next-intl" {
  interface AppConfig {
    Messages: Messages;
  }
}
