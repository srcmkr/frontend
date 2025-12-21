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

interface SLAReportPDFProps {
  report: SLAReport;
}

export function SLAReportPDF({ report }: SLAReportPDFProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getUptimeStyle = (uptime: number) => {
    if (uptime >= 99.9) return styles.statValueGreen;
    if (uptime >= 95) return styles.statValueYellow;
    return styles.statValueRed;
  };

  return (
    <Document>
      {/* Page 1: Executive Summary & Availability */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SLA Report</Text>
          <Text style={styles.subtitle}>{report.monitorName}</Text>
          <Text style={styles.periodBadge}>
            {report.period.label} ({report.period.startDate} - {report.period.endDate})
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zusammenfassung</Text>

          {/* SLA Requirements Overview */}
          <View style={styles.slaRequirementsBox}>
            <View style={styles.slaRequirementItem}>
              <Text style={styles.slaRequirementLabel}>SLA-Ziel Verfügbarkeit:</Text>
              <Text style={styles.slaRequirementValue}>{report.slaTarget}%</Text>
            </View>
            <View style={styles.slaRequirementItem}>
              <Text style={styles.slaRequirementLabel}>Max. Antwortzeit:</Text>
              <Text style={styles.slaRequirementValue}>{report.maxResponseTime}ms</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Verfügbarkeit</Text>
              <Text style={report.executiveSummary.slaCompliant ? styles.statValueGreen : styles.statValueRed}>
                {report.executiveSummary.slaCompliant ? "Eingehalten" : "Verletzt"}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Antwortzeit</Text>
              <Text style={report.executiveSummary.responseTimeCompliant ? styles.statValueGreen : styles.statValueRed}>
                {report.executiveSummary.responseTimeCompliant ? "Eingehalten" : "Verletzt"}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Uptime</Text>
              <Text style={getUptimeStyle(report.executiveSummary.overallAvailability)}>
                {report.executiveSummary.overallAvailability.toFixed(3)}%
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Ausfallzeit</Text>
              <Text style={styles.statValue}>{report.executiveSummary.totalDowntimeFormatted}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.statLabel}>Trend vs. Vorperiode: </Text>
            <Text style={report.executiveSummary.trendVsPreviousPeriod >= 0 ? styles.statValueGreen : styles.statValueRed}>
              {report.executiveSummary.trendVsPreviousPeriod > 0 ? "+" : ""}
              {report.executiveSummary.trendVsPreviousPeriod.toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verfügbarkeit</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Uptime</Text>
              <Text style={getUptimeStyle(report.availability.uptimePercentage)}>
                {report.availability.uptimePercentage.toFixed(2)}%
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Verfügbar</Text>
              <Text style={styles.statValue}>
                {report.availability.uptimeHours}h {report.availability.uptimeMinutes}m
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Ausfallzeit</Text>
              <Text style={styles.statValueRed}>
                {report.availability.downtimeHours}h {report.availability.downtimeMinutes}m
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>SLA-Verletzungen</Text>
              <Text style={report.availability.slaBreachCount > 0 ? styles.statValueRed : styles.statValueGreen}>
                {report.availability.slaBreachCount}
              </Text>
            </View>
          </View>

          {/* Weekly Breakdown Table */}
          {report.availability.weeklyBreakdown.length > 0 && (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.col1]}>Woche</Text>
                <Text style={[styles.tableHeaderCell, styles.col2]}>Uptime</Text>
                <Text style={[styles.tableHeaderCell, styles.col3]}>Checks</Text>
                <Text style={[styles.tableHeaderCell, styles.col4]}>Fehlgeschlagen</Text>
              </View>
              {report.availability.weeklyBreakdown.slice(0, 8).map((week) => (
                <View key={week.weekNumber} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.col1]}>
                    KW {week.weekNumber}
                  </Text>
                  <Text style={[styles.tableCell, styles.col2, getUptimeStyle(week.uptime)]}>
                    {week.uptime.toFixed(2)}%
                  </Text>
                  <Text style={[styles.tableCell, styles.col3]}>{week.totalChecks}</Text>
                  <Text style={[styles.tableCell, styles.col4, styles.statValueRed]}>
                    {week.failedChecks}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          Report generiert am {formatDate(report.generatedAt)} | {report.monitorUrl}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>

      {/* Page 2: Performance & Incidents */}
      <Page size="A4" style={styles.page}>
        {/* Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.row}>
            <Text style={styles.statLabel}>Max. Antwortzeit SLA: </Text>
            <Text style={styles.slaRequirementValue}>{report.maxResponseTime}ms</Text>
            <Text style={[
              styles.slaRequirementValue,
              { marginLeft: 10 },
              report.performance.averageResponseTime <= report.maxResponseTime
                ? styles.statValueGreen
                : styles.statValueRed
            ]}>
              ({report.performance.averageResponseTime <= report.maxResponseTime ? "Eingehalten" : "Verletzt"})
            </Text>
          </View>
          <View style={[styles.statsGrid, { marginTop: 10 }]}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Durchschnitt</Text>
              <Text style={report.performance.averageResponseTime <= report.maxResponseTime ? styles.statValueGreen : styles.statValueRed}>
                {report.performance.averageResponseTime}ms
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Median</Text>
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
          <View style={styles.row}>
            <Text style={styles.statLabel}>Min / Max: </Text>
            <Text style={styles.tableCell}>
              {report.performance.minResponseTime}ms / {report.performance.maxResponseTime}ms
            </Text>
          </View>
        </View>

        {/* Incidents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident-Analyse</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Incidents gesamt</Text>
              <Text style={report.incidents.totalIncidents > 0 ? styles.statValueRed : styles.statValueGreen}>
                {report.incidents.totalIncidents}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>MTBF</Text>
              <Text style={styles.statValue}>{report.incidents.mtbf}h</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>MTTR</Text>
              <Text style={styles.statValue}>{report.incidents.mttr}min</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Längster Ausfall</Text>
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
                {incident.severity === "critical" ? "Kritisch" :
                  incident.severity === "major" ? "Schwer" : "Leicht"}
              </Text>
              <Text style={styles.tableCell}>{incident.date} {incident.startTime}</Text>
              <Text style={[styles.tableCell, { marginLeft: 10 }]}>{incident.cause}</Text>
              <Text style={[styles.tableCell, { marginLeft: "auto" }]}>{incident.duration}min</Text>
            </View>
          ))}
        </View>

        {/* Check Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check-Statistiken</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Checks gesamt</Text>
              <Text style={styles.statValue}>{report.checks.totalChecks.toLocaleString("de-DE")}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Erfolgreich</Text>
              <Text style={styles.statValueGreen}>
                {report.checks.successfulChecks.toLocaleString("de-DE")}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Fehlgeschlagen</Text>
              <Text style={report.checks.failedChecks > 0 ? styles.statValueRed : styles.statValueGreen}>
                {report.checks.failedChecks.toLocaleString("de-DE")}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Erfolgsrate</Text>
              <Text style={getUptimeStyle(report.checks.successRate)}>
                {report.checks.successRate.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Technical Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technische Details</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>DNS Avg</Text>
              <Text style={styles.statValue}>{report.technical.dnsResolutionStats.averageTime}ms</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>DNS P95</Text>
              <Text style={styles.statValue}>{report.technical.dnsResolutionStats.p95Time}ms</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>IP-Änderungen</Text>
              <Text style={styles.statValue}>{report.technical.ipAddressChanges.length}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TLS-Version</Text>
              <Text style={styles.statValue}>
                {report.technical.tlsVersionHistory[0]?.version || "-"}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Report generiert am {formatDate(report.generatedAt)} | {report.monitorUrl}
        </Text>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
}
