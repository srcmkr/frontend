import type { StatusPage, Monitor, ExtendedIncident } from "@/types";
import { getStatusPageBySlug } from "@/mocks/status-pages";
import { getMockMonitors, getExtendedIncidents } from "@/mocks/monitors";
import { filterIncidentsByDays } from "./public-status-utils";

/**
 * Public status page data that can be shown without authentication
 * This is safe to send to the client even for password-protected pages
 */
export interface PublicStatusPageMetadata {
  slug: string;
  title: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  theme?: StatusPage["theme"];
  customCss?: string;
  passwordProtection: boolean;
  // Never include the actual password!
}

/**
 * Full status page data - only returned after successful authentication
 */
export interface AuthenticatedStatusPageData {
  statusPage: StatusPage;
  monitors: Monitor[];
  incidents: ExtendedIncident[];
}

/**
 * Get metadata for a status page (safe for unauthenticated access)
 * This contains only the minimal data needed to render the shell/skeleton
 */
export function getStatusPageMetadata(slug: string): PublicStatusPageMetadata | null {
  const statusPage = getStatusPageBySlug(slug);
  if (!statusPage) return null;

  return {
    slug: statusPage.slug,
    title: statusPage.title,
    description: statusPage.description,
    logo: statusPage.logo,
    primaryColor: statusPage.primaryColor,
    theme: statusPage.theme,
    customCss: statusPage.customCss,
    passwordProtection: statusPage.passwordProtection,
  };
}

/**
 * Validate password for a status page
 * In production, this would be a server-side API call
 */
export function validateStatusPagePassword(slug: string, password: string): boolean {
  const statusPage = getStatusPageBySlug(slug);
  if (!statusPage) return false;
  if (!statusPage.passwordProtection) return true;
  return statusPage.password === password;
}

/**
 * Get full status page data (for public pages or after authentication)
 * In production, this would verify the session/token server-side
 */
export function getStatusPageData(slug: string): AuthenticatedStatusPageData | null {
  const statusPage = getStatusPageBySlug(slug);
  if (!statusPage) return null;

  // Get all monitors and filter to only those on this status page
  const allMonitors = getMockMonitors();
  const monitors = allMonitors.filter((m) =>
    statusPage.monitors.includes(m.id)
  );

  // Get incidents for monitors on this page
  const allIncidents = getExtendedIncidents();
  const pageIncidents = allIncidents.filter((inc) =>
    inc.affectedMonitors.some((monitorId) =>
      statusPage.monitors.includes(monitorId)
    )
  );

  // Filter by configured history days
  const filteredIncidents = statusPage.showIncidents
    ? filterIncidentsByDays(pageIncidents, statusPage.incidentHistoryDays)
    : [];

  return {
    statusPage,
    monitors,
    incidents: filteredIncidents,
  };
}

/**
 * Get status page data with password validation
 * Returns null if password is required but not provided/invalid
 */
export function getAuthenticatedStatusPageData(
  slug: string,
  password?: string
): AuthenticatedStatusPageData | null {
  const statusPage = getStatusPageBySlug(slug);
  if (!statusPage) return null;

  // If password protection is enabled, validate the password
  if (statusPage.passwordProtection) {
    if (!password || statusPage.password !== password) {
      return null;
    }
  }

  return getStatusPageData(slug);
}
