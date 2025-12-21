"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Globe,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/stores";
import { UserMenu } from "./user-menu";

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslation();

  const navigation = [
    { name: t.dashboard, href: "/", icon: LayoutDashboard },
    { name: t.monitors, href: "/monitors", icon: Activity },
    { name: t.incidents, href: "/incidents", icon: AlertTriangle },
    { name: t.statusPages, href: "/status-pages", icon: Globe },
  ];

  const bottomNavigation = [
    { name: t.notifications, href: "/notifications", icon: Bell },
    { name: t.settings, href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex flex-col",
        "bg-sidebar border-r border-sidebar-border",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[320px]"
      )}
    >
      {/* Logo & Brand */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-sidebar-border",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-xl group-hover:bg-primary/30 transition-all duration-300" />
            <Image
              src="/favicon.png"
              alt="Kiwi Status"
              width={40}
              height={40}
              className="relative h-10 w-10 rounded-xl"
            />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg text-sidebar-foreground tracking-tight">
              Kiwi Status
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={() => onCollapsedChange?.(true)}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand Button (when collapsed) */}
      {collapsed && (
        <button
          onClick={() => onCollapsedChange?.(false)}
          className="mx-auto mt-3 p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                "hover:bg-sidebar-accent",
                active
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200",
                  "group-hover:scale-110",
                  active && "drop-shadow-sm"
                )}
              />
              {!collapsed && (
                <span className="font-medium text-sm truncate">{item.name}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm font-medium rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {bottomNavigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                "hover:bg-sidebar-accent",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
                collapsed && "justify-center px-0"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200",
                  "group-hover:scale-110"
                )}
              />
              {!collapsed && (
                <span className="font-medium text-sm truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Section */}
      <div className={cn(
        "px-3 py-4 border-t border-sidebar-border",
        collapsed && "flex justify-center"
      )}>
        <UserMenuSidebar collapsed={collapsed} />
      </div>
    </aside>
  );
}

function UserMenuSidebar({ collapsed }: { collapsed: boolean }) {
  const t = useTranslation();

  if (collapsed) {
    return <UserMenu />;
  }

  return (
    <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-sidebar-accent/50">
      <UserMenu />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
        <p className="text-xs text-sidebar-foreground/60 truncate">john@example.com</p>
      </div>
    </div>
  );
}
