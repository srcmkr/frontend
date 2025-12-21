import { create } from "zustand";
import { persist } from "zustand/middleware";

// Language Store
type Language = "en" | "de";

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
    }),
    { name: "language-storage" }
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

// Translations
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
    // Incident translations
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
    // Incident translations
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
    incidentTimeline: "Timeline",
    addUpdate: "Update hinzufügen",
    noIncidents: "Keine Vorfälle",
    allSystemsOperational: "Alle Systeme funktionieren einwandfrei",
    selectIncident: "Wähle einen Vorfall aus",
    activeIncidents: "Aktive Vorfälle",
    mttr: "MTTR",
  },
} as const;

export function useTranslation() {
  const { language } = useLanguageStore();
  return translations[language];
}
