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
  },
} as const;

export function useTranslation() {
  const { language } = useLanguageStore();
  return translations[language];
}
