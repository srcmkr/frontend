/**
 * Settings API Types
 *
 * These types match the backend DTOs and frontend form validation schemas.
 */

import type {
  MonitoringSettingsFormData,
  NotificationSettingsFormData,
  DataSettingsFormData,
  StatusPageSettingsFormData,
  SystemSettingsFormData,
} from "@/lib/validations/settings";

// ============================================
// Settings Response Types (from backend)
// ============================================

export type MonitoringSettings = MonitoringSettingsFormData;
export type NotificationSettings = NotificationSettingsFormData;
export type DataSettings = DataSettingsFormData;
export type StatusPageSettings = StatusPageSettingsFormData;
export type SystemSettings = SystemSettingsFormData;
