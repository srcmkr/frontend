"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Globe,
  Bell,
  Settings,
  Menu,
  X,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandPalette } from "@/lib/stores";
import { UserMenu } from "./user-menu";

export const FloatingNav = memo(function FloatingNav() {
  const pathname = usePathname();
  const t = useTranslations("common");
  const { setOpen: openCommandPalette } = useCommandPalette();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const mainNav = [
    { name: t("navigation.dashboard"), href: "/", icon: LayoutDashboard },
    { name: t("navigation.monitors"), href: "/monitors", icon: Activity },
    { name: t("navigation.incidents"), href: "/incidents", icon: AlertTriangle },
    { name: t("navigation.statusPages"), href: "/status-pages", icon: Globe },
  ];

  // Memoize isActive to prevent unnecessary recalculations
  const isActive = useCallback((href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }, [pathname]);

  return (
    <>
      {/* Desktop Floating Navigation */}
      <header
        className={cn(
          "hidden lg:block fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled ? "py-3" : "py-5"
        )}
      >
        <div className="max-w-[1600px] mx-auto px-6">
          <nav
            className={cn(
              "flex items-center justify-between px-4 py-2 rounded-2xl transition-all duration-500",
              "bg-zinc-900 backdrop-blur-2xl border border-zinc-800",
              scrolled && "shadow-lg shadow-black/20"
            )}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Image
                  src="/favicon.png"
                  alt="Kiwi Status"
                  width={36}
                  height={36}
                  className="relative h-9 w-9 rounded-xl"
                />
              </div>
              <span className="font-bold text-lg tracking-tight text-zinc-100">Kiwi Status</span>
            </Link>

            {/* Center Navigation Pills */}
            <div className="flex items-center gap-1 p-1 bg-zinc-800/50 rounded-xl">
              {mainNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium uppercase tracking-wide transition-all duration-300",
                      active
                        ? "text-primary-foreground"
                        : "text-zinc-400 hover:text-zinc-100"
                    )}
                  >
                    {active && (
                      <span className="absolute inset-0 bg-primary rounded-lg shadow-lg shadow-primary/30" />
                    )}
                    <item.icon className="relative h-4 w-4" />
                    <span className="relative">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Command Palette Hint */}
              <button
                onClick={() => openCommandPalette(true)}
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700/50 transition-colors"
              >
                <Command className="h-3 w-3" />
                <span>{t("actions.search")}</span>
                <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-zinc-950 text-zinc-300 rounded border border-zinc-700">
                  ⌘K
                </kbd>
              </button>

              {/* Notifications */}
              <Link
                href="/notifications"
                className={cn(
                  "relative p-2 rounded-lg transition-colors",
                  pathname === "/notifications"
                    ? "bg-primary text-primary-foreground"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                )}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
              </Link>

              {/* Settings */}
              <Link
                href="/settings"
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  pathname === "/settings"
                    ? "bg-primary text-primary-foreground"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                )}
              >
                <Settings className="h-4 w-4" />
              </Link>

              {/* Divider */}
              <div className="w-px h-6 bg-zinc-700 mx-1" />

              {/* User */}
              <UserMenu />
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Navigation */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <nav
          className={cn(
            "flex items-center justify-between px-4 py-2.5 rounded-2xl transition-all duration-300",
            "bg-zinc-900 backdrop-blur-2xl border border-zinc-800 shadow-lg shadow-black/20"
          )}
        >
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/favicon.png"
              alt="Kiwi Status"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg"
            />
            <span className="font-bold text-zinc-100">Kiwi</span>
          </Link>

          <div className="flex items-center gap-2">
            <UserMenu />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        <div
          className={cn(
            "mt-2 p-2 rounded-2xl bg-zinc-900/95 backdrop-blur-2xl border border-zinc-800 shadow-xl transition-all duration-300 origin-top",
            mobileOpen
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none"
          )}
        >
          {mainNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl uppercase tracking-wide transition-all duration-200",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
          <div className="my-2 h-px bg-zinc-800" />
          <Link
            href="/notifications"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="font-medium">{t("navigation.notifications")}</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">{t("navigation.settings")}</span>
          </Link>
        </div>
      </header>

      {/* Spacer for fixed nav */}
      <div className="h-20 lg:h-24" />
    </>
  );
});
