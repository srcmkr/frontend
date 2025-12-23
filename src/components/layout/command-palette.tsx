"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Globe,
  Bell,
  Settings,
  Plus,
  Moon,
  Sun,
  Monitor,
  FolderPlus,
  FileText,
  Zap,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useCommandPalette } from "@/lib/stores";

export function CommandPalette() {
  const { open, setOpen, toggle } = useCommandPalette();
  const router = useRouter();
  const t = useTranslations("common");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const navigationItems = [
    { name: t("navigation.dashboard"), href: "/", icon: LayoutDashboard, shortcut: "D" },
    { name: t("navigation.monitors"), href: "/monitors", icon: Activity, shortcut: "M" },
    { name: t("navigation.incidents"), href: "/incidents", icon: AlertTriangle, shortcut: "I" },
    { name: t("navigation.statusPages"), href: "/status-pages", icon: Globe, shortcut: "S" },
    { name: t("navigation.notifications"), href: "/notifications", icon: Bell, shortcut: "N" },
    { name: t("navigation.settings"), href: "/settings", icon: Settings },
  ];

  const quickActions = [
    {
      name: t("commandPalette.createMonitor"),
      icon: Plus,
      action: () => router.push("/monitors/create"),
      shortcut: "C",
    },
    {
      name: t("commandPalette.createGroup"),
      icon: FolderPlus,
      action: () => router.push("/monitors?action=new-group"),
    },
    {
      name: t("commandPalette.createIncident"),
      icon: AlertTriangle,
      action: () => router.push("/incidents/create?type=incident"),
    },
    {
      name: t("commandPalette.createStatusPage"),
      icon: FileText,
      action: () => router.push("/status-pages/new"),
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t("commandPalette.placeholder")} />
      <CommandList>
        <CommandEmpty>{t("commandPalette.noResults")}</CommandEmpty>

        <CommandGroup heading={t("commandPalette.quickActions")}>
          {quickActions.map((item) => (
            <CommandItem
              key={item.name}
              onSelect={() => runCommand(item.action)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t("commandPalette.navigation")}>
          {navigationItems.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.name}</span>
              {item.shortcut && (
                <CommandShortcut>{item.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t("commandPalette.theme")}>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                document.documentElement.classList.remove("basic", "dark", "forest", "slate");
              })
            }
          >
            <Zap className="mr-2 h-4 w-4" />
            <span>{t("themes.kiwi")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                document.documentElement.classList.remove("dark", "forest", "slate");
                document.documentElement.classList.add("basic");
              })
            }
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>{t("themes.basic")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                document.documentElement.classList.remove("basic", "forest", "slate");
                document.documentElement.classList.add("dark");
              })
            }
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>{t("themes.dark")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                document.documentElement.classList.remove("basic", "dark", "slate");
                document.documentElement.classList.add("forest");
              })
            }
          >
            <Monitor className="mr-2 h-4 w-4" />
            <span>{t("themes.forest")}</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                document.documentElement.classList.remove("basic", "dark", "forest");
                document.documentElement.classList.add("slate");
              })
            }
          >
            <Monitor className="mr-2 h-4 w-4" />
            <span>{t("themes.slate")}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
