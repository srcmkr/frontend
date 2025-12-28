import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { SLAReport } from "@/types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  periodBadge: {
    fontSize: 10,
    color: "#666",
    backgroundColor: "#f0f0f0",
    padding: "4 8",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  statBox: {
    width: "23%",
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 4,
  },
  statBoxWide: {
    width: "48%",
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 4,
  },
  slaRequirementsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f0f4f8",
    borderRadius: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e4e8",
  },
  slaRequirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slaRequirementLabel: {
    fontSize: 9,
    color: "#666",
  },
  slaRequirementValue: {
    fontSize: 11,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 8,
    color: "#666",
    marginBottom: 2,
  },
  statSubLabel: {
    fontSize: 7,
    color: "#888",
    marginTop: 2,
  },
  statSubLabelRed: {
    fontSize: 7,
    color: "#dc2626",
    marginTop: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statValueGreen: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#16a34a",
  },
  statValueRed: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#dc2626",
  },
  statValueYellow: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ca8a04",
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    padding: "6 8",
    borderRadius: 2,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#666",
  },
  tableRow: {
    flexDirection: "row",
    padding: "4 8",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  tableCell: {
    fontSize: 9,
  },
  col1: { width: "30%" },
  col2: { width: "20%", textAlign: "right" },
  col3: { width: "25%", textAlign: "right" },
  col4: { width: "25%", textAlign: "right" },
  incidentRow: {
    flexDirection: "row",
    padding: 8,
    marginBottom: 4,
    backgroundColor: "#fef2f2",
    borderRadius: 4,
  },
  badge: {
    fontSize: 8,
    padding: "2 6",
    borderRadius: 4,
    marginRight: 8,
  },
  badgeCritical: {
    backgroundColor: "#dc2626",
    color: "white",
  },
  badgeMajor: {
    backgroundColor: "#ca8a04",
    color: "white",
  },
  badgeMinor: {
    backgroundColor: "#16a34a",
    color: "white",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#e0e0e0",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 8,
    color: "#999",
  },
});

// Translation type for PDF
export interface PDFTranslations {
  title: string;
  summary: string;
  slaTargetAvailability: string;
  maxResponseTime: string;
  availability: string;
  met: string;
  violated: string;
  responseTime: string;
  uptime: string;
  downtime: string;
  trendVsPrevious: string;
  available: string;
  allowedDowntime: string;
  slaBreaches: string;
  table: {
    week: string;
    uptime: string;
    checks: string;
    failed: string;
  };
  weekPrefix: string;
  generatedAt: string;
  performance: {
    title: string;
    maxResponseTimeSla: string;
    average: string;
    median: string;
    minMax: string;
  };
  incidents: {
    title: string;
    totalIncidents: string;
    mtbf: string;
    mttr: string;
    longestOutage: string;
    severity: {
      critical: string;
      major: string;
      minor: string;
    };
  };
  checkStatistics: {
    title: string;
    totalChecks: string;
    successful: string;
    failed: string;
    successRate: string;
  };
  technicalDetails: {
    title: string;
    dnsAvg: string;
    dnsP95: string;
    ipChanges: string;
    tlsVersion: string;
  };
}

interface SLAReportPDFProps {
  report: SLAReport;
  locale?: string;
  translations: PDFTranslations;
}

