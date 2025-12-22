"use client";

import { useEffect } from "react";
import type { StatusPage, Monitor, ExtendedIncident, StatusPageTheme } from "@/types";
import {
  calculateOverallStatus,
  getActiveAnnouncements,
  getActiveMaintenances,
} from "@/lib/public-status-utils";
import { PublicStatusHeader } from "./public-status-header";
import { PublicStatusAnnouncements } from "./public-status-announcements";
import { PublicStatusGroups } from "./public-status-groups";
import { PublicStatusIncidents } from "./public-status-incidents";
import { PublicStatusMaintenance } from "./public-status-maintenance";
import { PublicStatusFooter } from "./public-status-footer";

interface PublicStatusPageProps {
  statusPage: StatusPage;
  monitors: Monitor[];
  incidents: ExtendedIncident[];
}

// Available themes (excluding "system")
const themeClasses: StatusPageTheme[] = ["basic", "dark", "forest", "slate", "kiwi"];

/**
 * Public status page component - renders the full status page content.
 * Password protection is handled by ProtectedStatusPage wrapper.
 */
export function PublicStatusPage({
  statusPage,
  monitors,
  incidents,
}: PublicStatusPageProps) {
  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const theme = statusPage.theme;

    // Remove all theme classes first
    themeClasses.forEach((t) => root.classList.remove(t));

    // Apply the configured theme (if not "system" or undefined)
    // "system" means respect user's preference (no class = uses kiwi as default)
    // If theme is set to a specific value, apply that class
    if (theme && theme !== "system" && theme !== "kiwi") {
      root.classList.add(theme);
    }

    // Cleanup: restore original theme when component unmounts
    return () => {
      themeClasses.forEach((t) => root.classList.remove(t));
    };
  }, [statusPage.theme]);

  // Calculate overall status
  const overallStatus = calculateOverallStatus(
    monitors,
    statusPage.scheduledMaintenances
  );

  // Get active announcements
  const activeAnnouncements = getActiveAnnouncements(statusPage.announcements);

  // Get active maintenances
  const activeMaintenances = getActiveMaintenances(
    statusPage.scheduledMaintenances
  );

  // Apply custom primary color as CSS variable
  const customStyle = statusPage.primaryColor
    ? ({ "--status-primary": statusPage.primaryColor } as React.CSSProperties)
    : undefined;

  return (
    <>
      {/* Custom CSS injection */}
      {statusPage.customCss && (
        <style dangerouslySetInnerHTML={{ __html: statusPage.customCss }} />
      )}

      {/* Main content */}
      <div
        className="public-status-page min-h-screen"
        style={customStyle}
      >
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {/* Header with overall status */}
          <PublicStatusHeader
            title={statusPage.title}
            description={statusPage.description}
            logo={statusPage.logo}
            primaryColor={statusPage.primaryColor}
            overallStatus={overallStatus}
            lastUpdated={statusPage.updatedAt}
          />

          {/* Active announcements */}
          {activeAnnouncements.length > 0 && (
            <PublicStatusAnnouncements announcements={activeAnnouncements} />
          )}

          {/* Active/upcoming maintenances */}
          {activeMaintenances.length > 0 && (
            <PublicStatusMaintenance
              maintenances={activeMaintenances}
              groups={statusPage.groups}
            />
          )}

          {/* Service groups with monitors */}
          <PublicStatusGroups
            groups={statusPage.groups}
            monitors={monitors}
            uptimeHistoryDays={statusPage.uptimeHistoryDays}
            showUptimeHistory={statusPage.showUptimeHistory}
          />

          {/* Incident history */}
          {statusPage.showIncidents && (
            <PublicStatusIncidents
              incidents={incidents}
              monitors={monitors}
            />
          )}

          {/* Footer */}
          <PublicStatusFooter lastUpdated={statusPage.updatedAt} />
        </div>
      </div>
    </>
  );
}
