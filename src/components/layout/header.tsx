"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { useTranslation } from "@/lib/stores";

export function Header() {
  const pathname = usePathname();
  const t = useTranslation();

  const navigation = [
    { name: t.dashboard, href: "/" },
    { name: t.monitors, href: "/monitors" },
    { name: t.incidents, href: "/incidents" },
    { name: t.statusPages, href: "/status-pages" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-header-border bg-header text-header-foreground">
      <div className="flex h-14 items-center px-6 lg:px-8">
        <div className="mr-8 flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/favicon.png"
              alt="Kiwi Status"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-semibold">Kiwi Status</span>
          </Link>
        </div>

        <nav className="flex flex-1 items-center space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href
                  ? "text-header-foreground"
                  : "text-header-muted"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-header-foreground hover:text-primary hover:bg-header-foreground/10">
              <BellIcon className="h-4 w-4" />
            </Button>
          </Link>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