export function SLAReportPDF({ report, locale = "en-US", translations: t }: SLAReportPDFProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUptimeStyle = (uptime: number) => {
    if (uptime >= 99.9) return styles.statValueGreen;
    if (uptime >= 95) return styles.statValueYellow;
    return styles.statValueRed;
  };

  /**
   * Calculate allowed downtime based on SLA target and period
   */
  const calculateAllowedDowntime = () => {
    const start = new Date(report.period.startDate);
    const end = new Date(report.period.endDate);
    const now = new Date();
    const actualEnd = end > now ? now : end;
    const periodHours = (actualEnd.getTime() - start.getTime()) / (1000 * 60 * 60);
    const allowedDowntimePercent = 100 - report.slaTarget;
    return (periodHours * allowedDowntimePercent) / 100;
  };

  const allowedDowntimeHours = calculateAllowedDowntime();

  /**
   * Format duration in a human-readable way for PDF
   */
  const formatDuration = (hours: number) => {
    const totalMinutes = Math.round(hours * 60);

    if (totalMinutes < 1) {
      return "< 1m";
    }

    if (totalMinutes < 60) {
      return `${totalMinutes}m`;
    }

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (totalHours < 24) {
      return remainingMinutes > 0
        ? `${totalHours}h ${remainingMinutes}m`
        : `${totalHours}h`;
    }

    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;

    return remainingHours > 0
      ? `${days}d ${remainingHours}h`
      : `${days}d`;
  };

  return (
    <Document>
      {/* Page 1: Executive Summary & Availability */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.title}</Text>
          <Text style={styles.subtitle}>{report.monitorName}</Text>
          <Text style={styles.periodBadge}>
            {report.period.label} ({report.period.startDate} - {report.period.endDate})
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.summary}</Text>

          {/* SLA Requirements Overview */}
          <View style={styles.slaRequirementsBox}>
            <View style={styles.slaRequirementItem}>
              <Text style={styles.slaRequirementLabel}>{t.slaTargetAvailability}</Text>
              <Text style={styles.slaRequirementValue}>{report.slaTarget}%</Text>
            </View>
            <View style={styles.slaRequirementItem}>
              <Text style={styles.slaRequirementLabel}>{t.maxResponseTime}</Text>
              <Text style={styles.slaRequirementValue}>{report.maxResponseTime}ms</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.availability}</Text>
              <Text style={report.executiveSummary.slaCompliant ? styles.statValueGreen : styles.statValueRed}>
                {report.executiveSummary.slaCompliant ? t.met : t.violated}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.responseTime}</Text>
              <Text style={report.executiveSummary.responseTimeCompliant ? styles.statValueGreen : styles.statValueRed}>
                {report.executiveSummary.responseTimeCompliant ? t.met : t.violated}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.uptime}</Text>
              <Text style={getUptimeStyle(report.executiveSummary.overallAvailability)}>
                {report.executiveSummary.overallAvailability.toFixed(3)}%
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.downtime}</Text>
              <Text style={styles.statValue}>{report.executiveSummary.totalDowntimeFormatted}</Text>
            </View>
          </View>
          <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
            <Text style={styles.statLabel}>{t.trendVsPrevious}</Text>
            <Text style={report.executiveSummary.trendVsPreviousPeriod >= 0 ? styles.statValueGreen : styles.statValueRed}>
              {report.executiveSummary.trendVsPreviousPeriod > 0 ? "+" : ""}
              {report.executiveSummary.trendVsPreviousPeriod.toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.availability}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.uptime}</Text>
              <Text style={getUptimeStyle(report.availability.uptimePercentage)}>
                {report.availability.uptimePercentage.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.available}</Text>
              <Text style={styles.statValueGreen}>
                {formatDuration(report.availability.uptimeHours)}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.downtime}</Text>
              <Text style={report.availability.downtimeMinutes > 0 ? styles.statValueRed : styles.statValueGreen}>
                {formatDuration(report.availability.downtimeHours)}
              </Text>
              <Text style={report.availability.downtimeHours <= allowedDowntimeHours ? styles.statSubLabel : styles.statSubLabelRed}>
                {t.allowedDowntime.replace("{sla}", String(report.slaTarget)).replace("{allowed}", formatDuration(allowedDowntimeHours))}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.slaBreaches}</Text>
              <Text style={report.availability.slaBreachCount > 0 ? styles.statValueRed : styles.statValueGreen}>
                {report.availability.slaBreachCount}
              </Text>
            </View>
          </View>

          {/* Weekly Breakdown Table */}
          {report.availability.weeklyBreakdown.length > 0 && (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.col1]}>{t.table.week}</Text>
                <Text style={[styles.tableHeaderCell, styles.col2]}>{t.table.uptime}</Text>
                <Text style={[styles.tableHeaderCell, styles.col3]}>{t.table.checks}</Text>
                <Text style={[styles.tableHeaderCell, styles.col4]}>{t.table.failed}</Text>
              </View>
              {report.availability.weeklyBreakdown.slice(0, 8).map((week) => (
                <View key={week.weekNumber} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.col1]}>
                    {t.weekPrefix} {week.weekNumber}
                  </Text>
                  <Text style={[styles.tableCell, styles.col2, getUptimeStyle(week.uptime)]}>
                    {week.uptime.toFixed(2)}%
                  </Text>
                  <Text style={[styles.tableCell, styles.col3]}>{week.totalChecks.toLocaleString(locale)}</Text>
                  <Text style={[styles.tableCell, styles.col4, styles.statValueRed]}>
                    {week.failedChecks.toLocaleString(locale)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text>
            {t.generatedAt} {formatDate(report.generatedAt)} | {report.monitorUrl}
          </Text>
          <Text style={{ marginTop: 4 }}>
            Generated with Kiwi Status • kiwistatus.com
          </Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>

      {/* Page 2: Performance & Incidents */}
      <Page size="A4" style={styles.page}>
        {/* Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.performance.title}</Text>
          <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
            <Text style={styles.statLabel}>{t.performance.maxResponseTimeSla}</Text>
            <Text style={styles.slaRequirementValue}>{report.maxResponseTime}ms</Text>
            <Text style={[
              styles.slaRequirementValue,
              { marginLeft: 10 },
              report.performance.averageResponseTime <= report.maxResponseTime
                ? styles.statValueGreen
                : styles.statValueRed
            ]}>
              ({report.performance.averageResponseTime <= report.maxResponseTime ? t.met : t.violated})
            </Text>
          </View>
          <View style={[styles.statsGrid, { marginTop: 10 }]}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.performance.average}</Text>
              <Text style={report.performance.averageResponseTime <= report.maxResponseTime ? styles.statValueGreen : styles.statValueRed}>
                {report.performance.averageResponseTime}ms
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.performance.median}</Text>
              <Text style={styles.statValue}>{report.performance.medianResponseTime}ms</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>P95</Text>
              <Text style={report.performance.p95ResponseTime <= report.maxResponseTime ? styles.statValue : styles.statValueYellow}>
                {report.performance.p95ResponseTime}ms
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>P99</Text>
              <Text style={report.performance.p99ResponseTime <= report.maxResponseTime ? styles.statValue : styles.statValueYellow}>
                {report.performance.p99ResponseTime}ms
              </Text>
            </View>
          </View>
          <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
            <Text style={styles.statLabel}>{t.performance.minMax}</Text>
            <Text style={styles.tableCell}>
              {report.performance.minResponseTime}ms / {report.performance.maxResponseTime}ms
            </Text>
          </View>
        </View>

        {/* Incidents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.incidents.title}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.incidents.totalIncidents}</Text>
              <Text style={report.incidents.totalIncidents > 0 ? styles.statValueRed : styles.statValueGreen}>
                {report.incidents.totalIncidents}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.incidents.mtbf}</Text>
              <Text style={styles.statValue}>{report.incidents.mtbf}h</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.incidents.mttr}</Text>
              <Text style={styles.statValue}>{report.incidents.mttr}min</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.incidents.longestOutage}</Text>
              <Text style={styles.statValueRed}>{report.incidents.longestOutage}min</Text>
            </View>
          </View>

          {/* Incident List */}
          {report.incidents.incidentTimeline.slice(0, 6).map((incident) => (
            <View key={incident.id} style={styles.incidentRow}>
              <Text style={[
                styles.badge,
                incident.severity === "critical" ? styles.badgeCritical :
                  incident.severity === "major" ? styles.badgeMajor : styles.badgeMinor
              ]}>
                {incident.severity === "critical" ? t.incidents.severity.critical :
                  incident.severity === "major" ? t.incidents.severity.major : t.incidents.severity.minor}
              </Text>
              <Text style={styles.tableCell}>{incident.date} {incident.startTime}</Text>
              <Text style={[styles.tableCell, { marginLeft: 10 }]}>{incident.cause}</Text>
              <Text style={[styles.tableCell, { marginLeft: "auto" }]}>{incident.duration}min</Text>
            </View>
          ))}
        </View>

        {/* Check Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.checkStatistics.title}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.checkStatistics.totalChecks}</Text>
              <Text style={styles.statValue}>{report.checks.totalChecks.toLocaleString(locale)}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.checkStatistics.successful}</Text>
              <Text style={styles.statValueGreen}>
                {report.checks.successfulChecks.toLocaleString(locale)}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.checkStatistics.failed}</Text>
              <Text style={report.checks.failedChecks > 0 ? styles.statValueRed : styles.statValueGreen}>
                {report.checks.failedChecks.toLocaleString(locale)}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.checkStatistics.successRate}</Text>
              <Text style={getUptimeStyle(report.checks.successRate)}>
                {report.checks.successRate.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Technical Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.technicalDetails.title}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.technicalDetails.dnsAvg}</Text>
              <Text style={styles.statValue}>{report.technical.dnsResolutionStats.averageTime}ms</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.technicalDetails.dnsP95}</Text>
              <Text style={styles.statValue}>{report.technical.dnsResolutionStats.p95Time}ms</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.technicalDetails.ipChanges}</Text>
              <Text style={styles.statValue}>{report.technical.ipAddressChanges.length}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.technicalDetails.tlsVersion}</Text>
              <Text style={styles.statValue}>
                {report.technical.tlsVersionHistory[0]?.version || "-"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            {t.generatedAt} {formatDate(report.generatedAt)} | {report.monitorUrl}
          </Text>
          <Text style={{ marginTop: 4 }}>
            Generated with Kiwi Status • kiwistatus.com
          </Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
}
