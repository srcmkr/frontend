"use client";

import { useState, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/stores";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslation();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navigation = [
    { name: t.dashboard, href: "/", icon: LayoutDashboard },
    { name: t.monitors, href: "/monitors", icon: Activity },
    { name: t.incidents, href: "/incidents", icon: AlertTriangle },
    { name: t.statusPages, href: "/status-pages", icon: Globe },
    { name: t.notifications, href: "/notifications", icon: Bell },
    { name: t.settings, href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/favicon.png"
              alt="Kiwi Status"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg"
            />
            <span className="font-bold text-lg">Kiwi Status</span>
          </Link>

          <div className="flex items-center gap-2">
            <UserMenu />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="h-10 w-10"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-out Menu */}
      <nav
        className={cn(
          "lg:hidden fixed top-16 right-0 z-40 h-[calc(100vh-4rem)] w-[280px]",
          "bg-background border-l border-border shadow-2xl",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex-1 space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Info */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/50">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">John Doe</p>
                <p className="text-sm text-muted-foreground truncate">
                  john@example.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
