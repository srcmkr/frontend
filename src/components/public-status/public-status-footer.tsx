"use client";

import { useTranslations } from "next-intl";
import { formatRelativeTime } from "@/lib/public-status-utils";

interface PublicStatusFooterProps {
  lastUpdated: string;
}

export function PublicStatusFooter({ lastUpdated }: PublicStatusFooterProps) {
  const t = useTranslations("publicStatus");

  return (
    <footer className="pt-5 pb-3 border-t">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs text-muted-foreground">
        <p>{t("lastUpdated", { time: formatRelativeTime(lastUpdated, "de") })}</p>
        <p>
          {t("poweredBy")}{" "}
          <a
            href="https://kiwistatus.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            Kiwi Status
          </a>
        </p>
      </div>
    </footer>
  );
}
