"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusPageListItem } from "./status-page-list-item";
import type { StatusPage } from "@/types";

const ITEMS_PER_PAGE = 10;

interface StatusPageListPanelProps {
  statusPages: StatusPage[];
  selectedPageId: string | null;
  onSelectPage: (id: string) => void;
  className?: string;
}

function filterAndSortStatusPages(
  statusPages: StatusPage[],
  search: string
): StatusPage[] {
  let result = [...statusPages];

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter(
      (sp) =>
        sp.title.toLowerCase().includes(searchLower) ||
        sp.slug.toLowerCase().includes(searchLower) ||
        sp.description.toLowerCase().includes(searchLower)
    );
  }

  // Sort by updatedAt (newest first)
  result.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return result;
}

export function StatusPageListPanel({
  statusPages,
  selectedPageId,
  onSelectPage,
  className,
}: StatusPageListPanelProps) {
  const t = useTranslations("statusPages");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredStatusPages = useMemo(() => {
    return filterAndSortStatusPages(statusPages, search);
  }, [statusPages, search]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredStatusPages.length / ITEMS_PER_PAGE);
  const showPagination = filteredStatusPages.length > ITEMS_PER_PAGE;

  // Ensure currentPage is valid
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  if (validCurrentPage !== currentPage && totalPages > 0) {
    setCurrentPage(validCurrentPage);
  }

  const paginatedStatusPages = useMemo(() => {
    const start = (validCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredStatusPages.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStatusPages, validCurrentPage]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with Search */}
      <div className="p-3 space-y-2 border-b">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("list.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("list.statusPagesCount", { count: statusPages.length })}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredStatusPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <p className="text-muted-foreground mb-2">
              {search ? t("list.noStatusPagesFound") : t("list.noStatusPagesCreated")}
            </p>
            {search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearch("")}
              >
                {t("list.clearSearch")}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {paginatedStatusPages.map((statusPage) => (
              <StatusPageListItem
                key={statusPage.id}
                statusPage={statusPage}
                isSelected={statusPage.id === selectedPageId}
                onSelect={() => onSelectPage(statusPage.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-center gap-1 p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validCurrentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {validCurrentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validCurrentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
