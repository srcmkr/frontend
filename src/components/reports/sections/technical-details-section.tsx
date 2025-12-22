"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/format-utils";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight } from "lucide-react";
import type { TechnicalDetails } from "@/types";

interface TechnicalDetailsSectionProps {
  data: TechnicalDetails;
  className?: string;
}

export function TechnicalDetailsSection({ data, className }: TechnicalDetailsSectionProps) {
  const locale = useLocale();
  const t = useTranslations("reports.technicalDetails");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="font-semibold text-lg">{t("title")}</h3>

      {/* DNS Resolution Stats */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{t("dnsResolution")}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{t("average")}</p>
            <p className="text-xl font-bold font-mono">{data.dnsResolutionStats.averageTime}ms</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{t("min")}</p>
            <p className="text-xl font-bold font-mono">
              {data.dnsResolutionStats.minTime}ms
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{t("max")}</p>
            <p className="text-xl font-bold font-mono">
              {data.dnsResolutionStats.maxTime}ms
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{t("p95")}</p>
            <p className="text-xl font-bold font-mono">{data.dnsResolutionStats.p95Time}ms</p>
          </div>
        </div>
      </div>

      {/* Certificate History */}
      {data.certificateHistory.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">{t("certificateHistory")}</h4>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t("certificateTable.date")}</TableHead>
                  <TableHead>{t("certificateTable.expiryDate")}</TableHead>
                  <TableHead>{t("certificateTable.remaining")}</TableHead>
                  <TableHead>{t("certificateTable.issuer")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.certificateHistory.map((cert, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">{formatDate(cert.date)}</TableCell>
                    <TableCell className="font-mono text-sm">{formatDate(cert.expiryDate)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          cert.daysUntilExpiry < 30 && "bg-red-600 text-white",
                          cert.daysUntilExpiry >= 30 && cert.daysUntilExpiry < 60 && "bg-amber-500 text-white",
                          cert.daysUntilExpiry >= 60 && "bg-green-600 text-white"
                        )}
                      >
                        {t("days", { count: cert.daysUntilExpiry })}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {cert.issuer}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* TLS Version History */}
      {data.tlsVersionHistory.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">{t("tlsVersion")}</h4>
          <div className="flex flex-wrap gap-2">
            {data.tlsVersionHistory.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                <span className="text-xs text-muted-foreground font-mono">{formatDate(entry.date)}</span>
                <Badge variant="secondary">
                  {entry.version}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IP Address Changes */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{t("ipChanges")}</h4>
        {data.ipAddressChanges.length > 0 ? (
          <div className="space-y-2">
            {data.ipAddressChanges.map((change, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg text-sm"
              >
                <span className="font-mono text-muted-foreground">{formatDate(change.date)}</span>
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-mono text-sm">
                    {change.previousIP}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm">
                    {change.newIP}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t("noIpChanges")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
