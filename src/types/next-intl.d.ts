// Type definitions for next-intl messages
// This must match the structure returned in src/i18n/request.ts

type Messages = {
  common: typeof import('../../messages/en/common.json');
  monitors: typeof import('../../messages/en/monitors.json');
  incidents: typeof import('../../messages/en/incidents.json');
  statusPages: typeof import('../../messages/en/status-pages.json');
  notifications: typeof import('../../messages/en/notifications.json');
  settings: typeof import('../../messages/en/settings.json');
  login: typeof import('../../messages/en/login.json');
  errors: typeof import('../../messages/en/errors.json');
  publicStatus: typeof import('../../messages/en/public-status.json');
  reports: typeof import('../../messages/en/reports.json');
  validations: typeof import('../../messages/en/validations.json');
  setup: typeof import('../../messages/en/setup.json');
};

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
