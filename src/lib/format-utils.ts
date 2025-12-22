/**
 * Shared formatting utilities for monitor data display
 */

import { useLanguageStore } from "@/lib/stores";
import type { Locale } from "@/i18n/request";

/**
 * Maps language code to locale string for date/time formatting
 */
export function localeToDateLocale(locale: Locale): string {
  const mapping: Record<Locale, string> = {
    en: "en-US",
    de: "de-DE",
  };
  return mapping[locale] || "en-US";
}

/**
 * Gets the current locale for date/time formatting
 * Note: This reads from localStorage, so it only works on client-side
 */
export function getLocale(): string {
  if (typeof window === "undefined") return "en-US";
  const state = useLanguageStore.getState();
  return localeToDateLocale(state.language);
}

/**
 * Hook to get current locale in React components
 */
export function useLocale(): string {
  const { language } = useLanguageStore();
  return localeToDateLocale(language);
}

export function formatResponseTime(ms: number | null): string {
  if (ms === null) return "-";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Formats a date as relative time (e.g., "5m ago", "vor 5m")
 */
export function formatLastCheck(date: string | null, locale?: string): string {
  const currentLocale = locale || getLocale();
  const isGerman = currentLocale.startsWith("de");

  if (!date) return isGerman ? "Nie" : "Never";

  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) {
    return isGerman ? `vor ${seconds}s` : `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return isGerman ? `vor ${minutes}m` : `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return isGerman ? `vor ${hours}h` : `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return isGerman ? `vor ${days}d` : `${days}d ago`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function formatTimeHMS(date: string, locale?: string): string {
  const currentLocale = locale || getLocale();
  return new Date(date).toLocaleTimeString(currentLocale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
