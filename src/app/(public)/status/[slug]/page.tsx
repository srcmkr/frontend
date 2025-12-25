import { notFound } from "next/navigation";
import { ProtectedStatusPage } from "@/components/public-status/protected-status-page";
import type { Metadata } from "next";

interface StatusPageProps {
  params: Promise<{ slug: string }>;
}

// Backend API base URL - use environment variable or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5291";

interface StatusPageDetailResponse {
  id: string;
  title: string;
  slug: string;
  description?: string;
  isPublic: boolean;
  groups: Array<{
    id: string;
    name: string;
    sortOrder: number;
    monitors: string[];  // Monitor IDs
  }>;
  monitors: Array<{
    id: string;
    name: string;
    url?: string;
    type: string;
    status: string;
    sortOrder: number;
    uptimePercentage?: number;
    avgResponseTimeMs?: number;
  }>;
  recentIncidents: Array<{
    id: string;
    title: string;
    description?: string;
    type: string;
    severity: string;
    status: string;
    affectedMonitorIds: string[];
    cause?: string;
    startedAt: string;
    resolvedAt?: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  customCss?: string;
  logoUrl?: string;
  primaryColor?: string;
  theme: string;
  showUptimeHistory: boolean;
  uptimeHistoryDays: number;
  showIncidents: boolean;
  incidentHistoryDays: number;
  showMaintenanceCalendar: boolean;
  showPoweredByBranding: boolean;
  passwordProtection: boolean;
  ipWhitelistEnabled: boolean;
  ipWhitelist?: string[];
  announcements: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    enabled: boolean;
    pinned: boolean;
    startAt?: string;
    endAt?: string;
    createdAt: string;
  }>;
  scheduledMaintenances: Array<{
    id: string;
    title: string;
    description?: string;
    affectedGroupIds: string[];
    scheduledStart: string;
    scheduledEnd: string;
    notifyBeforeMinutes?: number;
    autoStart: boolean;
    status: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt?: string;
}

async function fetchStatusPage(slug: string): Promise<StatusPageDetailResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/status-pages/${slug}`, {
      cache: "no-store", // Always fetch fresh data for status pages
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch status page: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching status page:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: StatusPageProps): Promise<Metadata> {
  const { slug } = await params;
  const statusPage = await fetchStatusPage(slug);

  if (!statusPage) {
    return {
      title: "Status Page Not Found",
      description: undefined,
    };
  }

  return {
    title: statusPage.title,
    description: statusPage.description || `Status page for ${statusPage.title}`,
  };
}

export default async function StatusPage({ params }: StatusPageProps) {
  const { slug } = await params;

  // Fetch status page from backend
  const statusPage = await fetchStatusPage(slug);

  if (!statusPage) {
    notFound();
  }

  // Prepare metadata for password protection check
  const metadata = {
    slug: statusPage.slug,
    passwordProtection: statusPage.passwordProtection,
    title: statusPage.title,
    description: statusPage.description,
    logo: statusPage.logoUrl,
    primaryColor: statusPage.primaryColor,
    theme: statusPage.theme,
    customCss: statusPage.customCss,
  };

  // If page is password-protected, don't send data (client will fetch after auth)
  const initialData = statusPage.passwordProtection
    ? null
    : {
        statusPage: {
          id: statusPage.id,
          title: statusPage.title,
          slug: statusPage.slug,
          description: statusPage.description,
          isPublic: statusPage.isPublic,
          hasPassword: statusPage.passwordProtection,
          logoUrl: statusPage.logoUrl,
          primaryColor: statusPage.primaryColor,
          theme: statusPage.theme,
          passwordProtection: statusPage.passwordProtection,
          ipWhitelistEnabled: statusPage.ipWhitelistEnabled,
          monitors: statusPage.groups.flatMap((g) => g.monitors),  // Flatten all monitor IDs
          groups: statusPage.groups,
          announcements: statusPage.announcements,
          scheduledMaintenances: statusPage.scheduledMaintenances,
          createdAt: statusPage.createdAt,
          updatedAt: statusPage.updatedAt,
        },
        monitors: statusPage.monitors || [],  // Full monitor objects from backend (default to empty array)
        incidents: statusPage.recentIncidents || [],
      };

  const groupCount = statusPage.groups.length;

  return (
    <ProtectedStatusPage
      metadata={metadata}
      initialData={initialData}
      groupCount={groupCount}
    />
  );
}
