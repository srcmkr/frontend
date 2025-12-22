"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { IncidentAnalysis } from "@/types";

interface IncidentSectionProps {
  data: IncidentAnalysis;
  className?: string;
}

const SEVERITY_COLORS = {
  minor: "#22c55e",
  major: "#f59e0b",
  critical: "#ef4444",
};

export function IncidentSection({ data, className }: IncidentSectionProps) {
  const t = useTranslations("reports.incidents");

  const pieData = [
    { name: t("severity.minor"), value: data.severityDistribution.minor, color: SEVERITY_COLORS.minor, key: "minor" },
    { name: t("severity.major"), value: data.severityDistribution.major, color: SEVERITY_COLORS.major, key: "major" },
    { name: t("severity.critical"), value: data.severityDistribution.critical, color: SEVERITY_COLORS.critical, key: "critical" },
  ].filter((d) => d.value > 0);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getSeverityLabel = (severity: "minor" | "major" | "critical") => {
    return t(`severity.${severity}`);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="font-semibold text-lg">{t("title")}</h3>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("totalIncidents")}</p>
          <p className={cn(
            "text-2xl font-bold font-mono",
            data.totalIncidents > 0 ? "text-red-600" : "text-green-600"
          )}>
            {data.totalIncidents}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("mtbf")}</p>
          <p className="text-2xl font-bold font-mono">{data.mtbf}h</p>
          <p className="text-xs text-muted-foreground">{t("mtbfDesc")}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("mttr")}</p>
          <p className="text-2xl font-bold font-mono">{data.mttr}min</p>
          <p className="text-xs text-muted-foreground">{t("mttrDesc")}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">{t("longestOutage")}</p>
          <p className="text-2xl font-bold font-mono text-red-600">
            {formatDuration(data.longestOutage)}
          </p>
          <p className="text-xs text-muted-foreground">{data.longestOutageDate}</p>
        </div>
      </div>

      {data.totalIncidents > 0 && (
        <>
          {/* Severity Distribution */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">{t("severityDistribution")}</h4>
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover text-popover-foreground border rounded-md shadow-lg px-3 py-2 text-xs">
                            <p className="font-medium">{data.name}</p>
                            <p>{data.value} Incidents</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex justify-center gap-4 text-xs">
                {pieData.map((entry) => (
                  <div key={entry.key} className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span>
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Root Causes */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">{t("rootCauses")}</h4>
              <div className="space-y-3">
                {data.rootCauseCategories.map((cause) => (
                  <div key={cause.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{cause.category}</span>
                      <span className="font-mono text-muted-foreground">
                        {cause.count} ({cause.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-foreground/20"
                        style={{ width: `${cause.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Incident Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">{t("timeline")}</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.incidentTimeline.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        incident.severity === "critical"
                          ? "bg-red-500"
                          : incident.severity === "major"
                            ? "bg-amber-500"
                            : "bg-green-500"
                      )}
                    />
                    <div className="w-px h-full bg-border mt-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={incident.severity === "critical" ? "destructive" : "secondary"}
                      >
                        {getSeverityLabel(incident.severity)}
                      </Badge>
                      <span className="font-mono text-sm">{incident.date}</span>
                      <span className="text-xs text-muted-foreground">
                        {incident.startTime} - {incident.endTime || t("ongoing")}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{incident.cause}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("durationLabel")} <span className="font-mono">{formatDuration(incident.duration)}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {data.totalIncidents === 0 && (
        <div className="text-center py-8 bg-muted/50 rounded-lg">
          <p className="text-lg font-medium text-green-600">{t("noIncidents")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("noIncidentsDescription")}</p>
        </div>
      )}
    </div>
  );
}
