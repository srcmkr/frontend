"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { useTranslation, useCommandPalette } from "@/lib/stores";

export function CommandPalette() {
  const { open, setOpen, toggle } = useCommandPalette();
  const router = useRouter();
  const t = useTranslation();

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
    { name: t.dashboard, href: "/", icon: LayoutDashboard, shortcut: "D" },
    { name: t.monitors, href: "/monitors", icon: Activity, shortcut: "M" },
    { name: t.incidents, href: "/incidents", icon: AlertTriangle, shortcut: "I" },
    { name: t.statusPages, href: "/status-pages", icon: Globe, shortcut: "S" },
    { name: t.notifications, href: "/notifications", icon: Bell, shortcut: "N" },
    { name: t.settings, href: "/settings", icon: Settings },
  ];

  const quickActions = [
    {
      name: "Neuen Monitor erstellen",
      icon: Plus,
      action: () => router.push("/monitors/new"),
      shortcut: "C",
    },
    {
      name: "Neue Gruppe erstellen",
      icon: FolderPlus,
      action: () => router.push("/monitors?action=new-group"),
    },
    {
      name: "Neuen Incident melden",
      icon: AlertTriangle,
      action: () => router.push("/incidents/new"),
    },
    {
      name: "Status Page erstellen",
      icon: FileText,
      action: () => router.push("/status-pages/new"),
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Suchen oder Befehl eingeben..." />
      <CommandList>
        <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
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

        <CommandGroup heading="Navigation">
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

        <CommandGroup heading="Theme">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                document.documentElement.classList.remove("basic", "dark", "forest", "slate");
              })
            }
          >
            <Zap className="mr-2 h-4 w-4" />
            <span>Kiwi Theme</span>
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
            <span>Basic Theme</span>
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
            <span>Dark Theme</span>
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
            <span>Forest Theme</span>
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
            <span>Slate Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
