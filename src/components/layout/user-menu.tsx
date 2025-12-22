"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguageStore, useThemeStore, useTranslation } from "@/lib/stores";

export function UserMenu() {
  const router = useRouter();
  const t = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const { theme, setTheme } = useThemeStore();

  const handleLogout = () => {
    // TODO: Clear auth state/tokens when backend is ready
    router.push("/login");
  };

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("basic", "dark", "forest", "slate");
    // Kiwi is now the default (no class needed), other themes add their class
    if (theme !== "kiwi") {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              JD
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">john@example.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/settings">{t.settings}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/notifications">{t.notifications}</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Language Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex items-center gap-2">
              <LanguageIcon className="h-4 w-4" />
              {t.language}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => setLanguage("en")}
                className={language === "en" ? "bg-accent" : ""}
              >
                <span className="mr-2">🇬🇧</span>
                {t.english}
                {language === "en" && <CheckIcon className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage("de")}
                className={language === "de" ? "bg-accent" : ""}
              >
                <span className="mr-2">🇩🇪</span>
                {t.german}
                {language === "de" && <CheckIcon className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        {/* Theme Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span className="flex items-center gap-2">
              <ThemeIcon className="h-4 w-4" />
              {t.theme}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => setTheme("kiwi")}
                className={theme === "kiwi" ? "bg-accent" : ""}
              >
                {t.kiwi}
                <ThemeColors colors={["#f0f9e8", "#BCEB2D", "#3d6b1f"]} className="ml-auto" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("basic")}
                className={theme === "basic" ? "bg-accent" : ""}
              >
                {t.basic}
                <ThemeColors colors={["#ffffff", "#f4f4f5", "#18181b"]} className="ml-auto" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className={theme === "dark" ? "bg-accent" : ""}
              >
                {t.dark}
                <ThemeColors colors={["#1a2e1a", "#243524", "#4ade80"]} className="ml-auto" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("forest")}
                className={theme === "forest" ? "bg-accent" : ""}
              >
                {t.forest}
                <ThemeColors colors={["#f0fdf4", "#dcfce7", "#166534"]} className="ml-auto" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("slate")}
                className={theme === "slate" ? "bg-accent" : ""}
              >
                {t.slate}
                <ThemeColors colors={["#1e293b", "#334155", "#94a3b8"]} className="ml-auto" />
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogoutIcon className="mr-2 h-4 w-4" />
          {t.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple icon components
function LanguageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ThemeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function ThemeColors({ colors, className }: { colors: [string, string, string]; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className ?? ""}`}>
      {colors.map((color, i) => (
        <div
          key={i}
          className="h-4 w-4 rounded-full border border-border/50"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}
