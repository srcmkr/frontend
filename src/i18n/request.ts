import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

// Supported locales
export const locales = ["en", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export default getRequestConfig(async () => {
  // Read locale from cookie (set by useLanguageStore)
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("locale")?.value;

  let locale: Locale = defaultLocale;

  // Validate the locale from cookie
  if (localeCookie && locales.includes(localeCookie as Locale)) {
    locale = localeCookie as Locale;
  }

  // Load all namespace files for the locale
  const [common, monitors, incidents, statusPages, notifications, settings, login, errors, publicStatus, reports, validations, setup] = await Promise.all([
    import(`../../messages/${locale}/common.json`),
    import(`../../messages/${locale}/monitors.json`),
    import(`../../messages/${locale}/incidents.json`),
    import(`../../messages/${locale}/status-pages.json`),
    import(`../../messages/${locale}/notifications.json`),
    import(`../../messages/${locale}/settings.json`),
    import(`../../messages/${locale}/login.json`),
    import(`../../messages/${locale}/errors.json`),
    import(`../../messages/${locale}/public-status.json`),
    import(`../../messages/${locale}/reports.json`),
    import(`../../messages/${locale}/validations.json`),
    import(`../../messages/${locale}/setup.json`),
  ]);

  return {
    locale,
    messages: {
      common: common.default,
      monitors: monitors.default,
      incidents: incidents.default,
      statusPages: statusPages.default,
      notifications: notifications.default,
      settings: settings.default,
      login: login.default,
      errors: errors.default,
      publicStatus: publicStatus.default,
      reports: reports.default,
      validations: validations.default,
      setup: setup.default,
    },
  };
});
