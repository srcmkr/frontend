import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/i18n";

// Helper to set cookie (for server-side reading by next-intl)
function setLocaleCookie(locale: Locale) {
  if (typeof document !== "undefined") {
    // Set cookie with 1 year expiry, accessible by server
    document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
  }
}

// Language Store
// Note: The language is persisted via Zustand (localStorage) AND as a cookie.
// The cookie is read by next-intl on the server to determine the locale.
interface LanguageState {
  language: Locale;
  setLanguage: (language: Locale) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => {
        set({ language });
        // Set cookie for server-side reading
        setLocaleCookie(language);
        // Reload to fetch new translations from server
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      },
    }),
    {
      name: "language-storage",
      // On rehydration, sync cookie with stored value
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          setLocaleCookie(state.language);
        }
      },
    }
  )
);

// Command Palette Store
interface CommandPaletteState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useCommandPalette = create<CommandPaletteState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));

// Theme Store
type Theme = "basic" | "dark" | "forest" | "slate" | "kiwi";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "kiwi",
      setTheme: (theme) => set({ theme }),
    }),
    { name: "theme-storage" }
  )
);

// Legacy translations export - deprecated, use useTranslations from next-intl instead
// Keeping for backwards compatibility during migration
/** @deprecated Use `useTranslations` from 'next-intl' instead */
export const translations = {
  en: {
    dashboard: "Dashboard",
    monitors: "Monitors",
    incidents: "Incidents",
    statusPages: "Status Pages",
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    logout: "Logout",
    english: "English",
    german: "German",
    basic: "Basic",
    dark: "Dark",
    forest: "Forest",
    slate: "Slate",
    kiwi: "Kiwi",
    servicesUp: "Services Up",
    servicesDown: "Services Down",
    avgUptime: "Avg. Uptime (24h)",
    avgResponseTime: "Avg. Response Time",
    incidentTitle: "Incidents",
    createIncident: "Create Incident",
    editIncident: "Edit Incident",
    resolveIncident: "Resolve",
    deleteIncident: "Delete",
    incidentOngoing: "Ongoing",
    incidentResolved: "Resolved",
    severityInfo: "Info",
    severityMinor: "Minor",
    severityMajor: "Major",
    severityCritical: "Critical",
    incidentType: "Incident",
    maintenanceType: "Maintenance",
    announcementType: "Announcement",
    affectedServices: "Affected Services",
    incidentCause: "Cause",
    incidentDescription: "Description",
    incidentTimeline: "Timeline",
    addUpdate: "Add Update",
    noIncidents: "No incidents",
    allSystemsOperational: "All systems operational",
    selectIncident: "Select an incident",
    activeIncidents: "Active Incidents",
    mttr: "MTTR",
  },
  de: {
    dashboard: "Dashboard",
    monitors: "Monitore",
    incidents: "Vorfälle",
    statusPages: "Statusseiten",
    notifications: "Benachrichtigungen",
    profile: "Profil",
    settings: "Einstellungen",
    language: "Sprache",
    theme: "Design",
    logout: "Abmelden",
    english: "Englisch",
    german: "Deutsch",
    basic: "Basic",
    dark: "Dunkel",
    forest: "Forest",
    slate: "Slate",
    kiwi: "Kiwi",
    servicesUp: "Dienste Online",
    servicesDown: "Dienste Offline",
    avgUptime: "Durchschn. Uptime (24h)",
    avgResponseTime: "Durchschn. Antwortzeit",
    incidentTitle: "Vorfälle",
    createIncident: "Vorfall erstellen",
    editIncident: "Vorfall bearbeiten",
    resolveIncident: "Beheben",
    deleteIncident: "Löschen",
    incidentOngoing: "Aktiv",
    incidentResolved: "Behoben",
    severityInfo: "Info",
    severityMinor: "Gering",
    severityMajor: "Mittel",
    severityCritical: "Kritisch",
    incidentType: "Vorfall",
    maintenanceType: "Wartung",
    announcementType: "Ankündigung",
    affectedServices: "Betroffene Services",
    incidentCause: "Ursache",
    incidentDescription: "Beschreibung",
    incidentTimeline: "Zeitleiste",
    addUpdate: "Update hinzufügen",
    noIncidents: "Keine Vorfälle",
    allSystemsOperational: "Alle Systeme funktionieren einwandfrei",
    selectIncident: "Wähle einen Vorfall aus",
    activeIncidents: "Aktive Vorfälle",
    mttr: "MTTR",
  },
} as const;

/** @deprecated Use `useTranslations` from 'next-intl' instead */
export function useTranslation() {
  const { language } = useLanguageStore();
  return translations[language];
}
